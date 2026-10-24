package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/mail"
	"time"

	_ "pdnode-account/migrations"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/mailer"
	"github.com/pocketbase/pocketbase/tools/osutils"
	"github.com/pocketbase/pocketbase/tools/security"
)

//go:embed all:ui/dist
var uiFS embed.FS

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		// (the IsProbablyGoRun check is to enable it only during development)
		Automigrate: osutils.IsProbablyGoRun(),
	})

	app.OnRecordAuthWithOAuth2Request("users").BindFunc(func(e *core.RecordAuthWithOAuth2RequestEvent) error {
		if e.ProviderName != "oidc" {
			return e.Next()
		}

		raw := e.OAuth2User.RawUser
		if raw == nil {
			return e.Next()
		}

		slackID, ok := raw["slack_id"].(string)
		if !ok || slackID == "" {
			app.Logger().Warn("slack_id not found or not string", "raw", raw)
			return e.Next()
		}

		if e.IsNewRecord {
			if e.CreateData == nil {
				e.CreateData = make(map[string]any)
			}
			e.CreateData["slack_id"] = slackID
			app.Logger().Info("set slack_id for new user", "slack_id", slackID)
		} else if e.Record != nil {
			e.Record.Set("slack_id", slackID)
			if err := app.Save(e.Record); err != nil {
				app.Logger().Error("failed to save slack_id", "error", err)
			} else {
				app.Logger().Info("updated slack_id for existing user", "slack_id", slackID)
			}
		}

		return e.Next()
	})

	app.OnRecordCreateRequest("delete_requests").BindFunc(func(e *core.RecordRequestEvent) error {
		if e.Auth == nil || e.Record.GetString("user") != e.Auth.Id {
			return e.BadRequestError("invalid user", nil)
		}

		var body struct {
			Password string `json:"password"`
		}
		if err := e.BindBody(&body); err != nil || body.Password == "" {
			return e.BadRequestError("password required", err)
		}

		user, err := app.FindRecordById("users", e.Auth.Id)
		if err != nil {
			return err
		}
		if !user.ValidatePassword(body.Password) {
			return e.BadRequestError("invalid password", nil)
		}

		token := security.RandomString(32)
		e.Record.Set("token", token)
		e.Record.Set("expiresAt", time.Now().UTC().Add(24*time.Hour))
		e.Record.Set("confirmed", false)
		e.Record.Set("used", false)

		if err := e.Next(); err != nil {
			return err
		}

		confirmURL := fmt.Sprintf("%s/confirm-delete?token=%s", app.Settings().Meta.AppURL, token)
		message := &mailer.Message{
			From:    mail.Address{Address: app.Settings().Meta.SenderAddress},
			To:      []mail.Address{{Address: user.Email()}},
			Subject: "Confirm account deletion",
			HTML:    fmt.Sprintf(`<p>Click to confirm account deletion:</p><p><a href="%s">%s</a></p><p>Valid for 24 hours.</p>`, confirmURL, confirmURL),
		}
		return app.NewMailClient().Send(message)
	})
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		distFS, err := fs.Sub(uiFS, "ui/dist")
		if err != nil {
			return err
		}
		se.Router.GET("/{path...}", apis.Static(distFS, true))

		se.Router.POST("/api/confirm-delete", func(e *core.RequestEvent) error {
			var data struct {
				Token string `json:"token"`
			}
			if err := e.BindBody(&data); err != nil || data.Token == "" {
				return e.BadRequestError("invalid body", err)
			}

			record, err := app.FindFirstRecordByFilter(
				"delete_requests",
				"token = {:token} && confirmed = false && used = false && expiresAt > {:now}",
				dbx.Params{"token": data.Token, "now": time.Now().UTC()},
			)
			if err != nil {
				return e.NotFoundError("invalid or expired token", err)
			}

			user, err := app.FindRecordById("users", record.GetString("user"))
			if err != nil {
				return err
			}
			user.Set("deletedAt", time.Now().UTC())
			user.Set("email", fmt.Sprintf("deleted_%s@deleted.local", user.Id))
			user.Set("name", "Deleted User")
			user.Set("slack_id", "")
			if err := app.Save(user); err != nil {
				return err
			}

			record.Set("confirmed", true)
			record.Set("used", true)
			if err := app.Save(record); err != nil {
				return err
			}

			return e.JSON(200, map[string]bool{"success": true})
		})
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

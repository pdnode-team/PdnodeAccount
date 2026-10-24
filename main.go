package main

import (
	"embed"
	"io/fs"
	"log"

	_ "pdnode-account/migrations"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/osutils"
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

		slackID, _ := raw["slack_id"].(string)

		if slackID == "" {
			return e.Next()
		}

		if e.IsNewRecord {
			if e.CreateData == nil {
				e.CreateData = map[string]any{}
			}

			e.CreateData["slack_id"] = slackID
		} else if e.Record != nil {

			e.Record.Set("slack_id", slackID)
		}
		return e.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		distFS, err := fs.Sub(uiFS, "ui/dist")
		if err != nil {
			return err
		}
		se.Router.GET("/{path...}", apis.Static(distFS, true))

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

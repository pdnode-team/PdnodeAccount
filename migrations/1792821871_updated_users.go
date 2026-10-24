package migrations

import (
	"encoding/json/v2"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"authRule": "deletedAt = \"\" && verified = true",
			"createRule": "(@request.context = \"oauth2\" || @request.body.slack_id:isset = false) && @request.body.deletedAt:isset = false",
			"deleteRule": null,
			"updateRule": "id = @request.auth.id && @request.body.deletedAt:isset = false && @request.body.slack_id:isset = false"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"authRule": "verified = true",
			"createRule": "@request.context = \"oauth2\" || @request.body.slack_id:isset = false",
			"deleteRule": "id = @request.auth.id",
			"updateRule": "id = @request.auth.id && @request.body.slack_id:isset = false"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}

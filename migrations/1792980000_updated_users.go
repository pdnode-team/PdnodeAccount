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

		// add field
		if collection.Fields.GetByName("mfa_enabled") == nil {
			if err := collection.Fields.AddMarshaledJSON([]byte(`{
				"hidden": false,
				"id": "bool3891001234",
				"name": "mfa_enabled",
				"presentable": false,
				"required": false,
				"system": false,
				"type": "bool"
			}`)); err != nil {
				return err
			}
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"mfa": {
				"duration": 1800,
				"enabled": true,
				"rule": "mfa_enabled = true"
			}
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("bool3891001234")

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"mfa": {
				"duration": 0,
				"enabled": false,
				"rule": ""
			}
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}

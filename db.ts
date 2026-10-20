import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema.ts";

const sqlite = new Database({
  url: "file:data/data.db",
});

export const db = drizzle(sqlite, { schema });

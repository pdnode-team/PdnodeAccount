import { migrate } from "drizzle-orm/node-sqlite/migrator";
import { db } from "./db.ts";

await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migration done");

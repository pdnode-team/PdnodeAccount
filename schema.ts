import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nickname: text("nickname").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  status: text("status").notNull(),
  role: text("role").notNull(),
  emailVerifiedAt: integer("email_verified_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`)
    .$onUpdate(() => sql`(strftime('%s', 'now'))`),
}, (table) => [     
  uniqueIndex("email_idx").on(table.email),
  index("nickname_idx").on(table.nickname),
]);

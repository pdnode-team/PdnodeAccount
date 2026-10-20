import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema.ts";

const client = createClient({
  url: "file:data.db", // 本地文件
  // url: ":memory:",   // 内存数据库
});

export const db = drizzle(client, { schema });

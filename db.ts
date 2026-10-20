import { drizzle } from "drizzle-orm/node-sqlite";
import * as schema from "./schema.ts";

export const db = drizzle("./data/data.db", { schema });

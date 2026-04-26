import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql: NeonQueryFunction<false, false> = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql, schema });


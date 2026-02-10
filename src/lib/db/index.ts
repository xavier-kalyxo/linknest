import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use a dummy connection string at build time so the Drizzle instance is real
// enough for DrizzleAdapter to accept. It's never actually queried during build.
const sql = neon(process.env.DATABASE_URL || "postgresql://build:build@localhost/build");

export const db = drizzle(sql, { schema });

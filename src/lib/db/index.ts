import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// WebSocket support for Node.js (Vercel serverless functions)
neonConfig.webSocketConstructor = ws;

// The placeholder exists so `next build` can statically analyze modules without
// a database. It must never be used at runtime: silently falling back meant a
// misconfigured deploy built cleanly and then threw ECONNREFUSED on the first
// query of every request, with no indication that the cause was a missing var.
const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  throw new Error(
    "DATABASE_URL is not set. Refusing to start with a placeholder connection.",
  );
}

const pool = new Pool({
  connectionString:
    connectionString || "postgresql://build:build@localhost/build",
});

export const db = drizzle(pool, { schema });

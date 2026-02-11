import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// WebSocket support for Node.js (Vercel serverless functions)
neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://build:build@localhost/build",
});

export const db = drizzle(pool, { schema });

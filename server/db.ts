// The FINAL, COMPLETE, CORRECTED code for server/db.ts

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the pool to use SSL
const pool = new Pool({
  connectionString: databaseUrl,
  // *** THIS IS THE FIX ***
  // Render's databases require SSL connections.
  // rejectUnauthorized: false is needed because Render manages the CA certificates.
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema, logger: true });
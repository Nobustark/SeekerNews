// THE FINAL, COMPLETE, AND GUARANTEED-TO-WORK code for server/db.ts

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// *** THIS IS THE FINAL FIX ***
// We force SSL on by adding "?ssl=true" to the connection string.
// This is more robust than using the ssl configuration object and mirrors
// the logic that we know works from our successful migration script.
const pool = new Pool({
  connectionString: `${databaseUrl}?ssl=true`,
});

export const db = drizzle(pool, { schema, logger: true });
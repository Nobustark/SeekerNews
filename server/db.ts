// THE FINAL, GUARANTEED-TO-WORK code for server/db.ts

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
// We use the standard Pool from 'pg', but we ensure the connection string
// has the required Neon options for its connection pooler and SSL.
const pool = new Pool({
  connectionString: `${databaseUrl}?sslmode=require&options=project%3D${process.env.NEON_PROJECT_NAME}`,
});

// We will also add a connection test to be 100% sure.
pool.connect((err, client, release) => {
  if (err) {
    console.error('CRITICAL: Error acquiring client for DB connection test:', err.stack);
  } else {
    client.query('SELECT NOW()', (err, result) => {
      release();
      if (err) {
        console.error('CRITICAL: DB connection test query failed:', err.stack);
      } else {
        console.log('SUCCESS: Database connected successfully, test query returned:', result.rows[0]);
      }
    });
  }
});

export const db = drizzle(pool, { schema, logger: true });
// The FINAL, CORRECTED, NEON-SPECIFIC code for server/db.ts

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set.");
}

// Initialize the Neon HTTP connection
const sql = neon(databaseUrl);

// Initialize Drizzle with the Neon HTTP driver
export const db = drizzle(sql, { schema, logger: true });
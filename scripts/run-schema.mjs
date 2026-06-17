/**
 * Run supabase/schema.sql when DATABASE_URL is available.
 * Find it in Supabase Dashboard → Project Settings → Database → Connection string (URI)
 *
 * Usage:
 *   $env:DATABASE_URL="postgresql://postgres.[ref]:[password]@..."
 *   node scripts/run-schema.mjs
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!DATABASE_URL) {
  console.error('Set DATABASE_URL or SUPABASE_DB_URL to your Supabase Postgres connection string.');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8');

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log('✓ Schema applied successfully');
} catch (err) {
  console.error('Schema failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
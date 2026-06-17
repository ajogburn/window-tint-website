/**
 * One-time Supabase setup helper.
 * Usage (from project root):
 *   node scripts/setup-supabase.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment.
 * Never commit the service role key to git.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const SUPABASE_URL = 'https://ozcmvbqshiggrchjcjqj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'supabase', 'schema.sql');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const exists = buckets?.some((b) => b.id === 'gallery-images');
  if (exists) {
    console.log('✓ Storage bucket gallery-images already exists');
    return;
  }

  const { error } = await supabase.storage.createBucket('gallery-images', {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });

  if (error) throw error;
  console.log('✓ Created storage bucket gallery-images (public)');
}

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'admin@joestint.com';
  const password = process.env.ADMIN_PASSWORD || 'jowt2025';

  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = users?.users?.find((u) => u.email === email);
  if (existing) {
    console.log(`✓ Admin user already exists: ${email}`);
    return;
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;
  console.log(`✓ Created admin user: ${email}`);
}

async function checkGalleryTable() {
  const { error } = await supabase.from('gallery_items').select('id').limit(1);
  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('gallery_items')) {
      console.log('\n⚠ gallery_items table not found yet.');
      console.log('  Run supabase/schema.sql in your Supabase Dashboard → SQL Editor:');
      console.log(`  ${schemaPath}`);
      return false;
    }
    throw error;
  }
  console.log('✓ gallery_items table is ready');
  return true;
}

async function main() {
  console.log('Setting up Joe\'s Window Tinting Supabase backend...\n');

  await ensureBucket();
  await ensureAdminUser();
  const tableReady = await checkGalleryTable();

  if (!tableReady) {
    console.log('\nAfter running schema.sql, re-run this script to verify.');
    process.exit(0);
  }

  console.log('\nSetup complete. You can log in at admin.html with your admin credentials.');
}

main().catch((err) => {
  console.error('Setup failed:', err.message || err);
  process.exit(1);
});
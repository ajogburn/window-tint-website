# Joe's Window Tinting — Supabase Upgrade Guide

This project (like your thankqtattoo site) can be upgraded from pure localStorage to a real backend using **Supabase** (free tier is generous).

The admin dashboard (`admin.html`) and public gallery are already structured so you can swap the data layer with almost zero changes to the UI.

## Tables to Create

Run in Supabase SQL Editor:

```sql
-- Gallery pieces
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  desc text,
  category text,
  vehicle_type text,
  darkness text,
  img text,               -- public url from storage, or base64 fallback
  created_at timestamz default now()
);

alter table public.gallery_items enable row level security;

create policy "Public can read gallery" on public.gallery_items for select using (true);
create policy "Authenticated can manage gallery" on public.gallery_items for all to authenticated using (true) with check (true);

-- Categories / Filters
create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

alter table public.gallery_categories enable row level security;

create policy "Public read categories" on public.gallery_categories for select using (true);
create policy "Authenticated manage categories" on public.gallery_categories for all to authenticated using (true) with check (true);

-- Contact / Quote leads
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz default now(),
  name text,
  phone text,
  email text,
  service text,
  message text,
  quote text,
  contacted boolean default false,
  contacted_at timestamptz
);

alter table public.submissions enable row level security;

create policy "Authenticated can manage submissions" on public.submissions for all to authenticated using (true) with check (true);
```

## Storage Bucket

1. Create a bucket called `tint-images` (or `gallery-images`)
2. Make it **PUBLIC**
3. Recommended: add a simple image resize policy or just upload optimized files from the admin.

## Auth

- Enable Email + Password in Authentication → Providers
- Create your first admin user (or use the signup flow you can add to admin.html)
- Recommended: add a `profiles` or `admin_users` table + RLS if you want role-based access later.

## How to Swap the Data Layer

1. Copy/adapt `thankqtattoo/js/supabase-client.js` → create `js/data-client.js` in this project.
2. In `js/gallery-data.js`, replace the localStorage implementations of:
   - getGalleryItems / save / add / update / delete
   - getCategories / add / update / delete
   - getSubmissions / add / mark / delete
   with calls to your new client (e.g. `await window.JoWTSupabase.getGalleryItems()`).
3. Include the Supabase CDN + your new client script in both `admin.html` and `gallery.html` (and index.html for form submissions).
4. Update the login section in admin.html to use real `signInWithPassword` + `onAuthStateChange` exactly like thankqtattoo.

The public UI and admin UX require almost no other changes — the function names stay the same.

## Why do this?

- Real cloud storage for images (no more huge base64 bloat in localStorage)
- Multi-device access (you + employee can both use the admin)
- Permanent history of leads
- You already know the pattern from the thankqtattoo project.

Once the tables + bucket + auth are set up, the rest is mostly copy-paste from your existing thankqtattoo supabase-client.

Let me know if you want me to write the full `js/data-client.js` + updated admin login for Supabase.

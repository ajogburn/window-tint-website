-- Joe's Window Tinting — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor (or via scripts/setup-supabase.mjs)

-- Gallery pieces
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text default 'automotive',
  vehicle_type text default 'car',
  darkness text default '20%',
  img text,
  storage_path text,
  created_at timestamptz default now()
);

create index if not exists gallery_items_created_at_idx on public.gallery_items (created_at desc);

alter table public.gallery_items enable row level security;

drop policy if exists "Public can read gallery" on public.gallery_items;
create policy "Public can read gallery"
  on public.gallery_items for select
  using (true);

drop policy if exists "Authenticated can insert gallery" on public.gallery_items;
create policy "Authenticated can insert gallery"
  on public.gallery_items for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update gallery" on public.gallery_items;
create policy "Authenticated can update gallery"
  on public.gallery_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete gallery" on public.gallery_items;
create policy "Authenticated can delete gallery"
  on public.gallery_items for delete
  to authenticated
  using (true);

-- Storage bucket (public read for gallery images)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-images',
  'gallery-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read gallery images" on storage.objects;
create policy "Public read gallery images"
  on storage.objects for select
  using (bucket_id = 'gallery-images');

drop policy if exists "Authenticated upload gallery images" on storage.objects;
create policy "Authenticated upload gallery images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery-images');

drop policy if exists "Authenticated update gallery images" on storage.objects;
create policy "Authenticated update gallery images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery-images');

drop policy if exists "Authenticated delete gallery images" on storage.objects;
create policy "Authenticated delete gallery images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery-images');
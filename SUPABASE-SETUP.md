# Supabase Backend — Joe's Window Tinting Gallery

The gallery is wired to Supabase for cloud storage and a shared database. The admin dashboard uploads images to **Supabase Storage** and saves metadata in **`gallery_items`**.

## Already done (via setup script)

- Storage bucket: `gallery-images` (public read)
- Admin user: `admin@joestint.com` / `jowt2025`

Run again anytime:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
npm run setup:supabase
```

**Never commit the service role key to git.**

## One required step: run the SQL schema

Open [Supabase SQL Editor](https://supabase.com/dashboard/project/ozcmvbqshiggrchjcjqj/sql/new), paste the contents of `supabase/schema.sql`, and click **Run**.

This creates:

- `gallery_items` table (title, description, category, image URL, etc.)
- Row Level Security: public read, authenticated write
- Storage policies for upload/delete in `gallery-images`

### Optional: run schema from terminal

If you have your Postgres connection string (Dashboard → Settings → Database):

```powershell
$env:DATABASE_URL="postgresql://postgres.[ref]:[password]@..."
node scripts/run-schema.mjs
npm run setup:supabase
```

## Using the admin

1. Open `admin.html`
2. Sign in with `admin@joestint.com` / `jowt2025`
3. **+ UPLOAD NEW PIECE** — image goes to Supabase Storage, row saved to DB
4. **DELETE** — removes DB row and storage file

Public `gallery.html` and the homepage preview load from Supabase automatically.

## Files

| File | Purpose |
|------|---------|
| `js/supabase-config.js` | Project URL + anon key (public) |
| `js/supabase-client.js` | Auth, storage upload, gallery CRUD |
| `js/gallery-data.js` | Data layer used by all pages |
| `supabase/schema.sql` | Database + storage policies |

## Security notes

- Only the **anon** key is in frontend code (correct for static sites).
- Keep the **service_role** key secret; use it only for `npm run setup:supabase`.
- Change the default admin password in Supabase → Authentication → Users.
- If the service role key was shared publicly, rotate it in Dashboard → Settings → API Keys.
# Joe's Window Tinting — Clarksville, TN (Static Edition)

A clean, **pure static website** (no React, no build tools, no Node required) for Joe's Window Tinting.

Everything lives in two easy-to-edit files:
- `index.html` — complete homepage (hero, services, live quote calculator, about, testimonials, FAQ, contact)
- `gallery.html` — dedicated filterable + searchable gallery with lightbox

## Why this version?

- **Much easier to understand** — open any .html file in a text editor or browser and you can immediately see and change everything.
- **Zero dependencies** — uses Tailwind via CDN + plain vanilla JavaScript. No npm, Vite, React, or build step.
- **Fully interactive** — the quote calculator updates live, "Use this quote" prefills the contact form, you can add reviews that persist in the browser, FAQ accordion works, gallery filters + beautiful modal all work with plain JS.
- Works by simply opening `index.html` in any browser. Deploy by uploading the two HTML files anywhere (Netlify, GitHub Pages, Vercel, S3, etc.).

## Key Features (all static)

- Professional light theme with strong yellow accents
- Fully working **Instant Quote Calculator** (vehicle type, film, darkness, add-ons). Price recalculates instantly. "Use this quote" button scrolls to contact + prefills the message box.
- **22 real-looking gallery examples** with category filters, vehicle filters, search, and sort. Click any photo for a nice lightbox with keyboard arrows + prev/next.
- **Live testimonials** — visitors can add a review (saved in localStorage so it stays while the tab is open).
- Fully simulated contact form with success state.
- Responsive mobile menu, smooth scrolling, all original content preserved and cleaned up (Tennessee legal notes fixed).
- Services cards that scroll you to the calculator.

## Business Info

- **Name**: Joe's Window Tinting
- **Location**: Clarksville, Tennessee (serving Middle TN)
- **Phone**: (931) 896-6453
- **Established**: 1981
- **Specialties**: Automotive, Residential, Commercial, Agriculture Equipment

## How to Use / Edit

1. Open `index.html` or `gallery.html` directly in your browser.
2. To edit: open the file(s) in VS Code / any editor. All HTML, Tailwind classes, and JavaScript are in one place per file and heavily commented.
3. **Update phone / email / address**: search in `index.html` (and gallery.html).
4. **Change pricing**: look for `BASE_PRICES`, `ADDONS`, `TINT_OPTIONS`, `DARKNESS_LEVELS`, and `VEHICLES` arrays near the top of the script in `index.html`.
5. **Edit gallery photos & info**: the big `GALLERY_ITEMS` array in `gallery.html`. Replace picsum URLs with your real photos (`/images/car1.jpg` etc. once you add them).
6. **Add / remove services**: the 6 service cards are plain HTML blocks in `index.html`.
7. **Testimonials default reviews**: array near top of script in `index.html`.

### Adding real images (recommended)

Create a folder `images/` or `gallery/` next to the HTML files and update the `img` paths in the gallery data to local relative paths.

## Getting a Real Form Backend Later (optional)

Currently the contact form is a demo (logs to console + shows success message).  
When ready for real submissions, you can:
- Paste a Formspree or Getform endpoint into the `submitContactForm` function, or
- Use EmailJS (client-side, one script include)

## Quick Start (no install needed)

Just double-click `index.html`.

To preview both pages together you can use any simple static server, e.g.:

```powershell
# In PowerShell from the project folder
npx serve .
# or
python -m http.server 8000
```

Then visit http://localhost:8000

## Notes

- All "live" features (calculator, adding reviews, form prefill, gallery filters + modal) are 100% client-side vanilla JavaScript so they work offline.
- The original React + Vite + framer-motion + lucide-react version has been replaced by this simpler static site for maximum maintainability.

## Admin Dashboard (New — modeled after thankqtattoo)

Open `admin.html` in your browser.

**Features (very similar to the ThankQTattoo admin you have):**
- Simple login (demo: `admin@joestint.com` / `jowt2025`)
- Stats overview
- **Gallery manager** — upload new work (images become data URLs), edit title/desc/category/darkness/vehicle type, delete. Changes appear instantly on `gallery.html`
- **Categories** — add / rename / delete the filter options that power the public gallery
- **Submissions inbox** — every time someone uses the contact form or "Use this quote" + submits, the lead appears here. Mark as contacted, delete, or export CSV.
- Fully localStorage powered — works offline, no setup. Perfect for a simple static site.

**How the public site stays in sync:**
`gallery.html` and the contact form now load/save through the shared `js/gallery-data.js` layer. Just refresh the gallery page after using the admin.

**To make it production-grade (recommended later):**
Copy the pattern from your `thankqtattoo/js/supabase-client.js`:
1. Add Supabase project + tables (`gallery_items`, `gallery_categories`, `submissions`)
2. Swap the load/save functions in `js/gallery-data.js` (or create a new `js/data-client.js`)
3. Update admin.html login to use real Supabase Auth (the structure is already prepared for it)

See your own `thankqtattoo/SUPABASE-SETUP.md` as a template — just rename tables and adjust fields.

**Pro tip:** Keep `admin.html` in a private folder or add real auth before going live. For now it's a beautiful, easy-to-edit local CMS.

Made for Joe's Window Tinting — Clarksville, TN. Easy for anyone to edit.

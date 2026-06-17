/**
 * Joe's Window Tinting — Gallery Data Layer
 * Backed by Supabase when configured; localStorage fallback for offline/dev.
 */

(function (window) {
  const STORAGE_KEY_GALLERY = 'jowt_gallery_items';
  const STORAGE_KEY_CATEGORIES = 'jowt_gallery_categories';
  const STORAGE_KEY_SUBMISSIONS = 'jowt_submissions';

  const SEED_GALLERY = [
    { id: 'g1', category: 'automotive', vehicleType: 'car', title: '2023 Tesla Model Y — 20% Ceramic', desc: 'Full vehicle premium ceramic. Massive heat rejection.', darkness: '20%', img: 'https://picsum.photos/id/1015/1400/900' },
    { id: 'g2', category: 'automotive', vehicleType: 'truck', title: 'Ford F-150 Lariat — 5% Rear', desc: 'Aggressive privacy on rear + 35% fronts for legal compliance.', darkness: '5%', img: 'https://picsum.photos/id/160/1400/900' },
    { id: 'g3', category: 'automotive', vehicleType: 'car', title: 'BMW 3-Series — Full Ceramic 20%', desc: 'Factory look with serious performance film.', darkness: '20%', img: 'https://picsum.photos/id/201/1400/900' },
    { id: 'g4', category: 'residential', vehicleType: 'other', title: 'Modern Home — Clarksville', desc: '35% ceramic on all large south & west windows.', darkness: '35%', img: 'https://picsum.photos/id/251/1400/900' },
    { id: 'g5', category: 'commercial', vehicleType: 'other', title: 'Medical Office Building', desc: 'Security film + energy performance on 38 windows.', darkness: '35%', img: 'https://picsum.photos/id/29/1400/900' },
    { id: 'g6', category: 'automotive', vehicleType: 'suv', title: 'Jeep Wrangler — Matte Carbon 15%', desc: 'Matte finish carbon for that tactical off-road look.', darkness: '15%', img: 'https://picsum.photos/id/180/1400/900' },
    { id: 'g7', category: 'automotive', vehicleType: 'car', title: 'Chevrolet Corvette C8 — Ceramic Tint', desc: 'Premium ceramic install at our Clarksville shop.', darkness: '20%', img: 'img/Screenshot 2026-06-17 103751_edited.png' },
    { id: 'g8', category: 'residential', vehicleType: 'other', title: 'Lakefront Home — Full Exterior', desc: 'Dramatically reduced cooling costs.', darkness: '30%', img: 'https://picsum.photos/id/1033/1400/900' },
    { id: 'g9', category: 'commercial', vehicleType: 'other', title: 'Retail Storefront Tint', desc: 'High performance reflective + security film.', darkness: '30%', img: 'https://picsum.photos/id/106/1400/900' },
    { id: 'g10', category: 'automotive', vehicleType: 'truck', title: 'Ram 1500 Work Truck — Full Body PPF', desc: 'Rock chip protection for a working truck.', darkness: '35%', img: 'https://picsum.photos/id/312/1400/900' },
    { id: 'g11', category: 'automotive', vehicleType: 'suv', title: 'Chevy Tahoe — 35% Ceramic', desc: 'Family hauler with great visibility and heat control.', darkness: '35%', img: 'https://picsum.photos/id/251/1400/900' },
    { id: 'g12', category: 'automotive', vehicleType: 'truck', title: 'Classic 1969 Camaro — 15% Carbon', desc: 'Beautifully restored muscle car with period-correct darkness.', darkness: '15%', img: 'https://picsum.photos/id/160/1400/900' },
    { id: 'g13', category: 'ag', vehicleType: 'other', title: 'John Deere Tractor Cab', desc: 'Agriculture equipment — keeps the cab cool during long days.', darkness: '20%', img: 'https://picsum.photos/id/29/1400/900' },
    { id: 'g14', category: 'automotive', vehicleType: 'car', title: 'Mercedes C-Class — 20% Ceramic', desc: 'Sleek and professional look for a daily driver.', darkness: '20%', img: 'https://picsum.photos/id/201/1400/900' },
    { id: 'g15', category: 'commercial', vehicleType: 'other', title: 'Warehouse Office Windows', desc: 'Commercial project with security & glare control.', darkness: '25%', img: 'https://picsum.photos/id/106/1400/900' },
    { id: 'g16', category: 'automotive', vehicleType: 'suv', title: 'Toyota 4Runner — 5% Rear Limo', desc: 'Full privacy for the rear passengers and cargo.', darkness: '5%', img: 'https://picsum.photos/id/180/1400/900' },
    { id: 'g17', category: 'ag', vehicleType: 'other', title: 'Farm Equipment — Enclosed Cab', desc: 'Multiple pieces of ag equipment done for a local farm.', darkness: '15%', img: 'https://picsum.photos/id/312/1400/900' },
    { id: 'g18', category: 'automotive', vehicleType: 'truck', title: 'Ford Super Duty — Heavy Tint', desc: '20% all around on a workhorse truck.', darkness: '20%', img: 'https://picsum.photos/id/160/1400/900' },
    { id: 'g19', category: 'automotive', vehicleType: 'car', title: 'Honda Civic Type R — 20% Ceramic', desc: 'Sporty daily with excellent heat rejection.', darkness: '20%', img: 'https://picsum.photos/id/1015/1400/900' },
    { id: 'g20', category: 'residential', vehicleType: 'other', title: 'Historic Home Restoration', desc: 'Careful install preserving original windows.', darkness: '35%', img: 'https://picsum.photos/id/251/1400/900' },
    { id: 'g21', category: 'automotive', vehicleType: 'suv', title: 'Range Rover — Full Ceramic + PPF', desc: 'Premium protection package.', darkness: '20%', img: 'https://picsum.photos/id/133/1400/900' },
    { id: 'g22', category: 'commercial', vehicleType: 'other', title: 'School Admin Building', desc: 'Large commercial job with energy savings focus.', darkness: '30%', img: 'https://picsum.photos/id/29/1400/900' },
  ];

  const SEED_CATEGORIES = [
    { id: 'cat-all', name: 'All Work' },
    { id: 'cat-auto', name: 'Automotive' },
    { id: 'cat-truck', name: 'Trucks & SUVs' },
    { id: 'cat-ag', name: 'Ag & Equipment' },
    { id: 'cat-comm', name: 'Commercial' },
    { id: 'cat-res', name: 'Residential' },
  ];

  const state = {
    initialized: false,
    useSupabase: false,
    gallery: [],
    initPromise: null,
  };

  function load(key, seed) {
    const saved = window.JoWT ? window.JoWT.loadFromStorage(key, null) : null;
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    if (window.JoWT) window.JoWT.saveToStorage(key, seed);
    return [...seed];
  }

  function save(key, data) {
    if (window.JoWT) window.JoWT.saveToStorage(key, data);
  }

  function syncLocalGallery(items) {
    state.gallery = items;
    save(STORAGE_KEY_GALLERY, items);
  }

  const GalleryData = {
    isUsingSupabase() {
      return state.useSupabase;
    },

    async init() {
      if (state.initPromise) return state.initPromise;

      state.initPromise = (async () => {
        if (window.JoWTSupabase?.isConfigured?.()) {
          try {
            state.gallery = await window.JoWTSupabase.fetchGalleryItems();
            state.useSupabase = true;
            state.initialized = true;
            return state.gallery;
          } catch (err) {
            console.warn('[JoWTData] Supabase load failed, using local fallback:', err.message || err);
          }
        }

        state.useSupabase = false;
        state.gallery = load(STORAGE_KEY_GALLERY, SEED_GALLERY);
        state.initialized = true;
        return state.gallery;
      })();

      return state.initPromise;
    },

    async refreshGallery() {
      if (state.useSupabase && window.JoWTSupabase) {
        state.gallery = await window.JoWTSupabase.fetchGalleryItems();
        return state.gallery;
      }
      state.gallery = load(STORAGE_KEY_GALLERY, SEED_GALLERY);
      return state.gallery;
    },

    getGalleryItems() {
      if (!state.initialized) {
        return load(STORAGE_KEY_GALLERY, SEED_GALLERY);
      }
      return [...state.gallery];
    },

    saveGalleryItems(items) {
      syncLocalGallery(items);
    },

    async addGalleryItem(item, file) {
      if (state.useSupabase && window.JoWTSupabase) {
        const newItem = await window.JoWTSupabase.addGalleryItem(item, file);
        state.gallery.unshift(newItem);
        return newItem;
      }

      const items = this.getGalleryItems();
      const newItem = {
        ...item,
        id: item.id || ('g' + Date.now() + Math.floor(Math.random() * 1000)),
      };
      items.unshift(newItem);
      syncLocalGallery(items);
      return newItem;
    },

    async updateGalleryItem(id, updates) {
      if (state.useSupabase && window.JoWTSupabase) {
        const updated = await window.JoWTSupabase.updateGalleryItem(id, updates);
        const idx = state.gallery.findIndex((i) => String(i.id) === String(id));
        if (idx !== -1) state.gallery[idx] = updated;
        return updated;
      }

      const items = this.getGalleryItems();
      const idx = items.findIndex((i) => String(i.id) === String(id));
      if (idx === -1) throw new Error('Item not found');
      items[idx] = { ...items[idx], ...updates };
      syncLocalGallery(items);
      return items[idx];
    },

    async deleteGalleryItem(id) {
      if (state.useSupabase && window.JoWTSupabase) {
        await window.JoWTSupabase.deleteGalleryItem(id);
        state.gallery = state.gallery.filter((i) => String(i.id) !== String(id));
        return;
      }

      let items = this.getGalleryItems();
      items = items.filter((i) => String(i.id) !== String(id));
      syncLocalGallery(items);
    },

    getCategories() {
      return load(STORAGE_KEY_CATEGORIES, SEED_CATEGORIES);
    },

    saveCategories(cats) {
      save(STORAGE_KEY_CATEGORIES, cats);
    },

    addCategory(name) {
      const cats = this.getCategories();
      const exists = cats.some((c) => c.name.toLowerCase() === name.toLowerCase());
      if (exists) throw new Error('Category already exists');
      const newCat = { id: 'cat-' + Date.now(), name: name.trim() };
      cats.push(newCat);
      this.saveCategories(cats);
      return newCat;
    },

    updateCategory(id, newName) {
      const cats = this.getCategories();
      const cat = cats.find((c) => c.id === id);
      if (!cat) throw new Error('Category not found');
      cat.name = newName.trim();
      this.saveCategories(cats);
    },

    deleteCategory(id) {
      let cats = this.getCategories();
      cats = cats.filter((c) => c.id !== id);
      this.saveCategories(cats);
    },

    getSubmissions() {
      return load(STORAGE_KEY_SUBMISSIONS, []);
    },

    saveSubmissions(list) {
      save(STORAGE_KEY_SUBMISSIONS, list);
    },

    addSubmission(sub) {
      const list = this.getSubmissions();
      const entry = {
        id: 'sub_' + Date.now(),
        ts: new Date().toISOString(),
        ...sub,
        contacted: false,
      };
      list.unshift(entry);
      this.saveSubmissions(list);
      return entry;
    },

    markSubmissionContacted(id) {
      const list = this.getSubmissions();
      const item = list.find((s) => s.id === id);
      if (item) {
        item.contacted = true;
        item.contactedAt = new Date().toISOString();
        this.saveSubmissions(list);
      }
    },

    deleteSubmission(id) {
      let list = this.getSubmissions();
      list = list.filter((s) => s.id !== id);
      this.saveSubmissions(list);
    },

    clearSubmissions() {
      this.saveSubmissions([]);
    },

    resetToDefaults() {
      if (confirm('Reset all gallery data, categories, and submissions to defaults? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY_GALLERY);
        localStorage.removeItem(STORAGE_KEY_CATEGORIES);
        localStorage.removeItem(STORAGE_KEY_SUBMISSIONS);
        window.location.reload();
      }
    },
  };

  window.JoWTData = GalleryData;
  window.JoWT = window.JoWT || {};
  window.JoWT.getGalleryItems = GalleryData.getGalleryItems;
  window.JoWT.saveGalleryItems = GalleryData.saveGalleryItems;
})(window);
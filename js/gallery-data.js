/**
 * Joe's Window Tinting — Gallery Data Layer
 * Backed by Supabase when configured; localStorage fallback for offline/dev.
 */

(function (window) {
  const STORAGE_KEY_GALLERY = 'jowt_gallery_items';
  const STORAGE_KEY_CATEGORIES = 'jowt_gallery_categories';
  const STORAGE_KEY_SUBMISSIONS = 'jowt_submissions';

  const SEED_GALLERY = [];

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
    if (saved && Array.isArray(saved)) return saved;
    if (seed.length > 0 && window.JoWT) window.JoWT.saveToStorage(key, seed);
    return [...seed];
  }

  function clearLocalGalleryCache() {
    try {
      localStorage.removeItem(STORAGE_KEY_GALLERY);
    } catch (_) {}
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
            clearLocalGalleryCache();
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
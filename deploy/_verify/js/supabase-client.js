/**
 * Joe's Window Tinting — Supabase Client Helper (Production Ready)
 *
 * CONFIG (embedded — same pattern as ThankQTattoo):
 *   - Project URL and Anon Key are set below.
 *   - Storage bucket: gallery-images (must be PUBLIC)
 *
 * TABLES USED:
 *   - gallery_items (id, title, description, category, vehicle_type, darkness, img, storage_path, created_at)
 *
 * USAGE:
 *   Include AFTER the Supabase CDN:
 *     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *     <script src="js/supabase-client.js"></script>
 *
 *   Then use: await JoWTSupabase.getGalleryItems(), etc.
 */

(function () {
  const SUPABASE_URL = 'https://ozcmvbqshiggrchjcjqj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y212YnFzaGlnZ3JjaGpjanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjM2MTIsImV4cCI6MjA5NzE5OTYxMn0.8h2WXuynolzjnKZ2PwLJpkkFM9lUT7hC2rVw1zqCbq8';
  const STORAGE_BUCKET = 'gallery-images';

  const DEFAULT_CATEGORIES = [
    { id: 'cat-all', name: 'All Work' },
    { id: 'cat-auto', name: 'Automotive' },
    { id: 'cat-truck', name: 'Trucks & SUVs' },
    { id: 'cat-ag', name: 'Ag & Equipment' },
    { id: 'cat-comm', name: 'Commercial' },
    { id: 'cat-res', name: 'Residential' },
  ];

  let supabaseClient = null;

  function getSupabase() {
    if (supabaseClient) return supabaseClient;

    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      console.error('[Supabase] @supabase/supabase-js CDN not found. Include the CDN script before supabase-client.js');
      return null;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    return supabaseClient;
  }

  function isPlaceholderImage(url) {
    if (!url || typeof url !== 'string') return true;
    const lower = url.toLowerCase().trim();
    if (!lower) return true;
    return (
      lower.includes('picsum.photos') ||
      lower.includes('placehold.co') ||
      lower.includes('placeholder.com') ||
      lower.includes('via.placeholder.com')
    );
  }

  function rowToItem(row) {
    if (!row) return null;
    return {
      id: row.id,
      title: row.title || '',
      desc: row.description || '',
      category: row.category || 'automotive',
      vehicleType: row.vehicle_type || 'car',
      darkness: row.darkness || '',
      img: row.img || '',
      storagePath: row.storage_path || null,
      createdAt: row.created_at || null,
    };
  }

  function itemToRow(item) {
    return {
      title: item.title,
      description: item.desc || item.description || '',
      category: item.category || 'automotive',
      vehicle_type: item.vehicleType || item.vehicle_type || 'car',
      darkness: item.darkness || '20%',
      img: item.img || null,
      storage_path: item.storagePath || item.storage_path || null,
    };
  }

  function fileExtension(file) {
    const name = file?.name || '';
    const parts = name.split('.');
    if (parts.length > 1) return parts.pop().toLowerCase();
    if (file?.type === 'image/png') return 'png';
    if (file?.type === 'image/webp') return 'webp';
    if (file?.type === 'image/gif') return 'gif';
    return 'jpg';
  }

  // ============================================================
  // GALLERY
  // ============================================================

  async function getGalleryItems() {
    const client = getSupabase();
    if (!client) {
      console.warn('[Supabase] Client not available — returning empty gallery');
      return [];
    }

    try {
      const { data, error } = await client
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || [])
        .map(rowToItem)
        .filter((item) => item && !isPlaceholderImage(item.img));
    } catch (err) {
      console.error('[Supabase] getGalleryItems error:', err);
      return [];
    }
  }

  function getCategories() {
    return [...DEFAULT_CATEGORIES];
  }

  async function uploadImageToStorage(file, onProgress) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not available');

    const ext = fileExtension(file);
    const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    let progress = 8;
    if (onProgress) onProgress(progress);

    const progressInterval = setInterval(() => {
      if (progress < 68) {
        progress = Math.min(68, progress + (Math.random() * 7 + 3));
        if (onProgress) onProgress(Math.floor(progress));
      }
    }, 180);

    try {
      const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

      clearInterval(progressInterval);

      if (error) {
        if (error.message && error.message.includes('Bucket not found')) {
          throw new Error(`Storage bucket "${STORAGE_BUCKET}" does not exist or is not public.`);
        }
        throw error;
      }

      if (onProgress) onProgress(78);

      const { data: publicData } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);

      if (onProgress) onProgress(100);

      return { publicUrl: publicData.publicUrl, storagePath: path };
    } catch (err) {
      clearInterval(progressInterval);
      throw err;
    }
  }

  async function uploadGalleryImage(file, metadata = {}, onProgress) {
    const uploaded = await uploadImageToStorage(file, onProgress);

    const client = getSupabase();
    if (!client) throw new Error('Supabase client not available');

    const row = itemToRow({ ...metadata, img: uploaded.publicUrl, storagePath: uploaded.storagePath });

    const { data, error } = await client
      .from('gallery_items')
      .insert(row)
      .select('*')
      .single();

    if (error) throw error;
    return rowToItem(data);
  }

  async function updateGalleryItem(id, updates) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not available');

    const row = {};
    if (updates.title != null) row.title = updates.title;
    if (updates.desc != null) row.description = updates.desc;
    if (updates.category != null) row.category = updates.category;
    if (updates.vehicleType != null) row.vehicle_type = updates.vehicleType;
    if (updates.darkness != null) row.darkness = updates.darkness;

    const { data, error } = await client
      .from('gallery_items')
      .update(row)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return rowToItem(data);
  }

  async function deleteGalleryItem(id) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not available');

    const { data: existing, error: fetchError } = await client
      .from('gallery_items')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const { error } = await client.from('gallery_items').delete().eq('id', id);
    if (error) throw error;

    if (existing?.storage_path) {
      const { error: storageError } = await client.storage.from(STORAGE_BUCKET).remove([existing.storage_path]);
      if (storageError) console.warn('[Supabase] Storage delete failed:', storageError.message);
    }

    return true;
  }

  // ============================================================
  // AUTH (for admin)
  // ============================================================

  async function signInAdmin(email, password) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not loaded');

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signUpAdmin(email, password) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not loaded');

    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOutAdmin() {
    const client = getSupabase();
    if (client) await client.auth.signOut();
  }

  async function getCurrentUser() {
    const client = getSupabase();
    if (!client) return null;
    const { data: { user } } = await client.auth.getUser();
    return user;
  }

  function onAuthChange(callback) {
    const client = getSupabase();
    if (client) return client.auth.onAuthStateChange(callback);
    return null;
  }

  function isSupabaseReady() {
    return !!getSupabase();
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.JoWTSupabase = {
    SUPABASE_URL,
    STORAGE_BUCKET,
    DEFAULT_CATEGORIES,

    getSupabase,
    isSupabaseReady,

    getGalleryItems,
    getCategories,
    uploadImageToStorage,
    uploadGalleryImage,
    updateGalleryItem,
    deleteGalleryItem,

    signInAdmin,
    signUpAdmin,
    signOutAdmin,
    getCurrentUser,
    onAuthChange,
  };
})();
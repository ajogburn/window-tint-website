/**
 * Joe's Window Tinting — Supabase client (gallery + auth)
 */
(function (window) {
  const config = window.JoWTSupabaseConfig || {};
  let client = null;

  function isConfigured() {
    return Boolean(config.url && config.anonKey && window.supabase?.createClient);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!client) {
      client = window.supabase.createClient(config.url, config.anonKey);
    }
    return client;
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

  async function uploadImage(file) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase is not configured');

    const ext = fileExtension(file);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const { error: uploadError } = await sb.storage
      .from(config.storageBucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) throw uploadError;

    const { data } = sb.storage.from(config.storageBucket).getPublicUrl(path);
    return { publicUrl: data.publicUrl, storagePath: path };
  }

  async function deleteStorageObject(storagePath) {
    if (!storagePath) return;
    const sb = getClient();
    if (!sb) return;

    const { error } = await sb.storage.from(config.storageBucket).remove([storagePath]);
    if (error) console.warn('Storage delete failed:', error.message);
  }

  const JoWTSupabase = {
    isConfigured,
    getClient,

    async getSession() {
      const sb = getClient();
      if (!sb) return null;
      const { data } = await sb.auth.getSession();
      return data.session;
    },

    onAuthStateChange(callback) {
      const sb = getClient();
      if (!sb) return { data: { subscription: { unsubscribe() {} } } };
      return sb.auth.onAuthStateChange(callback);
    },

    async signIn(email, password) {
      const sb = getClient();
      if (!sb) throw new Error('Supabase is not configured');
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    async signOut() {
      const sb = getClient();
      if (!sb) return;
      await sb.auth.signOut();
    },

    async fetchGalleryItems() {
      const sb = getClient();
      if (!sb) throw new Error('Supabase is not configured');

      const { data, error } = await sb
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(rowToItem);
    },

    async addGalleryItem(item, file) {
      const sb = getClient();
      if (!sb) throw new Error('Supabase is not configured');

      let img = item.img || '';
      let storagePath = item.storagePath || null;

      if (file) {
        const uploaded = await uploadImage(file);
        img = uploaded.publicUrl;
        storagePath = uploaded.storagePath;
      }

      const row = itemToRow({ ...item, img, storagePath });

      const { data, error } = await sb
        .from('gallery_items')
        .insert(row)
        .select('*')
        .single();

      if (error) throw error;
      return rowToItem(data);
    },

    async updateGalleryItem(id, updates) {
      const sb = getClient();
      if (!sb) throw new Error('Supabase is not configured');

      const row = {};
      if (updates.title != null) row.title = updates.title;
      if (updates.desc != null) row.description = updates.desc;
      if (updates.category != null) row.category = updates.category;
      if (updates.vehicleType != null) row.vehicle_type = updates.vehicleType;
      if (updates.darkness != null) row.darkness = updates.darkness;

      const { data, error } = await sb
        .from('gallery_items')
        .update(row)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return rowToItem(data);
    },

    async deleteGalleryItem(id) {
      const sb = getClient();
      if (!sb) throw new Error('Supabase is not configured');

      const { data: existing, error: fetchError } = await sb
        .from('gallery_items')
        .select('storage_path')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const { error } = await sb.from('gallery_items').delete().eq('id', id);
      if (error) throw error;

      if (existing?.storage_path) {
        await deleteStorageObject(existing.storage_path);
      }
    },
  };

  window.JoWTSupabase = JoWTSupabase;
})(window);
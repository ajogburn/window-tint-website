import { createClient } from '@supabase/supabase-js';

const url = 'https://ozcmvbqshiggrchjcjqj.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y212YnFzaGlnZ3JjaGpjanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjM2MTIsImV4cCI6MjA5NzE5OTYxMn0.8h2WXuynolzjnKZ2PwLJpkkFM9lUT7hC2rVw1zqCbq8';

const supabase = createClient(url, anonKey);

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'admin@joestint.com',
  password: 'jowt2025',
});

if (authError) {
  console.error('Auth failed:', authError.message);
  process.exit(1);
}
console.log('✓ Auth OK:', authData.user.email);

const { data, error } = await supabase.from('gallery_items').select('id').limit(1);
if (error) {
  console.log('Table status:', error.message);
  process.exit(error.code === 'PGRST205' ? 2 : 1);
}
console.log('✓ gallery_items accessible, rows:', data?.length ?? 0);
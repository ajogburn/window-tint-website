import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const url = 'https://ozcmvbqshiggrchjcjqj.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y212YnFzaGlnZ3JjaGpjanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjM2MTIsImV4cCI6MjA5NzE5OTYxMn0.8h2WXuynolzjnKZ2PwLJpkkFM9lUT7hC2rVw1zqCbq8';

const supabase = createClient(url, anonKey);
const __dirname = dirname(fileURLToPath(import.meta.url));

await supabase.auth.signInWithPassword({ email: 'admin@joestint.com', password: 'jowt2025' });

const imgPath = join(__dirname, '..', 'img', 'jeep.png');
const file = new Blob([readFileSync(imgPath)], { type: 'image/png' });
const path = `test-${Date.now()}.png`;

const { error } = await supabase.storage.from('gallery-images').upload(path, file);
console.log(error ? `Upload failed: ${error.message}` : `✓ Upload OK: ${path}`);
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: all, error: err1 } = await supabase.from('artist_professions').select('name');
  const { data: active, error: err2 } = await supabase.from('artist_professions').select('name').eq('is_active', true);
  
  console.log(`Total professions: ${all.length}`);
  console.log(`Active professions: ${active.length}`);
  
  const { data: profiles } = await supabase.from('artist_profiles').select('categories');
  const seededCategories = new Set();
  profiles.forEach(p => {
    if (p.categories) p.categories.forEach(c => seededCategories.add(c));
  });
  console.log(`Professions with seeded artists: ${seededCategories.size}`);
}

check();

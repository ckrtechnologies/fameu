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

async function fixCase() {
  console.log('Fixing artist_professions casing...');
  const { data: profs } = await supabase.from('artist_professions').select('id, name');
  for (const p of profs) {
    if (p.name !== p.name.toLowerCase()) {
      await supabase.from('artist_professions').update({ name: p.name.toLowerCase() }).eq('id', p.id);
    }
  }

  console.log('Fixing artist_profiles categories casing...');
  const { data: profiles } = await supabase.from('artist_profiles').select('id, categories');
  let count = 0;
  for (const p of profiles) {
    if (p.categories && Array.isArray(p.categories)) {
      const lowerCats = p.categories.map(c => c.toLowerCase());
      // Check if any change is needed
      if (JSON.stringify(p.categories) !== JSON.stringify(lowerCats)) {
        await supabase.from('artist_profiles').update({ categories: lowerCats }).eq('id', p.id);
        count++;
      }
    }
  }

  console.log(`✅ Fixed casing for ${count} artist profiles.`);
  process.exit(0);
}

fixCase();

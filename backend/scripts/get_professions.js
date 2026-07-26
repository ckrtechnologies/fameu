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

async function getProfessions() {
  const { data, error } = await supabase.from('artist_professions').select('name').eq('is_active', true);
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data.map(d => d.name)));
  }
}

getProfessions();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('conversations').select(`
        id,
        participant1_id,
        participant2_id,
        updated_at,
        p1:participant1_id ( id, display_name, avatar_url, role, artist_profiles(full_name), hiring_profiles(company_name) ),
        p2:participant2_id ( id, display_name, avatar_url, role, artist_profiles(full_name), hiring_profiles(company_name) )
      `).limit(1);
  console.log(JSON.stringify(data, null, 2));
}
check();

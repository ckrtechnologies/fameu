import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('profile_visits')
    .select(`
      visited_at,
      users!profile_visits_viewer_id_fkey (
        id,
        display_name,
        avatar_url,
        role,
        artist_profiles ( full_name ),
        hiring_profiles ( company_name )
      )
    `)
    .limit(1);
  console.log("Error:", error);
}
test();

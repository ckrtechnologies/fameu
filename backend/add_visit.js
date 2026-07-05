import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('profile_visits').insert([
    {
      profile_user_id: '7c56267c-3adc-4dd6-be1e-7ee4c426d933', // Luna
      viewer_id: '5b131f11-4166-4c56-bac3-7e4204572a8d', // Chandan
      visit_date: new Date().toISOString()
    }
  ]);
  console.log("Inserted:", data, error);
}
check();

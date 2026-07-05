import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('profile_visits')
    .select('*')
    .eq('profile_user_id', '7c56267c-3adc-4dd6-be1e-7ee4c426d933');
  console.log("Luna visitors:", data);
}
test();

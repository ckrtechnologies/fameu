import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('auditions').select('*, hiring_profiles(company_name, description, logo_url, is_verified, users(username))').limit(1).single();
  console.log(JSON.stringify(data, null, 2));
}
test();

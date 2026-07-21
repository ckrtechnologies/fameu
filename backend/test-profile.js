import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === 'mallik.era@gmail.com');
  const { data: profile } = await supabase.from('artist_profiles').select('*').eq('user_id', user.id).single();
  console.log("Artist Profile:", profile);
}
check().catch(console.error);

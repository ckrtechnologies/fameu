import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('users').select('id, email, display_name').eq('id', '7c149a17-462e-48aa-9b33-e2578d56827d');
  console.log("Viewer:", data, error);
}
check();

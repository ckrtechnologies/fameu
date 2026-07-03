import 'dotenv/config';
import supabase from './src/config/supabase.js';

async function run() {
  const { data: users, error } = await supabase.from('users').select('id, mobile, email, role');
  console.log("Users:", users);
}
run();

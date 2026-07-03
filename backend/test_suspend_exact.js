import 'dotenv/config';
import supabase from './src/config/supabase.js';

async function run() {
  const id = '0ceb6b64-5d7d-4b88-8a47-2d621f36a0c4';
  console.log("Trying exact id:", id);
  
  const { error: e3 } = await supabase.from('auditions').update({ status: 'cancelled' }).eq('id', id);
  console.log("cancelled error:", e3?.message || e3);
}
run();

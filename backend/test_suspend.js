import 'dotenv/config';
import supabase from './src/config/supabase.js';

async function run() {
  const { data: auditions } = await supabase.from('auditions').select('id, status').limit(1);
  if (!auditions || auditions.length === 0) { console.log("no auditions"); return; }
  
  const id = auditions[0].id;
  console.log("Trying id:", id);
  
  const { error: e1 } = await supabase.from('auditions').update({ status: 'suspended' }).eq('id', id);
  console.log("suspended error:", e1?.message || e1);
  
  const { error: e2 } = await supabase.from('auditions').update({ status: 'expired' }).eq('id', id);
  console.log("expired error:", e2?.message || e2);
  
  const { error: e3 } = await supabase.from('auditions').update({ status: 'cancelled' }).eq('id', id);
  console.log("cancelled error:", e3?.message || e3);

  // Restore active
  await supabase.from('auditions').update({ status: 'active' }).eq('id', id);
}
run();

import 'dotenv/config';
import supabase from './src/config/supabase.js';

async function run() {
  const { data, error } = await supabase.rpc('get_table_schema');
  console.log("RPC Error:", error);
  // We can't use raw sql, but we can query pg_catalog or information_schema?
  // Supabase postgrest exposes some tables, but maybe not information_schema.
  
  // Let's test just inserting 'cancelled' directly to see what error it gives
  const { data: auditions } = await supabase.from('auditions').select('id, status').limit(1);
  if (!auditions || auditions.length === 0) return;
  const id = auditions[0].id;
  
  const res = await supabase.from('auditions').update({ status: 'cancelled' }).eq('id', id);
  console.log("Cancelled Update Result:", res.error);
}
run();

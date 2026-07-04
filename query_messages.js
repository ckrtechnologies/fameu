require('dotenv').config({ path: 'backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('messages')
    .select('*, users!messages_sender_id_fkey(display_name)')
    .order('created_at', { ascending: false })
    .limit(20);
  console.log(JSON.stringify(data, null, 2));
}
run();

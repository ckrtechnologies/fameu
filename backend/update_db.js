const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('hiring_profiles').update({ verification_status: 'unverified' }).eq('verification_status', 'pending');
  console.log('Updated:', error ? error : 'Success');
}
run();

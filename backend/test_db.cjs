const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/chandanmallik/projects/Fameu/backend/.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('auditions').select('id, title, thumbnail_url, hiring_profiles(logo_url)').limit(3);
  console.log(JSON.stringify(data, null, 2));
}
run();

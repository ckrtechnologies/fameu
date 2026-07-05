const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/chandanmallik/projects/Fameu/backend/.env' });
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function migrate() {
  const { data, error } = await sb.from('auditions').select('id, gender');
  if (error) throw error;
  
  for (let aud of data) {
    let g = aud.gender;
    if (!g) continue;
    let newG = g;
    if (g === 'm' || g === 'M' || g === 'male') newG = 'Male';
    if (g === 'f' || g === 'F' || g === 'female') newG = 'Female';
    if (g === 'o' || g === 'O' || g === 'other') newG = 'Other';
    
    if (newG !== g) {
      console.log(`Updating audition ${aud.id} from ${g} to ${newG}`);
      await sb.from('auditions').update({ gender: newG }).eq('id', aud.id);
    }
  }
  console.log('Done migrating audition genders.');
}
migrate();

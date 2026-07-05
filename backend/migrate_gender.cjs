const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/chandanmallik/projects/Fameu/backend/.env' });
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function migrate() {
  const { data, error } = await sb.from('artist_profiles').select('id, gender');
  if (error) throw error;
  
  for (let profile of data) {
    let g = profile.gender;
    let newG = g;
    if (g === 'm' || g === 'M' || g === 'male') newG = 'Male';
    if (g === 'f' || g === 'F' || g === 'female') newG = 'Female';
    if (g === 'o' || g === 'O' || g === 'other') newG = 'Other';
    
    if (newG !== g) {
      console.log(`Updating ${profile.id} from ${g} to ${newG}`);
      await sb.from('artist_profiles').update({ gender: newG }).eq('id', profile.id);
    }
  }
  console.log('Done migrating genders.');
}
migrate();

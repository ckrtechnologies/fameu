import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
  const { data: user } = await supabase.from('users').select('id').eq('email', 'hiring1@fameu.in').single();
  const userId = user.id;

  // Let's explicitly delete the profile
  await supabase.from('hiring_profiles').delete().eq('user_id', userId);

  // Now let's simulate upsertProfile logic WITHOUT verification_status
  const payload = {
    user_id: userId,
    company_name: 'test company no status',
    company_type: 'test type',
    description: 'test desc'
  };

  const { data: inserted, error } = await supabase.from('hiring_profiles').insert([payload]).select().single();
  console.log('Inserted profile:', inserted);
  console.log('Error:', error);
}
run();

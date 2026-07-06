import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
  const { data: user } = await supabase.from('users').select('id').eq('email', 'hiring1@fameu.in').single();
  const userId = user.id;

  // Let's explicitly delete the profile
  await supabase.from('hiring_profiles').delete().eq('user_id', userId);

  // Now let's simulate upsertProfile logic
  const payload = {
    user_id: userId,
    company_name: 'test company',
    company_type: 'test type',
    description: 'test desc',
    verification_status: 'unverified'
  };

  const { data: inserted } = await supabase.from('hiring_profiles').insert([payload]).select().single();
  console.log('Inserted profile:', inserted);

  // Now simulate an update
  const { data: updated } = await supabase.from('hiring_profiles').update({ company_name: 'new test company' }).eq('id', inserted.id).select().single();
  console.log('Updated profile:', updated);
}
run();

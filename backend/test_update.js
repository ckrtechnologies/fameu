import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
  const { data: user } = await supabase.from('users').select('id').eq('email', 'hiring1@fameu.in').single();
  const userId = user.id;

  const { data: before } = await supabase.from('hiring_profiles').select('*').eq('user_id', userId).single();
  console.log('Before status:', before?.verification_status);

  // simulate update
  const payload = { company_name: 'test update 2' };
  const { data: after, error } = await supabase
    .from('hiring_profiles')
    .update(payload)
    .eq('user_id', userId)
    .select()
    .single();

  console.log('After status:', after?.verification_status);
  console.log('Error:', error?.message);
}
run();

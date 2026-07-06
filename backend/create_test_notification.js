import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
  const { data: user } = await supabase.from('users').select('id').eq('email', 'hiring1@fameu.in').single();
  
  if (user) {
    const { data: inserted, error } = await supabase.from('notifications').insert([{
      user_id: user.id,
      type: 'system',
      title: 'Welcome to Fameu',
      body: 'This is a test notification to check the integration.',
      data: JSON.stringify({ source: 'test' })
    }]).select();
    
    console.log('Inserted notification:', inserted, error);
  }
}
run();

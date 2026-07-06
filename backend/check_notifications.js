import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
  const { data: user } = await supabase.from('users').select('id').eq('email', 'hiring1@fameu.in').single();
  
  if (user) {
    const { data: notifications } = await supabase.from('notifications').select('*').eq('user_id', user.id);
    console.log('User notifications:', notifications);
  }
}
run();

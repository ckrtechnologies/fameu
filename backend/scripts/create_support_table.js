import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/chandanmallik/projects/Fameu/backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: `
      CREATE TABLE IF NOT EXISTS public.support_tickets (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
        user_type varchar(20) NOT NULL,
        subject varchar(255) NOT NULL,
        message text NOT NULL,
        status varchar(20) DEFAULT 'open',
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      
      ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow public insert" ON public.support_tickets;
      CREATE POLICY "Allow public insert" ON public.support_tickets FOR INSERT WITH CHECK (true);
      
      DROP POLICY IF EXISTS "Allow individual select" ON public.support_tickets;
      CREATE POLICY "Allow individual select" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
    `
  });
  
  if (error) {
    console.error('Error creating table via exec_sql RPC:', error);
  } else {
    console.log('Successfully created support_tickets table!');
  }
}

main();

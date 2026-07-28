-- Create the support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  user_type varchar(20) NOT NULL,
  subject varchar(255) NOT NULL,
  message text NOT NULL,
  status varchar(20) DEFAULT 'open',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert tickets (authenticated or public depending on your setup)
CREATE POLICY "Allow public insert" ON public.support_tickets FOR INSERT WITH CHECK (true);

-- Allow users to select their own tickets
CREATE POLICY "Allow individual select" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);

import { createClient  } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
  console.warn('⚠️ Missing Supabase environment variables. Database connection will fail.');
}

// Use Service Role Key to bypass RLS in the Express backend, fallback to Anon key
const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:8000',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder'
);

export default supabase;

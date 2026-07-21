import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const orQuery = "category.ilike.%Actor%,category.ilike.%theatre actor%,category.ilike.%aerial artist%";
  const { data, error } = await supabase.from('auditions').select('*').eq('status', 'active').or(orQuery);
  console.log("Data length:", data?.length);
  console.log("Error:", error);
}
test();

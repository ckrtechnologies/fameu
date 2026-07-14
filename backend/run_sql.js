import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('run_sql', { sql_query: "ALTER TABLE profiles ALTER COLUMN work_preference TYPE TEXT[] USING string_to_array(work_preference, ',');" });
  if (error) {
    console.error(error);
  } else {
    console.log("Success");
  }
}
run();

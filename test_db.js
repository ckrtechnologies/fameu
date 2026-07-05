import supabase from './backend/src/config/supabase.js';

async function test() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: "ALTER TABLE auditions ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;"
  });
  if (error) {
    console.error("RPC Error:", error);
  } else {
    console.log("Success:", data);
  }
}

test();

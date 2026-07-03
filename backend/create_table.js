import supabase from './src/config/supabase.js';

async function createTable() {
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS admin_broadcasts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        target_audience TEXT NOT NULL,
        target_user_id UUID,
        deep_link TEXT,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (error) {
    console.log('RPC execute_sql failed. You might not have an execute_sql function in Supabase. Alternative approach: We can just use the notifications table, but assign user_id to the admin who sent it, and type to "admin_broadcast".');
    console.error(error);
  } else {
    console.log('Success:', data);
  }
}

createTable();

import 'dotenv/config';
import supabase from './src/config/supabase.js';

async function updateRole() {
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'artist' })
    .eq('mobile', '7982296878')
    .select();
    
  if (error) {
    console.error("Error updating role:", error);
  } else {
    console.log("Updated role successfully:", data);
  }
  process.exit(0);
}

updateRole();

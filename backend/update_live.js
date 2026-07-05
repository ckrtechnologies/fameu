import { config } from 'dotenv';
config();

async function updateLiveStatus() {
  const { default: supabase } = await import('./src/config/supabase.js');

  const { data, error } = await supabase
    .from('auditions')
    .update({ is_live: true })
    .eq('status', 'active');
    
  if (error) {
    console.error('Error updating auditions:', error);
  } else {
    console.log('Successfully updated active auditions to is_live = true');
  }
}

updateLiveStatus();

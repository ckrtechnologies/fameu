import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixImages() {
  console.log('Fetching all artist profiles...');
  const { data: profiles, error } = await supabase.from('artist_profiles').select('id, user_id, full_name, gender');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    process.exit(1);
  }

  console.log(`Found ${profiles.length} profiles. Updating images to headshots...`);

  let count = 0;
  for (const profile of profiles) {
    // Generate a random ID between 0 and 99 for randomuser.me
    // We use randomuser.me because it guarantees a real human headshot
    const isFemale = profile.gender === 'Female' || Math.random() > 0.5;
    const genderPath = isFemale ? 'women' : 'men';
    
    const r1 = Math.floor(Math.random() * 99);
    const avatar = `https://randomuser.me/api/portraits/${genderPath}/${r1}.jpg`;
    
    const r2 = Math.floor(Math.random() * 99);
    const r3 = Math.floor(Math.random() * 99);
    const r4 = Math.floor(Math.random() * 99);

    const photos = [
      `https://randomuser.me/api/portraits/${genderPath}/${r2}.jpg`,
      `https://randomuser.me/api/portraits/${genderPath}/${r3}.jpg`,
      `https://randomuser.me/api/portraits/${genderPath}/${r4}.jpg`
    ];

    const { error: updateError } = await supabase
      .from('artist_profiles')
      .update({
        avatar_url: avatar,
        photo_urls: photos
      })
      .eq('id', profile.id);

    // Also update the avatar in public.users to match
    await supabase.from('users').update({ avatar_url: avatar }).eq('id', profile.user_id);

    if (updateError) {
      console.error(`Error updating ${profile.full_name}:`, updateError);
    } else {
      count++;
      if (count % 25 === 0) console.log(`Updated ${count}/${profiles.length}...`);
    }
  }

  console.log(`✅ Successfully updated ${count} profiles with human headshots.`);
  process.exit(0);
}

fixImages();

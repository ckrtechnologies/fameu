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

const PROFESSIONS = ['Actor', 'Model', 'Singer', 'Dancer', 'Technician', 'Writer', 'Director', 'Musician', 'Comedian'];
const PROJECT_TYPES = ['Feature Film', 'Short Film', 'Web Series', 'TV Commercial', 'Music Video'];
const DURATION_TYPES = ['Date Specific', 'Hours', 'Days', 'Months'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune'];

const CINEMATIC_IMAGES = [
  'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop', // Camera
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop', // Film Reel
  'https://images.unsplash.com/photo-1518131672697-611eb141a085?q=80&w=800&auto=format&fit=crop', // Clapperboard
  'https://images.unsplash.com/photo-1574267432553-4b4628081524?q=80&w=800&auto=format&fit=crop', // Stage Lights
  'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=800&auto=format&fit=crop', // Script
  'https://images.unsplash.com/photo-1516280440502-85f543dc6fba?q=80&w=800&auto=format&fit=crop', // Microphone
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop', // Dancer
  'https://images.unsplash.com/photo-1533422902701-443b749d0315?q=80&w=800&auto=format&fit=crop', // Clapperboard 2
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop', // Theater
  'https://images.unsplash.com/photo-1616423641405-b3a1a9e6bb07?q=80&w=800&auto=format&fit=crop'  // Studio Setup
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate() {
  const today = new Date();
  const rand = Math.random();
  const date = new Date(today);
  if (rand < 0.2) {
    // 20% chance of past date (Closed)
    date.setDate(today.getDate() - Math.floor(Math.random() * 14) - 1);
  } else if (rand < 0.4) {
    // 20% chance of today (Live)
    // keep as is
  } else {
    // 60% chance of future date (Active)
    date.setDate(today.getDate() + Math.floor(Math.random() * 14) + 1);
  }
  return date.toISOString().split('T')[0];
}

async function fixPhotosAndReseed() {
  console.log('1. Syncing recruiter avatar URLs...');
  
  // Get all hiring profiles
  const { data: hiringProfiles } = await supabase.from('hiring_profiles').select('user_id, logo_url');
  
  if (hiringProfiles) {
    let synced = 0;
    for (const profile of hiringProfiles) {
      if (profile.logo_url) {
        await supabase.from('users').update({ avatar_url: profile.logo_url }).eq('id', profile.user_id);
        synced++;
      }
    }
    console.log(`Synced ${synced} recruiter avatars in the users table.`);
  }

  console.log('2. Deleting old auditions with generic picsum thumbnails...');
  await supabase.from('auditions').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all

  console.log('3. Re-seeding auditions with high-quality cinematic thumbnails...');
  const { data: managers } = await supabase.from('hiring_profiles').select('id, company_name');
  
  if (!managers || managers.length === 0) {
    console.log('No hiring managers found. Run seed_hiring.js first.');
    return;
  }

  const { data: profData } = await supabase.from('artist_professions').select('name');
  const dbProfessions = profData ? profData.map(p => p.name) : PROFESSIONS;
  console.log(`Found ${dbProfessions.length} professions to seed.`);

  let insertedCount = 0;

  for (const manager of managers) {
    for (const profession of dbProfessions) {
      for (let i = 0; i < 2; i++) {
        const audDate = getRandomDate();
        
        const extraMeta = JSON.stringify({
          project_type: getRandomItem(PROJECT_TYPES),
          duration_type: getRandomItem(DURATION_TYPES),
          city: getRandomItem(CITIES),
          description_pdf_url: null,
          budget: `${Math.floor(Math.random() * 50 + 10)}k INR`,
          gender_req: getRandomItem(['Male', 'Female', 'Any']),
          specific_start_date: audDate,
          specific_end_date: audDate
        });

        const payload = {
          hiring_id: manager.id,
          title: `Looking for ${profession} for ${getRandomItem(PROJECT_TYPES)}`,
          role_description: `We are urgently looking for a talented ${profession} to join our upcoming project. Must be experienced and available for immediate shoot.`,
          character_req: `Strong screen presence, good communication skills.`,
          category: profession,
          language: ['English', 'Hindi'],
          age_min: 18 + Math.floor(Math.random() * 5),
          age_max: 30 + Math.floor(Math.random() * 20),
          gender: getRandomItem(['Male', 'Female', 'Any']),
          audition_type: getRandomItem(['walkin', 'scheduled']),
          venue_address: `123 ${getRandomItem(CITIES)} Studio Hub`,
          lat: 19.0760 + (Math.random() * 0.1 - 0.05),
          lng: 72.8777 + (Math.random() * 0.1 - 0.05),
          audition_date: audDate,
          date: audDate,
          audition_time: '10:00:00',
          compensation: 'Negotiable based on experience',
          instructions: extraMeta,
          status: 'active',
          is_live: true,
          thumbnail_url: getRandomItem(CINEMATIC_IMAGES),
        };

        const { error } = await supabase.from('auditions').insert([payload]);
        if (error) {
          console.error(`Error inserting audition for ${manager.company_name}:`, error.message);
        } else {
          insertedCount++;
        }
      }
    }
  }

  console.log(`\n✅ Successfully re-seeded ${insertedCount} active auditions with cinematic photos across ${dbProfessions.length} professions.`);
  process.exit(0);
}

fixPhotosAndReseed();

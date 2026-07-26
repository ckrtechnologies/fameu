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

const PROFESSIONS = ['actor', 'model', 'singer', 'dancer', 'writer'];

const PROJECT_TYPES = ['Feature Film', 'Short Film', 'Web Series', 'TV Commercial', 'Music Video'];
const DURATION_TYPES = ['Date Specific', 'Hours', 'Days', 'Months'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + Math.floor(Math.random() * 14)); // Up to 14 days in future
  return nextWeek.toISOString().split('T')[0];
}

async function seedAuditions() {
  console.log('Fetching hiring managers...');
  const { data: managers } = await supabase.from('hiring_profiles').select('id, company_name');
  
  if (!managers || managers.length === 0) {
    console.log('No hiring managers found. Run seed_hiring.js first.');
    return;
  }

  console.log(`Found ${managers.length} hiring managers. Creating auditions...`);
  
  let insertedCount = 0;

  for (const manager of managers) {
    for (const profession of PROFESSIONS) {
      // 2 auditions per profession per manager
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
          thumbnail_url: `https://picsum.photos/seed/${manager.id}${profession}${i}/500/500`,
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

  console.log(`\n✅ Successfully seeded ${insertedCount} active auditions.`);
  process.exit(0);
}

seedAuditions();

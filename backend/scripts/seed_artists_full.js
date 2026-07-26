import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Ananya", "Myra", "Avni", "Sara", "Aadhya", "Diya", "Kashvi", "Jhanvi", "Zara", "Riya", "Aria", "Kabir", "Neha", "Priya", "Rahul", "Rohan", "Maya", "Karan"];
const LAST_NAMES = ["Sharma", "Verma", "Gupta", "Malhotra", "Singh", "Patel", "Kumar", "Chauhan", "Bhatia", "Reddy", "Rao", "Nair", "Iyer", "Joshi", "Desai", "Mehta", "Shah", "Kaur", "Khan", "Choudhury"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane"];
const GENDERS = ["Male", "Female"];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Professional", "Expert"];
const AVAILABILITY = ["full_time", "part_time", "freelance"];

const AVATARS = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=500&q=80"
];

const GALLERIES = [
  [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    "https://images.unsplash.com/photo-1509631179647-0c37cb5377f3?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=800&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
    "https://images.unsplash.com/photo-1516280440502-6c701bd628d0?w=800&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1493225457124-a1a2f5af9a22?w=800&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
  ]
];

const VIDEOS = [
  "https://www.youtube.com/watch?v=5qap5aO4i9A",
  "https://www.youtube.com/watch?v=7M71yqYxL_Q",
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedArtists() {
  console.log('Fetching active professions...');
  const { data: professions, error: profError } = await supabase
    .from('artist_professions')
    .select('name')
    .eq('is_active', true);

  if (profError) {
    console.error('Error fetching professions:', profError);
    process.exit(1);
  }

  console.log(`Found ${professions.length} professions. Seeding 5 artists for each...`);
  
  let totalSeeded = 0;

  for (const prof of professions) {
    const professionName = prof.name;
    console.log(`\n--- Seeding 5 artists for: ${professionName} ---`);

    for (let i = 1; i <= 5; i++) {
      const fName = rand(FIRST_NAMES);
      const lName = rand(LAST_NAMES);
      const fullName = `${fName} ${lName}`;
      const uniqueSuffix = Date.now().toString().slice(-6) + Math.random().toString().slice(2, 6);
      const username = `${fName.toLowerCase()}_${prof.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${uniqueSuffix}`;
      const email = `${username}@example.com`;
      const password = 'Password123!';
      const phone = `+919${randInt(100000000, 999999999)}`;
      
      console.log(` Creating ${fullName} (${email})...`);

      try {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          phone: phone,
          phone_confirm: true,
          user_metadata: {
            role: 'artist',
            full_name: fullName,
            avatar_url: rand(AVATARS)
          }
        });

        if (authError) {
          console.error(`  Auth error for ${email}:`, authError.message);
          continue;
        }

        const userId = authData.user.id;

        // 2. Ensure public.users is correct
        await supabase.from('users').update({
          username: username,
          followers_count: randInt(10, 5000),
          is_active: true
        }).eq('id', userId);

        // 3. Create Artist Profile
        const isCintaa = Math.random() > 0.8;
        const profilePayload = {
          user_id: userId,
          full_name: fullName,
          categories: [professionName],
          age: randInt(18, 55),
          gender: rand(GENDERS),
          height: `5'${randInt(1, 11)}"`,
          weight: `${randInt(50, 90)} kg`,
          city: rand(CITIES),
          bio: `Hi, I am ${fullName}, an experienced ${professionName} based in ${rand(CITIES)}. I am passionate about my craft and looking forward to exciting projects.`,
          experience: rand(EXPERIENCE_LEVELS),
          languages: ["English", "Hindi"],
          skills: [professionName, "Team Player", "Creative"],
          avatar_url: authData.user.user_metadata.avatar_url,
          photo_urls: rand(GALLERIES),
          video_url: rand(VIDEOS),
          intro_video_url: rand(VIDEOS),
          social_links: {
            instagram: "https://instagram.com/example",
            youtube: "https://youtube.com/example"
          },
          is_cintaa_member: isCintaa,
          cintaa_reg_number: isCintaa ? `CIN${randInt(10000, 99999)}` : null,
          availability_type: rand(AVAILABILITY),
          work_preference: ["Bollywood", "OTT", "Ad Films"],
          preferred_cities: [rand(CITIES), rand(CITIES)],
          profile_complete_pct: randInt(70, 100),
          is_verified: Math.random() > 0.5,
          verification_status: 'verified'
        };

        const { data: profileData, error: profileError } = await supabase
          .from('artist_profiles')
          .insert(profilePayload)
          .select('id')
          .single();

        if (profileError) {
          console.error(`  Profile error for ${email}:`, profileError.message);
          continue;
        }

        // 4. Create Dynamic Details
        const { error: dynamicError } = await supabase
          .from('artist_dynamic_details')
          .insert({
            artist_id: profileData.id,
            category_name: professionName,
            details: {
              years_active: randInt(1, 20),
              preferred_genre: "Versatile",
              special_notes: "Available for immediate start."
            }
          });

        if (dynamicError) {
          console.error(`  Dynamic details error for ${email}:`, dynamicError.message);
        }

        totalSeeded++;
      } catch (e) {
        console.error(`  Exception processing ${email}:`, e);
      }
    }
  }

  console.log(`\n🎉 Seed Complete! Successfully created ${totalSeeded} artists.`);
  process.exit(0);
}

seedArtists();

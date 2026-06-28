import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:8000',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder'
);

const CATEGORIES = ['Actor', 'Model', 'Singer', 'Dancer', 'Technician'];

const generateAuditions = (hiringId, category, index) => {
  const isWalkin = Math.random() > 0.5;
  const compensationOptions = ['Unpaid / TFP', 'Paid - 1000/day', 'Paid - 5000/day', 'Paid - 10000+ flat'];
  
  return {
    hiring_id: hiringId,
    title: `Looking for talented ${category} for upcoming project #${index}`,
    role_description: `We are looking for a dedicated and talented ${category} to join our latest production. The ideal candidate will have strong skills in their domain and the ability to work collaboratively in a fast-paced environment. This is a fantastic opportunity to build your portfolio and work with an experienced team.`,
    character_req: category === 'Actor' ? 'Needs to be expressive, able to play a mid-20s urban professional.' : 'Strong stage presence and adaptability required.',
    category: category,
    language: ['English', 'Hindi'],
    age_min: 18 + Math.floor(Math.random() * 5),
    age_max: 25 + Math.floor(Math.random() * 20),
    gender: Math.random() > 0.6 ? 'Male' : (Math.random() > 0.5 ? 'Female' : 'Any'),
    audition_type: isWalkin ? 'walkin' : 'scheduled',
    venue_address: isWalkin ? '123 Studio Lane, Andheri West, Mumbai' : null,
    lat: isWalkin ? 19.136326 + (Math.random() * 0.05) : null,
    lng: isWalkin ? 72.827660 + (Math.random() * 0.05) : null,
    audition_date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    audition_time: '10:00:00',
    compensation: compensationOptions[Math.floor(Math.random() * compensationOptions.length)],
    required_docs: 'Resume, Headshots, ID proof',
    instructions: isWalkin ? 'Come dressed in smart casuals. Bring a hard copy of your resume.' : 'Apply online. Shortlisted candidates will be contacted with a Zoom link.',
    status: 'active'
  };
};

async function seed() {
  console.log('Starting seed process...');
  
  // 1. Get or create a hiring profile
  let { data: hiringProfiles, error: fetchError } = await supabase
    .from('hiring_profiles')
    .select('id')
    .limit(1);
    
  if (fetchError) {
    console.error('Error fetching hiring profiles:', fetchError);
    return;
  }
  
  let hiringId = hiringProfiles?.[0]?.id;
  
  if (!hiringId) {
    console.log('No hiring profile found. Creating a dummy one...');
    // Create a dummy user first
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'hiring_seed@fameu.com',
      password: 'password123',
      email_confirm: true
    });
    
    if (userError) {
      console.error('Error creating dummy user:', userError);
      return;
    }
    
    const userId = userData.user.id;
    
    // Create the hiring profile
    const { data: newProfile, error: profileError } = await supabase
      .from('hiring_profiles')
      .insert({
        user_id: userId,
        company_name: 'Fameu Productions',
        company_type: 'Production House',
        description: 'A leading production house creating blockbusters.'
      })
      .select('id')
      .single();
      
    if (profileError) {
      console.error('Error creating hiring profile:', profileError);
      return;
    }
    hiringId = newProfile.id;
    console.log('Created dummy hiring profile with ID:', hiringId);
  } else {
    console.log('Using existing hiring profile ID:', hiringId);
  }
  
  // 2. Generate 10 auditions for each category
  const auditionsToInsert = [];
  
  CATEGORIES.forEach(category => {
    for (let i = 1; i <= 10; i++) {
      auditionsToInsert.push(generateAuditions(hiringId, category, i));
    }
  });
  
  console.log(`Inserting ${auditionsToInsert.length} auditions...`);
  
  // Insert in batches of 10 to avoid any limits
  for (let i = 0; i < auditionsToInsert.length; i += 10) {
    const batch = auditionsToInsert.slice(i, i + 10);
    const { error: insertError } = await supabase
      .from('auditions')
      .insert(batch);
      
    if (insertError) {
      console.error(`Error inserting batch ${i / 10 + 1}:`, insertError);
    } else {
      console.log(`Successfully inserted batch ${i / 10 + 1}`);
    }
  }
  
  console.log('✅ Seeding completed!');
  process.exit(0);
}

seed();

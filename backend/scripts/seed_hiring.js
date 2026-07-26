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

const companies = [
  { name: 'Bollywood Dreams Agency', type: 'Casting Agency', desc: 'Leading casting agency in Mumbai specializing in fresh talent.' },
  { name: 'Star Maker Productions', type: 'Production House', desc: 'Producing high-quality web series and ad films.' },
  { name: 'Ad-Hoc Agencies', type: 'Ad Agency', desc: 'Creative ad agency looking for diverse faces for commercial campaigns.' },
  { name: 'Mumbai Casting Co.', type: 'Casting Agency', desc: 'We cast for top-tier Bollywood movies and OTT platforms.' },
  { name: 'CineVision Studios', type: 'Production House', desc: 'Award-winning production house based in Andheri West.' },
  { name: 'NextGen Events', type: 'Event Management', desc: 'Hiring anchors, dancers, and performers for corporate events.' },
  { name: 'Urban Soundtracks', type: 'Record Label', desc: 'Looking for the next big indie music sensation.' },
  { name: 'VFX Masters', type: 'Post-Production', desc: 'Hiring freelance VFX artists and animators.' },
  { name: 'Glitz & Glamour', type: 'Fashion Agency', desc: 'Casting models for print shoots and runway shows.' },
  { name: 'Laugh Out Loud Media', type: 'Production House', desc: 'Comedy content creators looking for stand-up comedians and writers.' }
];

async function seedHiring() {
  console.log('Starting to seed 10 hiring managers...');

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const email = `hiring${i+1}@fameu.in`;
    const password = 'Password123!';
    const username = `hiring${i+1}`;
    
    console.log(`\nCreating user: ${email}...`);

    let userId;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'hiring'
      }
    });

    if (authError) {
      if (authError.status === 422 || (authError.message && authError.message.includes('already'))) {
        console.log('User already exists in Auth. Fetching ID...');
        const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
        if (existingUser) {
          userId = existingUser.id;
        } else {
          console.error(`Could not find existing user in public.users for ${email}`);
          continue;
        }
      } else {
        console.error(`Auth Error:`, authError);
        continue;
      }
    } else {
      userId = authData.user.id;
    }

    // Update public.users role (just in case trigger didn't pick up metadata correctly)
    await supabase.from('users').update({
      role: 'hiring',
      username: username,
      display_name: company.name
    }).eq('id', userId);

    // Check if hiring profile exists
    const { data: existingProfile } = await supabase.from('hiring_profiles').select('id').eq('user_id', userId).single();

    if (!existingProfile) {
      console.log(`Creating hiring_profile for ${company.name}...`);
      const { error: profileError } = await supabase.from('hiring_profiles').insert({
        user_id: userId,
        company_name: company.name,
        company_type: company.type,
        logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&color=fff&size=512`,
        description: company.desc,
        is_verified: true,
        verification_status: 'approved',
        credits: 50 // Give them some credits to test posting auditions
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      } else {
        console.log('Profile created successfully.');
      }
    } else {
      console.log(`hiring_profile already exists for ${company.name}.`);
    }
  }

  console.log('\n✅ Successfully seeded 10 hiring managers.');
  process.exit(0);
}

seedHiring();

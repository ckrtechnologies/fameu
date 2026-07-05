import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import supabase from '../src/config/supabase.js';

const SEED_ARTISTS = [
  {
    username: 'mia.vocals',
    email: 'mia@example.com',
    password: 'Password123!',
    display_name: 'Mia Lawson',
    avatar_url: 'https://images.unsplash.com/photo-1516280440502-6c1775e110a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    categories: ['Singer', 'Band'],
    bio: 'Professional vocalist and frontman for indie pop bands. 10 years of stage experience across the US.',
    location: 'Los Angeles, CA',
    experience_level: 'Expert',
    hourly_rate: 150,
    skills: ['Lead Vocals', 'Acoustic Guitar', 'Songwriting', 'Harmonies'],
    photo_urls: [
      'https://images.unsplash.com/photo-1516280440502-6c1775e110a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502691876148-a84978e59af8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598387993441-a3637e1066b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
    category_details: {
      'Singer': {
        vocal_type: 'Mezzo-Soprano',
        genres: ['Pop', 'Indie', 'Jazz'],
        languages_sung: ['English', 'Spanish'],
        performance_type: ['Solo', 'Band Frontman']
      },
      'Band': {
        instrument: 'Vocals, Rhythm Guitar',
        band_size_preferred: '3-5 members',
        rehearsal_availability: 'Weekends'
      }
    }
  },
  {
    username: 'alex_shoots',
    email: 'alex.model@example.com',
    password: 'Password123!',
    display_name: 'Alex Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    categories: ['Model', 'Actor'],
    bio: 'Fashion and commercial model with a passion for method acting. Featured in GQ and Vogue campaigns.',
    location: 'New York, NY',
    experience_level: 'Professional',
    hourly_rate: 200,
    skills: ['Runway', 'Commercial Print', 'Method Acting', 'Improv'],
    photo_urls: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492288991661-058aa541ff43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category_details: {
      'Model': {
        height: "6'1\"",
        measurements: '38-30-38',
        eye_color: 'Brown',
        hair_color: 'Black',
        willing_to_travel: true
      },
      'Actor': {
        accent_skills: ['Standard American', 'British', 'Spanish'],
        union_status: 'SAG-AFTRA',
        stunt_experience: 'Basic'
      }
    }
  },
  {
    username: 'dj.rhythm',
    email: 'rhythm@example.com',
    password: 'Password123!',
    display_name: 'Marcus "Rhythm" Jones',
    avatar_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    categories: ['Musician', 'Band'],
    bio: 'Professional drummer and percussionist. Groove machine for live performances and studio sessions.',
    location: 'Austin, TX',
    experience_level: 'Expert',
    hourly_rate: 100,
    skills: ['Drum Kit', 'Percussion', 'Electronic Drums', 'Sight Reading'],
    photo_urls: [
      'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    video_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    category_details: {
      'Musician': {
        primary_instrument: 'Drums',
        secondary_instruments: ['Congas', 'Bongos'],
        reading_music: 'Advanced'
      },
      'Band': {
        instrument: 'Drums',
        gear_owned: 'DW Collector Series, Zildjian Cymbals',
        genre_specialties: ['Funk', 'Rock', 'Jazz']
      }
    }
  },
  {
    username: 'rj_samantha',
    email: 'sam.radio@example.com',
    password: 'Password123!',
    display_name: 'Samantha Radio',
    avatar_url: 'https://images.unsplash.com/photo-1583344607797-1515b677a29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    categories: ['RJ', 'Anchor'],
    bio: 'Energetic Radio Jockey and Event Anchor. Known for engaging morning shows and high-energy live events.',
    location: 'Chicago, IL',
    experience_level: 'Intermediate',
    hourly_rate: 80,
    skills: ['Voice Over', 'Live Hosting', 'Crowd Interaction', 'Script Writing'],
    photo_urls: [
      'https://images.unsplash.com/photo-1583344607797-1515b677a29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category_details: {
      'RJ': {
        voice_tone: 'Energetic, Friendly',
        preferred_time_slot: 'Morning Drive',
        show_format_experience: ['Music Countdowns', 'Talk Radio']
      },
      'Anchor': {
        event_types: ['Corporate Events', 'Music Festivals', 'Award Shows'],
        bilingual: true
      }
    }
  },
  {
    username: 'luna_creates',
    email: 'luna@example.com',
    password: 'Password123!',
    display_name: 'Luna Chen',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    categories: ['Dancer', 'Model'],
    bio: 'Contemporary dancer and movement model. Expressing emotion through fluid motion and striking poses.',
    location: 'San Francisco, CA',
    experience_level: 'Professional',
    hourly_rate: 120,
    skills: ['Contemporary Dance', 'Ballet', 'Movement Modeling', 'Choreography'],
    photo_urls: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    video_url: 'https://www.youtube.com/watch?v=7M71yqYxL_Q',
    category_details: {
      'Dancer': {
        styles: ['Contemporary', 'Ballet', 'Lyrical'],
        years_training: 15,
        choreography_experience: true
      },
      'Model': {
        specialty: 'Movement & Fitness Modeling',
        height: "5'7\"",
        measurements: '34-26-36'
      }
    }
  }
];

async function seed() {
  console.log('Seeding artists...');
  
  for (const artist of SEED_ARTISTS) {
    try {
      console.log(`Processing ${artist.username}...`);
      
      // 1. Create User via Auth (triggers insertion into public.users)
      let userId;
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: artist.email,
        password: artist.password,
        email_confirm: true,
        user_metadata: {
          role: 'artist',
          full_name: artist.display_name,
          avatar_url: artist.avatar_url
        }
      });
        
      if (authError) {
        if (authError.status === 422 || (authError.message && authError.message.includes('already'))) {
          // fetch user ID from users table
          const { data: existingUser } = await supabase.from('users').select('id').eq('email', artist.email).single();
          if (existingUser) {
            userId = existingUser.id;
          } else {
            console.error(`Could not find existing user in public.users for ${artist.email}`);
            continue;
          }
        } else {
          console.error(`Auth Error for ${artist.username}:`, authError);
          continue;
        }
      } else {
        userId = authData.user.id;
      }
      
      if (!userId) continue;
      
      // Update the user's username and followers
      await supabase.from('users').update({
        username: artist.username,
        followers_count: Math.floor(Math.random() * 5000),
      }).eq('id', userId);
      
      // 2. Create Artist Profile
      const { data: profile, error: profileError } = await supabase
        .from('artist_profiles')
        .upsert({
          user_id: userId,
          full_name: artist.display_name,
          categories: artist.categories,
          bio: artist.bio,
          city: artist.location, // Note: Schema uses 'city' not 'location'
          experience: artist.experience_level, // Note: Schema uses 'experience'
          photo_urls: artist.photo_urls,
          video_url: artist.video_url || null
        }, { onConflict: 'user_id' })
        .select('id')
        .single();
        
      if (profileError) {
        console.error(`Profile Error for ${artist.username}:`, profileError);
        continue;
      }
      
      const artistId = profile.id;
      
      // 3. Create Dynamic Details
      for (const cat of artist.categories) {
        if (artist.category_details && artist.category_details[cat]) {
          const { error: detailsError } = await supabase
            .from('artist_dynamic_details')
            .upsert({
              artist_id: artistId,
              category_name: cat,
              details: artist.category_details[cat]
            }, { onConflict: 'artist_id,category_name' });
            
          if (detailsError) {
            console.error(`Dynamic Details Error for ${cat}:`, detailsError);
          }
        }
      }
      
      console.log(`✅ Successfully seeded ${artist.username}`);
    } catch (e) {
      console.error(`Exception seeding ${artist.username}:`, e);
    }
  }
  
  console.log('Seeding complete!');
  process.exit(0);
}

seed();

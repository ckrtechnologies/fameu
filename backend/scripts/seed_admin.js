import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { default: supabase } = await import('../src/config/supabase.js');

async function seedAdmin() {
  console.log('Seeding admin user...');
  
  const adminEmail = 'admin@fameu.in'; // Change this if you want a different email
  const adminPassword = 'AdminPassword123!'; // Change this to a secure password
  
  try {
    // 1. Create User via Auth
    console.log(`Creating user in Supabase Auth: ${adminEmail}...`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'Fameu Admin',
      }
    });

    let userId;

    if (authError) {
      if (authError.status === 422 || (authError.message && authError.message.includes('already'))) {
        console.log('User already exists in Auth. Fetching ID...');
        const { data: existingUser } = await supabase.from('users').select('id').eq('email', adminEmail).single();
        if (existingUser) {
          userId = existingUser.id;
        } else {
          console.error(`Could not find existing user in public.users for ${adminEmail}`);
          process.exit(1);
        }
      } else {
        console.error(`Auth Error:`, authError);
        process.exit(1);
      }
    } else {
      userId = authData.user.id;
    }
    
    // 2. Ensure the user role is correctly set to 'admin' in the public.users table
    // (The trigger should have done this, but we explicitly update it just in case)
    console.log(`Promoting user ${userId} to admin role...`);
    const { error: updateError } = await supabase.from('users').update({
      role: 'admin',
      username: 'fameu_admin',
      display_name: 'Fameu Admin'
    }).eq('id', userId);

    if (updateError) {
      console.error('Error updating user role in public.users:', updateError);
      process.exit(1);
    }
    
    console.log('\n✅ Admin user seeded successfully!');
    console.log('-----------------------------------');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-----------------------------------');
    console.log('You can now log into the Admin Panel with these credentials.');
    
  } catch (e) {
    console.error(`Exception seeding admin:`, e);
  }

  process.exit(0);
}

seedAdmin();

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client with Service Role Key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmin() {
  const email = 'admin@fameu.in';
  const password = 'password@1';
  
  console.log(`Creating admin user: ${email}...`);

  try {
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already exists') || authError.message.includes('already been registered')) {
         console.log('User already exists in auth. Updating password and role...');
         // Fetch the user to get the ID if they exist
         const { data: { users } } = await supabase.auth.admin.listUsers();
         const existingUser = users.find(u => u.email === email);
         if (existingUser) {
           await supabase.auth.admin.updateUserById(existingUser.id, { password });
           console.log('Password updated successfully.');
           await updateRole(existingUser.id);
         }
         return;
      }
      throw authError;
    }

    const userId = authData.user.id;
    console.log(`User created in Auth. ID: ${userId}`);

    // 2. Ensure they exist in the public.users table with the 'admin' role
    await updateRole(userId);

  } catch (err) {
    console.error('Error creating admin:', err.message);
  }
}

async function updateRole(userId) {
    // Upsert into users table (in case a trigger already created the row)
    const { error: dbError } = await supabase
      .from('users')
      .upsert({ 
        id: userId, 
        role: 'admin',
        display_name: 'System Admin' 
      });

    if (dbError) throw dbError;
    
    console.log('✅ Admin user successfully set up!');
    console.log('-----------------------------------');
    console.log('Email: admin@fameu.in');
    console.log('Password: password@1');
    console.log('-----------------------------------');
}

createAdmin();

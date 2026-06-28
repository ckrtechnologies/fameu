import authService from './backend/src/services/auth.service.js';
import supabase from './backend/src/config/supabase.js';

async function test() {
  const { data: users } = await supabase.from('users').select('id, username').limit(1);
  if (!users || users.length === 0) {
    console.log('No users found');
    return;
  }
  
  const userId = users[0].id;
  console.log('Deleting user:', userId);
  
  try {
    const result = await authService.deleteAccount(userId);
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();

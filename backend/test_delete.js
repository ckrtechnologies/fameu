import supabase from './src/config/supabase.js';

async function testDelete() {
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: 'test_delete_1234@fameu.in',
    password: 'password123',
    email_confirm: true
  });
  
  if (createError) {
    console.error('Create error:', createError);
    return;
  }
  
  console.log('Created user:', user.user.id);
  
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.user.id);
  if (deleteError) {
    console.error('Delete error:', deleteError);
  } else {
    console.log('Deleted successfully');
  }
}

testDelete();

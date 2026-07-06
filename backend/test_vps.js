import fetch from 'node-fetch';
import supabase from './src/config/supabase.js';

async function run() {
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: 'hiring1@fameu.in',
    password: 'password123'
  });
  
  if (!session) {
    console.log('Login failed');
    return;
  }
  
  const token = session.access_token;
  const res = await fetch('https://api.fameu.in/api/notifications', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log(res.status, await res.text());
}
run();

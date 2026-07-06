import supabase from './src/config/supabase.js';
import fetch from 'node-fetch';

async function run() {
  const { data: user } = await supabase.from('users').select('*').eq('email', 'hiring1@fameu.in').single();
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: 'hiring1@fameu.in',
    password: 'password123'
  });
  const token = session.access_token;
  const res = await fetch('https://api.fameu.in/api/notifications', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log(res.status, await res.text());
}
run();

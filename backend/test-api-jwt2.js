import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const payload = {
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      sub: "b47a6c11-8d18-4e9b-a90b-5528e2af5aba",
      role: "authenticated"
    };
    const token = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET);
    
    const feedRes = await axios.get('http://localhost:3002/api/artist_app/discover/feed?category=Actor+%2F+theatre+actor%2Caerial+artist', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Feed response:", feedRes.data.data.length);
  } catch (e) {
    console.error("ERROR:", e.response ? e.response.data : e.message);
  }
}
test();

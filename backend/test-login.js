import axios from 'axios';
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/artist_app/auth/login', {
      email: 'cmallik1989@gmail.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log("Token acquired.");
    
    const feedRes = await axios.get('http://localhost:3001/api/artist_app/discover/feed?category=Actor%20/%20theatre%20actor,aerial%20artist', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Feed data length:", feedRes.data.data.length);
  } catch (e) {
    console.error("ERROR:", e.response ? e.response.data : e.message);
  }
}
test();

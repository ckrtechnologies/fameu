const fs = require('fs');

const artistAppContent = fs.readFileSync('../artist_app/src/screens/artist/ArtistProfileScreen.js', 'utf8').split('\n');
// get lines 289 to 629 (inclusive, meaning index 288 to 628)
const overviewLines = artistAppContent.slice(288, 629); 
const overviewString = overviewLines.join('\n');

function patchHiringArtist() {
  const file = './src/screens/hiring/ArtistProfileScreen.js';
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const before = lines.slice(0, 214);
  const after = lines.slice(295);
  const replaced = overviewString.replace(/profile\./g, 'artist.');
  const newContent = [...before, replaced, ...after].join('\n');
  fs.writeFileSync(file, newContent);
  console.log('Patched ArtistProfileScreen.js');
}

function patchPublicProfile() {
  const file = './src/screens/hiring/PublicProfileScreen.js';
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const before = lines.slice(0, 312);
  const after = lines.slice(369);
  const replaced = overviewString.replace(/profile\./g, 'profileData.profile.');
  const newContent = [...before, replaced, ...after].join('\n');
  fs.writeFileSync(file, newContent);
  console.log('Patched PublicProfileScreen.js');
}

patchHiringArtist();
patchPublicProfile();

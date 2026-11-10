import 'dotenv/config';
import supabase from '../src/config/supabase.js';

async function cleanUrls() {
  console.log('🚀 Starting Database URL cleanup...');

  // Helper to strip domains
  const stripDomain = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('/uploads/')) {
      return url.substring(url.indexOf('/uploads/'));
    }
    if (url.includes('/cdn/')) {
      return '/uploads/' + url.substring(url.indexOf('/cdn/') + '/cdn/'.length);
    }
    return url;
  };

  // 1. users
  const { data: users } = await supabase.from('users').select('id, avatar_url');
  for (const u of users || []) {
    if (u.avatar_url && u.avatar_url.includes('fameu.in')) {
      const cleaned = stripDomain(u.avatar_url);
      await supabase.from('users').update({ avatar_url: cleaned }).eq('id', u.id);
      console.log(`Updated user ${u.id}: ${u.avatar_url} -> ${cleaned}`);
    }
  }

  // 2. hiring_profiles
  const { data: hiring } = await supabase.from('hiring_profiles').select('id, logo_url');
  for (const h of hiring || []) {
    if (h.logo_url && h.logo_url.includes('fameu.in')) {
      const cleaned = stripDomain(h.logo_url);
      await supabase.from('hiring_profiles').update({ logo_url: cleaned }).eq('id', h.id);
      console.log(`Updated hiring_profile ${h.id}: ${h.logo_url} -> ${cleaned}`);
    }
  }

  // 3. artist_profiles
  const { data: artists } = await supabase.from('artist_profiles').select('id, avatar_url, photo_urls, video_url, intro_video_url, left_profile_url, right_profile_url');
  for (const a of artists || []) {
    const update = {};
    for (const key of ['avatar_url', 'video_url', 'intro_video_url', 'left_profile_url', 'right_profile_url']) {
      if (a[key] && a[key].includes('fameu.in')) {
        update[key] = stripDomain(a[key]);
      }
    }
    if (Array.isArray(a.photo_urls)) {
      update.photo_urls = a.photo_urls.map(p => stripDomain(p));
    }
    if (Object.keys(update).length > 0) {
      await supabase.from('artist_profiles').update(update).eq('id', a.id);
      console.log(`Updated artist_profile ${a.id}`);
    }
  }

  // 4. verification_documents
  const docCols = ['aadhaar_url', 'pan_url', 'company_reg_url', 'gst_url', 'selfie_url', 'passport_url', 'voter_id_url', 'driving_license_url'];
  const { data: kycDocs } = await supabase.from('verification_documents').select(['id', ...docCols].join(', '));
  for (const doc of kycDocs || []) {
    const update = {};
    for (const col of docCols) {
      if (doc[col] && doc[col].includes('fameu.in')) {
        update[col] = stripDomain(doc[col]);
      }
    }
    if (Object.keys(update).length > 0) {
      await supabase.from('verification_documents').update(update).eq('id', doc.id);
      console.log(`Updated verification_document ${doc.id}`);
    }
  }

  // 5. banners
  const { data: banners } = await supabase.from('banners').select('id, image_url');
  for (const b of banners || []) {
    if (b.image_url && b.image_url.includes('fameu.in')) {
      const cleaned = stripDomain(b.image_url);
      await supabase.from('banners').update({ image_url: cleaned }).eq('id', b.id);
      console.log(`Updated banner ${b.id}: ${b.image_url} -> ${cleaned}`);
    }
  }

  console.log('✅ Database URL cleanup complete!');
}

cleanUrls().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

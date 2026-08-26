const thumbnailCache = new Map();

export const getVideoInfo = (url) => {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim().replace(/^["']|["']$/g, '');
  
  // 1. YouTube (youtube.com, youtu.be, shorts, embed, live, mobile, raw ID)
  const ytRegExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  let ytMatch = cleanUrl.match(ytRegExp);
  
  if (!ytMatch && /^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    ytMatch = [null, cleanUrl];
  }

  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return { 
      type: 'youtube', 
      id, 
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`, 
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg` 
    };
  }

  // 2. Instagram (post, reel, tv, share, instagr.am)
  const igRegExp = /(?:instagram\.com|instagr\.am)\/(?:.*\/)?(?:p|reel|tv|reels|share\/reel)\/([a-zA-Z0-9_-]+)/i;
  const igMatch = cleanUrl.match(igRegExp);
  if (igMatch && igMatch[1]) {
    const id = igMatch[1];
    return { 
      type: 'instagram', 
      id, 
      embedUrl: `https://www.instagram.com/p/${id}/embed/`, 
      thumbnail: `https://www.instagram.com/p/${id}/`
    };
  } else if (cleanUrl.includes('instagram.com') || cleanUrl.includes('instagr.am')) {
    return { type: 'instagram', embedUrl: cleanUrl, thumbnail: null };
  }
  
  // 3. Direct video media file (.mp4, .mov, etc.)
  if (cleanUrl.match(/\.(mp4|mov|avi|wmv|mkv|webm)$/i) || cleanUrl.includes('/uploads/video') || cleanUrl.includes('/videos/')) {
    return { type: 'direct', embedUrl: cleanUrl, thumbnail: null };
  }

  // 4. Fallback to webview for other links
  return { type: 'webview', embedUrl: cleanUrl, thumbnail: 'LINK' };
};

export const fetchInstagramThumbnail = async (url) => {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();
  if (thumbnailCache.has(cleanUrl)) return thumbnailCache.get(cleanUrl);

  const igRegExp = /instagram\.com\/(?:.*\/)?(?:p|reel|tv|reels)\/([a-zA-Z0-9_-]+)/i;
  const match = cleanUrl.match(igRegExp);
  if (!match || !match[1]) return null;

  const id = match[1];

  // Try fetching og:image with Facebook User-Agent
  try {
    const res = await fetch(`https://www.instagram.com/p/${id}/`, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const imgMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) || 
                       html.match(/content="([^"]+)"\s+property="og:image"/i) ||
                       html.match(/name="twitter:image"\s+content="([^"]+)"/i);
      if (imgMatch && imgMatch[1]) {
        const found = imgMatch[1].replace(/&amp;/g, '&');
        thumbnailCache.set(cleanUrl, found);
        return found;
      }
    }
  } catch (err) {
    // ignore
  }

  // Fallback to /media/?size=l direct redirection CDN image
  const directMediaUrl = `https://www.instagram.com/p/${id}/media/?size=l`;
  thumbnailCache.set(cleanUrl, directMediaUrl);
  return directMediaUrl;
};

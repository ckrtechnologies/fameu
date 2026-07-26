export const getVideoInfo = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Check YouTube
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const ytMatch = url.match(ytRegExp);
  if (ytMatch && (ytMatch[1]?.length === 11 || ytMatch[2]?.length === 11)) {
    const id = ytMatch[2] || ytMatch[1];
    return { type: 'youtube', id, embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`, thumbnail: `https://img.youtube.com/vi/${id}/0.jpg` };
  }

  // Check Instagram
  const igRegExp = /instagram\.com\/(?:.*\/)?(?:p|reel|tv|reels)\/([a-zA-Z0-9_-]+)/i;
  const igMatch = url.match(igRegExp);
  if (igMatch && igMatch[1]) {
    return { type: 'instagram', id: igMatch[1], embedUrl: `https://www.instagram.com/p/${igMatch[1]}/embed/`, thumbnail: 'INSTAGRAM' };
  } else if (url.includes('instagram.com')) {
    return { type: 'instagram', embedUrl: url, thumbnail: 'INSTAGRAM' };
  }
  
  // Check if it's a direct media file
  if (url.match(/\.(mp4|mov|avi|wmv|mkv)$/i)) {
    return { type: 'direct', embedUrl: url, thumbnail: null };
  }

  // Fallback to webview for other http links
  return { type: 'webview', embedUrl: url, thumbnail: 'LINK' };
};

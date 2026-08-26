import express from 'express';
import https from 'https';
import http from 'http';

const router = express.Router();

/**
 * GET /api/proxy/thumbnail?url=<ytThumbUrl>
 * Proxies image requests for YouTube/Instagram CDNs that may be blocked
 * from certain networks (e.g., restricted emulators / corporate NAT).
 * Only allows img.youtube.com, i.ytimg.com, and images.unsplash.com.
 */
const ALLOWED_HOSTS = [
  'img.youtube.com',
  'i.ytimg.com',
  'images.unsplash.com',
  'i.imgur.com',
  'storage.googleapis.com',
];

router.get('/thumbnail', (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Security: only allow whitelisted CDN hosts
  if (!ALLOWED_HOSTS.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host))) {
    return res.status(403).json({ error: 'Host not allowed: ' + parsedUrl.hostname });
  }

  const protocol = parsedUrl.protocol === 'https:' ? https : http;

  const proxyReq = protocol.get(
    url,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 Chrome/91.0 Mobile Safari/537.36',
        'Accept': 'image/webp,image/jpeg,image/*,*/*',
        'Referer': 'https://www.youtube.com/',
      },
      timeout: 8000,
    },
    (upstream) => {
      const contentType = upstream.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(upstream.statusCode || 200);
      upstream.pipe(res);
    }
  );

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    res.status(504).json({ error: 'Upstream timeout' });
  });

  proxyReq.on('error', (err) => {
    console.error('[thumbnail-proxy] Error:', err.message, 'for URL:', url);
    res.status(502).json({ error: 'Upstream error: ' + err.message });
  });
});

export default router;

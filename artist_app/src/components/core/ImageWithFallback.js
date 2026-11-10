import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { BASE_URL } from '../../utils/uploadUtils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop';
const isValid = (url) => url && typeof url === 'string' && url !== 'null' && url !== 'undefined' && url.trim() !== '';

const sanitizeUrl = (rawUrl) => {
  if (!isValid(rawUrl)) return null;
  let url = rawUrl.trim();
  // Older uploads were stored with http:// URLs; Android release builds block cleartext.
  if (/^http:\/\/([^/]*\.)?fameu\.(online|in)\//i.test(url)) {
    url = url.replace(/^http:\/\//i, 'https://');
  }
  // If it's a relative path starting with /uploads/ or /cdn/
  if (url.startsWith('/uploads/') || url.startsWith('/cdn/')) {
    const rootCdn = BASE_URL.replace(/\/api\/?$/, '') + '/cdn/';
    const cleanPath = url.replace(/^\/(uploads|cdn)\//, '');
    return rootCdn + cleanPath;
  }
  // If it's an old api.fameu.in URL
  if (url.includes('api.fameu.in')) {
    const rootCdn = BASE_URL.replace(/\/api\/?$/, '') + '/cdn/';
    const match = url.match(/\/(uploads|cdn)\/(.*)$/);
    if (match && match[2]) {
      return rootCdn + match[2];
    }
  }
  return url;
};

export default function ImageWithFallback({ source, fallbackSource, style, resizeMode, ...props }) {
  const [errorCount, setErrorCount] = useState(0);

  // reset error count if source changes
  useEffect(() => {
    setErrorCount(0);
  }, [source?.uri, fallbackSource?.uri]);

  let currentSource;
  const rawSource = isValid(source?.uri) ? sanitizeUrl(source.uri) : null;
  const rawFallback = isValid(fallbackSource?.uri) ? sanitizeUrl(fallbackSource.uri) : null;

  if (errorCount === 0) {
    currentSource = rawSource ? { ...source, uri: rawSource } : 
                    rawFallback ? { uri: rawFallback } : 
                    { uri: FALLBACK_IMAGE };
  } else if (errorCount === 1) {
    currentSource = rawFallback ? { uri: rawFallback } : 
                    { uri: FALLBACK_IMAGE };
  } else {
    currentSource = { uri: FALLBACK_IMAGE };
  }

  return (
    <Image 
      source={currentSource} 
      style={style} 
      resizeMode={resizeMode || 'cover'}
      {...props} 
      onError={() => {
        if (errorCount < 2) {
          setErrorCount(prev => prev + 1);
        }
      }}
    />
  );
}

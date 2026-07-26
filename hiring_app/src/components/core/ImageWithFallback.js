import React, { useState, useEffect } from 'react';
import { Image, View } from 'react-native';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop';
const isValid = (url) => url && typeof url === 'string' && url !== 'null' && url !== 'undefined' && url.trim() !== '';

export default function ImageWithFallback({ source, fallbackSource, style, ...props }) {
  const [errorCount, setErrorCount] = useState(0);

  // reset error count if source changes
  useEffect(() => {
    setErrorCount(0);
  }, [source?.uri, fallbackSource?.uri]);

  let currentSource;
  if (errorCount === 0) {
    currentSource = isValid(source?.uri) ? { ...source, uri: source.uri } : 
                    isValid(fallbackSource?.uri) ? { uri: fallbackSource.uri } : 
                    { uri: FALLBACK_IMAGE };
  } else if (errorCount === 1) {
    currentSource = isValid(fallbackSource?.uri) ? { uri: fallbackSource.uri } : 
                    { uri: FALLBACK_IMAGE };
  } else {
    currentSource = { uri: FALLBACK_IMAGE };
  }

  return (
    <Image 
      source={currentSource} 
      style={style} 
      onError={() => {
        if (errorCount < 2) {
          setErrorCount(prev => prev + 1);
        }
      }} 
      {...props} 
    />
  );
}

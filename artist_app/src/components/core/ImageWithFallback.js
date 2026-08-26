import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop';
const isValid = (url) => url && typeof url === 'string' && url !== 'null' && url !== 'undefined' && url.trim() !== '';

export default function ImageWithFallback({ source, fallbackSource, style, resizeMode, ...props }) {
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    setErrorCount(0);
  }, [source?.uri, fallbackSource?.uri]);

  let currentUri;
  if (errorCount === 0) {
    currentUri = isValid(source?.uri) ? source.uri : 
                 isValid(fallbackSource?.uri) ? fallbackSource.uri : 
                 FALLBACK_IMAGE;
  } else if (errorCount === 1) {
    currentUri = isValid(fallbackSource?.uri) ? fallbackSource.uri : 
                 FALLBACK_IMAGE;
  } else {
    currentUri = FALLBACK_IMAGE;
  }

  // If URL is from YouTube or Instagram, FastImage often fails on Android due to HTTP/2 header negotiation.
  // Use React Native's core Image component for these CDNs.
  const isSpecialCdn = typeof currentUri === 'string' && (
    currentUri.includes('youtube.com') || 
    currentUri.includes('ytimg.com') || 
    currentUri.includes('instagram.com') || 
    currentUri.includes('cdninstagram.com')
  );

  if (isSpecialCdn) {
    return (
      <Image
        source={{ uri: currentUri }}
        style={style}
        resizeMode={resizeMode || 'cover'}
        onError={() => {
          if (errorCount < 2) {
            setErrorCount(prev => prev + 1);
          }
        }}
        {...props}
      />
    );
  }

  const fastResizeMode = resizeMode === 'contain' ? FastImage.resizeMode.contain :
                         resizeMode === 'stretch' ? FastImage.resizeMode.stretch :
                         FastImage.resizeMode.cover;

  return (
    <FastImage 
      source={{ 
        uri: currentUri, 
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.web 
      }} 
      style={style} 
      resizeMode={fastResizeMode}
      onError={() => {
        if (errorCount < 2) {
          setErrorCount(prev => prev + 1);
        }
      }} 
      {...props} 
    />
  );
}

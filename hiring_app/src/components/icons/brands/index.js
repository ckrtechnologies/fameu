import React from 'react';
import { Path, Rect, Circle, Polygon, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import IconBase from '../IconBase';

// 1. 3D INSTAGRAM GRADIENT BADGE
export function InstagramIcon({ size = 32, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <RadialGradient id="instaRadial" cx="30%" cy="105%" r="120%">
          <Stop offset="0%" stopColor="#FEE411" />
          <Stop offset="15%" stopColor="#FEDB16" />
          <Stop offset="50%" stopColor="#E03368" />
          <Stop offset="85%" stopColor="#8A3AB9" />
          <Stop offset="100%" stopColor="#4C68D7" />
        </RadialGradient>
      </Defs>
      {/* Outer rounded squircle */}
      <Rect x="2" y="2" width="32" height="32" rx="10" fill="url(#instaRadial)" />
      {/* Camera outline */}
      <Rect x="8.5" y="8.5" width="19" height="19" rx="5.5" fill="none" stroke="#FFFFFF" strokeWidth="2.4" />
      <Circle cx="18" cy="18" r="4.5" fill="none" stroke="#FFFFFF" strokeWidth="2.4" />
      <Circle cx="23.2" cy="12.8" r="1.3" fill="#FFFFFF" />
    </IconBase>
  );
}

// 2. 3D YOUTUBE GLOSS BADGE
export function YouTubeIcon({ size = 32, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="ytGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF1E1E" />
          <Stop offset="100%" stopColor="#D80000" />
        </LinearGradient>
      </Defs>
      <Rect x="2" y="5" width="32" height="26" rx="9" fill="url(#ytGrad)" />
      <Polygon points="15,12 24,18 15,24" fill="#FFFFFF" />
    </IconBase>
  );
}

// 3. 3D FACEBOOK ROYAL BADGE
export function FacebookIcon({ size = 32, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="fbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1877F2" />
          <Stop offset="100%" stopColor="#0D5FC7" />
        </LinearGradient>
      </Defs>
      <Circle cx="18" cy="18" r="16" fill="url(#fbGrad)" />
      <Path
        d="M21 18.5h-3.2v9h-3.8v-9h-2V15h2v-2.3c0-2.4 1.4-3.7 3.6-3.7 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5V15h2.8l-.4 3.5z"
        fill="#FFFFFF"
      />
    </IconBase>
  );
}

// 4. 3D SNAPCHAT VIBRANT BADGE
export function SnapchatIcon({ size = 32, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="snapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFC00" />
          <Stop offset="100%" stopColor="#FACC15" />
        </LinearGradient>
      </Defs>
      <Rect x="2" y="2" width="32" height="32" rx="10" fill="url(#snapGrad)" />
      <Path
        d="M18 7.5c-3.2 0-4.8 2.2-4.8 4.4 0 1 .3 2 .8 2.6.1.1.1.3.1.5-.2.3-.6.7-1.3.8-.3 0-.4.3-.3.5.2.5.7.7 1.2.8.1 0 .2.1.3.2.2.6.5 1.1 1.1 1.4.1.1.2.3.2.4-.1.5-.5 1.1-1.4 1.4-.2.1-.4.3-.3.6.2.5.7.7 1.3.8.2 0 .3.2.3.4 0 .3.2.7.8.9.5.2 1.2.2 1.9.2s1.4 0 1.9-.2c.6-.2.8-.6.8-.9 0-.2.1-.4.3-.4.6-.1 1.1-.3 1.3-.8.1-.3-.1-.5-.3-.6-.9-.3-1.3-.9-1.4-1.4 0-.1.1-.3.2-.4.6-.3.9-.8 1.1-1.4.1-.1.2-.2.3-.2.5-.1 1-.3 1.2-.8.1-.2 0-.5-.3-.5-.7-.1-1.1-.5-1.3-.8 0-.2 0-.4.1-.5.5-.6.8-1.6.8-2.6 0-2.2-1.6-4.4-4.8-4.4z"
        fill="#FFFFFF"
        stroke="#1E293B"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}


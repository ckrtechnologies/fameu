import React from 'react';
import { Path, Rect, Circle, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import IconBase from '../IconBase';

export function PlayIcon({ size = 32, color = '#FFFFFF', fill = '#FFFFFF', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Polygon
        points="9 5 27 16 9 27 9 5"
        fill={fill}
      />
    </IconBase>
  );
}

// Solid Filled Cinema / Video Camera
export function VideoCamIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="vidCamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>
      {/* Camera Body */}
      <Rect x="2" y="7" width="19" height="18" rx="5" fill="url(#vidCamGrad)" />
      {/* Lens Cone */}
      <Path
        d="M21 13.5l8-5.5v16l-8-5.5v-5z"
        fill="#1D4ED8"
      />
      {/* Front Accent Lens Circle */}
      <Circle cx="8" cy="14" r="3" fill="#60A5FA" />
      <Circle cx="15" cy="11" r="1.5" fill="#93C5FD" />
    </IconBase>
  );
}

// Solid Filled Headshots & Photos Camera
export function CameraIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0EA5E9" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>
      {/* Top Flash bump */}
      <Path d="M10 7h12l2 4H8l2-4z" fill="#0284C7" />
      {/* Main Camera Body */}
      <Rect x="2" y="9" width="28" height="19" rx="6" fill="url(#camGrad)" />
      {/* Outer Lens */}
      <Circle cx="16" cy="18.5" r="6.5" fill="#FFFFFF" />
      {/* Inner Lens Glass */}
      <Circle cx="16" cy="18.5" r="4.5" fill="#0369A1" />
      <Circle cx="14.5" cy="17" r="1.5" fill="#38BDF8" />
      {/* Flash LED */}
      <Circle cx="24" cy="13" r="1.8" fill="#FEF08A" />
    </IconBase>
  );
}

// Solid Filled Document / Bio Page with Folded Corner
export function DocumentAttachIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#6366F1" />
        </LinearGradient>
      </Defs>
      {/* Document Sheet */}
      <Path
        d="M6 5a3 3 0 0 1 3-3h11l6 6v19a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5z"
        fill="url(#docGrad)"
      />
      {/* Folded Corner */}
      <Path d="M20 2v6h6" fill="#93C5FD" />
      {/* Text Lines */}
      <Rect x="10" y="12" width="12" height="2.5" rx="1.2" fill="#FFFFFF" />
      <Rect x="10" y="17" width="12" height="2.5" rx="1.2" fill="#FFFFFF" />
      <Rect x="10" y="22" width="7" height="2.5" rx="1.2" fill="#FFFFFF" opacity="0.8" />
    </IconBase>
  );
}

// Solid Filled Web Link
export function WebLinkIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2563EB" />
          <Stop offset="100%" stopColor="#60A5FA" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="13.5" fill="#EFF6FF" stroke="url(#linkGrad)" strokeWidth="2" />
      <Path
        d="M13 18a4 4 0 0 0 5.66.44l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5M19 14a4 4 0 0 0-5.66-.44l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5"
        stroke="#2563EB"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

// Solid Filled Upload Cloud
export function UploadCloudIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0EA5E9" />
          <Stop offset="100%" stopColor="#3B82F6" />
        </LinearGradient>
      </Defs>
      <Path
        d="M8 26a6 6 0 0 1-1.7-11.8A9 9 0 0 1 23 11a7 7 0 0 1 2.8 13.4"
        fill="url(#cloudGrad)"
      />
      <Path d="M16 16v9M12 20l4-4 4 4" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

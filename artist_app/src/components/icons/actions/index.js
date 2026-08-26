import React from 'react';
import { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import IconBase from '../IconBase';

// 1. DISCOVER - Solid Filled Compass / Navigation Star
export function DiscoverFilledIcon({ size = 28, color = '#FFFFFF', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="discGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#E0F2FE" />
        </LinearGradient>
      </Defs>
      {/* Outer Rim */}
      <Circle cx="16" cy="16" r="13.5" fill="none" stroke={color} strokeWidth="2.5" />
      {/* 4 Cardinal Tick Marks */}
      <Path d="M16 2.5v3M16 26.5v3M2.5 16h3M26.5 16h3" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      {/* Solid Filled Needle Diamond */}
      <Path
        d="M16 7.5l4.2 8.5-4.2 8.5-4.2-8.5L16 7.5z"
        fill="url(#discGrad)"
      />
      {/* Top North Half Accent */}
      <Path
        d="M16 7.5l4.2 8.5H16V7.5z"
        fill="#0284C7"
      />
      {/* Center Pivot Point */}
      <Circle cx="16" cy="16" r="2.5" fill={color} />
    </IconBase>
  );
}

// 2. MESSAGES - Solid Filled Dual Chat Bubble
export function MessagesFilledIcon({ size = 28, color = '#FFFFFF', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="msgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#FEF3C7" />
        </LinearGradient>
      </Defs>
      {/* Back small bubble */}
      <Path
        d="M19 7h4a6 6 0 0 1 6 6c0 3.3-2.7 6-6 6h-1l-3.5 3v-3.3A6 6 0 0 1 19 7z"
        fill={color}
        opacity="0.5"
      />
      {/* Main Solid Chat Bubble */}
      <Path
        d="M4 14a8 8 0 0 1 8-8h5a8 8 0 0 1 8 8c0 4.4-3.6 8-8 8h-2.5l-5 4.5v-4.8A7.8 7.8 0 0 1 4 14z"
        fill="url(#msgGrad)"
      />
      {/* Solid Conversation Dots */}
      <Circle cx="10.5" cy="14" r="1.8" fill="#D97706" />
      <Circle cx="14.5" cy="14" r="1.8" fill="#D97706" />
      <Circle cx="18.5" cy="14" r="1.8" fill="#D97706" />
    </IconBase>
  );
}

// 3. PORTFOLIO - Solid Filled Film / Casting Portfolio Case
export function PortfolioFilledIcon({ size = 28, color = '#FFFFFF', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="portGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#EDE9FE" />
        </LinearGradient>
      </Defs>
      {/* Solid Briefcase Body */}
      <Rect x="3" y="10" width="26" height="18" rx="5" fill="url(#portGrad)" />
      {/* Briefcase Flap / Top Band */}
      <Path d="M3 15h26v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1z" fill={color} opacity="0.9" />
      {/* Solid Sturdy Handle */}
      <Path
        d="M11 10V6.5a2.5 2.5 0 0 1 2.5-2.5h5a2.5 2.5 0 0 1 2.5 2.5V10"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Center Golden Lock Plate */}
      <Rect x="13.5" y="15" width="5" height="5" rx="1.5" fill="#7C3AED" />
      {/* Vertical Leather Straps */}
      <Rect x="8" y="10" width="2.5" height="18" rx="1" fill="#7C3AED" opacity="0.3" />
      <Rect x="21.5" y="10" width="2.5" height="18" rx="1" fill="#7C3AED" opacity="0.3" />
    </IconBase>
  );
}

// 4. NETWORK - Solid Filled Team / Community Avatars
export function NetworkFilledIcon({ size = 28, color = '#FFFFFF', ...props }) {
  return (
    <IconBase size={size} color={color} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#D1FAE5" />
        </LinearGradient>
      </Defs>
      {/* Left / Secondary Person */}
      <Circle cx="21.5" cy="11.5" r="4" fill={color} opacity="0.6" />
      <Path
        d="M17 25.5c0-3.5 2.8-6 6.5-6s6.5 2.5 6.5 6"
        fill={color}
        opacity="0.6"
      />
      {/* Primary Foreground Person (Solid Filled) */}
      <Circle cx="12" cy="10" r="5.5" fill="url(#netGrad)" />
      <Path
        d="M4 26.5c0-4.7 3.6-8 8-8s8 3.3 8 8"
        fill="url(#netGrad)"
      />
    </IconBase>
  );
}

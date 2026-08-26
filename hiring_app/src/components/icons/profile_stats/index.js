import React from 'react';
import { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import IconBase from '../IconBase';

// 1. AGE STAT ICON (Vibrant 3D Calendar & Birthday Spark)
export function AgeProfileIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="ageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F97316" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
      </Defs>
      {/* Calendar Base */}
      <Rect x="4" y="8" width="24" height="20" rx="5" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
      {/* Top Bar */}
      <Path d="M4 13a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v2H4v-2z" fill="url(#ageGrad)" />
      {/* Rings */}
      <Rect x="9" y="5" width="2.5" height="5" rx="1.2" fill="#9A3412" />
      <Rect x="20.5" y="5" width="2.5" height="5" rx="1.2" fill="#9A3412" />
      {/* Center Star / Number Indicator */}
      <Circle cx="16" cy="21" r="4.5" fill="url(#ageGrad)" />
      <Circle cx="14.8" cy="19.8" r="1.2" fill="#FFFFFF" opacity="0.8" />
    </IconBase>
  );
}

// 2. GENDER STAT ICON (Vibrant 3D Identity Duo)
export function GenderProfileIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="genGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EC4899" />
          <Stop offset="100%" stopColor="#8B5CF6" />
        </LinearGradient>
      </Defs>
      {/* Outer Ring */}
      <Circle cx="15" cy="14" r="9" fill="url(#genGrad)" />
      <Circle cx="15" cy="14" r="5.5" fill="#FFFFFF" />
      {/* Mars Arrow */}
      <Path d="M21 4h7v7M27 4l-7.5 7.5" stroke="#EC4899" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Venus Cross */}
      <Path d="M15 23v7M11.5 27h7" stroke="#8B5CF6" strokeWidth="2.8" strokeLinecap="round" />
    </IconBase>
  );
}

// 3. HEIGHT STAT ICON (Vibrant 3D Measuring Scale)
export function HeightProfileIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="htGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
      </Defs>
      {/* Body Tape / Ruler */}
      <Rect x="10" y="4" width="12" height="24" rx="4" fill="url(#htGrad)" />
      {/* Scale Marks */}
      <Rect x="15" y="8" width="5" height="2" rx="1" fill="#FFFFFF" />
      <Rect x="17" y="13" width="3" height="1.8" rx="0.9" fill="#A7F3D0" />
      <Rect x="15" y="18" width="5" height="2" rx="1" fill="#FFFFFF" />
      <Rect x="17" y="23" width="3" height="1.8" rx="0.9" fill="#A7F3D0" />
    </IconBase>
  );
}

// 4. WEIGHT STAT ICON (Vibrant 3D Scale)
export function WeightProfileIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="wtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>
      {/* Platform */}
      <Rect x="5" y="6" width="22" height="21" rx="5" fill="url(#wtGrad)" />
      {/* Dial Screen */}
      <Rect x="10" y="9" width="12" height="7" rx="3" fill="#FFFFFF" />
      {/* Dial Needle */}
      <Circle cx="16" cy="14" r="1.8" fill="#1D4ED8" />
      <Path d="M16 14l2-3" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round" />
      {/* Foot Grip Pads */}
      <Rect x="9" y="19" width="4" height="5" rx="1.5" fill="#60A5FA" opacity="0.6" />
      <Rect x="19" y="19" width="4" height="5" rx="1.5" fill="#60A5FA" opacity="0.6" />
    </IconBase>
  );
}

// 5. PHONE STAT ICON (Vibrant 3D Calling Badge)
export function PhoneProfileIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="phGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
      </Defs>
      {/* Circle Glow */}
      <Circle cx="16" cy="16" r="13" fill="#D1FAE5" />
      <Circle cx="16" cy="16" r="10" fill="url(#phGrad)" />
      {/* Phone Handset */}
      <Path
        d="M12.5 10a1.5 1.5 0 0 0-1.5 1.5c0 6 4.5 10.5 10.5 10.5a1.5 1.5 0 0 0 1.5-1.5v-2a1.5 1.5 0 0 0-1.2-1.5l-2.4-.5a1.5 1.5 0 0 0-1.5.6l-1 1.2a8.5 8.5 0 0 1-4.7-4.7l1.2-1a1.5 1.5 0 0 0 .6-1.5l-.5-2.4A1.5 1.5 0 0 0 14.5 10h-2z"
        fill="#FFFFFF"
      />
    </IconBase>
  );
}

// 6. EDIT PENCIL ICON
export function EditPencilIcon({ size = 18, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="penGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>
      <Path
        d="M21 4l7 7L10 29H3v-7L21 4z"
        fill="url(#penGrad)"
      />
      <Path d="M18 7l7 7M6 26l3-3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// 7. LANGUAGES STAT ICON (Vibrant 3D Dual Translate Bubble)
export function LanguagesProfileIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="langBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
        <LinearGradient id="langAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      {/* Primary Blue Chat Bubble */}
      <Path
        d="M4 14C4 8.5 8.5 4 14 4h4c5.5 0 10 4.5 10 10 0 4.5-3 8.3-7.2 9.5L18 28l-5-4.5H14c-5.5 0-10-4.5-10-9.5z"
        fill="url(#langBlueGrad)"
      />
      {/* 'A' character inside */}
      <Path
        d="M13 18l3-8 3 8m-5-2.5h4"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Accent Orange Mini Chat Bubble */}
      <Circle cx="23" cy="21" r="6" fill="url(#langAmberGrad)" />
      <Path d="M21 21h4M23 19v4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}


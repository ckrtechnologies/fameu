import React from 'react';
import { View } from 'react-native';
import { Path, Rect, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import IconBase from '../IconBase';

// Helper wrapper to give each icon an optional soft vibrant colored background pill
export function ColorfulIconWrapper({ bg = '#EFF6FF', children, size = 40, style }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2.5,
          backgroundColor: bg,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// 1. AGE / BIRTHDAY - Vibrant Coral / Orange Calendar
export function AgeCalendarIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="ageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF6B6B" />
          <Stop offset="100%" stopColor="#FF8E53" />
        </LinearGradient>
      </Defs>
      {/* Calendar body */}
      <Rect x="3" y="6" width="26" height="23" rx="6" fill="#FFF5F0" stroke="#FF8E53" strokeWidth="1.5" />
      {/* Top Header bar */}
      <Path d="M3 12h26V11a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v1z" fill="url(#ageGrad)" />
      {/* Calendar rings */}
      <Rect x="8" y="3" width="3" height="6" rx="1.5" fill="#FF6B6B" />
      <Rect x="21" y="3" width="3" height="6" rx="1.5" fill="#FF6B6B" />
      {/* Date dots / grid */}
      <Circle cx="9" cy="17" r="1.8" fill="#FF8E53" />
      <Circle cx="16" cy="17" r="1.8" fill="#FF6B6B" />
      <Circle cx="23" cy="17" r="1.8" fill="#FF8E53" />
      <Circle cx="9" cy="23" r="1.8" fill="#FF6B6B" />
      <Circle cx="16" cy="23" r="1.8" fill="#FF8E53" />
      <Circle cx="23" cy="23" r="1.8" fill="#FF6B6B" />
    </IconBase>
  );
}

// 2. GENDER - Vibrant Purple / Pink Dual Gender Identity Glyph
export function GenderIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="genderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#EC4899" />
        </LinearGradient>
      </Defs>
      {/* Background Glow Ring */}
      <Circle cx="14" cy="18" r="8" fill="#FDF2F8" stroke="url(#genderGrad)" strokeWidth="2.5" />
      <Circle cx="14" cy="18" r="4" fill="#F3E8FF" />
      {/* Male Arrow */}
      <Path
        d="M21 5h6m0 0v6m0-6-8 8"
        stroke="#8B5CF6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Female Cross */}
      <Path
        d="M14 26v4M11 28h6"
        stroke="#EC4899"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// 3. HEIGHT - Emerald & Cyan Height Scale Ruler
export function HeightScaleIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="heightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#06B6D4" />
          <Stop offset="100%" stopColor="#10B981" />
        </LinearGradient>
      </Defs>
      {/* Ruler Body */}
      <Rect x="8" y="3" width="16" height="26" rx="4" fill="#ECFDF5" stroke="url(#heightGrad)" strokeWidth="2" />
      {/* Measurement lines */}
      <Path d="M8 8h7M8 13h5M8 18h7M8 23h5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      {/* Top and Bottom height arrows */}
      <Path d="M20 7l2-3 2 3M20 25l2 3 2-3M22 6v20" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

// 4. WEIGHT - Royal Blue & Indigo Smart Fitness Scale
export function WeightScaleIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="weightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#6366F1" />
        </LinearGradient>
      </Defs>
      {/* Scale Platform */}
      <Rect x="4" y="5" width="24" height="22" rx="6" fill="#EEF2FF" stroke="url(#weightGrad)" strokeWidth="2" />
      {/* Dial Screen */}
      <Circle cx="16" cy="13" r="5.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
      {/* Needle Dial */}
      <Path d="M16 13l2.5-3" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="16" cy="13" r="1.5" fill="#6366F1" />
      {/* Standing Footprints/Lines */}
      <Path d="M9 22h4M19 22h4" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// 5. LOCATION / CITY - Bright Rose / Red Location Beacon Pin
export function LocationPinIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="locGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F43F5E" />
          <Stop offset="100%" stopColor="#FB7185" />
        </LinearGradient>
      </Defs>
      {/* Shadow */}
      <Circle cx="16" cy="27" r="5" fill="#FFE4E6" />
      {/* Pin Body */}
      <Path
        d="M26 13.5C26 21 16 28 16 28S6 21 6 13.5a10 10 0 1 1 20 0Z"
        fill="url(#locGrad)"
      />
      {/* Inner White Center */}
      <Circle cx="16" cy="13.5" r="4.5" fill="#FFFFFF" />
      <Circle cx="16" cy="13.5" r="2.2" fill="#F43F5E" />
    </IconBase>
  );
}

// 6. LANGUAGES - Vibrant Dual Language Chat / Speech Bubbles
export function LanguageGlobeIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="langGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0EA5E9" />
          <Stop offset="100%" stopColor="#38BDF8" />
        </LinearGradient>
        <LinearGradient id="langGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#FBBF24" />
        </LinearGradient>
      </Defs>
      {/* Left Chat Bubble (A) */}
      <Path
        d="M4 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-2l-4 3v-3H9a5 5 0 0 1-5-5V8z"
        fill="url(#langGrad1)"
      />
      <Path d="M11 15l2.5-6.5 2.5 6.5M11.8 13.2h3.4" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Right Chat Bubble (文) */}
      <Path
        d="M16 16a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-1l-3 2.5v-2.5h-1a4 4 0 0 1-4-4v-5z"
        fill="url(#langGrad2)"
      />
      <Path d="M20 18h5M22.5 15.5v5M21 21c1-1 2-2 3-2" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
    </IconBase>
  );
}

// 7. SKILLS - Glowing Gold Star Talent Badge
export function SkillsStarIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#FCD34D" />
        </LinearGradient>
      </Defs>
      {/* Outer Soft Glow */}
      <Circle cx="16" cy="16" r="14" fill="#FEF3C7" opacity="0.7" />
      {/* 3D Star */}
      <Path
        d="m16 4 3.8 7.7 8.5 1.2-6.1 6 1.4 8.5-7.6-4-7.6 4 1.4-8.5-6.1-6 8.5-1.2L16 4z"
        fill="url(#starGrad)"
        stroke="#D97706"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <Circle cx="16" cy="14" r="1.5" fill="#FFFFFF" opacity="0.8" />
    </IconBase>
  );
}

// 8. AVAILABILITY - Mint & Teal Calendar Clock
export function AvailabilityTimeIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="availGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0D9488" />
          <Stop offset="100%" stopColor="#2DD4BF" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="13" fill="#CCFBF1" stroke="url(#availGrad)" strokeWidth="2.5" />
      {/* Clock ticks & Hands */}
      <Circle cx="16" cy="16" r="2" fill="#0D9488" />
      <Path d="M16 9v7l5 3" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

// 9. CALENDAR NUMBER / DATES
export function CalendarNumberIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="calNumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6366F1" />
          <Stop offset="100%" stopColor="#818CF8" />
        </LinearGradient>
      </Defs>
      <Rect x="3" y="6" width="26" height="23" rx="6" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <Path d="M3 12h26V11a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v1z" fill="url(#calNumGrad)" />
      <Rect x="8" y="3" width="3" height="6" rx="1.5" fill="#4F46E5" />
      <Rect x="21" y="3" width="3" height="6" rx="1.5" fill="#4F46E5" />
      {/* Highlighted Date badge */}
      <Rect x="10" y="16" width="12" height="9" rx="3" fill="#6366F1" />
      <Path d="M15 18v5M17 18v5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

// 10. CINTAA - Official Member ID Gold & Sapphire Card
export function CintaaCardIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="cintaaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E40AF" />
          <Stop offset="100%" stopColor="#3B82F6" />
        </LinearGradient>
      </Defs>
      {/* Card Base */}
      <Rect x="2" y="5" width="28" height="22" rx="5" fill="#EFF6FF" stroke="url(#cintaaGrad)" strokeWidth="2" />
      {/* Top Banner */}
      <Path d="M2 10h28V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1z" fill="url(#cintaaGrad)" />
      {/* Avatar Badge */}
      <Circle cx="9" cy="18" r="4" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
      <Circle cx="9" cy="16.5" r="1.8" fill="#2563EB" />
      {/* Verified Gold Badge */}
      <Circle cx="23" cy="17" r="3.5" fill="#F59E0B" />
      <Path d="M21.5 17l1 1 2-2" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* ID Lines */}
      <Path d="M15 15h4M15 19h6" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

// 11. PHONE - Emerald Call Badge
export function PhoneCallIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#16A34A" />
          <Stop offset="100%" stopColor="#4ADE80" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="13" fill="#DCFCE7" />
      <Path
        d="M22 19.5v2.5a2 2 0 0 1-2.18 2 15.8 15.8 0 0 1-6.9-2.45 15.6 15.6 0 0 1-4.8-4.8A15.8 15.8 0 0 1 5.67 9.8 2 2 0 0 1 7.65 7.6h2.5a2 2 0 0 1 2 1.72c.13.97.37 1.92.7 2.83a2 2 0 0 1-.45 2.11L11.34 15.3a12.8 12.8 0 0 0 4.8 4.8l1.04-1.06a2 2 0 0 1 2.11-.45c.91.33 1.86.57 2.83.7A2 2 0 0 1 22 19.5z"
        fill="url(#phoneGrad)"
      />
    </IconBase>
  );
}

// 12. EMAIL - Violet Mail Envelope
export function EmailIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="emailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7C3AED" />
          <Stop offset="100%" stopColor="#A78BFA" />
        </LinearGradient>
      </Defs>
      <Rect x="3" y="6" width="26" height="20" rx="5" fill="#F5F3FF" stroke="url(#emailGrad)" strokeWidth="2" />
      <Path
        d="m3 9 11.7 8a2.5 2.5 0 0 0 2.6 0L29 9"
        stroke="#7C3AED"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// 13. INFO BADGE / SECTION HEADER
export function InfoBadgeIcon({ size = 28, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="infoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2563EB" />
          <Stop offset="100%" stopColor="#60A5FA" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="13" fill="#DBEAFE" stroke="url(#infoGrad)" strokeWidth="2.5" />
      <Circle cx="16" cy="11" r="2" fill="#2563EB" />
      <Path d="M16 15v7M14 22h4" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

import React from 'react';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

// ==================== WIZARD STEP HEADER ICONS (3D MULTI-LAYER) ====================

export const StepBasicInfoIcon = ({ size = 28, active = false, completed = false }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="sb_grad1" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor={completed ? "#10B981" : active ? "#2563EB" : "#94A3B8"} />
        <Stop offset="100%" stopColor={completed ? "#059669" : active ? "#1D4ED8" : "#64748B"} />
      </LinearGradient>
      <LinearGradient id="sb_clip" x1="14" y1="4" x2="34" y2="16" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>
    {/* Shadow / Base */}
    <Rect x="8" y="10" width="32" height="34" rx="8" fill="url(#sb_grad1)" opacity={active || completed ? 1 : 0.7} />
    {/* Paper Sheet */}
    <Rect x="12" y="14" width="24" height="26" rx="4" fill="#FFFFFF" opacity={active || completed ? 0.95 : 0.85} />
    {/* Clip Top */}
    <Rect x="18" y="6" width="12" height="8" rx="3" fill="url(#sb_clip)" />
    <Circle cx="24" cy="9" r="2" fill="#FFFFFF" opacity={0.9} />
    {/* Checklist Lines */}
    <Rect x="16" y="20" width="16" height="3" rx="1.5" fill={active || completed ? "#2563EB" : "#94A3B8"} />
    <Rect x="16" y="26" width="12" height="3" rx="1.5" fill={active || completed ? "#3B82F6" : "#CBD5E1"} />
    <Rect x="16" y="32" width="8" height="3" rx="1.5" fill={active || completed ? "#60A5FA" : "#CBD5E1"} />
    {/* Tiny Star Badge */}
    <Circle cx="32" cy="33" r="3.5" fill="#F59E0B" />
    <Path d="M32 30.5L32.8 32.2L34.5 32.5L33.2 33.7L33.6 35.5L32 34.6L30.4 35.5L30.8 33.7L29.5 32.5L31.2 32.2L32 30.5Z" fill="#FFFFFF" />
  </Svg>
);

export const StepRoleCriteriaIcon = ({ size = 28, active = false, completed = false }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="sr_grad1" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor={completed ? "#10B981" : active ? "#8B5CF6" : "#94A3B8"} />
        <Stop offset="100%" stopColor={completed ? "#059669" : active ? "#6D28D9" : "#64748B"} />
      </LinearGradient>
      <LinearGradient id="sr_mask" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#EC4899" />
        <Stop offset="100%" stopColor="#DB2777" />
      </LinearGradient>
    </Defs>
    {/* Base Circle / Shield */}
    <Circle cx="24" cy="24" r="18" fill="url(#sr_grad1)" opacity={active || completed ? 1 : 0.7} />
    {/* Inner Mask 1 */}
    <Path d="M14 18C14 13.58 17.58 10 22 10C26.42 10 30 13.58 30 18V24C30 29.52 25.52 34 20 34C15.58 34 14 29.52 14 24V18Z" fill="#FFFFFF" opacity={0.92} />
    {/* Mask Features */}
    <Circle cx="18" cy="18" r="2" fill="#8B5CF6" />
    <Circle cx="24" cy="18" r="2" fill="#8B5CF6" />
    <Path d="M18 24C19 26 23 26 24 24" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    {/* Crown / Star Sparkle */}
    <Circle cx="33" cy="15" r="5" fill="url(#sr_mask)" />
    <Path d="M33 12L34 14.2L36 15L34 15.8L33 18L32 15.8L30 15L32 14.2L33 12Z" fill="#FFFFFF" />
  </Svg>
);

export const StepBudgetTermsIcon = ({ size = 28, active = false, completed = false }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="sbg_grad1" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor={completed ? "#10B981" : active ? "#F59E0B" : "#94A3B8"} />
        <Stop offset="100%" stopColor={completed ? "#059669" : active ? "#D97706" : "#64748B"} />
      </LinearGradient>
      <LinearGradient id="sbg_coin" x1="16" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#FBBF24" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </LinearGradient>
    </Defs>
    {/* Outer Rounded Container */}
    <Rect x="8" y="8" width="32" height="32" rx="10" fill="url(#sbg_grad1)" opacity={active || completed ? 1 : 0.7} />
    {/* Gold Coin 1 (Back) */}
    <Circle cx="28" cy="22" r="10" fill="#FDE68A" />
    {/* Gold Coin 2 (Front) */}
    <Circle cx="22" cy="26" r="11" fill="url(#sbg_coin)" stroke="#FFFFFF" strokeWidth="1.5" />
    <Circle cx="22" cy="26" r="8" fill="#F59E0B" opacity={0.6} />
    {/* Rupee Symbol */}
    <Path d="M19 21H25M19 24H24M21.5 24C23.5 24 24.5 25.5 24.5 27C24.5 28.5 23 30 21 30L25 34M19 21V34" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const StepLogisticsMediaIcon = ({ size = 28, active = false, completed = false }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="slm_grad1" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor={completed ? "#10B981" : active ? "#06B6D4" : "#94A3B8"} />
        <Stop offset="100%" stopColor={completed ? "#059669" : active ? "#0891B2" : "#64748B"} />
      </LinearGradient>
      <LinearGradient id="slm_pin" x1="14" y1="8" x2="34" y2="38" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#EF4444" />
        <Stop offset="100%" stopColor="#DC2626" />
      </LinearGradient>
    </Defs>
    {/* Container */}
    <Circle cx="24" cy="24" r="18" fill="url(#slm_grad1)" opacity={active || completed ? 1 : 0.7} />
    {/* Map Pin 3D */}
    <Path d="M24 10C18.48 10 14 14.48 14 20C14 27.5 24 38 24 38C24 38 34 27.5 34 20C34 14.48 29.52 10 24 10Z" fill="url(#slm_pin)" />
    {/* Pin Inner */}
    <Circle cx="24" cy="20" r="5" fill="#FFFFFF" />
    {/* Clapper / Star inside Pin */}
    <Circle cx="24" cy="20" r="2.5" fill="#EF4444" />
  </Svg>
);

// ==================== LISTING TYPE ICONS (AUDITION / JOB / CASTING CALL) ====================

export const ListingTypeAuditionIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="lta_g" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#3B82F6" />
        <Stop offset="100%" stopColor="#1D4ED8" />
      </LinearGradient>
    </Defs>
    <Rect x="6" y="8" width="36" height="32" rx="10" fill="url(#lta_g)" />
    {/* Clapperboard Strip Top */}
    <Path d="M6 16H42V12C42 9.79 40.21 8 38 8H10C7.79 8 6 9.79 6 12V16Z" fill="#1E3A8A" />
    <Path d="M12 8L16 16M22 8L26 16M32 8L36 16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    {/* Play Triangle with Glow */}
    <Circle cx="24" cy="28" r="9" fill="#FFFFFF" opacity={0.25} />
    <Path d="M21 23L29 28L21 33V23Z" fill="#FFFFFF" />
  </Svg>
);

export const ListingTypeJobIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="ltj_g" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#10B981" />
        <Stop offset="100%" stopColor="#047857" />
      </LinearGradient>
    </Defs>
    <Rect x="6" y="14" width="36" height="26" rx="8" fill="url(#ltj_g)" />
    {/* Handle Top */}
    <Path d="M18 14V10C18 8.9 18.9 8 20 8H28C29.1 8 30 8.9 30 10V14" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
    {/* Briefcase Gold Lock */}
    <Rect x="21" y="22" width="6" height="6" rx="2" fill="#F59E0B" />
    <Rect x="8" y="24" width="32" height="2" fill="#065F46" opacity={0.5} />
  </Svg>
);

export const ListingTypeCastingCallIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="ltc_g" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#EC4899" />
        <Stop offset="100%" stopColor="#BE185D" />
      </LinearGradient>
    </Defs>
    <Circle cx="24" cy="24" r="18" fill="url(#ltc_g)" />
    {/* Megaphone */}
    <Path d="M14 20H18L26 14V34L18 28H14C12.9 28 12 27.1 12 26V22C12 20.9 12.9 20 14 20Z" fill="#FFFFFF" />
    {/* Sound Waves */}
    <Path d="M30 18C32 20 33 22 33 24C33 26 32 28 30 30M34 14C37 17 38 20.5 38 24C38 27.5 37 31 34 34" stroke="#FDF2F8" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

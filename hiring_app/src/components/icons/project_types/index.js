import React from 'react';
import {
  Svg,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  Polygon,
} from 'react-native-svg';

function IconBase({ size = 26, viewBox = '0 0 32 32', style, children }) {
  return (
    <Svg width={size} height={size} viewBox={viewBox} style={style}>
      {children}
    </Svg>
  );
}

// 1. WEB-SERIES ICON (Streaming Tablet / Screen with Neon Play)
export function WebSeriesProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="wsDeviceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7C3AED" />
          <Stop offset="100%" stopColor="#4F46E5" />
        </LinearGradient>
        <LinearGradient id="wsScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E1B4B" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>
        <LinearGradient id="wsPlayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="5" width="24" height="22" rx="4" fill="url(#wsDeviceGrad)" />
      <Rect x="6" y="7" width="20" height="15" rx="2" fill="url(#wsScreenGrad)" />
      <Polygon points="14,10 20,14.5 14,19" fill="url(#wsPlayGrad)" />
      <Circle cx="16" cy="24.5" r="1.2" fill="#E2E8F0" opacity="0.8" />
    </IconBase>
  );
}

// 2. FILMS ICON (Cinema Projector & Vintage Reel)
export function FilmsProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="filmBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
        <LinearGradient id="filmReelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>
        <LinearGradient id="filmLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
      </Defs>
      {/* Upper Dual Reels */}
      <Circle cx="10" cy="8" r="5" fill="url(#filmReelGrad)" />
      <Circle cx="10" cy="8" r="2" fill="#F59E0B" />
      <Circle cx="20" cy="8" r="5" fill="url(#filmReelGrad)" />
      <Circle cx="20" cy="8" r="2" fill="#F59E0B" />
      {/* Projector Body */}
      <Rect x="6" y="13" width="18" height="13" rx="3" fill="url(#filmBodyGrad)" />
      {/* Lens Cone */}
      <Polygon points="24,16 29,13 29,23 24,20" fill="url(#filmLensGrad)" />
      {/* Detail dials */}
      <Circle cx="10" cy="19.5" r="2" fill="#FFFFFF" opacity="0.3" />
      <Circle cx="16" cy="19.5" r="2" fill="#FFFFFF" opacity="0.3" />
    </IconBase>
  );
}

// 3. TV SERIALS ICON (Retro TV with Dual Antenna & Glow)
export function TvSerialsProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="tvCaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0EA5E9" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
        <LinearGradient id="tvScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0F172A" />
          <Stop offset="100%" stopColor="#1E293B" />
        </LinearGradient>
      </Defs>
      {/* Dual Antenna */}
      <Path d="M12 4l4 5 4-5" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      {/* Main Body */}
      <Rect x="4" y="9" width="24" height="18" rx="4" fill="url(#tvCaseGrad)" />
      {/* Screen */}
      <Rect x="6" y="11" width="16" height="14" rx="2" fill="url(#tvScreenGrad)" />
      {/* Screen Reflection Curve */}
      <Path d="M8 13q6 4 12 0" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Knobs */}
      <Circle cx="25" cy="14" r="1.5" fill="#F8FAFC" />
      <Circle cx="25" cy="19" r="1.5" fill="#F8FAFC" />
      <Rect x="23.5" y="22" width="3" height="1.5" rx="0.5" fill="#F8FAFC" opacity="0.6" />
      {/* Legs */}
      <Path d="M7 27l-2 3M25 27l2 3" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// 4. SHORT FILMS ICON (Compact Action Clapperboard)
export function ShortFilmsProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="sfBoardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#334155" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>
        <LinearGradient id="sfClapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E2E8F0" />
          <Stop offset="100%" stopColor="#94A3B8" />
        </LinearGradient>
      </Defs>
      {/* Board Base */}
      <Rect x="5" y="12" width="22" height="16" rx="3" fill="url(#sfBoardGrad)" />
      {/* Clap Top Stick */}
      <G transform="rotate(-12 6 12)">
        <Rect x="5" y="6" width="22" height="6" rx="1.5" fill="#0F172A" />
        <Polygon points="7,6 10,6 7,12 4,12" fill="#E2E8F0" />
        <Polygon points="13,6 16,6 13,12 10,12" fill="#E2E8F0" />
        <Polygon points="19,6 22,6 19,12 16,12" fill="#E2E8F0" />
        <Polygon points="25,6 27,6 25,12 22,12" fill="#E2E8F0" />
      </G>
      {/* Fast Forward Icon on Board */}
      <Polygon points="12,17 17,20 12,23" fill="#38BDF8" />
      <Polygon points="17,17 22,20 17,23" fill="#38BDF8" />
    </IconBase>
  );
}

// 5. AD FILMS ICON (Megaphone with Sparkle & Advertising Flash)
export function AdFilmsProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="adConeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F43F5E" />
          <Stop offset="100%" stopColor="#BE123C" />
        </LinearGradient>
        <LinearGradient id="adCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </LinearGradient>
      </Defs>
      {/* Megaphone Cone */}
      <Polygon points="9,13 21,7 21,23 9,17" fill="url(#adConeGrad)" />
      {/* Megaphone Back */}
      <Rect x="5" y="13" width="4" height="4" rx="1" fill="url(#adCapGrad)" />
      {/* Handle */}
      <Path d="M12 17v7a2 2 0 002 2h1" stroke="#BE123C" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sound Waves / Sparkles */}
      <Path d="M24 11q3 4 0 8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <Path d="M27 8q5 7 0 14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <Circle cx="24" cy="6" r="1.5" fill="#FBBF24" />
    </IconBase>
  );
}

// 6. REALITY SHOWS ICON (Stage Spotlight & Studio Mic)
export function RealityShowsProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="rsBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
        </LinearGradient>
        <LinearGradient id="rsMicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#6D28D9" />
        </LinearGradient>
      </Defs>
      {/* Stage Light Beam */}
      <Polygon points="6,6 26,6 29,26 3,26" fill="url(#rsBeamGrad)" />
      {/* Spotlight Rig */}
      <Rect x="10" y="3" width="12" height="4" rx="1.5" fill="#334155" />
      {/* Studio Mic in Center */}
      <Rect x="14" y="11" width="4" height="7" rx="2" fill="url(#rsMicGrad)" />
      <Path d="M12 15a4 4 0 008 0" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M16 19v4M13 23h6" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

// 7. TALENT HUNT ICON (3D Golden Star Trophy)
export function TalentHuntProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="thTrophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
        <LinearGradient id="thStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFBEB" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>
      </Defs>
      {/* Base */}
      <Rect x="10" y="24" width="12" height="4" rx="1" fill="#78350F" />
      <Rect x="14" y="20" width="4" height="4" fill="#D97706" />
      {/* Cup */}
      <Path d="M8 8h16v6a8 8 0 01-16 0V8z" fill="url(#thTrophyGrad)" />
      {/* Handles */}
      <Path d="M8 10H5a3 3 0 003 3v-1M24 10h3a3 3 0 01-3 3v-1" stroke="#D97706" strokeWidth="1.5" fill="none" />
      {/* Champion Star */}
      <Polygon points="16,9 17.5,12 21,12.5 18.5,15 19,18 16,16.5 13,18 13.5,15 11,12.5 14.5,12" fill="url(#thStarGrad)" />
    </IconBase>
  );
}

// 8. REGIONAL MOVIES ICON (Cultural Cinema & Marigold Lantern)
export function RegionalMoviesProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="regLanternGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EA580C" />
          <Stop offset="100%" stopColor="#C2410C" />
        </LinearGradient>
        <LinearGradient id="regFlameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </LinearGradient>
      </Defs>
      {/* Diya / Lantern Base */}
      <Path d="M6 18c0 6 8 8 10 8s10-2 10-8H6z" fill="url(#regLanternGrad)" />
      {/* Film Spool Accents on Diya */}
      <Circle cx="12" cy="20" r="1.5" fill="#FEF08A" />
      <Circle cx="16" cy="21" r="1.5" fill="#FEF08A" />
      <Circle cx="20" cy="20" r="1.5" fill="#FEF08A" />
      {/* Glowing Flame */}
      <Path d="M16 6c-3 4-4 7-4 9a4 4 0 008 0c0-2-1-5-4-9z" fill="url(#regFlameGrad)" />
    </IconBase>
  );
}

// 9. REGIONAL SHOWS ICON (Broadcaster Satellite Dish)
export function RegionalShowsProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="satDishGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0284C7" />
          <Stop offset="100%" stopColor="#0369A1" />
        </LinearGradient>
      </Defs>
      {/* Dish Arc */}
      <Path d="M7 21A12 12 0 0121 7" stroke="url(#satDishGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Receiver Spoke */}
      <Path d="M14 14l6-6" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="21" cy="7" r="2.5" fill="#EA580C" />
      {/* Signal Pulses */}
      <Path d="M23 4q3 3 0 6" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M26 1q5 5 0 10" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Stand */}
      <Path d="M9 19l-4 8M15 22l-1 5" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// 10. BRANDED CONTENT ICON (Luxury Brand Tag & Briefcase)
export function BrandedContentProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="bcTagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
        <LinearGradient id="bcRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      {/* Diagonal Tag */}
      <Polygon points="12,5 24,5 28,17 16,17" fill="url(#bcTagGrad)" transform="rotate(-15 18 12)" />
      {/* Tag Hole */}
      <Circle cx="13" cy="9" r="1.5" fill="#FFFFFF" />
      {/* Gold Seal */}
      <Circle cx="20" cy="18" r="6" fill="url(#bcRibbonGrad)" />
      {/* Star on Seal */}
      <Polygon points="20,15 21,17 23,17.5 21.5,19 22,21 20,20 18,21 18.5,19 17,17.5 19,17" fill="#FFFFFF" />
    </IconBase>
  );
}

// 11. MUSIC VIDEOS ICON (Studio Headphones & Musical Notes)
export function MusicVideosProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="mvPhoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EC4899" />
          <Stop offset="100%" stopColor="#DB2777" />
        </LinearGradient>
      </Defs>
      {/* Headphone Arch */}
      <Path d="M6 16A10 10 0 0126 16" stroke="url(#mvPhoneGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Left Ear Cushion */}
      <Rect x="4" y="15" width="4" height="9" rx="2" fill="url(#mvPhoneGrad)" />
      {/* Right Ear Cushion */}
      <Rect x="24" y="15" width="4" height="9" rx="2" fill="url(#mvPhoneGrad)" />
      {/* Center Musical Note */}
      <Path d="M14 20v-5l4-2v5" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="13" cy="21" r="2" fill="#38BDF8" />
      <Circle cx="17" cy="19" r="2" fill="#38BDF8" />
    </IconBase>
  );
}

// 12. MUSIC ALBUMS ICON (Glossy Vinyl Record Disc)
export function MusicAlbumsProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="albVinylGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#020617" />
        </LinearGradient>
        <LinearGradient id="albCenterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F43F5E" />
          <Stop offset="100%" stopColor="#E11D48" />
        </LinearGradient>
      </Defs>
      {/* Outer Vinyl Disc */}
      <Circle cx="16" cy="16" r="13" fill="url(#albVinylGrad)" />
      {/* Grooves */}
      <Circle cx="16" cy="16" r="10" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.6" />
      <Circle cx="16" cy="16" r="8" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.6" />
      {/* Center Label */}
      <Circle cx="16" cy="16" r="4.5" fill="url(#albCenterGrad)" />
      <Circle cx="16" cy="16" r="1.5" fill="#FFFFFF" />
    </IconBase>
  );
}

// 13. PRINT SHOOTS ICON (Editorial Magazine & Flash Camera)
export function PrintShootsProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="psMagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6366F1" />
          <Stop offset="100%" stopColor="#4F46E5" />
        </LinearGradient>
        <LinearGradient id="psCamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      {/* Magazine Page */}
      <Rect x="4" y="5" width="17" height="22" rx="2" fill="url(#psMagGrad)" />
      {/* Header bar on Mag */}
      <Rect x="6" y="8" width="13" height="3" rx="1" fill="#FFFFFF" opacity="0.8" />
      <Rect x="6" y="13" width="9" height="1.5" rx="0.5" fill="#FFFFFF" opacity="0.5" />
      <Rect x="6" y="16" width="11" height="1.5" rx="0.5" fill="#FFFFFF" opacity="0.5" />
      {/* Flash Camera Overlay */}
      <Rect x="15" y="16" width="14" height="11" rx="2.5" fill="url(#psCamGrad)" />
      <Circle cx="22" cy="21.5" r="3" fill="#0F172A" />
      <Circle cx="22" cy="21.5" r="1.5" fill="#38BDF8" />
      <Circle cx="26" cy="18" r="1" fill="#FEF08A" />
    </IconBase>
  );
}

// 14. CATALOG SHOOTS ICON (Lookbook & Designer Shopping Bag)
export function CatalogShootsProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="catBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#14B8A6" />
          <Stop offset="100%" stopColor="#0D9488" />
        </LinearGradient>
      </Defs>
      {/* Bag Handles */}
      <Path d="M12 12V8a4 4 0 018 0v4" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Shopping Bag Body */}
      <Polygon points="7,12 25,12 23,27 9,27" fill="url(#catBagGrad)" />
      {/* Fashion Tag */}
      <Circle cx="16" cy="18" r="3" fill="#FFFFFF" opacity="0.9" />
      <Path d="M15 18l2 2" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

// 15. DOCUMENTARY ICON (Heavy Duty Camcorder & Shotgun Mic)
export function DocumentaryProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="docCamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#475569" />
          <Stop offset="100%" stopColor="#1E293B" />
        </LinearGradient>
      </Defs>
      {/* Camera Body */}
      <Rect x="4" y="12" width="18" height="13" rx="3" fill="url(#docCamGrad)" />
      {/* Handle / Rig Top */}
      <Path d="M6 12V8h12v4" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Shotgun Mic on top */}
      <Rect x="10" y="6" width="12" height="3" rx="1.5" fill="#E2E8F0" />
      {/* Lens Cone */}
      <Polygon points="22,15 28,11 28,22 22,18" fill="#F59E0B" />
      {/* Recording Red Dot */}
      <Circle cx="7" cy="15" r="1.5" fill="#EF4444" />
    </IconBase>
  );
}

// 16. OTHER PROJECT ICON (Multi-color Creative Sparkle)
export function OtherProjectIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="othSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EC4899" />
          <Stop offset="50%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#3B82F6" />
        </LinearGradient>
      </Defs>
      {/* 4-point Main Sparkle */}
      <Path
        d="M16 3c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z"
        fill="url(#othSparkGrad)"
      />
      <Circle cx="6" cy="7" r="2" fill="#FBBF24" />
      <Circle cx="26" cy="24" r="1.5" fill="#34D399" />
    </IconBase>
  );
}

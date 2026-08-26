import React from 'react';
import { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import IconBase from '../IconBase';

// 1. RICH BASIC INFO SECTION HEADER ICON (3D Artist ID Badge)
export function BasicInfoSectionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="idCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
        <LinearGradient id="idLanyardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#60A5FA" />
          <Stop offset="100%" stopColor="#3B82F6" />
        </LinearGradient>
      </Defs>
      {/* Lanyard Ring */}
      <Path d="M12 2h8v4h-8z" fill="#94A3B8" />
      <Circle cx="16" cy="4" r="1.5" fill="#FFFFFF" />
      {/* Card Base */}
      <Rect x="4" y="6" width="24" height="24" rx="5" fill="url(#idCardGrad)" />
      {/* ID Photo Box */}
      <Rect x="7" y="10" width="8" height="9" rx="2.5" fill="#FFFFFF" />
      <Circle cx="11" cy="13" r="2" fill="#3B82F6" />
      <Path d="M8 18c0-1.8 1.5-2.5 3-2.5s3 .7 3 2.5z" fill="#3B82F6" />
      {/* ID Details Text Lines */}
      <Rect x="17" y="11" width="8" height="2" rx="1" fill="#FFFFFF" opacity="0.9" />
      <Rect x="17" y="14.5" width="6" height="2" rx="1" fill="#93C5FD" />
      <Rect x="17" y="18" width="7" height="2" rx="1" fill="#93C5FD" />
      {/* Bottom Chip Strip */}
      <Rect x="7" y="22" width="18" height="4.5" rx="2" fill="#1E40AF" />
      <Circle cx="10" cy="24.2" r="1" fill="#FBBF24" />
      <Rect x="13" y="23.2" width="10" height="2" rx="1" fill="#FFFFFF" opacity="0.8" />
    </IconBase>
  );
}

// 2. RICH SHARE PROFILE ICON
export function ShareProfileIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="shareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>
      {/* Connection Lines */}
      <Path d="M10 16l12-6M10 16l12 6" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
      {/* Main Source Node */}
      <Circle cx="8" cy="16" r="5.5" fill="url(#shareGrad)" />
      <Circle cx="7" cy="14.5" r="1.5" fill="#FFFFFF" opacity="0.8" />
      {/* Target Node Top */}
      <Circle cx="24" cy="9" r="4.5" fill="#60A5FA" />
      <Circle cx="23" cy="8" r="1.2" fill="#FFFFFF" opacity="0.8" />
      {/* Target Node Bottom */}
      <Circle cx="24" cy="23" r="4.5" fill="#60A5FA" />
      <Circle cx="23" cy="22" r="1.2" fill="#FFFFFF" opacity="0.8" />
    </IconBase>
  );
}

// 3. CINTAA VERIFIED PRO BADGE (Prominent Header Banner)
export function CintaaGoldBadgeIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="cintaaGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      {/* Card Base */}
      <Rect x="2" y="5" width="28" height="22" rx="5" fill="url(#cintaaGold)" />
      {/* Movie Film Strip Cutouts on Top & Bottom */}
      <Rect x="4" y="7" width="2.5" height="2.5" rx="0.5" fill="#FFFFFF" />
      <Rect x="9" y="7" width="2.5" height="2.5" rx="0.5" fill="#FFFFFF" />
      <Rect x="14" y="7" width="2.5" height="2.5" rx="0.5" fill="#FFFFFF" />
      <Rect x="19" y="7" width="2.5" height="2.5" rx="0.5" fill="#FFFFFF" />
      <Rect x="24" y="7" width="2.5" height="2.5" rx="0.5" fill="#FFFFFF" />
      {/* Center Checkmark Shield */}
      <Circle cx="16" cy="18" r="6" fill="#FFFFFF" />
      <Path
        d="M13.5 18l2 2 3.5-3.5"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// 4. COMMENTS & REVIEWS SECTION HEADER ICON (3D Multi-Layer Discussion Bubbles)
export function CommentsSectionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="commBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
        <LinearGradient id="commTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2DD4BF" />
          <Stop offset="100%" stopColor="#0D9488" />
        </LinearGradient>
      </Defs>
      {/* Secondary Back Bubble */}
      <Path
        d="M14 4h10c4.4 0 8 3.6 8 8 0 3.2-1.9 6-4.6 7.3L28 24l-4.5-2.2H14c-4.4 0-8-3.6-8-8s3.6-8 8-8z"
        fill="url(#commTealGrad)"
        opacity="0.85"
      />
      {/* Primary Front Bubble */}
      <Path
        d="M4 10h11c4.4 0 8 3.6 8 8 0 3.2-1.9 6-4.6 7.3L19 30l-4.8-2.4H4c-4.4 0-8-3.6-8-8s3.6-8 8-8z"
        fill="url(#commBlueGrad)"
      />
      {/* Discussion Dots */}
      <Circle cx="5" cy="18" r="1.6" fill="#FFFFFF" />
      <Circle cx="9.5" cy="18" r="1.6" fill="#FFFFFF" />
      <Circle cx="14" cy="18" r="1.6" fill="#FFFFFF" />
    </IconBase>
  );
}

// 5. MEDIA GALLERY SECTION HEADER ICON (3D Camera & Film Reel Lens)
export function MediaGallerySectionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="mediaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#6D28D9" />
        </LinearGradient>
        <LinearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
      </Defs>
      {/* Camera Body */}
      <Path
        d="M4 10a4 4 0 0 1 4-4h2.5l1.8-2.5a2 2 0 0 1 1.6-.8h4.2a2 2 0 0 1 1.6.8L21.5 6H24a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10z"
        fill="url(#mediaGrad)"
      />
      {/* Outer Lens Rim */}
      <Circle cx="16" cy="17" r="7.5" fill="#FFFFFF" />
      {/* Inner Glowing Lens */}
      <Circle cx="16" cy="17" r="6" fill="url(#lensGrad)" />
      <Circle cx="14.2" cy="15.2" r="1.8" fill="#FFFFFF" />
      {/* Top Flash Accent */}
      <Circle cx="24" cy="10" r="1.8" fill="#FBBF24" />
    </IconBase>
  );
}

// 6. PREFERENCES & TAGS SECTION HEADER ICON (3D Filter Sliders)
export function PreferencesSectionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="prefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
      </Defs>
      {/* Slider Track 1 */}
      <Path d="M4 9h24" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="11" cy="9" r="4.5" fill="url(#prefGrad)" />
      <Circle cx="11" cy="9" r="2" fill="#FFFFFF" />
      {/* Slider Track 2 */}
      <Path d="M4 16h24" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="21" cy="16" r="4.5" fill="url(#prefGrad)" />
      <Circle cx="21" cy="16" r="2" fill="#FFFFFF" />
      {/* Slider Track 3 */}
      <Path d="M4 23h24" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="14" cy="23" r="4.5" fill="url(#prefGrad)" />
      <Circle cx="14" cy="23" r="2" fill="#FFFFFF" />
    </IconBase>
  );
}

// 7. RECENT ASSIGNMENTS SECTION HEADER ICON (3D Star Clapper Project)
export function AssignmentsSectionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="assGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      {/* Project Board */}
      <Rect x="4" y="6" width="24" height="22" rx="4" fill="url(#assGrad)" />
      {/* Header Clapper Bars */}
      <Path d="M4 11h24M9 6l3 5M17 6l3 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      {/* Star Medal in Center */}
      <Circle cx="16" cy="20" r="5" fill="#FFFFFF" />
      <Path
        d="M16 17l1 2.3 2.5.3-1.8 1.7.5 2.5L16 22.5l-2.2 1.3.5-2.5-1.8-1.7 2.5-.3L16 17z"
        fill="#D97706"
      />
    </IconBase>
  );
}

// 8. VIDEO SECTION HEADER ICON (3D Film Reel & Play)
export function VideoSectionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="vidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#B91C1C" />
        </LinearGradient>
      </Defs>
      {/* Film Reel Body */}
      <Rect x="3" y="6" width="26" height="20" rx="5" fill="url(#vidGrad)" />
      {/* Film Holes */}
      <Circle cx="7" cy="10" r="1.5" fill="#FFFFFF" />
      <Circle cx="7" cy="22" r="1.5" fill="#FFFFFF" />
      <Circle cx="25" cy="10" r="1.5" fill="#FFFFFF" />
      <Circle cx="25" cy="22" r="1.5" fill="#FFFFFF" />
      {/* Center Play Glass Bubble */}
      <Circle cx="16" cy="16" r="5.5" fill="#FFFFFF" />
      <Path d="M14.5 13.5l4.5 2.5-4.5 2.5v-5z" fill="#DC2626" />
    </IconBase>
  );
}

// 9. 3D REPORT / SAFETY SHIELD ICON
export function ReportFlagShieldIcon({ size = 22, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="repShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F87171" />
          <Stop offset="100%" stopColor="#DC2626" />
        </LinearGradient>
      </Defs>
      <Path
        d="M16 3L5 7v9c0 8 4.7 12.5 11 13 6.3-.5 11-5 11-13V7l-11-4z"
        fill="url(#repShieldGrad)"
      />
      {/* Exclamation Symbol in Center */}
      <Rect x="14.5" y="9" width="3" height="8" rx="1.5" fill="#FFFFFF" />
      <Circle cx="16" cy="21" r="1.7" fill="#FFFFFF" />
    </IconBase>
  );
}

// 10. 3D BIO QUOTE SECTION ICON
export function BioQuoteIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="quoteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>
      {/* Left Quote Mark */}
      <Path
        d="M7 17h5c0 4-2.5 6-5 6v2c4.5 0 7-3.5 7-8V10H7v7z"
        fill="url(#quoteGrad)"
      />
      {/* Right Quote Mark */}
      <Path
        d="M17 17h5c0 4-2.5 6-5 6v2c4.5 0 7-3.5 7-8V10h-7v7z"
        fill="url(#quoteGrad)"
      />
    </IconBase>
  );
}

// 11. 3D ARTIST ROLE SPARKLE BADGE
export function ArtistRoleBadgeIcon({ size = 16, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 24 24" {...props}>
      <Defs>
        <LinearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#60A5FA" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>
      {/* Central 4-pointed sparkle */}
      <Path
        d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2z"
        fill="url(#sparkleGrad)"
      />
      <Circle cx="19" cy="5" r="1.5" fill="#93C5FD" />
      <Circle cx="5" cy="18" r="1.2" fill="#93C5FD" />
    </IconBase>
  );
}




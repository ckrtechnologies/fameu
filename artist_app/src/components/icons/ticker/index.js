import React from 'react';
import { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import IconBase from '../IconBase';

// 1. LIVE RADAR BROADCAST ICON
export function LiveRadarIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="liveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#DC2626" />
        </LinearGradient>
      </Defs>
      {/* Outer Pulse Wave */}
      <Circle cx="16" cy="16" r="14" fill="#FEE2E2" opacity="0.6" />
      {/* Mid Wave */}
      <Circle cx="16" cy="16" r="9.5" fill="#FECACA" />
      {/* Core Live Red Beacon */}
      <Circle cx="16" cy="16" r="5.5" fill="url(#liveGrad)" />
      <Circle cx="14.5" cy="14.5" r="1.5" fill="#FFFFFF" opacity="0.8" />
    </IconBase>
  );
}

// 2. CINEMA CLAPPERBOARD / FOR YOU ROLES ICON
export function ClapperRoleIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="clapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>
      {/* Clapper Top Stick */}
      <Path
        d="M4 7l24-3.5 1 4.5-24 3.5z"
        fill="#1E293B"
      />
      <Path d="M9 6.2l3 4.2M17 5l3 4.2M25 3.8l3 4.2" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      {/* Main Board */}
      <Rect x="4" y="11" width="24" height="17" rx="4" fill="url(#clapGrad)" />
      {/* Center Star */}
      <Path
        d="M16 14.5l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.6-3.1 1.6.6-3.5-2.5-2.5 3.5-.5L16 14.5z"
        fill="#FBBF24"
      />
    </IconBase>
  );
}

// 3. NEARBY GEO SPOTLIGHT ICON
export function NearbySpotlightIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="spotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
      </Defs>
      {/* Pin Body */}
      <Path
        d="M16 3a10 10 0 0 0-10 10c0 7.5 10 16 10 16s10-8.5 10-16A10 10 0 0 0 16 3z"
        fill="url(#spotGrad)"
      />
      {/* White Inner Center */}
      <Circle cx="16" cy="13" r="4.5" fill="#FFFFFF" />
      <Circle cx="16" cy="13" r="2.5" fill="#047857" />
    </IconBase>
  );
}

// 4. VERIFIED TRUST SHIELD ICON
export function VerifiedTrustShieldIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#6366F1" />
        </LinearGradient>
      </Defs>
      {/* Shield Body */}
      <Path
        d="M16 2.5l11 4.5v9c0 8-5 13-11 14.5C10 29 5 24 5 16V7l11-4.5z"
        fill="url(#shieldGrad)"
      />
      {/* Checkmark */}
      <Path
        d="M11 15.5l3.5 3.5 7.5-7.5"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// 5. PRO TALENT STAR ICON
export function ProTalentStarIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="proStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="14" fill="#FEF3C7" />
      <Path
        d="M16 6.5l2.8 6 6.6.9-4.8 4.6 1.2 6.5-5.8-3.1-5.8 3.1 1.2-6.5-4.8-4.6 6.6-.9L16 6.5z"
        fill="url(#proStarGrad)"
      />
      <Circle cx="14" cy="12" r="1" fill="#FFFFFF" />
    </IconBase>
  );
}

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

// 1. WALK-IN ICON (Solid 3D Location Pin with Target Base)
export function WalkInIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="pinBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#DC2626" />
        </LinearGradient>
      </Defs>
      {/* Target Shadow / Base */}
      <Circle cx="16" cy="27" r="7" fill="#FEE2E2" />
      <Circle cx="16" cy="27" r="3" fill="#DC2626" opacity="0.3" />
      {/* Pin Body */}
      <Path
        d="M16 4a8 8 0 00-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 00-8-8z"
        fill="url(#pinBodyGrad)"
      />
      <Circle cx="16" cy="12" r="3" fill="#FFFFFF" />
    </IconBase>
  );
}

// 2. SCHEDULED ICON (Solid 3D Desk Calendar with Clock Overlay)
export function ScheduledIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="calBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
        <LinearGradient id="calClockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      {/* Binder Rings */}
      <Rect x="9" y="3" width="3" height="4" rx="1.5" fill="#64748B" />
      <Rect x="20" y="3" width="3" height="4" rx="1.5" fill="#64748B" />
      {/* Calendar Card */}
      <Rect x="5" y="5" width="22" height="22" rx="4" fill="url(#calBodyGrad)" />
      {/* Header Band */}
      <Rect x="5" y="5" width="22" height="7" rx="4" fill="#1E40AF" />
      {/* Clock Badge Bottom Right */}
      <Circle cx="21" cy="21" r="6.5" fill="url(#calClockGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
      <Path d="M21 18v3.5l2 1.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

// 3. ONLINE MODE ICON (Solid Video Conference Terminal with Live Dot)
export function OnlineModeIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="onScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
      </Defs>
      {/* Monitor Display */}
      <Rect x="4" y="6" width="24" height="17" rx="3" fill="url(#onScreenGrad)" />
      {/* Video Camera in Center */}
      <Rect x="10" y="11" width="8" height="7" rx="1.5" fill="#FFFFFF" />
      <Polygon points="18,12.5 22,10.5 22,18.5 18,16.5" fill="#FFFFFF" />
      {/* Stand & Base */}
      <Path d="M16 23v4M11 27h10" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
      {/* Live Green Pulsing Dot */}
      <Circle cx="7" cy="9" r="1.5" fill="#FEF08A" />
    </IconBase>
  );
}

// 4. FULL-TIME ICON (Solid Executive Leather Briefcase)
export function FullTimeIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="ftCaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#854D0E" />
          <Stop offset="100%" stopColor="#713F12" />
        </LinearGradient>
      </Defs>
      {/* Handle */}
      <Path d="M12 9V6a2 2 0 012-2h4a2 2 0 012 2v3" stroke="#A16207" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Bag */}
      <Rect x="4" y="9" width="24" height="18" rx="4" fill="url(#ftCaseGrad)" />
      {/* Clasp & Straps */}
      <Rect x="4" y="16" width="24" height="2" fill="#CA8A04" />
      <Rect x="14" y="14" width="4" height="5" rx="1" fill="#FDE047" />
    </IconBase>
  );
}

// 5. PART-TIME ICON (Solid Half-Day Chronometer Clock)
export function PartTimeIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="ptClockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F97316" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
      </Defs>
      {/* Clock Outer Rim */}
      <Circle cx="16" cy="17" r="11" fill="url(#ptClockGrad)" />
      {/* Top Stopwatch Knob */}
      <Rect x="14.5" y="3" width="3" height="3" rx="0.5" fill="#9A3412" />
      {/* Clock Face Inside */}
      <Circle cx="16" cy="17" r="8.5" fill="#FFF7ED" />
      {/* Clock Hands */}
      <Path d="M16 11v6l4 2" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="16" cy="17" r="1.5" fill="#9A3412" />
    </IconBase>
  );
}

// 6. DATE-SPECIFIC ICON (Solid Calendar with Highlighted Event)
export function DateSpecificIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="dsCalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#06B6D4" />
          <Stop offset="100%" stopColor="#0891B2" />
        </LinearGradient>
      </Defs>
      <Rect x="5" y="6" width="22" height="21" rx="4" fill="url(#dsCalGrad)" />
      <Rect x="5" y="6" width="22" height="6" rx="4" fill="#0E7490" />
      {/* Highlighted Date Star/Pin */}
      <Circle cx="16" cy="19" r="4.5" fill="#FEF08A" />
      <Polygon points="16,16.5 17,18.5 19,18.8 17.5,20 18,22 16,21 14,22 14.5,20 13,18.8 15,18.5" fill="#D97706" />
    </IconBase>
  );
}

// 7. PER DAY COMPENSATION ICON (Solid Green Currency Notes)
export function PerDayIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="cashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#22C55E" />
          <Stop offset="100%" stopColor="#15803D" />
        </LinearGradient>
      </Defs>
      {/* Back Note */}
      <Rect x="7" y="7" width="20" height="12" rx="2.5" fill="#86EFAC" transform="rotate(-6 17 13)" />
      {/* Front Note */}
      <Rect x="5" y="11" width="22" height="14" rx="2.5" fill="url(#cashGrad)" />
      <Circle cx="16" cy="18" r="3.5" fill="#DCFCE7" />
      <Circle cx="16" cy="18" r="2" fill="#15803D" />
    </IconBase>
  );
}

// 8. PER WEEK COMPENSATION ICON (Solid Golden Coin Pouch)
export function PerWeekIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="pouchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      {/* Top Ribbon */}
      <Path d="M12 9h8l-2 3h-4z" fill="#DC2626" />
      {/* Pouch Sack */}
      <Path d="M10 12c-4 4-4 12 0 14s12 2 12-2 0-10-4-12z" fill="url(#pouchGrad)" />
      {/* Rupee / Dollar Coin in Center */}
      <Circle cx="16" cy="19" r="3" fill="#FEF3C7" />
      <Path d="M15 17h2M15 19h2M16 17v4" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
    </IconBase>
  );
}

// 9. PER MONTH COMPENSATION ICON (Solid Royal Blue Credit Card)
export function PerMonthIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>
      {/* Card Body */}
      <Rect x="4" y="8" width="24" height="16" rx="3" fill="url(#cardGrad)" />
      {/* Magnetic Stripe */}
      <Rect x="4" y="12" width="24" height="3.5" fill="#1E293B" />
      {/* Gold Chip */}
      <Rect x="7" y="17" width="4" height="3" rx="0.8" fill="#FBBF24" />
    </IconBase>
  );
}

// 10. ONE TIME COMPENSATION ICON (Solid Sparkling Diamond Gem)
export function OneTimeIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#A855F7" />
          <Stop offset="100%" stopColor="#7E22CE" />
        </LinearGradient>
      </Defs>
      {/* Diamond Crown & Pavilion */}
      <Polygon points="10,8 22,8 27,14 16,26 5,14" fill="url(#gemGrad)" />
      {/* Facet Highlights */}
      <Polygon points="10,8 16,14 5,14" fill="#C084FC" opacity="0.6" />
      <Polygon points="22,8 16,14 27,14" fill="#C084FC" opacity="0.6" />
      <Polygon points="10,8 22,8 16,14" fill="#E9D5FF" opacity="0.8" />
      <Polygon points="16,14 16,26 5,14" fill="#9333EA" />
      <Polygon points="16,14 16,26 27,14" fill="#6B21A8" />
    </IconBase>
  );
}

// 11. UNPAID / TFP ICON (Solid Collaboration Handshake)
export function UnpaidTfpIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="tfpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#14B8A6" />
          <Stop offset="100%" stopColor="#0F766E" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="12" fill="#CCFBF1" />
      <Path d="M9 18l4-4 3 3 5-5 3 3" stroke="url(#tfpGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="21" cy="12" r="2" fill="#0D9488" />
    </IconBase>
  );
}

// 12. GENDER MALE ICON
export function MaleGenderIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="maleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0EA5E9" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
      </Defs>
      <Circle cx="13" cy="19" r="6.5" stroke="url(#maleGrad)" strokeWidth="3" fill="#E0F2FE" />
      <Path d="M18 14l7-7M19 7h6v6" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

// 13. GENDER FEMALE ICON
export function FemaleGenderIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="femaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EC4899" />
          <Stop offset="100%" stopColor="#DB2777" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="12" r="6.5" stroke="url(#femaleGrad)" strokeWidth="3" fill="#FCE7F3" />
      <Path d="M16 19v8M12 23h8" stroke="#DB2777" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

// 14. GENDER OTHER / NON-BINARY ICON
export function OtherGenderIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="nbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#6D28D9" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="17" r="6.5" stroke="url(#nbGrad)" strokeWidth="3" fill="#EDE9FE" />
      <Path d="M16 10.5V4M13 6h6" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="16" cy="17" r="2" fill="#8B5CF6" />
    </IconBase>
  );
}

// 15. GENDER ANY ICON
export function AnyGenderIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="11" fill="url(#globeGrad)" />
      <Path d="M5 16h22M16 5c-3 4-5 7-5 11s2 7 5 11M16 5c3 4 5 7 5 11s-2 7-5 11" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
    </IconBase>
  );
}

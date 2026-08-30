import React from 'react';
import { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import IconBase from '../IconBase';

// ==========================================
// 1. QUICK ACTION 3D SOLID ICONS
// ==========================================

// 1.1 POST AUDITION (3D Layered Director Clapper & Neon Plus)
export function PostAudition3DIcon({ size = 30, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="postClapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#60A5FA" />
          <Stop offset="50%" stopColor="#2563EB" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
        <LinearGradient id="postStickGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>
        <LinearGradient id="plusGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#E0F2FE" />
        </LinearGradient>
      </Defs>

      {/* Clapper Top Angle Arm */}
      <Path
        d="M4 8l26-4 1.5 5-26 4z"
        fill="url(#postStickGrad)"
      />
      <Path d="M9 7.2l3.2 4.5M17 6l3.2 4.5M25 4.8l3.2 4.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />

      {/* Main Board Base */}
      <Rect x="4" y="12" width="28" height="20" rx="5" fill="url(#postClapGrad)" />

      {/* Glossy Top Sheen */}
      <Path
        d="M5 14h26c0 0-3 4-13 4S5 14 5 14z"
        fill="#FFFFFF"
        opacity="0.25"
      />

      {/* Center 3D Plus Emblem */}
      <Circle cx="18" cy="22" r="7" fill="#1E3A8A" opacity="0.4" />
      <Path
        d="M18 17v10M13 22h10"
        stroke="url(#plusGlow)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <Circle cx="18" cy="22" r="1.5" fill="#FFFFFF" />
    </IconBase>
  );
}

// 1.2 FIND TALENT (3D Glowing Gold Star with Hologram Lens)
export function FindTalent3DIcon({ size = 30, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="starGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="40%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
        <LinearGradient id="starSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF3C7" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>
      </Defs>

      {/* Soft Gold Outer Glow */}
      <Circle cx="18" cy="18" r="14" fill="#FEF3C7" opacity="0.6" />

      {/* 3D Primary Gemstone Star */}
      <Path
        d="M18 3.5l4.3 8.7 9.6 1.4-6.9 6.8 1.6 9.6-8.6-4.5-8.6 4.5 1.6-9.6-6.9-6.8 9.6-1.4L18 3.5z"
        fill="url(#starGoldGrad)"
      />

      {/* 3D Star Facet Shading */}
      <Path
        d="M18 3.5l4.3 8.7L18 19V3.5z"
        fill="#FFFFFF"
        opacity="0.35"
      />
      <Path
        d="M31.9 13.6l-6.9 6.8L18 19l13.9-5.4z"
        fill="#B45309"
        opacity="0.25"
      />

      {/* Center Shine Gem */}
      <Circle cx="18" cy="19" r="3.5" fill="url(#starSparkle)" />
      <Circle cx="16.5" cy="17.5" r="1.2" fill="#FFFFFF" />
    </IconBase>
  );
}

// 1.3 APPLICATIONS (3D Royal Violet Dossier with Certified Check)
export function ApplicationsAction3DIcon({ size = 30, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="dossierGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#A855F7" />
          <Stop offset="50%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#6D28D9" />
        </LinearGradient>
        <LinearGradient id="checkEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#34D399" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
      </Defs>

      {/* Back Document Shadow */}
      <Rect x="8" y="3" width="20" height="26" rx="4" fill="#DDD6FE" />

      {/* Main Document Body */}
      <Rect x="5" y="6" width="22" height="27" rx="4" fill="url(#dossierGrad)" />

      {/* Folder Fold Corner */}
      <Path d="M21 6v6h6" fill="#C4B5FD" opacity="0.9" />

      {/* Text Lines */}
      <Path d="M9 14h9M9 18h13M9 22h8" stroke="#E9D5FF" strokeWidth="2.2" strokeLinecap="round" />

      {/* Bottom Certified Check Badge */}
      <Circle cx="25" cy="25" r="7.5" fill="#FFFFFF" />
      <Circle cx="25" cy="25" r="6" fill="url(#checkEmerald)" />
      <Path
        d="M22.5 25l1.8 1.8 3.6-3.6"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// 1.4 MESSAGING (3D Emerald Speech Bubbles with Gloss Reflection)
export function MessagingAction3DIcon({ size = 30, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient id="chatMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#34D399" />
          <Stop offset="50%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
        <LinearGradient id="chatTealBack" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6EE7B7" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
      </Defs>

      {/* Back Secondary Chat Bubble */}
      <Path
        d="M20 6h7a6 6 0 0 1 6 6c0 3.3-2.7 6-6 6h-1l-3.5 3v-3.3A6 6 0 0 1 20 6z"
        fill="url(#chatTealBack)"
        opacity="0.7"
      />

      {/* Main Foreground Speech Bubble */}
      <Path
        d="M3 14a8 8 0 0 1 8-8h8a8 8 0 0 1 8 8c0 4.4-3.6 8-8 8h-3l-5.5 5.5v-5.8A7.8 7.8 0 0 1 3 14z"
        fill="url(#chatMintGrad)"
      />

      {/* Top Gloss Curve */}
      <Path
        d="M5 12c2-4 8-5 13-5s9 1 9 5c0 0-4-3-11-3S5 12 5 12z"
        fill="#FFFFFF"
        opacity="0.3"
      />

      {/* Three Discussion Dots */}
      <Circle cx="10" cy="14" r="1.8" fill="#FFFFFF" />
      <Circle cx="15" cy="14" r="1.8" fill="#FFFFFF" />
      <Circle cx="20" cy="14" r="1.8" fill="#FFFFFF" />
    </IconBase>
  );
}

// ==========================================
// 2. 2x2 METRIC CARDS 3D SOLID ICONS
// ==========================================

// 2.1 ACTIVE AUDITIONS (3D Studio Camera & Film Reel in Sky Blue)
export function ActiveAuditionsStat3DIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="50%" stopColor="#0284C7" />
          <Stop offset="100%" stopColor="#0369A1" />
        </LinearGradient>
      </Defs>

      {/* Top Dual Film Reels */}
      <Circle cx="10" cy="8" r="4.5" fill="#0284C7" />
      <Circle cx="10" cy="8" r="2" fill="#BAE6FD" />
      <Circle cx="18" cy="8" r="4.5" fill="#0284C7" />
      <Circle cx="18" cy="8" r="2" fill="#BAE6FD" />

      {/* Camera Body */}
      <Rect x="4" y="11" width="18" height="15" rx="3.5" fill="url(#camGrad)" />
      
      {/* Front Projecting Lens */}
      <Path
        d="M22 15l7-4v14l-7-4v-6z"
        fill="#0369A1"
      />
      <Path d="M29 11v14" stroke="#38BDF8" strokeWidth="1.5" />

      {/* Lens Reflection Highlight */}
      <Circle cx="9" cy="16" r="3" fill="#FFFFFF" opacity="0.3" />
      <Circle cx="8" cy="15" r="1" fill="#FFFFFF" />
    </IconBase>
  );
}

// 2.2 PENDING REVIEW (3D Hourglass / Chronometer in Amber Glow)
export function PendingReviewStat3DIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="clockAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" />
          <Stop offset="50%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>

      {/* Outer Watch Rim */}
      <Circle cx="16" cy="17" r="12.5" fill="#FEF3C7" />
      <Circle cx="16" cy="17" r="10.5" fill="url(#clockAmberGrad)" />

      {/* Top Chrono Stem / Button */}
      <Rect x="14" y="2" width="4" height="4" rx="1.2" fill="#B45309" />
      <Path d="M11 4h10" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" />

      {/* Dial Sclera */}
      <Circle cx="16" cy="17" r="8" fill="#FFFFFF" />

      {/* Clock Hands */}
      <Path
        d="M16 11.5v6l4.2 2.5"
        stroke="#D97706"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="16" cy="17.5" r="1.5" fill="#B45309" />
    </IconBase>
  );
}

// 2.3 SHORTLISTED (3D Gemstone Talent Star in Deep Royal Blue)
export function ShortlistedStat3DIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="shortlistGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#60A5FA" />
          <Stop offset="40%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>

      {/* Soft Glow */}
      <Circle cx="16" cy="16" r="13" fill="#DBEAFE" opacity="0.6" />

      {/* Star Body */}
      <Path
        d="M16 3.5l3.8 7.8 8.6 1.2-6.2 6.1 1.5 8.6-7.7-4-7.7 4 1.5-8.6-6.2-6.1 8.6-1.2L16 3.5z"
        fill="url(#shortlistGrad)"
      />

      {/* 3D Highlight Facet */}
      <Path
        d="M16 3.5l3.8 7.8L16 17V3.5z"
        fill="#FFFFFF"
        opacity="0.4"
      />
      <Circle cx="16" cy="17" r="2.5" fill="#BFDBFE" />
      <Circle cx="15" cy="15.8" r="1" fill="#FFFFFF" />
    </IconBase>
  );
}

// 2.4 TOTAL APPLICANTS (3D Candidate Team Duo in Emerald Neon)
export function TotalApplicantsStat3DIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="usersEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#34D399" />
          <Stop offset="50%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
        <LinearGradient id="userBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#A7F3D0" />
          <Stop offset="100%" stopColor="#34D399" />
        </LinearGradient>
      </Defs>

      {/* Secondary User (Back Left) */}
      <Circle cx="10" cy="11" r="4.2" fill="url(#userBackGrad)" />
      <Path
        d="M2.5 24c0-3.8 3.5-6.5 7.5-6.5s7.5 2.7 7.5 6.5"
        fill="url(#userBackGrad)"
      />

      {/* Primary User (Front Right) */}
      <Circle cx="21" cy="9.5" r="5" fill="url(#usersEmeraldGrad)" />
      <Path
        d="M12.5 26.5c0-4.5 3.8-7.5 8.5-7.5s8.5 3 8.5 7.5v1.5h-17v-1.5z"
        fill="url(#usersEmeraldGrad)"
      />

      {/* Highlight on Main User Chest */}
      <Circle cx="21" cy="23" r="1.5" fill="#D1FAE5" />
      <Circle cx="19.5" cy="8.5" r="1.2" fill="#FFFFFF" />
    </IconBase>
  );
}

// ==========================================
// 3. SECTION HEADER 3D SOLID BADGE ICONS
// ==========================================

// 3.1 LIVE AUDITIONS (Pulsing Red Radar Signal)
export function LiveAuditionsSectionIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 24 24" {...props}>
      <Defs>
        <LinearGradient id="liveSecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#B91C1C" />
        </LinearGradient>
      </Defs>
      <Circle cx="12" cy="12" r="10" fill="#FEE2E2" />
      <Circle cx="12" cy="12" r="6.5" fill="#FECACA" />
      <Circle cx="12" cy="12" r="4" fill="url(#liveSecGrad)" />
      <Circle cx="11" cy="11" r="1" fill="#FFFFFF" />
    </IconBase>
  );
}

// 3.2 APPLICATION GROWTH (Ascending Chart Bars & Spark)
export function ApplicationGrowthSectionIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 24 24" {...props}>
      <Defs>
        <LinearGradient id="growthSecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
      </Defs>
      <Rect x="2" y="14" width="4.5" height="7" rx="1.5" fill="#BAE6FD" />
      <Rect x="8.5" y="9" width="4.5" height="12" rx="1.5" fill="#38BDF8" />
      <Rect x="15" y="4" width="4.5" height="17" rx="1.5" fill="url(#growthSecGrad)" />
      <Path d="M4 11l6-4 5 3 6-7" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

// 3.3 RECENT APPLICANTS (Profile Id Card with Badge)
export function RecentApplicantsSectionIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 24 24" {...props}>
      <Defs>
        <LinearGradient id="applicantSecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
      </Defs>
      <Rect x="3" y="3" width="18" height="18" rx="4" fill="url(#applicantSecGrad)" />
      <Circle cx="12" cy="9" r="3.2" fill="#FFFFFF" />
      <Path d="M7 17c0-2.5 2.2-4.2 5-4.2s5 1.7 5 4.2" fill="#A7F3D0" />
    </IconBase>
  );
}

// 3.4 RECOMMENDED TALENT (Spotlight Star Badge)
export function RecommendedTalentSectionIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 24 24" {...props}>
      <Defs>
        <LinearGradient id="talentSecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      <Circle cx="12" cy="12" r="10" fill="#FEF3C7" />
      <Path
        d="M12 4.5l2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.2-.8L12 4.5z"
        fill="url(#talentSecGrad)"
      />
      <Circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
    </IconBase>
  );
}

// 3.5 UPCOMING INTERVIEWS (Desk Calendar with Meeting Pin)
export function InterviewsSectionIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 24 24" {...props}>
      <Defs>
        <LinearGradient id="calSecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#818CF8" />
          <Stop offset="100%" stopColor="#4F46E5" />
        </LinearGradient>
      </Defs>
      <Rect x="3" y="4" width="18" height="17" rx="3.5" fill="url(#calSecGrad)" />
      <Path d="M3 9h18" stroke="#FFFFFF" strokeWidth="1.8" />
      <Path d="M7 2v4M17 2v4" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="8" cy="14" r="1.2" fill="#FFFFFF" />
      <Circle cx="12" cy="14" r="1.2" fill="#FFFFFF" />
      <Circle cx="16" cy="14" r="1.2" fill="#FFFFFF" />
      <Circle cx="8" cy="17.5" r="1.2" fill="#FFFFFF" />
      <Circle cx="12" cy="17.5" r="1.2" fill="#FFFFFF" />
    </IconBase>
  );
}

// 3.6 SAVED DRAFTS (Draft Pen & Document)
export function DraftAuditionsSectionIcon({ size = 20, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 24 24" {...props}>
      <Defs>
        <LinearGradient id="draftSecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F472B6" />
          <Stop offset="100%" stopColor="#DB2777" />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="3" width="14" height="18" rx="3" fill="#FCE7F3" />
      <Path d="M7 7h6M7 11h8M7 15h5" stroke="#DB2777" strokeWidth="1.8" strokeLinecap="round" />
      <Path
        d="M13 18l7-7 2 2-7 7-3 1 1-3z"
        fill="url(#draftSecGrad)"
      />
    </IconBase>
  );
}

// 3.7 KYC TRUST SHIELD (Gold & Blue Solid Shield)
export function KycShield3DIcon({ size = 26, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="50%" stopColor="#1D4ED8" />
          <Stop offset="100%" stopColor="#1E3A8A" />
        </LinearGradient>
        <LinearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      <Path
        d="M16 2.5l11.5 4.5v9c0 7.5-5 13-11.5 14.5C9.5 29 4.5 23.5 4.5 16V7L16 2.5z"
        fill="url(#shieldGrad)"
        stroke="url(#goldRim)"
        strokeWidth="1.8"
      />
      <Path
        d="M16 3.5l10 4v8.5c0 6.5-4.5 11.5-10 13V3.5z"
        fill="#FFFFFF"
        opacity="0.18"
      />
      <Path
        d="M11 16l3.5 3.5 7-7"
        stroke="#FDE047"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

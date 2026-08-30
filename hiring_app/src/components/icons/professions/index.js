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
} from 'react-native-svg';

function IconBase({ size = 24, viewBox = '0 0 32 32', style, children }) {
  return (
    <Svg width={size} height={size} viewBox={viewBox} style={style}>
      {children}
    </Svg>
  );
}

// 1. 3D VISUAL ARTS & DESIGN ICON (Palette & Stylus)
export function VisualArtsProfessionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="palBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7C3AED" />
          <Stop offset="100%" stopColor="#4F46E5" />
        </LinearGradient>
        <LinearGradient id="palGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#A78BFA" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
        </LinearGradient>
        <LinearGradient id="brushMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBBF24" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      {/* Palette Body */}
      <Path
        d="M16 3.5C8.8 3.5 3 9.3 3 16.5c0 7.2 5.8 13 13 13 2.5 0 4.5-2 4.5-4.5 0-1.1-.4-2.1-1.1-2.9-.7-.8-1.1-1.8-1.1-2.9 0-2 1.6-3.6 3.6-3.6h3.6c4.5 0 8.5-4 8.5-8.5C32 8.3 24.5 3.5 16 3.5z"
        fill="url(#palBodyGrad)"
      />
      <Path
        d="M16 4.8C9.5 4.8 4.3 10 4.3 16.5c0 6.5 5.2 11.7 11.7 11.7 1.8 0 3.2-1.4 3.2-3.2 0-.8-.3-1.6-.9-2.2-.8-.9-1.3-2.1-1.3-3.4 0-2.6 2.1-4.7 4.7-4.7h3.6c3.5 0 7.2-3.2 7.2-7.2C30.5 9 23.8 4.8 16 4.8z"
        fill="url(#palGlowGrad)"
      />
      {/* Paint Dabs */}
      <Circle cx="9.5" cy="11.5" r="2.2" fill="#F43F5E" />
      <Circle cx="15.5" cy="8.5" r="2.2" fill="#F59E0B" />
      <Circle cx="21.5" cy="10.5" r="2.2" fill="#10B981" />
      <Circle cx="10" cy="18" r="2.2" fill="#38BDF8" />
      <Circle cx="15" cy="22" r="1.8" fill="#FB7185" />
      {/* Thumb Rest */}
      <Circle cx="23" cy="23" r="2.8" fill="#FFFFFF" opacity="0.3" />
      {/* Stylus / Brush Tip */}
      <Path d="M22 6l5-3 2 2-3 5-4-4z" fill="url(#brushMetal)" />
    </IconBase>
  );
}

// 2. 3D ACTING & THEATRE ICON (Polished Theatrical Drama Masks & Clapper Crest)
export function ActingTheatreProfessionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="goldMask" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="50%" stopColor="#D97706" />
          <Stop offset="100%" stopColor="#B45309" />
        </LinearGradient>
        <LinearGradient id="blueMask" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="50%" stopColor="#2563EB" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>
      {/* Background Mask - Tragedy / Blue */}
      <Path
        d="M8.5 6C4.4 6 1 9.6 1 14.5c0 5 3.4 9 7.5 9 1 0 2-.2 2.8-.7-.6-1.5-.9-3.2-.9-5.1 0-4.3 1.8-8.1 4.7-10.2C13.2 6.5 11 6 8.5 6z"
        fill="url(#blueMask)"
      />
      {/* Blue Mask Eyes & Mouth */}
      <Path d="M4.5 11.5a1.8 1.8 0 0 1 3 0M9.5 11.5a1.8 1.8 0 0 1 1.5 0" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M5.5 18a3 3 0 0 1 4.5 0" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" fill="none" />

      {/* Foreground Mask - Golden Comedy */}
      <Path
        d="M20 9c-5 0-9.2 4-9.2 9.5s4.2 9.5 9.2 9.5 9.2-4 9.2-9.5S25 9 20 9z"
        fill="url(#goldMask)"
      />
      {/* Crown / Brow Ridge */}
      <Path d="M14 13.5c1.8-1 4.2-1 6 0M20 13.5c1.8-1 4.2-1 6 0" stroke="#FEF3C7" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes Cutouts */}
      <Path d="M15 16l3-1M22 15l3 1" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      {/* Smiling Mouth */}
      <Path d="M16 22.5c2.2 2.5 5.8 2.5 8 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Star Highlight */}
      <Circle cx="25.5" cy="11.5" r="1.5" fill="#FEF08A" />
    </IconBase>
  );
}

// 3. 3D MUSIC & SOUND ICON (Vinyl Disc & Audio Equalizer)
export function MusicSoundProfessionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="soundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EC4899" />
          <Stop offset="100%" stopColor="#9333EA" />
        </LinearGradient>
        <LinearGradient id="centerVinyl" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="13.5" fill="url(#soundGrad)" />
      <Circle cx="16" cy="16" r="10" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="4,2" fill="none" opacity="0.4" />
      <Circle cx="16" cy="16" r="7" stroke="#FFFFFF" strokeWidth="0.8" fill="none" opacity="0.5" />
      <Circle cx="16" cy="16" r="4.5" fill="url(#centerVinyl)" />
      <Circle cx="16" cy="16" r="1.5" fill="#FFFFFF" />
      {/* Note Badge */}
      <Path d="M22 5v7l4-2V6l-4-1z" fill="#FEF08A" />
    </IconBase>
  );
}

// 4. 3D DANCE & CHOREOGRAPHY ICON (Motion Ribbon)
export function DanceProfessionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="danceBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FB7185" />
          <Stop offset="100%" stopColor="#E11D48" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="6" r="3.2" fill="url(#danceBody)" />
      <Path
        d="M16 10c-2.2 3.5-5.5 5.5-10 6.5 3.5 1.5 6.5 2 10 1v11h2V17.5c3.5.8 6.5.3 10-1-4.5-1-7.8-3-10-6.5v-1z"
        fill="url(#danceBody)"
      />
      <Circle cx="6" cy="9" r="1.5" fill="#FDA4AF" />
      <Circle cx="26" cy="9" r="1.5" fill="#FDA4AF" />
    </IconBase>
  );
}

// 5. 3D CINEMA, DIRECTION & DOP ICON (Clapperboard & Cine Lens)
export function CinemaDOPProfessionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="cineBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0284C7" />
          <Stop offset="100%" stopColor="#0369A1" />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="11" width="24" height="17" rx="4" fill="url(#cineBody)" />
      <Path d="M4 11l24-4v4L4 15v-4z" fill="#0C4A6E" />
      <Path d="M8 8l3 3M15 7l3 3M22 6l3 3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="16" cy="19.5" r="4.5" fill="#FFFFFF" />
      <Path d="M16 16.8l1 2.2 2.4.3-1.7 1.6.4 2.4L16 22l-2.1 1.3.4-2.4-1.7-1.6 2.4-.3L16 16.8z" fill="#0284C7" />
    </IconBase>
  );
}

// 6. 3D FASHION & STYLING ICON (Diamond Sheen)
export function FashionStylingProfessionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="fashBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
      </Defs>
      <Path d="M16 4L6 14l10 14 10-14L16 4z" fill="url(#fashBody)" />
      <Path
        d="M6 14h20M11 4l5 10 5-10M16 14v14"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </IconBase>
  );
}

// 7. 3D BROADCASTING & MEDIA ICON (Studio Microphone)
export function BroadcastingMediaProfessionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="micBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>
      <Rect x="11" y="4" width="10" height="15" rx="5" fill="url(#micBody)" />
      <Path d="M11 11h10M16 4v15" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
      <Path
        d="M7 13c0 5 4 9 9 9s9-4 9-9"
        stroke="#D97706"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M16 22v6M11 28h10" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
    </IconBase>
  );
}

// 8. 3D WRITING & LITERATURE ICON (Feather Quill)
export function WritingLiteratureProfessionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="quillBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6366F1" />
          <Stop offset="100%" stopColor="#4338CA" />
        </LinearGradient>
      </Defs>
      <Path
        d="M26 4c-6 3-10 8-12 13-1 2.5-1.5 5.5-2 8.5l3.5-1c3-.5 6-1 8.5-2C29 20 31 13 31 7l-5-3z"
        fill="url(#quillBody)"
      />
      <Path d="M26 4L12 25.5" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M5 21h8l-3 6H4c-1 0-2-.8-2-1.8 0-2.3 1.3-4.2 3-4.2z" fill="#C7D2FE" />
    </IconBase>
  );
}

// 9. GENERAL / OTHER PROFESSION ICON
export function GeneralProfessionIcon({ size = 24, ...props }) {
  return (
    <IconBase size={size} viewBox="0 0 32 32" {...props}>
      <Defs>
        <LinearGradient id="starBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="4" width="24" height="24" rx="6" fill="url(#starBody)" />
      <Path
        d="M16 9l2.2 4.8 5.3.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.3-.8L16 9z"
        fill="#FFFFFF"
      />
    </IconBase>
  );
}

// DYNAMIC PROFESSION ICON RESOLVER
export function ProfessionCategoryIcon({ categoryName = '', size = 24, style, ...props }) {
  const norm = String(categoryName).toLowerCase().trim();

  // Visual Arts & Design
  if (
    norm.includes('cartoon') ||
    norm.includes('animat') ||
    norm.includes('craft') ||
    norm.includes('paint') ||
    norm.includes('sculpt') ||
    norm.includes('sand') ||
    norm.includes('paper') ||
    norm.includes('graff') ||
    norm.includes('micro') ||
    norm.includes('portrait') ||
    norm.includes('sketch') ||
    norm.includes('illustrat') ||
    norm.includes('visual') ||
    norm.includes('graphic')
  ) {
    return <VisualArtsProfessionIcon size={size} style={style} {...props} />;
  }

  // Acting & Theatre
  if (
    norm.includes('actor') ||
    norm.includes('theatre') ||
    norm.includes('mime') ||
    norm.includes('child artist') ||
    norm.includes('comedian') ||
    norm.includes('stunt') ||
    norm.includes('fight') ||
    norm.includes('magic') ||
    norm.includes('drama') ||
    norm.includes('acting')
  ) {
    return <ActingTheatreProfessionIcon size={size} style={style} {...props} />;
  }

  // Music & Sound
  if (
    norm.includes('sing') ||
    norm.includes('beatbox') ||
    norm.includes('dj') ||
    norm.includes('rap') ||
    norm.includes('music') ||
    norm.includes('sound') ||
    norm.includes('band') ||
    norm.includes('audio') ||
    norm.includes('instrument')
  ) {
    return <MusicSoundProfessionIcon size={size} style={style} {...props} />;
  }

  // Dance & Choreography
  if (norm.includes('danc') || norm.includes('choreo') || norm.includes('group perform') || norm.includes('ballet') || norm.includes('hiphop')) {
    return <DanceProfessionIcon size={size} style={style} {...props} />;
  }

  // Cinema, Direction & DOP
  if (
    norm.includes('director') ||
    norm.includes('cinematograph') ||
    norm.includes('camera') ||
    norm.includes('dop') ||
    norm.includes('vfx') ||
    norm.includes('edit') ||
    norm.includes('art director') ||
    norm.includes('publicity') ||
    norm.includes('set design') ||
    norm.includes('film') ||
    norm.includes('movie') ||
    norm.includes('producer') ||
    norm.includes('production') ||
    norm.includes('advertis')
  ) {
    return <CinemaDOPProfessionIcon size={size} style={style} {...props} />;
  }

  // Fashion & Styling
  if (
    norm.includes('model') ||
    norm.includes('fashion') ||
    norm.includes('costume') ||
    norm.includes('stylist') ||
    norm.includes('makeup') ||
    norm.includes('tattoo') ||
    norm.includes('beauty') ||
    norm.includes('wardrobe') ||
    norm.includes('hair')
  ) {
    return <FashionStylingProfessionIcon size={size} style={style} {...props} />;
  }

  // Broadcasting & Media
  if (
    norm.includes('host') ||
    norm.includes('anchor') ||
    norm.includes('emcee') ||
    norm.includes('vj') ||
    norm.includes('rj') ||
    norm.includes('voice') ||
    norm.includes('news') ||
    norm.includes('vlog') ||
    norm.includes('radio') ||
    norm.includes('podcast') ||
    norm.includes('presenter')
  ) {
    return <BroadcastingMediaProfessionIcon size={size} style={style} {...props} />;
  }

  // Writing & Literature
  if (
    norm.includes('writ') ||
    norm.includes('poet') ||
    norm.includes('lyric') ||
    norm.includes('script') ||
    norm.includes('author') ||
    norm.includes('screenplay') ||
    norm.includes('dialogue')
  ) {
    return <WritingLiteratureProfessionIcon size={size} style={style} {...props} />;
  }

  // Default fallback
  return <GeneralProfessionIcon size={size} style={style} {...props} />;
}

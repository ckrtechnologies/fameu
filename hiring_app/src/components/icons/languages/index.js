import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

// Reusable Base Badge Container
function LanguageBadge({ 
  gradientId, 
  startColor, 
  endColor, 
  char, 
  size = 28, 
  textColor = '#FFFFFF',
}) {
  const badgeSize = size;
  const fontSize = char.length > 2 ? badgeSize * 0.34 : char.length === 2 ? badgeSize * 0.42 : badgeSize * 0.52;

  return (
    <View style={{ width: badgeSize, height: badgeSize, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={badgeSize} height={badgeSize} viewBox="0 0 32 32" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
        </Defs>
        <Rect x="1.5" y="1.5" width="29" height="29" rx="8.5" fill={`url(#${gradientId})`} />
        {/* Subtle top-left gloss curve */}
        <Path
          d="M3 10C3 5.5 5.5 3 10 3h12c-4 0-14 3-17 12V10z"
          fill="#FFFFFF"
          opacity={0.25}
        />
        {/* Inner subtle glow ring */}
        <Rect
          x="2.5"
          y="2.5"
          width="27"
          height="27"
          rx="7.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          opacity={0.35}
        />
      </Svg>
      <Text
        style={{
          color: textColor,
          fontSize: fontSize,
          fontWeight: '800',
          textAlign: 'center',
          includeFontPadding: false,
        }}
      >
        {char}
      </Text>
    </View>
  );
}

// 1. Hindi (Devanagari "अ" - Saffron / Gold)
export function HindiLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="hindiGrad"
      startColor="#FF8C00"
      endColor="#E53935"
      char="अ"
      size={size}
    />
  );
}

// 2. English (Latin "Aa" - Royal Blue / Purple)
export function EnglishLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="engGrad"
      startColor="#3B82F6"
      endColor="#1D4ED8"
      char="Aa"
      size={size}
    />
  );
}

// 3. Marathi (Devanagari "म" - Deep Saffron / Crimson)
export function MarathiLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="marathiGrad"
      startColor="#F59E0B"
      endColor="#DC2626"
      char="म"
      size={size}
    />
  );
}

// 4. Bengali (Bengali "অ" - Emerald Green / Gold)
export function BengaliLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="bengaliGrad"
      startColor="#10B981"
      endColor="#047857"
      char="অ"
      size={size}
    />
  );
}

// 5. Telugu (Telugu "తె" - Amethyst Purple & Violet)
export function TeluguLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="teluguGrad"
      startColor="#8B5CF6"
      endColor="#6D28D9"
      char="తె"
      size={size}
    />
  );
}

// 6. Tamil (Tamil "அ" - Ruby Red & Bright Yellow)
export function TamilLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="tamilGrad"
      startColor="#EF4444"
      endColor="#B91C1C"
      char="அ"
      size={size}
    />
  );
}

// 7. Kannada (Kannada "ಕ" - Amber Gold & Vermillion)
export function KannadaLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="kannadaGrad"
      startColor="#FBBF24"
      endColor="#D97706"
      char="ಕ"
      size={size}
    />
  );
}

// 8. Malayalam (Malayalam "മ" - Lush Teal & Cyan)
export function MalayalamLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="malayalamGrad"
      startColor="#06B6D4"
      endColor="#0891B2"
      char="മ"
      size={size}
    />
  );
}

// 9. Gujarati (Gujarati "અ" - Coral & Rose Pink)
export function GujaratiLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="gujaratiGrad"
      startColor="#FB7185"
      endColor="#E11D48"
      char="અ"
      size={size}
    />
  );
}

// 10. Punjabi (Gurmukhi "ਸ" - Electric Indigo & Blue)
export function PunjabiLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="punjabiGrad"
      startColor="#6366F1"
      endColor="#4338CA"
      char="ਸ"
      size={size}
    />
  );
}

// 11. Urdu (Nastaliq "اردو" - Islamic Deep Green & Gold)
export function UrduLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="urduGrad"
      startColor="#059669"
      endColor="#064E3B"
      char="اردو"
      size={size}
    />
  );
}

// 12. Bhojpuri (Bhojpuri "भ" - Terracotta Sun)
export function BhojpuriLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="bhojpuriGrad"
      startColor="#EA580C"
      endColor="#C2410C"
      char="भ"
      size={size}
    />
  );
}

// 13. Other / Multilingual (Translate "文/A" Badge - Indigo Cyan)
export function OtherLanguageIcon({ size = 28 }) {
  return (
    <LanguageBadge
      gradientId="otherLangGrad"
      startColor="#8B5CF6"
      endColor="#06B6D4"
      char="文A"
      size={size}
    />
  );
}

export default {
  HindiLanguageIcon,
  EnglishLanguageIcon,
  MarathiLanguageIcon,
  BengaliLanguageIcon,
  TeluguLanguageIcon,
  TamilLanguageIcon,
  KannadaLanguageIcon,
  MalayalamLanguageIcon,
  GujaratiLanguageIcon,
  PunjabiLanguageIcon,
  UrduLanguageIcon,
  BhojpuriLanguageIcon,
  OtherLanguageIcon,
};

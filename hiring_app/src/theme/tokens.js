/**
 * FAMEU Design Tokens — Hiring App
 * Single source of truth mirroring docs/DESIGN.md v1.1 §1 & docs/fameu-figma-tokens.json
 * 
 * Rules:
 * - Semantic tokens only — components reference these names, never raw hex.
 * - Body text never below 13.
 * - No arbitrary spacing values (4, 8, 12, 16, 20, 24, 32, 48, 64).
 * - One radius per component type (sm=inputs/chips, md=cards/buttons, lg=sheets/modals, full=pills/avatars).
 */

export const colors = {
  light: {
    primary: '#C8952B',
    primaryPressed: '#A97C1F',
    secondary: '#1A1C23',
    background: '#F8F6F1',
    surface: '#FFFFFF',
    surfaceAlt: '#EAE6DC',
    textPrimary: '#1A1C1F',
    textSecondary: '#6B7280',
    textDisabled: '#A6A9AE',
    textOnPrimary: '#1A1200',
    border: '#E8E4DA',
    success: '#2E7D46',
    successBg: '#E4F3E8',
    warning: '#B8860B',
    warningBg: '#FBF1D6',
    error: '#C43D3D',
    errorBg: '#FBE4E4',
    info: '#C8952B',
    infoBg: '#FBF1D6',
    overlay: 'rgba(0,0,0,0.5)',
    // Header & Bottom Tab Bar (Deep Obsidian & Spotlight Gold)
    headerBackground: '#131418',
    headerText: '#FFFFFF',
    headerSubtitle: '#9CA3AF',
    headerIcon: '#FFFFFF',
    headerBorder: '#22242B',
    headerAccent: '#E3B04B',
    tabBarBackground: '#131418',
    tabBarBorder: '#22242B',
    tabBarActive: '#E3B04B',
    tabBarInactive: '#8A8F9E',
  },
  dark: {
    primary: '#E3B04B',
    primaryPressed: '#C8952B',
    secondary: '#2C2F38',
    background: '#0E0F12',
    surface: '#17191F',
    surfaceAlt: '#1F222A',
    textPrimary: '#F4F2EE',
    textSecondary: '#A6ABB3',
    textDisabled: '#5A5E66',
    textOnPrimary: '#1A1200',
    border: '#2C2F38',
    success: '#4CAF6E',
    successBg: '#17281C',
    warning: '#E3B04B',
    warningBg: '#2A2413',
    error: '#E76A6A',
    errorBg: '#2A1717',
    info: '#E3B04B',
    infoBg: '#2A2413',
    overlay: 'rgba(0,0,0,0.7)',
    // Header & Bottom Tab Bar (Deep Obsidian & Spotlight Gold)
    headerBackground: '#131418',
    headerText: '#FFFFFF',
    headerSubtitle: '#9CA3AF',
    headerIcon: '#FFFFFF',
    headerBorder: '#22242B',
    headerAccent: '#E3B04B',
    tabBarBackground: '#131418',
    tabBarBorder: '#22242B',
    tabBarActive: '#E3B04B',
    tabBarInactive: '#8A8F9E',
  },
};

export const typography = {
  fontFamily: 'Inter',
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
  },
  h1: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '600',
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
  },
  h3: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  caption: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  overline: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
  // Convenience aliases for existing components
  s: 8,
  m: 12,
  l: 16,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
};

export const elevation = {
  level0: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  level1: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  level2: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
};

export const motion = {
  durationFast: 150,
  durationBase: 250,
  durationSlow: 400,
  easingStandard: [0.2, 0, 0, 1],
  easingExit: [0.4, 0, 1, 1],
};

export const iconography = {
  sizes: {
    inline: 16,
    list: 20,
    default: 24,
    feature: 28,
  },
};

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  elevation,
  motion,
  iconography,
};

export default tokens;

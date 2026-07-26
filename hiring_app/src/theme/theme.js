import { lightColors } from './colors.light';
import { darkColors } from './colors.dark';

export const colors = lightColors; // Default export for backwards compatibility
export { lightColors, darkColors };

export const typography = {
  fontFamily: 'Comic Sans MS', // Strict Requirement
  h1: {
    fontSize: 28,
    fontWeight: '700',
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
  },
  h3: {
    fontSize: 18,
    fontWeight: '500',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 12, // Compact
  l: 16, // Compact
  xl: 24,
  xxl: 32,
};

export const cardDimensions = {
  compact: {
    height: 120,
    width: 200, // For horizontal scrolls
    thumbnailSize: 50,
  },
  standard: {
    height: 140,
    width: 260, // For horizontal scrolls
    thumbnailSize: 60,
  },
  large: {
    height: 200,
    thumbnailSize: 80,
  }
};

export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.textMainDark,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    fontFamily: typography.fontFamily,
  },
};

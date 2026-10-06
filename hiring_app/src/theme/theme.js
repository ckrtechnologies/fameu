import { lightColors } from './colors.light';
import { darkColors } from './colors.dark';
import tokens, { 
  typography as tokenTypography, 
  spacing as tokenSpacing, 
  radius as tokenRadius, 
  elevation as tokenElevation, 
  motion as tokenMotion, 
  iconography as tokenIconography 
} from './tokens';

export const colors = lightColors; // Default export for backwards compatibility
export { lightColors, darkColors, tokens };

export const typography = {
  ...tokenTypography,
  // Backwards compatibility for existing screens
  h1: tokenTypography.h1,
  h2: tokenTypography.h2,
  h3: tokenTypography.h3,
  h4: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: tokenTypography.body,
  body2: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  caption: tokenTypography.caption,
};

export const spacing = tokenSpacing;
export const radius = tokenRadius;
export const elevation = tokenElevation;
export const shadows = tokenElevation; // Alias for AuditionCard
export const motion = tokenMotion;
export const iconography = tokenIconography;

export const cardDimensions = {
  compact: {
    height: 120,
    width: 200,
    thumbnailSize: 50,
  },
  standard: {
    height: 140,
    width: 260,
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


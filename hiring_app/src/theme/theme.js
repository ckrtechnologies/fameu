export const colors = {
  // Brand
  primary: '#007AFF', // Vibrant Blue
  secondary: '#1E3A8A',
  accent: '#007AFF',
  white: '#FFFFFF',
  
  // Backgrounds
  background: '#FFFFFF', // Crisp White
  backgroundDark: '#F8FAFC', 
  backgroundLight: '#FFFFFF',
  surface: '#F1F5F9', 
  surfaceLight: '#F1F5F9',
  card: '#FFFFFF',
  
  // Typography
  textMain: '#1E293B', // Slate dark text for light mode
  textMuted: '#64748B', 
  textMainDark: '#FFFFFF', // For text on blue buttons
  textMutedDark: '#94A3B8',
  textMainLight: '#1E293B',
  textMutedLight: '#64748B',
  
  // Status
  success: '#10B981',
  danger: '#EF4444',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Borders
  borderLight: '#E2E8F0',
  borderDark: '#CBD5E1', 
};

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

export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
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

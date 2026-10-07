import { lightColors } from './colors.light';

export const darkColors = {
  ...lightColors,
  
  // Brand
  primary: '#E3B04B', // Spotlight Gold
  secondary: '#2C2F38',
  accent: '#E3B04B',

  // Backgrounds
  background: '#0E0F12', // Deep Obsidian theatre background
  backgroundLight: '#0E0F12',
  backgroundDark: '#08090B',
  
  surface: '#17191F', // Elevated dark surface
  surfaceLight: '#17191F',
  surfaceDark: '#1F222A',
  card: '#17191F',
  
  // Typography
  textMain: '#F4F2EE',
  textMainLight: '#F4F2EE',
  textMuted: '#A6ABB3',
  textMutedLight: '#A6ABB3',
  
  // Status
  success: '#4CAF6E',
  warning: '#E3B04B',
  danger: '#E76A6A',
  error: '#E76A6A',

  // Borders
  borderLight: '#2C2F38',
  borderDark: '#383C47',
  border: '#2C2F38',

  // Aliases for missing colors
  textDark: '#F4F2EE',
  textSecondaryLight: '#A6ABB3',
  text: '#F4F2EE',

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
};

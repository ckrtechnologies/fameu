import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as staticColors } from './theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_mode');
        if (storedTheme === 'dark') {
          setIsDarkMode(true);
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('@theme_mode', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  // Basic dark mode palette mapping
  const darkColors = {
    ...staticColors,
    background: '#121212',
    backgroundLight: '#121212',
    backgroundDark: '#000000',
    surface: '#1E1E1E',
    surfaceLight: '#1E1E1E',
    surfaceDark: '#2C2C2C',
    card: '#1E1E1E',
    textMain: '#FFFFFF',
    textMainLight: '#FFFFFF',
    textMuted: '#A0A0A0',
    textMutedLight: '#A0A0A0',
    borderLight: '#333333',
    borderDark: '#444444',
  };

  const colors = isDarkMode ? darkColors : staticColors;

  return (
    <ThemeContext.Provider value={{ colors, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

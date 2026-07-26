import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isManualOverride, setIsManualOverride] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_mode');
        if (storedTheme) {
          setIsDarkMode(storedTheme === 'dark');
          setIsManualOverride(true);
        } else {
          setIsDarkMode(true);
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  // Update theme if system changes, but ONLY if there's no manual override
  useEffect(() => {
    // We default to dark theme. If we wanted to follow system:
    // if (!isManualOverride) setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme, isManualOverride]);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      setIsManualOverride(true);
      await AsyncStorage.setItem('@theme_mode', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { colors: lightColors, isDarkMode: false, toggleTheme: () => {} };
  }
  return context;
};


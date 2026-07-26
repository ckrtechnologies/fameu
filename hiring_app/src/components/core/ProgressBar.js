import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';

const ProgressBar = ({ progress = 0, height = 12 }) => {
  const { colors } = useTheme();
  
  // Ensure progress stays between 0 and 100
  const validProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <View style={styles.container}>
      <View style={[styles.barBackground, { height, backgroundColor: colors.surfaceDark }]}>
        <View style={[styles.fill, { width: `${validProgress}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text style={[styles.text, { color: colors.textMuted }]}>{validProgress}% Uploaded</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  barBackground: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  text: {
    ...typography.caption,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ProgressBar;

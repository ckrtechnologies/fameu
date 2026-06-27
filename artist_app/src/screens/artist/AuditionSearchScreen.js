import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme/theme';

export default function AuditionSearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AuditionSearchScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  text: {
    ...typography.h2,
    color: colors.textMainLight,
  }
});

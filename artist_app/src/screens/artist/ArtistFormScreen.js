import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme/theme';

export default function ArtistFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ArtistFormScreen</Text>
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

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme/theme';

export default function DeleteAccountScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <Text style={styles.text}>DeleteAccountScreen</Text>
    </SafeAreaView>
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

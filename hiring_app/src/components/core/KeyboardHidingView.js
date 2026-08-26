import React from 'react';
import { View, Keyboard, StyleSheet, Platform } from 'react-native';

/**
 * A global wrapper view that dismisses the keyboard when tapping anywhere outside of an active input.
 * It uses the gesture responder system to catch unhandled taps (like tapping the background)
 * without interfering with buttons, inputs, or scroll views.
 */
export default function KeyboardHidingView({ children, style = undefined }) {
  return (
    <View 
      style={[styles.container, style]} 
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return false; // Return false to let the tap pass through if needed
      }}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

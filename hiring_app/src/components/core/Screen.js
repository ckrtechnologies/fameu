import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
;

const Screen = ({ children, style, barStyle = 'light-content', backgroundColor }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor || colors.backgroundDark }]}>
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
      <View style={[styles.inner, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Pure white
  },
  inner: {
    flex: 1,
  }
});

export default Screen;

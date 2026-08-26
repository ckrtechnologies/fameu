import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing, globalStyles } from '../../theme/theme';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';

export default function WalkInListingsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation();

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['left', 'right']}>
      <ShrinkableHeader 
        title="Walk-in Listings"
        subtitle="Direct Walk-in Auditions"
        showBack={true}
        onBack={handleGoBack}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
      />

      <ScrollView 
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.emptyText}>No walk-in listings available right now.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
    marginLeft: spacing.s,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMutedLight,
    textAlign: 'center',
  }
});

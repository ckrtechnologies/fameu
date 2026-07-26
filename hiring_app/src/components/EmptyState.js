import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from './forms/CustomButton';
import { typography, spacing } from '../theme/theme';
import { useTheme } from '../theme/ThemeProvider';

const EmptyState = ({
  title = 'No results found',
  message,
  iconName = 'emoticon-sad-outline',
  actionTitle,
  onAction,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.container}>
      <Icon name={iconName} size={64} color={colors.textMutedLight} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionTitle && onAction && (
        <CustomButton
          title={actionTitle}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.m,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textMainLight,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fontFamily,
    fontSize: typography.body.fontSize,
    color: colors.textMutedLight,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  button: {
    marginTop: spacing.m,
    minWidth: 150,
  },
});

export default EmptyState;

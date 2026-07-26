import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { showError, showSuccess } from '../../utils/toast';
import { typography, spacing, globalStyles } from '../../theme/theme';
import { useChangePasswordMutation } from '../../services/authApi';
import { useTheme } from '../../theme/ThemeProvider';
import CustomButton from '../../components/forms/CustomButton';

export default function ChangePasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleUpdate = async () => {
    if (!password || !confirmPassword) {
      showError('', 'Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      showError('', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showError('', 'Password must be at least 6 characters.');
      return;
    }

    try {
      await changePassword({ password }).unwrap();
      showSuccess('', 'Password updated successfully');
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (err) {
      showError('', err?.data?.error || 'Failed to update password');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>New Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor={colors.textMutedLight}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm New Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter new password"
            placeholderTextColor={colors.textMutedLight}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <CustomButton
          title="Update Password"
          onPress={handleUpdate}
          isLoading={isLoading}
          style={{ marginTop: spacing.l }}
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  backButton: {
    padding: spacing.s,
    marginRight: spacing.s,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textMainLight,
  },
  content: {
    padding: spacing.xl,
  },
  formGroup: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.body2,
    color: colors.textSecondaryLight,
    marginBottom: spacing.s,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    color: colors.textMainLight,
    ...typography.body,
  }
});

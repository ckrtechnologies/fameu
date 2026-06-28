import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { logout } from '../../store/slices/authSlice';
import { apiSlice } from '../../services/apiSlice';
import { useDeleteAccountMutation } from '../../services/authApi';
import { colors, typography, spacing } from '../../theme/theme';

export default function ArtistSettingsScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            dispatch(apiSlice.util.resetApiState());
            dispatch(logout());
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount().unwrap();
              dispatch(apiSlice.util.resetApiState());
              dispatch(logout());
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again later.');
              console.error('Delete account error:', error);
            }
          }
        },
      ]
    );
  };

  const renderSettingItem = (icon, title, onPress, isDestructive = false) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={isDestructive ? colors.danger : colors.primary} />
        <Text style={[styles.settingText, isDestructive && { color: colors.danger }]}>{title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textMutedLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.textMainLight} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={[styles.settingItem, { paddingVertical: 12 }]}>
            <View style={styles.settingLeft}>
              <Icon name="call-outline" size={24} color={colors.primary} />
              <View>
                <Text style={styles.settingText}>Phone Number</Text>
                <Text style={{ ...typography.caption, color: colors.textMutedLight, marginLeft: 12 }}>
                  {user?.mobile || user?.phone || user?.email || 'Not provided'}
                </Text>
              </View>
            </View>
          </View>
          {renderSettingItem('person-outline', 'Edit Profile', () => navigation.navigate('EditProfile'))}
          {renderSettingItem('notifications-outline', 'Notifications', () => {})}
          {renderSettingItem('shield-checkmark-outline', 'Verification', () => navigation.navigate('Verification'))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & About</Text>
          {renderSettingItem('help-circle-outline', 'Help Center', () => {})}
          {renderSettingItem('document-text-outline', 'Terms of Service', () => {})}
          {renderSettingItem('information-circle-outline', 'Privacy Policy', () => {})}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          {renderSettingItem('log-out-outline', 'Log Out', handleLogout, true)}
          <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount} disabled={isDeleting}>
            <View style={styles.settingLeft}>
              <Icon name="trash-outline" size={24} color={colors.danger} />
              <Text style={[styles.settingText, { color: colors.danger }]}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textMutedLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceDark,
  },
  title: {
    ...typography.h2,
    color: colors.textMainLight,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textMutedLight,
    marginBottom: spacing.m,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceDark,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    ...typography.body,
    color: colors.textMainLight,
    marginLeft: spacing.m,
  },
});

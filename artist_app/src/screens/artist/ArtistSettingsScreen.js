import { GlobalAlert } from '../../components/core/GlobalAlert';
import { showError, showSuccess } from '../../utils/toast';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { logout } from '../../store/slices/authSlice';
import { apiSlice } from '../../services/apiSlice';
import { useDeleteAccountMutation } from '../../services/authApi';
import { typography, spacing } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeProvider';
import ShrinkableHeader from '../../components/core/ShrinkableHeader';
import useShrinkableHeader from '../../hooks/useShrinkableHeader';

export default function ArtistSettingsScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const {
    scrollY,
    onScroll,
    headerPaddingVertical,
    headerTitleSize,
    subtitleHeight,
    subtitleOpacity,
    headerElevation,
  } = useShrinkableHeader();

  const handleLogout = () => {
    GlobalAlert.show(
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
    GlobalAlert.show(
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
              showError('', 'Failed to delete account. Please try again later.');
              console.error('Delete account error:', error);
            }
          }
        },
      ]
    );
  };

  const renderSettingItem = (icon, title, onPress, isDestructive = false) => (
    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.surfaceDark }]} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={isDestructive ? colors.danger : colors.primary} />
        <Text style={[styles.settingText, { color: colors.textMainLight }, isDestructive && { color: colors.danger }]}>{title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textMutedLight} />
    </TouchableOpacity>
  );

  const handleRateApp = () => {
    // Placeholder store IDs
    const GOOGLE_PACKAGE_NAME = 'com.fameu.artistapp';
    const APPLE_STORE_ID = 'id1234567890';
    
    if (Platform.OS === 'android') {
      Linking.openURL(`market://details?id=${GOOGLE_PACKAGE_NAME}`).catch(() => {
        Linking.openURL(`https://play.google.com/store/apps/details?id=${GOOGLE_PACKAGE_NAME}`);
      });
    } else {
      Linking.openURL(`itms-apps://itunes.apple.com/app/viewContentsUserReviews?id=${APPLE_STORE_ID}&action=write-review`).catch(() => {
        Linking.openURL(`https://apps.apple.com/app/${APPLE_STORE_ID}`);
      });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundLight }]} edges={['left', 'right']}>
      <ShrinkableHeader 
        title="Settings"
        subtitle="Preferences & Account"
        showBack={true}
        onBack={() => navigation.goBack()}
        headerPaddingVertical={headerPaddingVertical}
        headerTitleSize={headerTitleSize}
        subtitleHeight={subtitleHeight}
        subtitleOpacity={subtitleOpacity}
        headerElevation={headerElevation}
      />

      <ScrollView 
        style={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMutedLight }]}>Account</Text>
          <View style={[styles.settingItem, { paddingVertical: 12, borderBottomColor: colors.surfaceDark }]}>
            <View style={styles.settingLeft}>
              <Icon name="mail-outline" size={24} color={colors.primary} />
              <View>
                <Text style={[styles.settingText, { color: colors.textMainLight }]}>Email Address</Text>
                <Text style={{ ...typography.caption, color: colors.textMutedLight, marginLeft: 12 }}>
                  {user?.email || user?.mobile || user?.phone || 'Not provided'}
                </Text>
              </View>
            </View>
          </View>
          {renderSettingItem('person-outline', 'Edit Profile', () => navigation.navigate('EditProfile'))}
          {renderSettingItem('notifications-outline', 'Notifications', () => {})}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMutedLight }]}>Support & About</Text>
          {renderSettingItem('play-circle-outline', 'How this app works', () => navigation.navigate('Tutorial'))}
          {renderSettingItem('chatbubble-ellipses-outline', 'Contact Us', () => navigation.navigate('ContactUs'))}
          {renderSettingItem('star-outline', 'Rate our App', handleRateApp)}
          {renderSettingItem('document-text-outline', 'Terms of Service', () => navigation.navigate('Legal', { type: 'terms' }))}
          {renderSettingItem('information-circle-outline', 'Privacy Policy', () => navigation.navigate('Legal', { type: 'privacy' }))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMutedLight }]}>Appearance</Text>
          <View style={[styles.settingItem, { borderBottomColor: colors.surfaceDark }]}>
            <View style={styles.settingLeft}>
              <Icon name={isDarkMode ? "moon-outline" : "sunny-outline"} size={24} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.textMainLight }]}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDarkMode} 
              onValueChange={toggleTheme}
              trackColor={{ false: colors.borderDark, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMutedLight }]}>Danger Zone</Text>
          {renderSettingItem('log-out-outline', 'Log Out', handleLogout, true)}
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.surfaceDark }]} onPress={handleDeleteAccount} disabled={isDeleting}>
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
  },
  title: {
    ...typography.h2,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.m,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    ...typography.body,
    marginLeft: spacing.m,
  },
});

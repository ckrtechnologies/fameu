import { GlobalAlert } from '../components/core/GlobalAlert';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Switch } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, Users, Building, ShieldCheck, LogOut, Trash2 } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

import TabNavigator from './TabNavigator';
import CompanyKycScreen from '../screens/hiring/CompanyKycScreen';
import FaqScreen from '../screens/hiring/FaqScreen';
import ContactUsScreen from '../screens/hiring/ContactUsScreen';
import LegalScreen from '../screens/hiring/LegalScreen';
import TutorialScreen from '../screens/hiring/TutorialScreen';
import ChangePasswordScreen from '../screens/common/ChangePasswordScreen';

import { typography, spacing } from '../theme/theme';
import { useGetCompanyProfileQuery } from '../services/hiringApi';
import { useDeleteAccountMutation } from '../services/authApi';
import { apiSlice } from '../services/apiSlice';
import { useTheme } from '../theme/ThemeProvider';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);
  const { data: profileResponse } = useGetCompanyProfileQuery(user?.id, {
    skip: !user?.id,
  });

  const profile = profileResponse?.data;
  const verificationStatus = profile?.verification_status || 'pending';

  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const handleLogout = () => {
    GlobalAlert.show('Logout', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: () => {
          dispatch(apiSlice.util.resetApiState());
          dispatch(logout());
        } 
      },
    ]);
  };

  const handleDeleteAccount = () => {
    GlobalAlert.show('Delete Account', 'Are you sure you want to delete your account? All auditions, applicants, and company details will be permanently removed. This action cannot be undone.', [
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
            GlobalAlert.showError('Unable to Delete Account', error, 'Your account could not be removed at this time.');
          }
        } 
      },
    ]);
  };

  const getBadgeConfig = () => {
    switch (verificationStatus) {
      case 'approved':
        return {
          label: 'VERIFIED PARTNER',
          color: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.14)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          icon: 'shield-checkmark',
        };
      case 'rejected':
        return {
          label: 'KYC REJECTED',
          color: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.14)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          icon: 'alert-circle',
        };
      default:
        return {
          label: 'KYC PENDING',
          color: colors.accent || '#E3B04B',
          bgColor: 'rgba(227, 176, 75, 0.14)',
          borderColor: 'rgba(227, 176, 75, 0.3)',
          icon: 'time-outline',
        };
    }
  };

  const badge = getBadgeConfig();

  return (
    <View style={styles.drawerWrapper}>
      {/* Top Safe Area Spacing */}
      <View style={{ height: insets.top, backgroundColor: '#131418' }} />

      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            {profile?.logo_url ? (
              <Image source={{ uri: profile.logo_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {profile?.company_name 
                    ? profile.company_name.charAt(0).toUpperCase() 
                    : (user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'H')}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {profile?.company_name || user?.display_name || 'Hiring Partner'}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email || 'partner@fameu.in'}
          </Text>

          <View style={[styles.badge, { backgroundColor: badge.bgColor, borderColor: badge.borderColor }]}>
            <Icon name={badge.icon} size={12} color={badge.color} style={{ marginRight: 5 }} />
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {/* Section 1: Main Features */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>MAIN NAVIGATION</Text>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('Tabs', { screen: 'Dashboard' }); }}
          >
            <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
              <Home size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Dashboard</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('Search'); }}
          >
            <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
              <Search size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Search Artists & Talent</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('AllApplicants'); }}
          >
            <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
              <Users size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>All Applicants</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('Tabs', { screen: 'Profile' }); }}
          >
            <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
              <Building size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Company Profile</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('CompanyKyc'); }}
          >
            <View style={[styles.iconContainer, { borderColor: badge.borderColor }]}>
              <ShieldCheck size={18} color={badge.color} />
            </View>
            <Text style={styles.menuText}>KYC Verification</Text>
            {verificationStatus !== 'approved' && (
              <View style={[styles.statusDot, { backgroundColor: badge.color }]} />
            )}
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* Section 2: Preferences & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>PREFERENCES & SUPPORT</Text>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('Faq'); }}
          >
            <View style={styles.iconContainer}>
              <Icon name="help-circle-outline" size={18} color="#9CA3AF" />
            </View>
            <Text style={styles.menuText}>Help & FAQ</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('ChangePassword'); }}
          >
            <View style={styles.iconContainer}>
              <Icon name="lock-closed-outline" size={18} color="#9CA3AF" />
            </View>
            <Text style={styles.menuText}>Change Password</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('ContactUs'); }}
          >
            <View style={styles.iconContainer}>
              <Icon name="mail-outline" size={18} color="#9CA3AF" />
            </View>
            <Text style={styles.menuText}>Contact Us</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('Tutorial'); }}
          >
            <View style={styles.iconContainer}>
              <Icon name="play-circle-outline" size={18} color="#9CA3AF" />
            </View>
            <Text style={styles.menuText}>How it Works</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('Legal', { type: 'terms' }); }}
          >
            <View style={styles.iconContainer}>
              <Icon name="document-text-outline" size={18} color="#9CA3AF" />
            </View>
            <Text style={styles.menuText}>Terms & Privacy</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          {/* Dark Mode Switch */}
          <View style={[styles.menuItem, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
                <Icon name={isDarkMode ? "moon" : "sunny"} size={18} color={colors.accent || '#E3B04B'} />
              </View>
              <Text style={styles.menuText}>Dark Theme</Text>
            </View>
            <Switch 
              value={isDarkMode} 
              onValueChange={toggleTheme}
              trackColor={{ false: '#2D313E', true: colors.primary || '#C8952B' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.footerItem} activeOpacity={0.7} onPress={handleLogout}>
          <View style={styles.footerIconContainer}>
            <LogOut size={18} color="#D1D5DB" />
          </View>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.footerItem, { marginTop: 10 }]} 
          activeOpacity={0.7}
          onPress={handleDeleteAccount} 
          disabled={isDeleting}
        >
          <View style={[styles.footerIconContainer, styles.dangerIconContainer]}>
            <Trash2 size={18} color="#EF4444" />
          </View>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Fameu Hiring Partner • v1.0.0</Text>
      </View>
    </View>
  );
}

export default function DrawerNavigator() {
  const { colors } = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#131418',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '700',
        },
        drawerStyle: {
          width: '82%',
          backgroundColor: '#131418',
        },
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
      }}
    >
      <Drawer.Screen name="Tabs" component={TabNavigator} />
      <Drawer.Screen name="CompanyKyc" component={CompanyKycScreen} options={{ headerShown: true, headerTitle: 'KYC Verification' }} />
      <Drawer.Screen name="Faq" component={FaqScreen} />
      <Drawer.Screen name="ContactUs" component={ContactUsScreen} />
      <Drawer.Screen name="Legal" component={LegalScreen} />
      <Drawer.Screen name="Tutorial" component={TutorialScreen} />
      <Drawer.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Drawer.Navigator>
  );
}

const getStyles = (colors) => StyleSheet.create({
  drawerWrapper: {
    flex: 1,
    backgroundColor: '#131418',
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.xl,
    backgroundColor: '#181A22',
    borderBottomWidth: 1,
    borderBottomColor: '#232632',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#E3B04B',
    padding: 2,
    marginBottom: spacing.m,
    shadowColor: '#E3B04B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#232632',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#C8952B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    maxWidth: '95%',
  },
  email: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
    maxWidth: '95%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  section: {
    paddingVertical: spacing.s,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    paddingHorizontal: spacing.l,
    marginTop: spacing.s,
    marginBottom: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: spacing.l,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E212B',
    borderWidth: 1,
    borderColor: '#2A2E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerPrimary: {
    borderColor: 'rgba(227, 176, 75, 0.3)',
    backgroundColor: 'rgba(227, 176, 75, 0.08)',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
  },
  chevron: {
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#222530',
    marginVertical: spacing.s,
    marginHorizontal: spacing.l,
  },
  footer: {
    paddingHorizontal: spacing.l,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222530',
    backgroundColor: '#15171F',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E212B',
    borderWidth: 1,
    borderColor: '#2A2E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 16,
  },
});

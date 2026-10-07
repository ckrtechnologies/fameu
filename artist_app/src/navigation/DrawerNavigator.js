import { GlobalAlert } from '../components/core/GlobalAlert';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Home,
  User, 
  Image as ImageIcon, 
  Video, 
  Bookmark, 
  Search, 
  Bell, 
  PlayCircle, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Trash2,
  Briefcase,
  Compass
} from 'lucide-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import TabNavigator from './TabNavigator';
import { useTheme } from '../theme/ThemeProvider';
import { typography, spacing } from '../theme/theme';
import { logout } from '../store/slices/authSlice';
import { apiSlice } from '../services/apiSlice';
import { useDeleteAccountMutation } from '../services/authApi';
import { useGetProfileQuery } from '../services/profileApi';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const user = useSelector(state => state.auth.user);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const { data: profileResponse } = useGetProfileQuery();
  const profile = profileResponse?.data;
  
  const fullName = profile?.full_name || user?.full_name || 'Artist';
  const username = fullName;
  const avatarUrl = profile?.avatar_url || user?.avatar_url || null;
  const verificationStatus = profile?.verification_status || user?.verification_status || 'pending';

  const handleLogout = () => {
    GlobalAlert.show('Logout', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: () => {
          props.navigation.closeDrawer();
          dispatch(apiSlice.util.resetApiState());
          dispatch(logout());
        } 
      },
    ]);
  };

  const handleNavigation = (screenName, params) => {
    props.navigation.closeDrawer();
    props.navigation.navigate(screenName, params);
  };

  const handleDeleteAccount = () => {
    GlobalAlert.show('Delete Account', 'Are you absolutely sure you want to delete your account? All applications, media, and profile data will be permanently removed. This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteAccount().unwrap();
            props.navigation.closeDrawer();
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
          label: 'VERIFIED ARTIST',
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
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {fullName ? fullName.charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.name} numberOfLines={1}>{username}</Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email || user?.mobile || user?.phone || 'artist@fameu.in'}
          </Text>

          <View style={[styles.badge, { backgroundColor: badge.bgColor, borderColor: badge.borderColor }]}>
            <Icon name={badge.icon} size={12} color={badge.color} style={{ marginRight: 5 }} />
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {/* Section 1: Main Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>MAIN NAVIGATION</Text>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('Tabs', { screen: 'Dashboard' }); }}
          >
            <View style={styles.iconContainer}>
              <Home size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Dashboard</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('Tabs', { screen: 'Auditions' }); }}
          >
            <View style={styles.iconContainer}>
              <Compass size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Auditions Discovery</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('Tabs', { screen: 'Applications' }); }}
          >
            <View style={styles.iconContainer}>
              <Briefcase size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>My Applications</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('EditProfile')}
          >
            <View style={styles.iconContainer}>
              <User size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('PhotoGallery')}
          >
            <View style={styles.iconContainer}>
              <ImageIcon size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Photo Gallery</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('VideoPortfolio')}
          >
            <View style={styles.iconContainer}>
              <Video size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Video Portfolio</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('SavedAuditions')}
          >
            <View style={styles.iconContainer}>
              <Bookmark size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Saved Auditions</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('Search')}
          >
            <View style={styles.iconContainer}>
              <Search size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Search Users</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('Notifications')}
          >
            <View style={styles.iconContainer}>
              <Bell size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* Section 2: Utilities & Help */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>UTILITIES & HELP</Text>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('Tutorial')}
          >
            <View style={styles.iconContainer}>
              <PlayCircle size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>How it Works</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('Faq')}
          >
            <View style={styles.iconContainer}>
              <HelpCircle size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>FAQ</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('Legal', { type: 'terms' })}
          >
            <View style={styles.iconContainer}>
              <FileText size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Terms & Conditions</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('ContactUs')}
          >
            <View style={styles.iconContainer}>
              <MessageSquare size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Contact Us</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => handleNavigation('ArtistSettings')}
          >
            <View style={styles.iconContainer}>
              <Settings size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Settings</Text>
            <Icon name="chevron-forward" size={16} color="#4B5563" style={styles.chevron} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* Section 3: Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>APPEARANCE</Text>
          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Icon name={isDarkMode ? "moon-outline" : "sunny-outline"} size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.menuText}>Dark Theme</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#374151', true: colors.primary || '#E3B04B' }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Section 4: Account Actions */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.menuItem, { paddingHorizontal: 0, paddingVertical: 8 }]} 
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.footerIconContainer}>
              <LogOut size={18} color={colors.accent || '#E3B04B'} />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { paddingHorizontal: 0, paddingVertical: 8 }]} 
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <View style={[styles.footerIconContainer, styles.dangerIconContainer]}>
              <Trash2 size={18} color="#EF4444" />
            </View>
            <Text style={styles.deleteText}>
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Fameu Artist App v1.0.0</Text>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.65)',
        drawerStyle: {
          backgroundColor: '#131418',
          width: '80%',
        },
      }}
    >
      <Drawer.Screen name="Tabs" component={TabNavigator} />
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
    backgroundColor: '#131418',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#181A22',
    borderBottomWidth: 1,
    borderBottomColor: '#252834',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#E3B04B',
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#262936',
    borderWidth: 2,
    borderColor: '#E3B04B',
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
    textAlign: 'center',
  },
  email: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
    maxWidth: '95%',
    textAlign: 'center',
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
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    paddingHorizontal: spacing.l,
    marginTop: spacing.s,
    marginBottom: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.l,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(227, 176, 75, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(227, 176, 75, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  chevron: {
    marginLeft: 8,
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
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#222530',
    backgroundColor: '#15171F',
  },
  footerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(227, 176, 75, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(227, 176, 75, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 16,
  },
});

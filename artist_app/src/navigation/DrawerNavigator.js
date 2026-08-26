import { GlobalAlert } from '../components/core/GlobalAlert';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
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
  Trash2 
} from 'lucide-react-native';
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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const { data: profileResponse } = useGetProfileQuery();
  const profile = profileResponse?.data;
  
  const fullName = profile?.full_name || user?.full_name || 'Artist';
  const username = fullName;
  const avatarUrl = profile?.avatar_url || user?.avatar_url || null;

  const handleLogout = () => {
    props.navigation.closeDrawer();
    dispatch(apiSlice.util.resetApiState());
    dispatch(logout());
  };

  const handleNavigation = (screenName, params) => {
    props.navigation.closeDrawer();
    props.navigation.navigate(screenName, params);
  };

  const handleDeleteAccount = () => {
    GlobalAlert.show(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action cannot be undone.',
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
              GlobalAlert.show('Error', 'Failed to delete account. Please try again later.');
            }
          }
        },
      ]
    );
  };

  const menuItems = [
    { title: 'Edit Profile', icon: User, screen: 'EditProfile', color: colors.primary },
    { title: 'Photo Gallery', icon: ImageIcon, screen: 'PhotoGallery', color: '#10B981' },
    { title: 'Video Portfolio', icon: Video, screen: 'VideoPortfolio', color: '#F59E0B' },
    { title: 'Saved Auditions', icon: Bookmark, screen: 'SavedAuditions', color: '#8B5CF6' },
    { title: 'Search Users', icon: Search, screen: 'Search', color: '#06B6D4' },
    { title: 'Notifications', icon: Bell, screen: 'Notifications', color: '#EC4899' },
    { title: 'How it Works', icon: PlayCircle, screen: 'Tutorial', color: '#3B82F6' },
    { title: 'FAQ', icon: HelpCircle, screen: 'Faq', color: '#6366F1' },
    { title: 'Terms & Conditions', icon: FileText, screen: 'Legal', params: { type: 'terms' }, color: '#64748B' },
    { title: 'Contact Us', icon: MessageSquare, screen: 'ContactUs', color: '#14B8A6' },
    { title: 'Settings', icon: Settings, screen: 'ArtistSettings', color: '#475569' },
  ];

  return (
    <DrawerContentScrollView 
      {...props} 
      style={styles.drawerContainer} 
      contentContainerStyle={{ paddingTop: 0 }}
      bounces={false}
    >
      <View style={styles.drawerHeader}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.drawerAvatar} />
        ) : (
          <View style={styles.drawerAvatarPlaceholder}>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.drawerUsername} numberOfLines={1}>{username}</Text>
        <Text style={styles.drawerContactText} numberOfLines={1}>
          {user?.email || user?.mobile || user?.phone || 'No contact info'}
        </Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingVertical: 4 }}>
        {menuItems.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity 
              key={idx} 
              style={styles.drawerItem} 
              onPress={() => handleNavigation(item.screen, item.params)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, { backgroundColor: item.color + '12' }]}>
                <IconComponent size={18} color={item.color} strokeWidth={2} />
              </View>
              <Text style={styles.drawerItemText}>{item.title}</Text>
            </TouchableOpacity>
          );
        })}
        
        <View style={styles.drawerDivider} />
        
        <TouchableOpacity style={styles.drawerItem} onPress={handleLogout} activeOpacity={0.7}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.danger + '12' }]}>
            <LogOut size={18} color={colors.danger} strokeWidth={2} />
          </View>
          <Text style={[styles.drawerItemText, { color: colors.danger, fontWeight: '600' }]}>Log Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.drawerItem} onPress={handleDeleteAccount} disabled={isDeleting} activeOpacity={0.7}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.danger + '12' }]}>
            <Trash2 size={18} color={colors.danger} strokeWidth={2} />
          </View>
          <Text style={[styles.drawerItemText, { color: colors.danger, fontWeight: '600' }]}>
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
        
        <View style={{ height: 24 }} />
      </ScrollView>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { colors } = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStyle: {
          backgroundColor: colors.backgroundLight,
          width: '78%',
        },
      }}
    >
      <Drawer.Screen name="Tabs" component={TabNavigator} />
    </Drawer.Navigator>
  );
}

const getStyles = (colors, insets) => StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingTop: Math.max(insets?.top || 0, 24) + 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    marginBottom: 4,
  },
  drawerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 12,
  },
  drawerAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerUsername: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textMainLight,
    letterSpacing: -0.2,
  },
  drawerContactText: {
    fontSize: 12.5,
    color: colors.textMutedLight,
    marginTop: 2,
    fontWeight: '400',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  drawerItemText: {
    fontSize: 14.5,
    color: colors.textMainLight,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
    marginHorizontal: 20,
  }
});

import { GlobalAlert } from '../components/core/GlobalAlert';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
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
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const { data: profileResponse } = useGetProfileQuery();
  const profile = profileResponse?.data;
  
  const fullName = profile?.full_name || user?.full_name || 'Artist';
  const username = fullName;
  const avatarUrl = profile?.avatar_url || user?.avatar_url || null;

  const handleLogout = () => {
    dispatch(apiSlice.util.resetApiState());
    dispatch(logout());
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

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.drawerAvatar} />
        ) : (
          <View style={styles.drawerAvatarPlaceholder}>
            <Icon name="person" size={32} color={colors.textMutedLight} />
          </View>
        )}
        <Text style={styles.drawerUsername}>{username}</Text>
        <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 4 }}>
          {user?.mobile || user?.phone || user?.email || 'No contact info'}
        </Text>
      </View>
      
      <ScrollView>
        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('EditProfile')}>
          <Icon name="person-circle-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('PhotoGallery')}>
          <Icon name="images-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Photo Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('VideoPortfolio')}>
          <Icon name="videocam-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Video Portfolio</Text>
        </TouchableOpacity>



        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('SavedAuditions')}>
          <Icon name="bookmark-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Saved Auditions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('Verification')}>
          <Icon name="shield-checkmark-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Get Verified</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('Search')}>
          <Icon name="search-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Search Users</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('Notifications')}>
          <Icon name="notifications-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('ArtistSettings')}>
          <Icon name="settings-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Settings</Text>
        </TouchableOpacity>
        
        <View style={styles.drawerDivider} />
        
        <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color={colors.danger} />
          <Text style={[styles.drawerItemText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.drawerItem} onPress={handleDeleteAccount} disabled={isDeleting}>
          <Icon name="trash-outline" size={24} color={colors.danger} />
          <Text style={[styles.drawerItemText, { color: colors.danger }]}>
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
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
        drawerStyle: {
          backgroundColor: colors.backgroundLight,
          width: '75%',
        },
      }}
    >
      <Drawer.Screen name="Tabs" component={TabNavigator} />
    </Drawer.Navigator>
  );
}

const getStyles = (colors) => StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  drawerHeader: {
    padding: spacing.xl,
    paddingTop: spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.m,
  },
  drawerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: spacing.m,
  },
  drawerAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  drawerUsername: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.textMainLight,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
  },
  drawerItemText: {
    ...typography.h3,
    marginLeft: spacing.l,
    color: colors.textMainLight,
    fontWeight: '500',
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.m,
  }
});

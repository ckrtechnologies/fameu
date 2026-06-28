import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import TabNavigator from './TabNavigator';
import { colors, typography, spacing } from '../theme/theme';
import { logout } from '../store/slices/authSlice';
import { apiSlice } from '../services/apiSlice';
import { useDeleteAccountMutation } from '../services/authApi';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const username = (user?.full_name || 'Artist').toLowerCase().replace(/\s+/g, '_');

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Log Out', 
        style: 'destructive',
        onPress: () => {
          dispatch(apiSlice.util.resetApiState());
          dispatch(logout());
        }
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
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
              Alert.alert('Error', 'Failed to delete account. Please try again later.');
            }
          }
        },
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerUsername}>{username}</Text>
        <Text style={{ ...typography.caption, color: colors.textMutedLight, marginTop: 4 }}>
          {user?.mobile || user?.phone || user?.email || 'No phone number'}
        </Text>
      </View>
      
      <ScrollView>
        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('ArtistSettings')}>
          <Icon name="settings-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('EditProfile')}>
          <Icon name="person-circle-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('Notifications')}>
          <Icon name="notifications-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('PhotoGallery')}>
          <Icon name="images-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Photo Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('VideoPortfolio')}>
          <Icon name="videocam-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Video Portfolio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('Verification')}>
          <Icon name="shield-checkmark-outline" size={24} color={colors.textMainLight} />
          <Text style={styles.drawerItemText}>Get Verified</Text>
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

const styles = StyleSheet.create({
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

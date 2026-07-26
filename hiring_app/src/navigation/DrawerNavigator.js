import { GlobalAlert } from '../components/core/GlobalAlert';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
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

import { colors, typography, spacing } from '../theme/theme';
import { useGetCompanyProfileQuery } from '../services/hiringApi';
import { useDeleteAccountMutation } from '../services/authApi';
import { apiSlice } from '../services/apiSlice';
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: profileResponse } = useGetCompanyProfileQuery(user?.id, {
    skip: !user?.id,
  });

  const profile = profileResponse?.data;
  const isVerified = profile?.is_verified;
  const verificationStatus = profile?.verification_status || 'pending';

  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const handleLogout = () => {
    GlobalAlert.show('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {
        dispatch(apiSlice.util.resetApiState());
        dispatch(logout());
      } },
    ]);
  };

  const handleDeleteAccount = () => {
    GlobalAlert.show('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteAccount().unwrap();
          dispatch(apiSlice.util.resetApiState());
          dispatch(logout());
        } catch (error) {
          GlobalAlert.show('Error', error?.data?.error || 'Failed to delete account');
        }
      } },
    ]);
  };

  const getStatusColor = () => {
    switch(verificationStatus) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      default: return colors.warning;
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
      <View style={{ height: insets.top, backgroundColor: '#000000' }} />
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          {profile?.logo_url ? (
            <Image source={{ uri: profile.logo_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                {profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : (user?.display_name ? user.display_name.charAt(0).toUpperCase() : '?')}
              </Text>
            </View>
          )}
          
          <Text style={styles.name}>{profile?.company_name || user?.display_name || 'Company Name'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.badgeText}>
              {verificationStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => props.navigation.navigate('Tabs', { screen: 'Dashboard' })}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}><Home size={22} color={colors.primary} /></View>
            <Text style={styles.menuText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => props.navigation.navigate('Search')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#8b5cf615' }]}><Search size={22} color="#8b5cf6" /></View>
            <Text style={styles.menuText}>Search Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => props.navigation.navigate('AllApplicants')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#10b98115' }]}><Users size={22} color="#10b981" /></View>
            <Text style={styles.menuText}>All Applicants</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => props.navigation.navigate('Tabs', { screen: 'Profile' })}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#f59e0b15' }]}><Building size={22} color="#f59e0b" /></View>
            <Text style={styles.menuText}>Company Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => props.navigation.navigate('CompanyKyc')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#3b82f615' }]}><ShieldCheck size={22} color="#3b82f6" /></View>
            <Text style={styles.menuText}>KYC Verification</Text>
            {verificationStatus === 'rejected' && (
              <View style={styles.alertDot} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* Static Links */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => props.navigation.navigate('Faq')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.textMainLight + '15' }]}><Icon name="help-circle-outline" size={22} color={colors.textMainLight} /></View>
            <Text style={styles.menuText}>FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => props.navigation.navigate('ContactUs')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.textMainLight + '15' }]}><Icon name="mail-outline" size={22} color={colors.textMainLight} /></View>
            <Text style={styles.menuText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => props.navigation.navigate('Tutorial')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.textMainLight + '15' }]}><Icon name="play-circle-outline" size={22} color={colors.textMainLight} /></View>
            <Text style={styles.menuText}>How it Works</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => props.navigation.navigate('Legal', { type: 'terms' })}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.textMainLight + '15' }]}><Icon name="document-text-outline" size={22} color={colors.textMainLight} /></View>
            <Text style={styles.menuText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={[styles.iconContainer, { backgroundColor: colors.textMainLight + '15' }]}><LogOut size={22} color={colors.textMainLight} /></View>
          <Text style={[styles.menuText, { color: colors.textMainLight, fontWeight: '600' }]}>Log Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.logoutButton, { marginTop: 12 }]} onPress={handleDeleteAccount} disabled={isDeleting}>
          <View style={[styles.iconContainer, { backgroundColor: colors.error + '15' }]}><Trash2 size={22} color={colors.error} /></View>
          <Text style={[styles.menuText, { color: colors.error, fontWeight: '600' }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '80%',
        },
      }}
    >
      <Drawer.Screen name="Tabs" component={TabNavigator} />
      <Drawer.Screen name="CompanyKyc" component={CompanyKycScreen} options={{ headerShown: true, headerTitle: 'KYC Verification' }} />
      <Drawer.Screen name="Faq" component={FaqScreen} />
      <Drawer.Screen name="ContactUs" component={ContactUsScreen} />
      <Drawer.Screen name="Legal" component={LegalScreen} />
      <Drawer.Screen name="Tutorial" component={TutorialScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.xl,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: spacing.m,
  },
  name: {
    ...typography.h3,
    color: colors.textMainLight,
    marginBottom: 4,
  },
  email: {
    ...typography.body2,
    color: colors.textMutedLight,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuContainer: {
    paddingVertical: spacing.m,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.l,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.s,
    marginHorizontal: spacing.l,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.l,
  },
  menuText: {
    ...typography.body1,
    color: colors.textMainLight,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginLeft: 8,
  }
});

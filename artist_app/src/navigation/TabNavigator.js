import React from 'react';
import { useSelector } from 'react-redux';
import { TouchableOpacity, StyleSheet, View, Image, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetProfileQuery } from '../services/profileApi';

import ArtistDashboardScreen from '../screens/artist/ArtistDashboardScreen';
import AuditionDiscoveryScreen from '../screens/artist/AuditionDiscoveryScreen';
import MyApplicationsScreen from '../screens/artist/MyApplicationsScreen';
import ArtistProfileScreen from '../screens/artist/ArtistProfileScreen';
import InboxScreen from '../screens/artist/InboxScreen';

import { colors, typography, spacing } from '../theme/theme';

const Tab = createBottomTabNavigator();

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabNavigator() {
  const totalUnreadCount = useSelector((state) => state.chat.totalUnreadCount);
  const user = useSelector(state => state.auth.user);
  const { data: profileResponse } = useGetProfileQuery();
  const insets = useSafeAreaInsets();
  
  const profile = profileResponse?.data;
  const fullName = profile?.full_name || user?.full_name || 'Artist';
  const avatarUrl = profile?.avatar_url || user?.avatar_url || null;

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.backgroundLight,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        headerTitleStyle: {
          ...typography.h2,
          color: colors.textMainLight,
          fontWeight: '700',
        },
        headerLeft: () => (
          <TouchableOpacity style={{ marginLeft: spacing.xl, padding: 4 }} onPress={() => navigation.openDrawer()}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 32, height: 32, borderRadius: 16 }} />
            ) : (
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{fullName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: spacing.xl }}>
            <TouchableOpacity style={{ padding: 4, marginRight: 12 }} onPress={() => navigation.navigate('Search')}>
              <Icon name="search-outline" size={26} color={colors.textMainLight} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="notifications-outline" size={26} color={colors.textMainLight} />
            </TouchableOpacity>
          </View>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Auditions') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Applications') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Inbox') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMutedLight,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily,
          fontSize: 12,
        },
      })}
      initialRouteName="Dashboard"
    >
      <Tab.Screen 
        name="Dashboard" 
        component={ArtistDashboardScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ArtistProfileScreen} 
        options={{ tabBarLabel: 'Profile', headerTitle: 'artist' }}
      />
      <Tab.Screen 
        name="Auditions" 
        component={AuditionDiscoveryScreen} 
        options={{ tabBarLabel: 'Auditions' }}
      />
      <Tab.Screen 
        name="Applications" 
        component={MyApplicationsScreen} 
        options={{ tabBarLabel: 'Applications' }}
      />
      <Tab.Screen 
        name="Inbox" 
        component={InboxScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarBadge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.white }
        }}
      />
    </Tab.Navigator>
  );
}

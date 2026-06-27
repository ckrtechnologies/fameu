import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ArtistDashboardScreen from '../screens/artist/ArtistDashboardScreen';
import AuditionDiscoveryScreen from '../screens/artist/AuditionDiscoveryScreen';
import MyApplicationsScreen from '../screens/artist/MyApplicationsScreen';
import ArtistProfileScreen from '../screens/artist/ArtistProfileScreen';

import { colors, typography } from '../theme/theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMutedLight,
        tabBarStyle: {
          backgroundColor: colors.backgroundLight,
          borderTopColor: colors.surfaceDark,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily,
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={ArtistDashboardScreen} 
        options={{ tabBarLabel: 'Home' }}
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
        name="Profile" 
        component={ArtistProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

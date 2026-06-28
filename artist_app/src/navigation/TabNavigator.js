import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import ArtistDashboardScreen from '../screens/artist/ArtistDashboardScreen';
import AuditionDiscoveryScreen from '../screens/artist/AuditionDiscoveryScreen';
import MyApplicationsScreen from '../screens/artist/MyApplicationsScreen';
import ArtistProfileScreen from '../screens/artist/ArtistProfileScreen';
import InboxScreen from '../screens/artist/InboxScreen';

import { colors, typography, spacing } from '../theme/theme';

const Tab = createBottomTabNavigator();

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

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
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: spacing.xl, padding: 4 }} onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={32} color={colors.textMainLight} />
          </TouchableOpacity>
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
          backgroundColor: colors.backgroundLight,
          borderTopColor: colors.borderLight,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 10,
          paddingTop: 10,
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
        options={{ tabBarLabel: 'Messages' }}
      />
    </Tab.Navigator>
  );
}

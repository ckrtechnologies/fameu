import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { TouchableOpacity, StyleSheet, View, Image, Text, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetProfileQuery } from '../services/profileApi';
import { useGetInboxQuery } from '../services/chatApi';

import ArtistDashboardScreen from '../screens/artist/ArtistDashboardScreen';
import AuditionDiscoveryScreen from '../screens/artist/AuditionDiscoveryScreen';
import MyApplicationsScreen from '../screens/artist/MyApplicationsScreen';
import ArtistProfileScreen from '../screens/artist/ArtistProfileScreen';
import InboxScreen from '../screens/artist/InboxScreen';

import { useTheme } from '../theme/ThemeProvider';
import { typography, spacing } from '../theme/theme';
import {
  HomeTabIcon,
  ProfileTabIcon,
  AuditionsTabIcon,
  ApplicationsTabIcon,
  MessagesTabIcon,
} from '../components/icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

function AnimatedTabIcon({ routeName, focused, activeColor, inactiveColor }) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.12 : 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleAnim]);

  let IconComponent;
  if (routeName === 'Dashboard') {
    IconComponent = HomeTabIcon;
  } else if (routeName === 'Profile') {
    IconComponent = ProfileTabIcon;
  } else if (routeName === 'Auditions') {
    IconComponent = AuditionsTabIcon;
  } else if (routeName === 'Applications') {
    IconComponent = ApplicationsTabIcon;
  } else if (routeName === 'Inbox') {
    IconComponent = MessagesTabIcon;
  }

  return (
    <Animated.View style={[styles.tabIconWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.tabIconPill, focused && { backgroundColor: activeColor + '15' }]}>
        {IconComponent ? (
          <IconComponent
            size={24}
            focused={focused}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
          />
        ) : null}
      </View>
    </Animated.View>
  );
}

export default function TabNavigator() {
  const { colors } = useTheme();
  const totalUnreadCount = useSelector((state) => state.chat.totalUnreadCount);
  const user = useSelector(state => state.auth.user);
  
  // Global Prefetching
  const { data: profileResponse } = useGetProfileQuery();
  useGetInboxQuery(undefined, { skip: !user });
  const insets = useSafeAreaInsets();
  
  const profile = profileResponse?.data;
  const fullName = profile?.full_name || user?.full_name || 'Artist';
  const avatarUrl = profile?.avatar_url || user?.avatar_url || null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <AnimatedTabIcon
            routeName={route.name}
            focused={focused}
            activeColor={colors.primary}
            inactiveColor={colors.textMutedLight}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMutedLight,
        tabBarStyle: {
          backgroundColor: colors.backgroundLight,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 62 + insets.bottom,
          paddingBottom: (insets.bottom || 8) + 2,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily,
          fontSize: 11.5,
          fontWeight: 'bold',
          marginTop: -2,
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
        options={{ tabBarLabel: 'Profile' }}
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

const styles = StyleSheet.create({
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

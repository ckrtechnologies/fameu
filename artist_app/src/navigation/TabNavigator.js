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
  const scaleAnim = useRef(new Animated.Value(focused ? 1.08 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.08 : 1,
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
      <View style={[styles.tabIconPill, focused && { backgroundColor: 'rgba(227, 176, 75, 0.12)' }]}>
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
  
  const activeColor = colors.tabBarActive || '#E3B04B';
  const inactiveColor = colors.tabBarInactive || '#8A8F9E';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <AnimatedTabIcon
            routeName={route.name}
            focused={focused}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
          />
        ),
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground || '#131418',
          borderTopColor: colors.tabBarBorder || '#22242B',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily,
          fontSize: 13,
          fontWeight: '700',
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
          tabBarBadgeStyle: { 
            backgroundColor: '#EF4444', 
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
          }
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

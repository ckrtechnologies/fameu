import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeTabIcon,
  MyAuditionsTabIcon,
  MessagesTabIcon,
  ApplicantsTabIcon,
  CompanyTabIcon,
} from '../components/icons';
import { useGetNotificationsQuery } from '../services/hiringApi';
import { useGetInboxQuery } from '../services/chatApi';

import HiringDashboardScreen from '../screens/hiring/HiringDashboardScreen';
import CompanyProfileScreen from '../screens/hiring/CompanyProfileScreen';
import MyAuditionsScreen from '../screens/hiring/MyAuditionsScreen';
import InboxScreen from '../screens/hiring/InboxScreen';
import AllApplicantsScreen from '../screens/hiring/AllApplicantsScreen';

import { typography, spacing } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const totalUnreadCount = useSelector((state) => state.chat.totalUnreadCount);
  const { user } = useSelector((state) => state.auth);

  // Global Prefetching
  useGetInboxQuery(undefined, { skip: !user });
  const { data: notificationsResponse } = useGetNotificationsQuery(undefined, { 
    skip: !user,
    pollingInterval: 10000,
  });

  const hasUnreadNotifications = notificationsResponse?.data?.some(n => !n.is_read) || false;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconSize = size || 26;
          if (route.name === 'Dashboard') {
            return <HomeTabIcon size={iconSize} focused={focused} />;
          } else if (route.name === 'MyAuditions') {
            return <MyAuditionsTabIcon size={iconSize} focused={focused} />;
          } else if (route.name === 'Inbox') {
            return (
              <View>
                <MessagesTabIcon size={iconSize} focused={focused} />
                {totalUnreadCount > 0 && (
                  <View style={{
                    position: 'absolute', top: -3, right: -6,
                    minWidth: 16, height: 16, borderRadius: 8,
                    backgroundColor: colors.error,
                    justifyContent: 'center', alignItems: 'center',
                    paddingHorizontal: 3,
                    borderWidth: 1.5, borderColor: colors.surfaceLight,
                  }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.error }} />
                  </View>
                )}
              </View>
            );
          } else if (route.name === 'Applicants') {
            return <ApplicantsTabIcon size={iconSize} focused={focused} />;
          } else if (route.name === 'Profile') {
            return <CompanyTabIcon size={iconSize} focused={focused} />;
          }
          return null;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMutedLight,
        tabBarStyle: {
          backgroundColor: colors.surfaceLight,
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
        component={HiringDashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="MyAuditions"
        component={MyAuditionsScreen}
        options={{ tabBarLabel: 'My Auditions' }}
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
      <Tab.Screen
        name="Applicants"
        component={AllApplicantsScreen}
        options={{ tabBarLabel: 'Applicants' }}
      />
      <Tab.Screen
        name="Profile"
        component={CompanyProfileScreen}
        options={{ tabBarLabel: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

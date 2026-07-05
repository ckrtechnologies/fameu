import React from 'react';
import { useSelector } from 'react-redux';
import { TouchableOpacity, StyleSheet, View, Text, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Bell, Search } from 'lucide-react-native';
import { useGetCompanyProfileQuery } from '../services/hiringApi';
import { useGetInboxQuery } from '../services/chatApi';

import HiringDashboardScreen from '../screens/hiring/HiringDashboardScreen';
import CompanyProfileScreen from '../screens/hiring/CompanyProfileScreen';
import MyAuditionsScreen from '../screens/hiring/MyAuditionsScreen';
import InboxScreen from '../screens/hiring/InboxScreen';
import AllApplicantsScreen from '../screens/hiring/AllApplicantsScreen';

import { colors, typography, spacing } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const totalUnreadCount = useSelector((state) => state.chat.totalUnreadCount);
  const { user } = useSelector((state) => state.auth);
  
  // Global Prefetching
  const { data: profileResponse } = useGetCompanyProfileQuery(undefined, { skip: !user });
  useGetInboxQuery(undefined, { skip: !user });
  
  const profile = profileResponse?.data;
  const logoUrl = profile?.logo_url || user?.avatar_url || null;
  const companyName = profile?.company_name || user?.display_name || 'Company';

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        header: ({ navigation, route, options }) => (
          <View style={{
            paddingTop: insets.top + spacing.m,
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.m,
            backgroundColor: colors.surfaceLight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 5,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            zIndex: 10,
          }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                {logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
                    style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12, borderWidth: 2, borderColor: colors.primary + '30' }}
                  />
                ) : (
                  <View style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.primary + '30' }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{companyName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View>
                <Text style={{ ...typography.body, color: colors.textSecondaryLight, marginBottom: 2 }}>Welcome back,</Text>
                <Text style={{ ...typography.h3, color: colors.textMainLight, fontWeight: '800' }}>{companyName}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Search')} 
                style={{ padding: 10, backgroundColor: colors.surfaceLight, borderRadius: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, marginRight: 12 }}
              >
                <Search size={28} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Notifications')} 
                style={{ padding: 10, backgroundColor: colors.surfaceLight, borderRadius: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
              >
                <Bell size={28} color={colors.primary} />
                <View style={{ position: 'absolute', top: 12, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error, borderWidth: 2, borderColor: colors.surfaceLight }} />
              </TouchableOpacity>
            </View>
          </View>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyAuditions') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'Inbox') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Applicants') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'business' : 'business-outline';
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
        component={HiringDashboardScreen} 
        options={{ tabBarLabel: 'Home', headerShown: true }}
      />
      <Tab.Screen 
        name="MyAuditions" 
        component={MyAuditionsScreen} 
        options={{ tabBarLabel: 'My Auditions', headerShown: false }}
      />
      <Tab.Screen 
        name="Inbox" 
        component={InboxScreen} 
        options={{
          tabBarLabel: 'Inbox',
          headerShown: false,
          tabBarBadge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.white }
        }}
      />
      <Tab.Screen 
        name="Applicants" 
        component={AllApplicantsScreen} 
        options={{ tabBarLabel: 'Applicants', headerShown: false }}
      />
      <Tab.Screen 
        name="Profile" 
        component={CompanyProfileScreen} 
        options={{ tabBarLabel: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

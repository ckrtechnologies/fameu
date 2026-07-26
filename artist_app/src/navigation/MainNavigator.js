import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DrawerNavigator from './DrawerNavigator';

import AuditionDetailScreen from '../screens/artist/AuditionDetailScreen';
import TutorialScreen from '../screens/artist/TutorialScreen';
import ApplyAuditionScreen from '../screens/artist/ApplyAuditionScreen';
import ApplicationDetailScreen from '../screens/artist/ApplicationDetailScreen';
import NotificationsScreen from '../screens/artist/NotificationsScreen';
import ArtistSettingsScreen from '../screens/artist/ArtistSettingsScreen';
import EditProfileScreen from '../screens/artist/EditProfileScreen';
import PhotoGalleryScreen from '../screens/artist/PhotoGalleryScreen';
import VideoPortfolioScreen from '../screens/artist/VideoPortfolioScreen';

import ArtistCategoryScreen from '../screens/artist/ArtistCategoryScreen';
import ArtistFormScreen from '../screens/artist/ArtistFormScreen';
import AuditionSearchScreen from '../screens/artist/AuditionSearchScreen';
import TrendingAuditionsScreen from '../screens/artist/TrendingAuditionsScreen';
import UpcomingCalendarScreen from '../screens/artist/UpcomingCalendarScreen';
import WalkInListingsScreen from '../screens/artist/WalkInListingsScreen';
import DeleteAccountScreen from '../screens/artist/DeleteAccountScreen';
import ChatScreen from '../screens/artist/ChatScreen';
import SearchScreen from '../screens/artist/SearchScreen';
import ArtistDiscoveryScreen from '../screens/artist/ArtistDiscoveryScreen';
import PublicProfileScreen from '../screens/artist/PublicProfileScreen';
import ConnectionListScreen from '../screens/artist/ConnectionListScreen';
import SavedAuditionsScreen from '../screens/artist/SavedAuditionsScreen';
import ProfileVisitorsScreen from '../screens/artist/ProfileVisitorsScreen';
import LegalScreen from '../screens/artist/LegalScreen';
import FaqScreen from '../screens/artist/FaqScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Drawer wraps the Bottom Tabs as the main entry point */}
      <Stack.Screen name="MainTabs" component={DrawerNavigator} />
      
      {/* Other screens that should hide the bottom tabs */}
      <Stack.Screen name="AuditionDetail" component={AuditionDetailScreen} />
      <Stack.Screen name="ApplyAudition" component={ApplyAuditionScreen} />
      <Stack.Screen name="ApplicationDetail" component={ApplicationDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ArtistSettings" component={ArtistSettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PhotoGallery" component={PhotoGalleryScreen} />
      <Stack.Screen name="VideoPortfolio" component={VideoPortfolioScreen} />

      <Stack.Screen name="ArtistCategory" component={ArtistCategoryScreen} />
      <Stack.Screen name="ArtistForm" component={ArtistFormScreen} />
      <Stack.Screen name="AuditionSearch" component={AuditionSearchScreen} />
      <Stack.Screen name="TrendingAuditions" component={TrendingAuditionsScreen} />
      <Stack.Screen name="UpcomingCalendar" component={UpcomingCalendarScreen} />
      <Stack.Screen name="WalkInListings" component={WalkInListingsScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="ArtistDiscovery" component={ArtistDiscoveryScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
      <Stack.Screen name="ConnectionList" component={ConnectionListScreen} />
      <Stack.Screen name="SavedAuditions" component={SavedAuditionsScreen} />
      <Stack.Screen name="ProfileVisitors" component={ProfileVisitorsScreen} />
      <Stack.Screen name="Legal" component={LegalScreen} />
      <Stack.Screen name="Faq" component={FaqScreen} />
      <Stack.Screen name="Tutorial" component={TutorialScreen} />
    </Stack.Navigator>
  );
}

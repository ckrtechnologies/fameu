import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import CreateAuditionScreen from '../screens/hiring/CreateAuditionScreen';
import ApplicantTrackingScreen from '../screens/hiring/ApplicantTrackingScreen';
import AllApplicantsScreen from '../screens/hiring/AllApplicantsScreen';
import ChatScreen from '../screens/hiring/ChatScreen';
import ArtistProfileScreen from '../screens/hiring/ArtistProfileScreen';
import AuditionDetailsScreen from '../screens/hiring/AuditionDetailsScreen';
import NotificationsScreen from '../screens/hiring/NotificationsScreen';
import SearchScreen from '../screens/hiring/SearchScreen';
import TalentDiscoveryScreen from '../screens/hiring/TalentDiscoveryScreen';
import FindTalentScreen from '../screens/hiring/FindTalentScreen';
import PublicProfileScreen from '../screens/hiring/PublicProfileScreen';
import VerificationRequiredScreen from '../screens/hiring/VerificationRequiredScreen';
import EditCompanyProfileScreen from '../screens/hiring/EditCompanyProfileScreen';
import ConnectionListScreen from '../screens/hiring/ConnectionListScreen';
import VideoPortfolioScreen from '../screens/hiring/VideoPortfolioScreen';
const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen name="CreateAudition" component={CreateAuditionScreen} />
      <Stack.Screen name="AuditionDetails" component={AuditionDetailsScreen} />
      <Stack.Screen name="ApplicantTracking" component={ApplicantTrackingScreen} />
      <Stack.Screen name="AllApplicants" component={AllApplicantsScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ArtistProfileScreen" component={ArtistProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="TalentDiscovery" component={TalentDiscoveryScreen} />
      <Stack.Screen name="VideoPortfolio" component={VideoPortfolioScreen} />
      <Stack.Screen name="FindTalent" component={FindTalentScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
      <Stack.Screen name="VerificationRequired" component={VerificationRequiredScreen} />
      <Stack.Screen name="EditCompanyProfile" component={EditCompanyProfileScreen} />
      <Stack.Screen name="ConnectionList" component={ConnectionListScreen} />
    </Stack.Navigator>
  );
}

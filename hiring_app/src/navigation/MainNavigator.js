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
import CompanyKycScreen from '../screens/hiring/CompanyKycScreen';
import FaqScreen from '../screens/hiring/FaqScreen';
import ContactUsScreen from '../screens/hiring/ContactUsScreen';
import LegalScreen from '../screens/hiring/LegalScreen';
import TutorialScreen from '../screens/hiring/TutorialScreen';
import ChangePasswordScreen from '../screens/common/ChangePasswordScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ROUTES.DRAWER} component={DrawerNavigator} />
      <Stack.Screen name={ROUTES.CREATE_AUDITION} component={CreateAuditionScreen} />
      <Stack.Screen name={ROUTES.AUDITION_DETAILS} component={AuditionDetailsScreen} />
      <Stack.Screen name={ROUTES.APPLICANT_TRACKING} component={ApplicantTrackingScreen} />
      <Stack.Screen name={ROUTES.ALL_APPLICANTS} component={AllApplicantsScreen} />
      
      {/* Chat routes - canonical and alias */}
      <Stack.Screen name={ROUTES.CHAT_SCREEN} component={ChatScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />

      {/* Artist Profile routes - canonical and alias */}
      <Stack.Screen name={ROUTES.ARTIST_PROFILE_SCREEN} component={ArtistProfileScreen} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />

      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
      <Stack.Screen name={ROUTES.SEARCH} component={SearchScreen} />
      <Stack.Screen name={ROUTES.TALENT_DISCOVERY} component={TalentDiscoveryScreen} />
      <Stack.Screen name={ROUTES.VIDEO_PORTFOLIO} component={VideoPortfolioScreen} />
      <Stack.Screen name={ROUTES.FIND_TALENT} component={FindTalentScreen} />
      <Stack.Screen name={ROUTES.PUBLIC_PROFILE} component={PublicProfileScreen} />
      <Stack.Screen name={ROUTES.VERIFICATION_REQUIRED} component={VerificationRequiredScreen} />
      <Stack.Screen name={ROUTES.EDIT_COMPANY_PROFILE} component={EditCompanyProfileScreen} />
      <Stack.Screen name={ROUTES.CONNECTION_LIST} component={ConnectionListScreen} />

      {/* Shared Screens pushed from Drawer/Deep-links (Tab Bar cleanly hidden) */}
      <Stack.Screen name={ROUTES.COMPANY_KYC} component={CompanyKycScreen} />
      <Stack.Screen name={ROUTES.FAQ} component={FaqScreen} />
      <Stack.Screen name={ROUTES.CONTACT_US} component={ContactUsScreen} />
      <Stack.Screen name={ROUTES.LEGAL} component={LegalScreen} />
      <Stack.Screen name={ROUTES.TUTORIAL} component={TutorialScreen} />
      <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { initializeAuth } from '../store/slices/authSlice';
import { useTheme } from '../theme/ThemeProvider';

import SocketService from '../services/SocketService';
import * as Keychain from 'react-native-keychain';
import { setupPushNotifications } from '../services/PushNotificationService';

export default function AppNavigator() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      Keychain.getGenericPassword().then(credentials => {
        if (credentials && credentials.password) {
          SocketService.connect(credentials.password);
        }
      });
      setupPushNotifications();
    } else {
      SocketService.disconnect();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundLight }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}

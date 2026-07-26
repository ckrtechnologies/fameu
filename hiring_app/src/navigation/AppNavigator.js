import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { initializeAuth } from '../store/slices/authSlice';
import SocketService from '../services/SocketService';
import * as Keychain from 'react-native-keychain';
import { setupPushNotifications } from '../services/PushNotificationService';
import { useTheme } from '../theme/ThemeProvider';

export default function AppNavigator() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, isBlacklisted } = useSelector((state) => state.auth);

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

  if (isBlacklisted) {
    const { logout } = require('../store/slices/authSlice');
    const { Text, TouchableOpacity, SafeAreaView } = require('react-native');
    const { AlertTriangle } = require('lucide-react-native');

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ef4444' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <AlertTriangle color="#1E1E1E" size={64} style={{ marginBottom: 24 }} />
          <Text style={{ fontSize: 24, color: '#1E1E1E', fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>Account Suspended</Text>
          <Text style={{ fontSize: 16, color: '#1E1E1E', textAlign: 'center', marginBottom: 32, opacity: 0.9, lineHeight: 24 }}>
            Your account has been blocked for violating our terms of service or community guidelines.
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#1E1E1E', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 100, width: '100%', alignItems: 'center' }} 
            onPress={() => dispatch(logout())}
          >
            <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16 }}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}

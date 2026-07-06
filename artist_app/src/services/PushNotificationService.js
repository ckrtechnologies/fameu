import { getMessaging, getToken, requestPermission, onTokenRefresh, AuthorizationStatus } from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { BASE_URL } from './apiSlice';

export const setupPushNotifications = async () => {
  try {
    const messaging = getMessaging();

    if (Platform.OS === 'ios') {
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('FCM Permission not granted');
        return null;
      }
    } else if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('FCM Permission not granted for Android');
        return null;
      }
    }

    const token = await getToken(messaging);
    console.log('FCM Token generated:', token);

    await sendTokenToBackend(token);

    onTokenRefresh(messaging, newToken => {
      sendTokenToBackend(newToken);
    });

    return token;
  } catch (error) {
    console.log('Push notification setup error:', error.message || error);
    return null;
  }
};

export const sendTokenToBackend = async (fcmToken) => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (!credentials || !credentials.password) return;

    const response = await fetch(`${BASE_URL}/notifications/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.password}`,
      },
      body: JSON.stringify({ fcm_token: fcmToken }),
    });

    if (!response.ok) {
      console.log('Failed to update FCM token', await response.text());
    }
  } catch (error) {
    console.error('Failed to send token to backend:', error);
  }
};

/**
 * Fameu Artist App
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, Vibration } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import messaging from '@react-native-firebase/messaging';
import { setupPushNotifications } from './src/services/PushNotificationService';
import { colors, typography } from './src/theme/theme';

import Toast from 'react-native-toast-message';

export type RootStackParamList = {
  [key: string]: any;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const toastConfig = {
  customNotification: ({ text1, text2, props, onPress }: any) => (
    <TouchableOpacity 
      style={{
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        width: '90%',
        borderLeftWidth: 4,
        borderLeftColor: colors.primary
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {props.avatarUrl ? (
        <Image 
          source={{ uri: props.avatarUrl }}
          style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
        />
      ) : (
        <View style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="notifications" size={24} color={colors.backgroundLight} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.h3, color: colors.textMainLight } as any}>{text1 != null ? String(text1) : ''}</Text>
        <Text style={{ ...typography.body, color: colors.textMutedLight, marginTop: 2 } as any} numberOfLines={2}>{text2 != null ? String(text2) : ''}</Text>
      </View>
    </TouchableOpacity>
  )
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    setupPushNotifications();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived in foreground!', JSON.stringify(remoteMessage));
      
      // Check if we are currently on the ChatScreen for this conversation
      const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
      if (remoteMessage.data?.type === 'chat_message' && currentRoute?.name === 'Chat') {
        if (currentRoute.params?.conversationId === remoteMessage.data.conversationId) {
          // User is already looking at this chat, do not show toast, do not vibrate
          return;
        }
      }

      if (remoteMessage.notification) {
        // Vibrate for notification
        Vibration.vibrate(500);

        Toast.show({
          type: 'customNotification',
          text1: remoteMessage.notification.title ?? 'Notification',
          text2: remoteMessage.notification.body ?? '',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 50,
          props: {
            avatarUrl: remoteMessage.data?.avatarUrl
          },
          onPress: () => {
             if (remoteMessage.data?.deepLink) {
                // handle navigation if possible
             } else if (remoteMessage.data?.type === 'chat_message' && remoteMessage.data?.conversationId) {
                if (navigationRef.isReady()) {
                  navigationRef.navigate('Chat', { conversationId: remoteMessage.data.conversationId });
                }
             }
             Toast.hide();
          }
        });
      }
    });

    // Handle notification tap when app is in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      if (remoteMessage.data?.type === 'chat_message' && remoteMessage.data?.conversationId) {
        if (navigationRef.isReady()) {
          navigationRef.navigate('Chat', { conversationId: remoteMessage.data.conversationId });
        }
      }
    });

    // Handle notification tap when app is killed/quit
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          const conversationId = remoteMessage.data?.conversationId;
          if (remoteMessage.data?.type === 'chat_message' && typeof conversationId === 'string') {
            // Need to wait slightly for navigation to mount from quit state
            setTimeout(() => {
              if (navigationRef.isReady()) {
                navigationRef.navigate('Chat', { conversationId });
              }
            }, 1000);
          }
        }
      });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          translucent={true}
          backgroundColor="transparent"
        />
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
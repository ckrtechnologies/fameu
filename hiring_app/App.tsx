/**
 * Fameu Artist App
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, Vibration, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import messaging from '@react-native-firebase/messaging';
import { setupPushNotifications } from './src/services/PushNotificationService';
import { colors, typography } from './src/theme/theme';

import Toast from 'react-native-toast-message';
import ErrorBoundary from './src/components/core/ErrorBoundary';

export type RootStackParamList = {
  [key: string]: any;
};

const GlobalStatusBar = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: '#000000', zIndex: 99999 }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
    </View>
  );
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const toastConfig = {
  
  fameuSuccess: ({ text1, text2, props, onPress }: any) => (

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
        borderLeftColor: colors.success
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name={'checkmark-circle'} size={24} color={'#FFF'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.h3, color: colors.textMainLight } as any}>{text1 != null ? String(text1) : ''}</Text>
        <Text style={{ ...typography.body, color: colors.textMutedLight, marginTop: 2 } as any} numberOfLines={2}>{text2 != null ? String(text2) : ''}</Text>
      </View>
    </TouchableOpacity>
  ),
  fameuError: ({ text1, text2, props, onPress }: any) => (

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
        borderLeftColor: colors.danger
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: colors.danger, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name={'alert-circle'} size={24} color={'#FFF'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.h3, color: colors.textMainLight } as any}>{text1 != null ? String(text1) : ''}</Text>
        <Text style={{ ...typography.body, color: colors.textMutedLight, marginTop: 2 } as any} numberOfLines={2}>{text2 != null ? String(text2) : ''}</Text>
      </View>
    </TouchableOpacity>
  ),
  fameuWarning: ({ text1, text2, props, onPress }: any) => (

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
        borderLeftColor: colors.warning
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: colors.warning, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name={'warning'} size={24} color={'#FFF'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.h3, color: colors.textMainLight } as any}>{text1 != null ? String(text1) : ''}</Text>
        <Text style={{ ...typography.body, color: colors.textMutedLight, marginTop: 2 } as any} numberOfLines={2}>{text2 != null ? String(text2) : ''}</Text>
      </View>
    </TouchableOpacity>
  ),
  fameuInfo: ({ text1, text2, props, onPress }: any) => (

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
      <View style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name={'information-circle'} size={24} color={'#FFF'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.h3, color: colors.textMainLight } as any}>{text1 != null ? String(text1) : ''}</Text>
        <Text style={{ ...typography.body, color: colors.textMutedLight, marginTop: 2 } as any} numberOfLines={2}>{text2 != null ? String(text2) : ''}</Text>
      </View>
    </TouchableOpacity>
  ),

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
      console.log('App.tsx (FCM): currentRoute', currentRoute?.name, currentRoute?.params);
      console.log('App.tsx (FCM): remoteMessage.data', remoteMessage.data);

      if (remoteMessage.data?.type === 'chat_message' && currentRoute?.name === 'ChatScreen') {
        if (String(currentRoute.params?.conversationId) === String(remoteMessage.data.conversationId)) {
          // User is already looking at this chat, do not show toast, do not vibrate
          console.log('App.tsx (FCM): Suppressing toast because we are on ChatScreen for this conversation');
          return;
        } else {
          console.log('App.tsx (FCM): Conversation IDs do not match!', currentRoute.params?.conversationId, remoteMessage.data.conversationId);
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
             const type = remoteMessage.data?.type;
             const conversationId = remoteMessage.data?.conversationId;
             const targetId = remoteMessage.data?.targetId;
             const targetType = remoteMessage.data?.targetType;
             
             if (remoteMessage.data?.deepLink) {
                // handle navigation if possible
             } else if (type === 'chat_message' && conversationId) {
                if (navigationRef.isReady()) {
                  navigationRef.navigate('ChatScreen', { 
                    conversationId,
                    otherParticipant: {
                      display_name: remoteMessage.data?.senderName || 'Chat',
                      avatar_url: remoteMessage.data?.avatarUrl
                    }
                  });
                }
             } else if ((type === 'comment' || type === 'comment_reply') && targetType === 'audition' && targetId) {
                if (navigationRef.isReady()) {
                  navigationRef.navigate('AuditionDetails', { auditionId: targetId, scrollToComments: true });
                }
             } else if ((type === 'comment' || type === 'comment_reply') && targetType === 'profile') {
                if (navigationRef.isReady()) {
                  navigationRef.navigate('CompanyProfile', { scrollToComments: true });
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
      const type = remoteMessage.data?.type;
      const conversationId = remoteMessage.data?.conversationId;
      const targetId = remoteMessage.data?.targetId;
      const targetType = remoteMessage.data?.targetType;
      
      if (type === 'chat_message' && conversationId) {
        if (navigationRef.isReady()) {
          navigationRef.navigate('ChatScreen', { 
            conversationId,
            otherParticipant: {
              display_name: remoteMessage.data?.senderName || 'Chat',
              avatar_url: remoteMessage.data?.avatarUrl
            }
          });
        }
      } else if ((type === 'comment' || type === 'comment_reply') && targetType === 'audition' && targetId) {
        if (navigationRef.isReady()) {
          navigationRef.navigate('AuditionDetails', { auditionId: targetId, scrollToComments: true });
        }
      } else if ((type === 'comment' || type === 'comment_reply') && targetType === 'profile') {
        if (navigationRef.isReady()) {
          navigationRef.navigate('CompanyProfile', { scrollToComments: true });
        }
      }
    });

    // Handle notification tap when app is killed/quit
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          const type = remoteMessage.data?.type;
          const conversationId = remoteMessage.data?.conversationId;
          const targetId = remoteMessage.data?.targetId;
          const targetType = remoteMessage.data?.targetType;
          
          setTimeout(() => {
            if (!navigationRef.isReady()) return;
            if (type === 'chat_message' && conversationId) {
              navigationRef.navigate('ChatScreen', { 
                conversationId,
                otherParticipant: {
                  display_name: remoteMessage.data?.senderName || 'Chat',
                  avatar_url: remoteMessage.data?.avatarUrl
                }
              });
            } else if ((type === 'comment' || type === 'comment_reply') && targetType === 'audition' && targetId) {
              navigationRef.navigate('AuditionDetails', { auditionId: targetId, scrollToComments: true });
            } else if ((type === 'comment' || type === 'comment_reply') && targetType === 'profile') {
              navigationRef.navigate('CompanyProfile', { scrollToComments: true });
            }
          }, 1000);
        }
      });

    return unsubscribe;
  }, []);

  return (
    <ErrorBoundary>
    <Provider store={store}>
      <SafeAreaProvider>
        <GlobalStatusBar />
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>  
    </ErrorBoundary>
  );
}

export default App;
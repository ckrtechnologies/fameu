/**
 * Fameu Artist App
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import messaging from '@react-native-firebase/messaging';
import { setupPushNotifications } from './src/services/PushNotificationService';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    setupPushNotifications();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived in foreground!', JSON.stringify(remoteMessage));
      if (remoteMessage.notification) {
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
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
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
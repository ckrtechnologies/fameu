import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import supabase from '../config/supabase.js';
import fs from 'fs';

// Initialize Firebase Admin lazily to allow server to start even if credentials aren't ready
const initFirebase = () => {
  if (getApps().length > 0) return true;
  
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      initializeApp({
        credential: cert(serviceAccount)
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return false;
  }
};

const notificationService = {
  sendPushNotification: async (userId, title, body, data = {}) => {
    try {
      // Save notification to database
      await supabase.from('notifications').insert([{
        user_id: userId,
        type: data.type || 'general',
        title,
        body,
        data
      }]);

      // Attempt to send push notification via FCM
      if (!initFirebase()) {
        console.log('Firebase not initialized. Notification saved to DB only.');
        return;
      }

      // Fetch user's FCM token
      const { data: user } = await supabase.from('users').select('fcm_token').eq('id', userId).single();

      if (user && user.fcm_token) {
        const message = {
          notification: { title, body },
          data,
          token: user.fcm_token,
          android: {
            priority: 'high',
            notification: {
              sound: 'fameu_sound',
              channelId: 'fameu_notifications_channel_v2',
              tag: data?.conversationId || 'general'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'fameu_sound.wav',
                'thread-id': data?.conversationId || 'general'
              }
            }
          }
        };

        const response = await getMessaging().send(message);
        console.log('Successfully sent message:', response);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  },

  sendBulkPushNotification: async (tokens, title, body, data = {}) => {
    try {
      if (!tokens || tokens.length === 0) return { successCount: 0, failureCount: 0 };
      if (!initFirebase()) {
        console.log('Firebase not initialized. Cannot send bulk push notification.');
        return { successCount: 0, failureCount: 0 };
      }

      // FCM sendMulticast allows max 500 tokens at a time.
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < tokens.length; i += 500) {
        const chunk = tokens.slice(i, i + 500);
        const message = {
          notification: { title, body },
          data,
          tokens: chunk,
          android: {
            notification: {
              sound: 'default'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default'
              }
            }
          }
        };

        const response = await getMessaging().sendEachForMulticast(message);
        successCount += response.successCount;
        failureCount += response.failureCount;
      }

      console.log(`Successfully sent ${successCount} messages, ${failureCount} failures.`);
      return { successCount, failureCount };
    } catch (error) {
      console.error('Error sending bulk push notification:', error);
      return { successCount: 0, failureCount: 0 };
    }
  }
};

export default notificationService;

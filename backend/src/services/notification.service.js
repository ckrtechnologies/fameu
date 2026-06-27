import admin from 'firebase-admin';
import supabase from '../config/supabase.js';
import fs from 'fs';

// Initialize Firebase Admin lazily to allow server to start even if credentials aren't ready
let initialized = false;

const initFirebase = () => {
  if (initialized) return true;
  
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      initialized = true;
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
          token: user.fcm_token
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
};

export default notificationService;

import 'dotenv/config';
import notificationService from './src/services/notification.service.js';

async function testPush() {
  const userId = "5b131f11-4166-4c56-bac3-7e4204572a8d"; // any valid userId with a token
  console.log("Testing push for", userId);
  await notificationService.sendPushNotification(userId, "Test Title", "Test Body", { type: "test" });
  console.log("Done");
  process.exit(0);
}

testPush();

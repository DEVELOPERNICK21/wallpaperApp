/**
 * Test Notification Script
 * Use this to send a test notification to your device
 *
 * Usage:
 * 1. Get your FCM token from the app console logs
 * 2. Get your Server Key from Firebase Console → Project Settings → Cloud Messaging
 * 3. Replace the values below
 * 4. Run: node test-notification.js
 */

const https = require('https');

// ===== CONFIGURATION =====
// Replace these with your values:
const SERVER_KEY = 'YOUR_SERVER_KEY_HERE'; // From Firebase Console
const FCM_TOKEN = 'YOUR_DEVICE_FCM_TOKEN_HERE'; // From app console logs

// ========================

const data = JSON.stringify({
  to: FCM_TOKEN,
  notification: {
    title: 'Test Message',
    body: 'This is a test notification',
  },
  data: {
    chatId: 'test123',
    senderId: 'test456',
    type: 'chat_message',
  },
  priority: 'high',
});

const options = {
  hostname: 'fcm.googleapis.com',
  port: 443,
  path: '/fcm/send',
  method: 'POST',
  headers: {
    Authorization: `key=${SERVER_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

console.log('📤 Sending test notification...');
console.log('To:', FCM_TOKEN.substring(0, 50) + '...');

const req = https.request(options, res => {
  let responseData = '';

  res.on('data', chunk => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\n📬 Response:');
    console.log(responseData);

    const response = JSON.parse(responseData);

    if (response.success === 1) {
      console.log('\n✅ Notification sent successfully!');
      console.log('Check your device for the notification.');
    } else {
      console.log('\n❌ Failed to send notification');
      console.log('Error:', response);
    }
  });
});

req.on('error', error => {
  console.error('❌ Error:', error);
});

req.write(data);
req.end();

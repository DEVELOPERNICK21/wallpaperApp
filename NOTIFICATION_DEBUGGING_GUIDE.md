# 🔍 Notification Debugging Guide

## ⚠️ Why Notifications Might Not Be Working

There are several possible reasons why you're not receiving notifications. Let's debug step by step.

---

## 🧪 Step-by-Step Debugging

### Step 1: Check if FCM Token is Generated

**Run your app and check the console logs:**

```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

**Look for these logs:**

```
🚀 Initializing disguised notification service...
✅ iOS notification permission granted (or Android)
🔑 FCM Token: ey...long token here...
✅ Disguised notification service initialized
```

**❌ If you DON'T see "FCM Token":**

- Firebase is not properly configured
- Google Services not connected
- See Step 2

**✅ If you see "FCM Token":**

- Copy the token (you'll need it for testing)
- Continue to Step 3

---

### Step 2: Verify Firebase Cloud Messaging (FCM) is Enabled

#### Android:

1. **Check `google-services.json` exists:**

   ```bash
   ls android/app/google-services.json
   ```

   - ✅ Should show the file
   - ❌ If not found, download from Firebase Console

2. **Check package name matches:**

   - Open `android/app/google-services.json`
   - Find: `"package_name": "com.wallpe"`
   - Open `android/app/build.gradle`
   - Find: `applicationId "com.wallpe"`
   - **They must match!**

3. **Verify Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select your project: `wallpemsg`
   - Click: **Project Settings** (gear icon)
   - Go to: **Cloud Messaging** tab
   - **Verify:** Cloud Messaging API is **enabled**

#### iOS:

1. **Check `GoogleService-Info.plist` exists:**

   ```bash
   ls ios/GoogleService-Info.plist
   ls ios/wallpe/GoogleService-Info.plist
   ```

   - ✅ Should exist in one of these locations

2. **Check APNs Key:**

   - Firebase Console → Project Settings → Cloud Messaging
   - Under **Apple app configuration**
   - **APNs Authentication Key** should be uploaded
   - If not, you need to generate one in Apple Developer Console

3. **Check Bundle ID matches:**
   - Open `GoogleService-Info.plist`
   - Find: `BUNDLE_ID`
   - Open `ios/wallpe/Info.plist`
   - Find: `CFBundleIdentifier`
   - **They must match!**

---

### Step 3: Test with Firebase Console (Easiest Method)

This bypasses your backend and tests FCM directly.

1. **Get your FCM token:**

   - Run app
   - Check logs for: `🔑 FCM Token: ...`
   - Copy the entire token

2. **Send test notification from Firebase:**

   - Go to: https://console.firebase.google.com/
   - Click: **Cloud Messaging** (in left menu)
   - Click: **Send your first message** (or **New Campaign**)
   - **Notification:**
     - Title: `Test`
     - Text: `This is a test notification`
   - Click: **Next**
   - **Target:**
     - Select: **FCM registration token**
     - Paste your token
   - Click: **Review**
   - Click: **Publish**

3. **Check your device:**
   - **App in foreground:** Should see notification (check console logs)
   - **App in background:** Should see notification in notification tray
   - **App closed:** Should see notification in notification tray

**❌ If you don't receive it:**

- Continue to Step 4

**✅ If you receive it:**

- FCM works! Problem is in your message sending logic
- Continue to Step 6

---

### Step 4: Check Permissions

#### Android:

1. **System Permissions:**

   ```
   Settings → Apps → Wallpaper → Notifications → Allow
   ```

2. **Battery Optimization:**

   ```
   Settings → Battery → Battery Optimization
   Find your app → Don't Optimize
   ```

3. **Do Not Disturb:**
   - Make sure DND is off or app is allowed

#### iOS:

1. **System Permissions:**

   ```
   Settings → Wallpaper → Notifications → Allow
   ```

2. **Notification Settings:**

   - Alerts should be enabled
   - Badge should be enabled
   - Sounds should be enabled

3. **Focus Mode:**
   - Make sure Focus mode allows notifications

---

### Step 5: Verify App Configuration

#### Check Android Manifest:

```bash
cat android/app/src/main/AndroidManifest.xml | grep POST_NOTIFICATIONS
```

Should show:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

#### Check iOS Info.plist:

```bash
cat ios/wallpe/Info.plist | grep -A 2 UIBackgroundModes
```

Should show:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

---

### Step 6: Check Message Sending Logic

The issue might be in how you're sending notifications when a message is sent.

**You need a backend function that:**

1. Gets FCM token of recipient
2. Sends notification via Firebase Admin SDK

**Example backend code (Node.js):**

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Send notification when message is sent
async function sendNotification(recipientFCMToken, senderName, messageText) {
  try {
    await admin.messaging().send({
      token: recipientFCMToken,
      notification: {
        title: senderName,
        body: messageText,
      },
      data: {
        chatId: 'chat123',
        senderId: 'user456',
        type: 'chat_message',
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default',
          },
        },
      },
    });

    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
```

**❌ Common mistakes:**

- Not storing FCM tokens in Firestore when user logs in
- Not sending notification when message is created
- Sending notification to sender instead of recipient
- Token expired or invalid

---

### Step 7: Store FCM Tokens in Firestore

You need to save FCM tokens so you know who to send notifications to.

**Update your DisguisedNotificationService.ts:**

Add this function:

```typescript
import firestore from '@react-native-firebase/firestore';

export const saveFCMTokenToFirestore = async (userId: string) => {
  try {
    const fcmToken = await getFCMToken();

    if (fcmToken && userId) {
      // Save to user's document
      await firestore().collection('users').doc(userId).update({
        fcmToken: fcmToken,
        fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log('✅ FCM token saved to Firestore');
    }
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
  }
};
```

**Call this after user logs in:**

```typescript
// In your login success handler
import {saveFCMTokenToFirestore} from './services/DisguisedNotificationService';

// After successful login
const userId = auth().currentUser.uid;
await saveFCMTokenToFirestore(userId);
```

---

### Step 8: Trigger Notification When Message is Sent

You need a Cloud Function (or backend) to send notifications.

**Option A: Firebase Cloud Functions (Recommended)**

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Trigger when a new message is added
exports.sendMessageNotification = functions.firestore
  .document('groupChats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const chatId = context.params.chatId;

    // Get chat info
    const chatDoc = await admin
      .firestore()
      .collection('groupChats')
      .doc(chatId)
      .get();

    const chat = chatDoc.data();
    const members = chat.members || [];
    const senderId = message.senderId;

    // Get all members except sender
    const recipients = members.filter(m => m !== senderId);

    // Get FCM tokens for all recipients
    const userDocs = await admin
      .firestore()
      .collection('users')
      .where(admin.firestore.FieldPath.documentId(), 'in', recipients)
      .get();

    const tokens = [];
    userDocs.forEach(doc => {
      const token = doc.data().fcmToken;
      if (token) tokens.push(token);
    });

    if (tokens.length === 0) {
      console.log('No tokens to send to');
      return;
    }

    // Send notification to all tokens
    const payload = {
      notification: {
        title: message.senderName || 'New Message',
        body: message.text || 'You have a new message',
      },
      data: {
        chatId: chatId,
        senderId: senderId,
        type: 'chat_message',
      },
    };

    // Send to multiple devices
    const response = await admin.messaging().sendToDevice(tokens, payload, {
      priority: 'high',
      timeToLive: 60 * 60 * 24, // 24 hours
    });

    console.log('Notifications sent:', response.successCount);
    console.log('Notifications failed:', response.failureCount);

    return response;
  });
```

**Deploy:**

```bash
cd functions
npm install
firebase deploy --only functions
```

**Option B: Manual Backend (if you have your own server)**

Create an endpoint that sends notifications:

```javascript
// POST /send-notification
app.post('/send-notification', async (req, res) => {
  const {recipientToken, senderName, messageText, chatId, senderId} = req.body;

  try {
    await admin.messaging().send({
      token: recipientToken,
      notification: {
        title: senderName,
        body: messageText,
      },
      data: {
        chatId: chatId,
        senderId: senderId,
      },
    });

    res.json({success: true});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});
```

Then call this from your app when sending a message.

---

### Step 9: Quick Test Without Backend

If you don't have a backend set up yet, use this quick test:

**Install test script dependencies:**

```bash
npm install -g firebase-tools
firebase login
```

**Send test notification using FCM API:**

```bash
# Get your Server Key from Firebase Console:
# Project Settings → Cloud Messaging → Server key

# Replace with your values:
SERVER_KEY="your-server-key"
FCM_TOKEN="your-device-token"

curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=$SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "'$FCM_TOKEN'",
    "notification": {
      "title": "Test",
      "body": "This is a test notification"
    },
    "data": {
      "chatId": "test123",
      "senderId": "test456"
    }
  }'
```

**✅ If this works:**

- Your app's notification handling is correct
- You just need to implement backend notification sending

**❌ If this doesn't work:**

- There's an issue with your app's FCM setup
- Go back to Step 2

---

## 🔍 Common Issues and Solutions

### Issue 1: "Permission not granted"

**Solution:**

```typescript
// Add this to check permission status
import messaging from '@react-native-firebase/messaging';

const checkPermission = async () => {
  const authStatus = await messaging().hasPermission();
  console.log('Permission status:', authStatus);

  if (authStatus !== messaging.AuthorizationStatus.AUTHORIZED) {
    await messaging().requestPermission();
  }
};
```

### Issue 2: "No FCM Token"

**Solution:**

```bash
# Clear cache and rebuild
rm -rf node_modules
npm install
cd android && ./gradlew clean && cd ..
npm run android
```

### Issue 3: Notifications work in foreground but not background

**Solution:**

- Check `index.js` has `setBackgroundMessageHandler`
- Verify background handler is registered before `AppRegistry.registerComponent`
- Make sure handler doesn't use any React components

### Issue 4: Notifications don't open app

**Solution:**
Add this to AndroidManifest.xml:

```xml
<intent-filter>
  <action android:name="FLUTTER_NOTIFICATION_CLICK" />
  <category android:name="android.intent.category.DEFAULT" />
</intent-filter>
```

### Issue 5: iOS notifications not working

**Solution:**

1. Check APNs certificate in Firebase Console
2. Verify provisioning profile includes Push Notifications
3. Check Xcode capabilities: Push Notifications enabled
4. Test on real device (simulator doesn't support push)

---

## 📋 Complete Checklist

Before asking for help, verify:

- [ ] FCM token is generated (check console logs)
- [ ] Permissions are granted (system settings)
- [ ] Firebase Cloud Messaging is enabled (Firebase Console)
- [ ] Package/Bundle ID matches in config files
- [ ] `google-services.json` / `GoogleService-Info.plist` are present
- [ ] App is built with these files (clean build)
- [ ] Test notification from Firebase Console works
- [ ] Background handler is registered in `index.js`
- [ ] Foreground handler is set up in app
- [ ] FCM tokens are being saved to Firestore
- [ ] Backend/Cloud Function sends notifications when message is created
- [ ] Testing on real device (not emulator for iOS)

---

## 🎯 Quick Debug Script

Add this to your App.tsx to see detailed notification status:

```typescript
useEffect(() => {
  const debugNotifications = async () => {
    console.log('=== NOTIFICATION DEBUG INFO ===');

    // 1. Check permission
    const authStatus = await messaging().hasPermission();
    console.log('1. Permission:', authStatus);

    // 2. Check token
    const token = await messaging().getToken();
    console.log('2. FCM Token:', token ? 'EXISTS' : 'MISSING');
    console.log('   Token:', token);

    // 3. Check notifee permission
    const settings = await notifee.getNotificationSettings();
    console.log('3. Notifee Permission:', settings.authorizationStatus);

    // 4. Check AsyncStorage settings
    const notifEnabled = await AsyncStorage.getItem('notificationsEnabled');
    console.log('4. Notifications Enabled in App:', notifEnabled);

    console.log('=== END DEBUG INFO ===');
  };

  debugNotifications();
}, []);
```

---

## 🆘 Still Not Working?

If you've tried everything above and notifications still don't work:

1. **Share these logs:**

   - Console output when app starts
   - FCM token
   - Permission status
   - Any error messages

2. **Verify:**

   - Are you testing on a real device? (Emulators can be flaky)
   - Is the device connected to internet?
   - Is Firebase project active?
   - Are you sending to the correct token?

3. **Test with another app:**
   - Install any app that uses FCM
   - See if you receive notifications
   - This tests if your device has issues

---

## ✅ Success Indicators

You'll know notifications are working when:

- ✅ Console shows: `🔑 FCM Token: ...`
- ✅ Test from Firebase Console appears on device
- ✅ Foreground notifications show in app
- ✅ Background notifications show in tray
- ✅ Disguised message appears (e.g., "Wallpaper update available")
- ✅ Tapping notification opens app

---

**Need more help? Share your console logs and I can help debug further!** 🔍

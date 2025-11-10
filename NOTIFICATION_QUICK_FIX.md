# ⚡ Notification Quick Fix Guide

## 🚨 Notifications Not Working? Start Here!

Follow these steps **in order**:

---

## Step 1: Run the App and Check Console (2 minutes)

```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios

# Or just run the app
npm run android
```

### Look for These Logs:

You should see:

```
🚀 Initializing disguised notification service...
✅ Android notification permission granted (or iOS)
🔑 FCM Token: eyJhbG...  <-- IMPORTANT!
✅ FCM token saved to Firestore for user: abc123
✅ Disguised notification service initialized

========================================
🔍 NOTIFICATION DEBUG STATUS
========================================
1. FCM Permission Status: 1
   - AUTHORIZED: true
2. FCM Token Status: EXISTS ✅
   Token (first 50 chars): eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...
3. Notifee Permission: 2
   - Authorized: true
4. Notifications Enabled in App: YES ✅
5. Current User: abc123def456
6. Platform: android
========================================
```

### ❌ If You DON'T See These Logs:

**Problem:** Notification service not initializing

**Solution:**

1. Check `App.tsx` has this code:

   ```typescript
   import {initializeNotifications} from './src/services/DisguisedNotificationService';

   useEffect(() => {
     initializeNotifications();
   }, []);
   ```

2. Rebuild app:
   ```bash
   npm run android
   ```

---

## Step 2: Copy Your FCM Token (30 seconds)

From the console logs, copy the FULL FCM token:

```
🔑 FCM Token: eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save this somewhere** - you'll need it for testing!

---

## Step 3: Test with Firebase Console (2 minutes)

This is the EASIEST way to test if notifications work.

1. **Go to Firebase Console:**

   - https://console.firebase.google.com/
   - Select project: `wallpemsg`

2. **Send Test Notification:**

   - Click **Cloud Messaging** in left menu
   - Click **Send your first message** or **New campaign**
   - Enter:
     - **Title:** Test
     - **Text:** This is a test notification
   - Click **Next**

3. **Target Your Device:**

   - Select: **FCM registration token**
   - Paste your FCM token
   - Click **Test**

4. **Check Your Device:**
   - You should see: "Wallpaper - Wallpaper update available" (or similar)

### ✅ If You Got the Notification:

**Great!** FCM works! The problem is:

- You don't have a backend to send notifications when messages arrive
- Continue to Step 5 to set up automatic notifications

### ❌ If You DIDN'T Get the Notification:

**Problem:** FCM not working

**Try these:**

1. **Check Permissions:**

   - Android: Settings → Apps → Wallpaper → Notifications → **Allow**
   - iOS: Settings → Wallpaper → Notifications → **Allow**

2. **Check Internet Connection:**

   - Make sure device is connected to internet

3. **Rebuild App:**

   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

4. **Check Firebase Project:**
   - Make sure Cloud Messaging API is enabled
   - Project Settings → Cloud Messaging tab

---

## Step 4: Verify Token is Saved to Firestore (1 minute)

1. **Go to Firebase Console:**

   - https://console.firebase.google.com/
   - Select project: `wallpemsg`

2. **Check Firestore:**
   - Click **Firestore Database**
   - Open `users` collection
   - Find your user document
   - Should have fields:
     ```
     fcmToken: "eyJhbGciOiJ..."
     fcmTokenUpdatedAt: [timestamp]
     ```

### ❌ If Token is NOT Saved:

**Check console logs:**

- Should see: `✅ FCM token saved to Firestore for user: abc123`
- If not, you might not be logged in

**Solution:**

1. Make sure you're logged in
2. Restart app
3. Check logs again

---

## Step 5: Set Up Automatic Notifications (Cloud Functions)

**The Missing Piece:** You need a backend to send notifications when messages are created.

### Option A: Quick Test Script (5 minutes)

Use the test script I created:

1. **Get Your Server Key:**

   - Firebase Console → Project Settings → Cloud Messaging
   - Copy **Server key**

2. **Edit test-notification.js:**

   ```javascript
   const SERVER_KEY = 'YOUR_SERVER_KEY'; // Paste here
   const FCM_TOKEN = 'YOUR_DEVICE_TOKEN'; // Paste here
   ```

3. **Run:**

   ```bash
   node test-notification.js
   ```

4. **Check Device:**
   - Should see disguised notification!

### Option B: Set Up Cloud Functions (Recommended - 15 minutes)

This will automatically send notifications when messages arrive.

1. **Install Firebase CLI:**

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Functions:**

   ```bash
   firebase init functions
   # Select JavaScript
   # Install dependencies: Yes
   ```

3. **Edit functions/index.js:**

   ```javascript
   const functions = require('firebase-functions');
   const admin = require('firebase-admin');

   admin.initializeApp();

   exports.sendMessageNotification = functions.firestore
     .document('groupChats/{chatId}/messages/{messageId}')
     .onCreate(async (snap, context) => {
       const message = snap.data();
       const chatId = context.params.chatId;

       // Get chat members
       const chatDoc = await admin
         .firestore()
         .collection('groupChats')
         .doc(chatId)
         .get();

       const chat = chatDoc.data();
       const members = chat.members || [];
       const senderId = message.senderId;

       // Get recipients (all members except sender)
       const recipients = members.filter(m => m !== senderId);

       if (recipients.length === 0) {
         return null;
       }

       // Get FCM tokens
       const usersSnapshot = await admin
         .firestore()
         .collection('users')
         .where(admin.firestore.FieldPath.documentId(), 'in', recipients)
         .get();

       const tokens = [];
       usersSnapshot.forEach(doc => {
         const token = doc.data().fcmToken;
         if (token) tokens.push(token);
       });

       if (tokens.length === 0) {
         console.log('No FCM tokens found');
         return null;
       }

       // Send notification
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

       const response = await admin.messaging().sendToDevice(tokens, payload, {
         priority: 'high',
       });

       console.log('Sent to', response.successCount, 'devices');
       return response;
     });
   ```

4. **Deploy:**

   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

5. **Test:**
   - Send a message in your app
   - Recipient should get disguised notification!

---

## 🎯 Common Issues & Solutions

### Issue 1: "No FCM Token in logs"

**Solution:**

```bash
# Clean rebuild
rm -rf node_modules
npm install
cd android && ./gradlew clean && cd ..
npm run android
```

### Issue 2: "Permission Denied"

**Solution:**

- Android: Settings → Apps → Wallpaper → Notifications → **Allow**
- Make sure to allow when prompted on first launch

### Issue 3: "Token saved but still no notifications"

**Solution:**

- You need Cloud Functions (Step 5)
- Notifications won't send automatically without backend

### Issue 4: "Notifications show actual message content"

**Solution:**

- The disguising happens on the client side
- Check that `DisguisedNotificationService` is being used
- Check console logs: Should see "📱 Displaying disguised notification"

### Issue 5: "Works in foreground but not background"

**Solution:**

- Check `index.js` has background handler:

  ```javascript
  import {handleBackgroundMessage} from './src/services/DisguisedNotificationService';

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await handleBackgroundMessage(remoteMessage);
  });
  ```

---

## ✅ Success Checklist

Your notifications are working when you can check ALL of these:

- [ ] See FCM token in console logs
- [ ] Token saved to Firestore
- [ ] Test from Firebase Console works
- [ ] See disguised message ("Wallpaper update available")
- [ ] Works when app is in foreground
- [ ] Works when app is in background
- [ ] Works when app is closed
- [ ] Tapping notification opens app
- [ ] No actual message content visible in notification

---

## 🆘 Still Not Working?

1. **Share these logs:**

   - Everything from "🔍 NOTIFICATION DEBUG STATUS"
   - Your FCM token
   - Any error messages

2. **Verify:**

   - Testing on real device? (Not emulator for iOS)
   - Device connected to internet?
   - Logged into the app?
   - Firebase project is active?

3. **Try test script:**
   ```bash
   node test-notification.js
   ```
   - If this works → Problem is in Cloud Functions
   - If this doesn't work → Problem is in app setup

---

## 📞 Quick Debug Commands

```bash
# Check logs
npx react-native log-android

# Clean rebuild
rm -rf node_modules && npm install
cd android && ./gradlew clean && cd ..
npm run android

# Check Firebase
firebase projects:list
firebase deploy --only functions

# Test notification
node test-notification.js
```

---

## 🎉 Next Steps After Notifications Work

1. **Customize disguised messages** (DisguisedNotificationService.ts)
2. **Add notification sounds** (optional)
3. **Set up notification badges** (iOS)
4. **Add notification categories** (different for groups vs 1-on-1)
5. **Test on multiple devices**

---

**Remember:** The main thing you need is:

1. ✅ FCM token generated (Step 1-2)
2. ✅ Test from Firebase Console works (Step 3)
3. ✅ Cloud Function to send on new message (Step 5)

**That's it! 🚀**

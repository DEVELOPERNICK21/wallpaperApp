# 🚀 START HERE - Getting Notifications to Work

## ⚡ Quick 3-Step Process

Your notifications aren't working because you're missing **one key piece**: the backend that sends notifications when messages arrive.

---

## The Problem

Right now:

- ✅ Your app CAN receive notifications
- ✅ Notification service is set up
- ❌ **Nothing is SENDING notifications when messages arrive**

It's like having a mailbox but no postman!

---

## The Solution (Choose One)

### 🎯 Option 1: Quick Test (5 minutes) - **START HERE**

Test if notifications work at all:

**Step 1:** Run your app and look for this in console:

```
🔑 FCM Token: eyJhbGciOiJFUzI1N...
```

**Step 2:** Copy the token

**Step 3:** Go to Firebase Console:

- https://console.firebase.google.com/
- Project: wallpemsg
- Cloud Messaging → Send your first message
- Paste your FCM token
- Click Send

**Step 4:** Check your phone

- Should see: "Wallpaper - Wallpaper update available"

**✅ If this works:** Your app is fine! Continue to Option 2.

**❌ If this doesn't work:** See NOTIFICATION_QUICK_FIX.md

---

### 🎯 Option 2: Test Script (10 minutes) - **Quick Testing**

Send notifications from your computer:

**Step 1:** Get Server Key

- Firebase Console → Project Settings → Cloud Messaging
- Copy **Server key**

**Step 2:** Edit `test-notification.js`:

```javascript
const SERVER_KEY = 'PASTE_YOUR_SERVER_KEY_HERE';
const FCM_TOKEN = 'PASTE_YOUR_DEVICE_TOKEN_HERE';
```

**Step 3:** Run:

```bash
node test-notification.js
```

**Result:** Should see disguised notification on device!

---

### 🎯 Option 3: Cloud Functions (Recommended - 30 minutes) - **Production Ready**

Automatically send notifications when messages arrive:

**Step 1:** Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

**Step 2:** Initialize Functions

```bash
firebase init functions
# Choose JavaScript
# Install dependencies: Yes
```

**Step 3:** Add notification function

Create/edit `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Send notification when new message is created
exports.sendMessageNotification = functions.firestore
  .document('groupChats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    try {
      const message = snap.data();
      const chatId = context.params.chatId;

      console.log('New message in chat:', chatId);

      // Get chat document
      const chatDoc = await admin
        .firestore()
        .collection('groupChats')
        .doc(chatId)
        .get();

      if (!chatDoc.exists) {
        console.log('Chat not found');
        return null;
      }

      const chat = chatDoc.data();
      const senderId = message.senderId;
      const members = chat.members || [];

      // Get recipients (everyone except sender)
      const recipients = members.filter(memberId => memberId !== senderId);

      if (recipients.length === 0) {
        console.log('No recipients');
        return null;
      }

      console.log('Sending to', recipients.length, 'recipients');

      // Get FCM tokens for all recipients
      const usersSnapshot = await admin
        .firestore()
        .collection('users')
        .where(admin.firestore.FieldPath.documentId(), 'in', recipients)
        .get();

      const tokens = [];
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      });

      if (tokens.length === 0) {
        console.log('No FCM tokens found');
        return null;
      }

      console.log('Found', tokens.length, 'FCM tokens');

      // Prepare notification payload
      const payload = {
        notification: {
          title: message.senderName || 'New Message',
          body: message.text || 'You have a new message',
        },
        data: {
          chatId: chatId,
          senderId: senderId,
          messageId: context.params.messageId,
          type: 'chat_message',
        },
      };

      // Send to all tokens
      const response = await admin.messaging().sendToDevice(tokens, payload, {
        priority: 'high',
        timeToLive: 60 * 60 * 24, // 24 hours
      });

      console.log('Successfully sent to:', response.successCount);
      console.log('Failed to send to:', response.failureCount);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
          const error = result.error;
          if (error) {
            console.error('Error sending to token:', error);
            if (
              error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered'
            ) {
              tokensToRemove.push(tokens[index]);
            }
          }
        });

        // Remove invalid tokens from Firestore
        for (const token of tokensToRemove) {
          console.log('Removing invalid token');
          // Find user with this token and remove it
          const userQuery = await admin
            .firestore()
            .collection('users')
            .where('fcmToken', '==', token)
            .limit(1)
            .get();

          if (!userQuery.empty) {
            await userQuery.docs[0].ref.update({
              fcmToken: admin.firestore.FieldValue.delete(),
            });
          }
        }
      }

      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });
```

**Step 4:** Install dependencies

```bash
cd functions
npm install firebase-functions firebase-admin
cd ..
```

**Step 5:** Deploy

```bash
firebase deploy --only functions
```

**Step 6:** Test

- Send a message in your app
- Recipient should get notification: "Wallpaper - Wallpaper update available"

---

## 📋 What's Happening Now

When you run your app, this happens:

```
1. App starts ✅
   ↓
2. Notification service initializes ✅
   ↓
3. FCM token generated ✅
   ↓
4. Token saved to Firestore ✅
   ↓
5. You send a message ✅
   ↓
6. Message saved to Firestore ✅
   ↓
7. ❌ Nothing sends notification ← THIS IS THE PROBLEM
   ↓
8. ❌ Recipient doesn't get notified
```

**What you need:** Step 7 - Cloud Function to send notification

---

## 🔍 Debug Your Current Setup

Run your app and check console:

```bash
npx react-native log-android
```

You should see:

```
🚀 Initializing disguised notification service...
✅ Android notification permission granted
🔑 FCM Token: eyJhbG...  ← COPY THIS
✅ FCM token saved to Firestore for user: abc123
✅ Disguised notification service initialized

========================================
🔍 NOTIFICATION DEBUG STATUS
========================================
1. FCM Permission Status: 1
   - AUTHORIZED: true  ← Should be true
2. FCM Token Status: EXISTS ✅  ← Should say EXISTS
3. Notifee Permission: 2
   - Authorized: true  ← Should be true
4. Notifications Enabled in App: YES ✅  ← Should say YES
5. Current User: abc123  ← Should show user ID
6. Platform: android
========================================
```

**✅ If you see all this:** Your app is ready! Just need Cloud Functions (Option 3)

**❌ If something is missing:** See NOTIFICATION_DEBUGGING_GUIDE.md

---

## 🎯 Quick Summary

**What works:**

- ✅ Notification service setup
- ✅ Permission handling
- ✅ FCM token generation
- ✅ Token storage in Firestore
- ✅ Foreground/background handlers
- ✅ Disguised messages

**What's missing:**

- ❌ Backend/Cloud Function to trigger notifications

**Solution:**

- Set up Cloud Functions (Option 3 above)
- OR use test script for testing (Option 2)

---

## 📚 Additional Resources

- **NOTIFICATION_QUICK_FIX.md** - Step-by-step troubleshooting
- **NOTIFICATION_DEBUGGING_GUIDE.md** - Complete debugging guide
- **DISGUISED_NOTIFICATIONS_FEATURE.md** - Technical documentation
- **test-notification.js** - Test script to send notifications

---

## ✅ Success Checklist

You'll know it's working when:

- [ ] See FCM token in logs
- [ ] Token saved to Firestore (check Firebase Console)
- [ ] Test from Firebase Console works
- [ ] Cloud Function deployed
- [ ] Send message → recipient gets notification
- [ ] Notification shows disguised message
- [ ] Works in foreground, background, and closed state
- [ ] Tapping notification opens app

---

## 🆘 Need Help?

1. **First:** Try Option 1 (Firebase Console test)

   - This will tell you if your app can receive notifications

2. **If that works:** Deploy Cloud Functions (Option 3)

   - This will send notifications automatically

3. **If it doesn't work:** Read NOTIFICATION_QUICK_FIX.md

   - Follow the troubleshooting steps

4. **Still stuck?** Share:
   - Console logs (the debug status section)
   - Your FCM token
   - Any error messages

---

## 🚀 Let's Get Started!

**Right now, do this:**

1. Run your app
2. Look for FCM token in logs
3. Copy the token
4. Go to Firebase Console
5. Send test notification
6. Check if you receive it

**Takes 2 minutes!**

If that works, you just need Cloud Functions. If it doesn't work, there's an issue with your app setup.

---

**Good luck! You're almost there! 🎯**

# 🔔 Disguised Notifications Feature

## 📱 Overview

The **Disguised Notifications** feature is a critical privacy component that maintains your app's wallpaper disguise even when notifications arrive. Instead of showing actual message content like "John: Hey, how are you?", the notification displays wallpaper-themed messages like "Wallpaper update available".

---

## 🎯 Why This Matters

**The Problem:**
Even with encryption, standard messaging notifications reveal:

- Someone sent you a message
- The app is a messaging app
- Who sent it (if name is shown)
- What they said (if preview is shown)

**The Solution:**
Disguised notifications show wallpaper-themed messages that:

- ✅ Maintain your app's wallpaper cover
- ✅ Don't reveal it's a messaging app
- ✅ Provide plausible deniability
- ✅ Still notify you of new messages

---

## 🚀 Features

### 1. **Multiple Disguised Messages**

The system randomly selects from 8 different wallpaper-themed messages:

- "Wallpaper update available"
- "New wallpaper collection ready"
- "Wallpaper is being updated"
- "Checking for new wallpapers"
- "Wallpaper sync in progress"
- "New wallpapers added"
- "Wallpaper refresh complete"
- "HD wallpapers available"

### 2. **Cross-Platform Support**

- ✅ **Android** - Full support with custom channel
- ✅ **iOS** - Full support with foreground presentation

### 3. **All Notification States Covered**

- **Foreground** - App is open
- **Background** - App is in background
- **Quit** - App is completely closed

### 4. **Privacy Settings Integration**

- Users can enable/disable notifications in app settings
- Badge count management (iOS)
- Respects system notification permissions

---

## 🔧 Technical Implementation

### Architecture

```
Firebase Cloud Messaging (FCM)
        ↓
DisguisedNotificationService
        ↓
Notifee (Display Layer)
        ↓
User sees: "Wallpaper update available"
```

### Key Components

#### 1. **DisguisedNotificationService.ts**

Central service that handles all notification logic:

- Permission requests
- Message handling (foreground/background)
- Notification display with disguised content
- Token management
- Badge count

#### 2. **index.js**

Registers background message handler:

```javascript
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await handleBackgroundMessage(remoteMessage);
});
```

#### 3. **App.tsx**

Initializes the notification service on app start:

```javascript
useEffect(() => {
  initializeNotifications();
}, []);
```

---

## 📋 Setup Instructions

### Step 1: Install Dependencies

Already installed in your project:

```bash
npm install @notifee/react-native
npm install @react-native-firebase/messaging
```

### Step 2: Android Notification Icon

You need to add a notification icon for Android:

**Option A: Use Default Icon (Quick)**
The code references `ic_notification`. If you don't have this, it will use the default.

**Option B: Create Custom Icon (Recommended)**

1. **Generate Icon:**

   - Visit: https://romannurik.github.io/AndroidAssetStudio/icons-notification.html
   - Upload a simple icon (white/transparent, 24x24dp)
   - Name it: `ic_notification`
   - Download the zip file

2. **Add to Project:**

   ```
   android/app/src/main/res/
   ├── drawable-hdpi/ic_notification.png
   ├── drawable-mdpi/ic_notification.png
   ├── drawable-xhdpi/ic_notification.png
   ├── drawable-xxhdpi/ic_notification.png
   └── drawable-xxxhdpi/ic_notification.png
   ```

3. **Icon Guidelines:**
   - Use white/transparent PNG
   - Simple, recognizable shape
   - No text or complex details
   - Should look like a wallpaper/image icon

**Icon Suggestion:** A simple picture frame, landscape, or gallery icon in white.

### Step 3: iOS Setup

**Add to Info.plist** (already added, but verify):

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### Step 4: Test the Implementation

```bash
# Rebuild the app
npm run android
# or
npm run ios
```

---

## 🧪 Testing

### Test Foreground Notifications (App Open)

1. Open the app
2. Send a message from another device
3. **Expected:** Notification shows "Wallpaper update available" (or similar)
4. **Verify:** No message content is revealed

### Test Background Notifications (App Minimized)

1. Minimize the app (Home button)
2. Send a message from another device
3. **Expected:** Notification appears with disguised message
4. **Verify:** Tap notification opens app

### Test Quit State Notifications (App Closed)

1. Force close the app (swipe away from recent apps)
2. Send a message from another device
3. **Expected:** Notification appears with disguised message
4. **Verify:** Tap notification launches app

### Test Lock Screen

1. Lock your device
2. Send a message
3. **Expected:** Notification shows "Wallpaper" with disguised message
4. **Verify:** No personal information visible

---

## 🔐 Privacy Considerations

### What's Hidden:

- ✅ Sender name
- ✅ Message content
- ✅ That it's a messaging app
- ✅ Chat context

### What's Visible:

- App name: "Wallpaper" (can be changed in app config)
- Generic wallpaper-related message
- App icon (should be wallpaper-themed)

### Best Practices:

1. **App Name:** Keep it wallpaper-themed

   - "Wallpaper"
   - "HD Walls"
   - "WallpaperHub"

2. **App Icon:** Should look like a wallpaper/gallery app

   - Use landscape, picture frame, or gallery icon
   - Avoid anything that looks like messaging

3. **Notification Sound:** Use default or subtle sound
   - Don't use distinctive messaging sounds

---

## 📱 User Experience

### How It Looks:

**Notification Panel:**

```
[Wallpaper Icon] Wallpaper
Wallpaper update available
2 minutes ago
```

**Lock Screen:**

```
[Wallpaper Icon] Wallpaper
New wallpapers added
Now
```

### What User Sees:

1. Gets notification with wallpaper message
2. Opens app (enters PIN if enabled)
3. Sees actual unread messages in chat list

### Benefits:

- ✅ Privacy maintained at all times
- ✅ No one can identify it as messaging app
- ✅ Still get notified of new messages
- ✅ Seamless user experience

---

## ⚙️ Configuration

### Enable/Disable Notifications

Users can control notifications in Privacy Settings:

```typescript
// In PrivacySecurityScreen.tsx
await AsyncStorage.setItem('notificationsEnabled', 'true'); // or 'false'
```

The notification service checks this before displaying:

```typescript
const notificationsEnabled = await areNotificationsEnabled();
if (!notificationsEnabled) {
  return; // Don't show notification
}
```

### Customize Disguised Messages

Edit the array in `DisguisedNotificationService.ts`:

```typescript
const DISGUISED_MESSAGES = [
  'Wallpaper update available',
  'New wallpaper collection ready',
  // Add more messages here
  'Your custom message',
];
```

**Tips for Good Disguised Messages:**

- Keep them wallpaper-themed
- Make them generic (not specific to timing or actions)
- Avoid patterns (use variety)
- Sound legitimate for a wallpaper app

---

## 🔄 How It Works

### Message Flow:

1. **FCM receives push notification** from Firebase

   ```
   {
     notification: {
       title: "John Doe",
       body: "Hey, how are you?"
     },
     data: {
       chatId: "abc123",
       senderId: "user456"
     }
   }
   ```

2. **DisguisedNotificationService intercepts** the message

3. **Replaces content** with disguised message:

   ```
   {
     title: "Wallpaper",
     body: "New wallpapers added",
     data: {
       actualMessage: "Hey, how are you?", // Hidden in data
       chatId: "abc123",
       senderId: "user456"
     }
   }
   ```

4. **Notifee displays** the disguised notification

5. **User taps** notification → App opens → Shows actual messages

### Data Storage:

The actual message data is stored in the notification's `data` field:

```typescript
data: {
  actualMessage: remoteMessage?.notification?.body || '',
  senderId: remoteMessage?.data?.senderId || '',
  chatId: remoteMessage?.data?.chatId || '',
}
```

This allows the app to navigate to the correct chat when notification is tapped, without revealing it in the notification itself.

---

## 🐛 Troubleshooting

### Notifications Not Appearing

**Check:**

1. Permissions granted?
   - Settings → App → Notifications → Enabled
2. Notifications enabled in app settings?
   - Privacy Settings → Notifications
3. FCM token generated?
   - Check console logs for "FCM Token: ..."
4. App in battery saver mode? (Android)
   - Disable battery optimization for your app

### Notifications Show Wrong Content

**Issue:** Seeing actual message instead of disguised message

**Fix:**

1. Make sure you're using the new service
2. Verify `index.js` imports `handleBackgroundMessage`
3. Clear app data and reinstall
4. Check if sending custom notification from backend (should let FCM handle it)

### Notifications Don't Open App

**Check:**

1. Intent filters in AndroidManifest.xml
2. Notification press action configured
3. Deep linking setup (if navigating to specific chat)

### iOS Notifications Not Working

**Check:**

1. APNs certificate configured in Firebase
2. Info.plist has remote-notification background mode
3. Xcode capabilities: Push Notifications enabled
4. Device permissions granted

---

## 📊 Monitoring

### Console Logs

The service provides detailed logs:

```
🚀 Initializing disguised notification service...
✅ Android notification permission granted
🔑 FCM Token: [token]
📬 Foreground message received: [message]
📱 Displaying disguised notification: Wallpaper update available
✅ Disguised notification service initialized
```

### What to Monitor:

1. **Token generation:** Should happen on app start
2. **Permission status:** Should be granted
3. **Message reception:** Should log when messages arrive
4. **Notification display:** Should show disguised messages

---

## 🔮 Future Enhancements

### Potential Improvements:

1. **Time-Based Messages**

   - Morning: "Good morning! New wallpapers"
   - Evening: "Evening wallpaper collection"

2. **Category-Based Messages**

   - "New nature wallpapers"
   - "Abstract art collection updated"

3. **Custom Message per User**

   - Let users set their own disguised messages
   - Per-contact custom notifications

4. **Notification Channels**

   - Different channels for different chat types
   - Group vs 1-on-1 differentiation (but still disguised)

5. **Schedule-Based Display**
   - "Do Not Disturb" integration
   - Only show during certain hours

---

## 🎯 Best Practices

### For Maximum Privacy:

1. **Use generic app name:** "Wallpaper" not "SecureChat"
2. **Use wallpaper-themed icon:** Not a lock or shield
3. **Disable message previews:** Always (this is already done)
4. **Test on lock screen:** Verify nothing leaks
5. **Educate users:** Explain the disguised notifications

### For User Experience:

1. **Keep messages varied:** Don't repeat same message
2. **Make them believable:** Should sound like real wallpaper app
3. **Don't over-notify:** Respect notification settings
4. **Badge count:** Use sparingly (can reveal message count)

---

## 📝 Code Examples

### Send Notification from Backend (Node.js)

```javascript
const admin = require('firebase-admin');

// Send notification
await admin.messaging().send({
  token: userFCMToken,
  notification: {
    title: senderName,
    body: messageText,
  },
  data: {
    chatId: chatId,
    senderId: senderId,
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
```

**Note:** The app will automatically disguise this on the client side.

### Navigate to Chat on Notification Tap

Update `DisguisedNotificationService.ts`:

```typescript
import {navigationRef} from './navigationRef'; // Create this

export const setupNotificationOpenedApp = () => {
  return messaging().onNotificationOpenedApp(remoteMessage => {
    const chatId = remoteMessage?.data?.chatId;

    if (chatId && navigationRef.isReady()) {
      navigationRef.navigate('ChatScreen', {chatId});
    }
  });
};
```

---

## ✅ Checklist

Before deploying:

- [ ] Notification permissions requested on app start
- [ ] Background handler registered in index.js
- [ ] Foreground handler registered in App.tsx
- [ ] Android notification icon added
- [ ] iOS background modes configured
- [ ] Tested foreground notifications
- [ ] Tested background notifications
- [ ] Tested quit state notifications
- [ ] Tested lock screen display
- [ ] Verified no message content leaks
- [ ] Badge count working (iOS)
- [ ] Notification sound appropriate
- [ ] App name is wallpaper-themed
- [ ] App icon is wallpaper-themed

---

## 🎉 Summary

The Disguised Notifications feature is **fully implemented** and ready to use!

**What you have:**
✅ Automatic notification disguising
✅ Cross-platform support (iOS & Android)
✅ All notification states covered
✅ Privacy-first implementation
✅ User control (enable/disable)
✅ Badge management
✅ Token management

**What you need to do:**

1. Add Android notification icon (5 minutes)
2. Test on real devices
3. Verify no content leaks on lock screen

**Result:**
A truly private messaging app where even notifications maintain your cover. Users get notified of new messages without revealing the app's true purpose.

---

## 🆘 Support

### Common Questions:

**Q: Can users tell apart different types of messages?**
A: No, all notifications look the same for maximum privacy. They check the app to see actual messages.

**Q: What if someone asks why I get so many wallpaper updates?**
A: That's the point - it's a believable cover. Wallpaper apps do send updates frequently.

**Q: Can I show the sender name?**
A: You can, but it defeats the purpose. The goal is complete disguise.

**Q: Does this work with Android Auto / CarPlay?**
A: Yes, but messages will also be disguised there.

---

**Privacy maintained. Notifications disguised. Mission accomplished! 🎯🔐**

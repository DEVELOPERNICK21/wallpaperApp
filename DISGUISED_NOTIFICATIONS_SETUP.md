# 🚀 Quick Setup: Disguised Notifications

## ⚡ 5-Minute Setup Guide

### Step 1: Add Notification Icon (Android)

**Option A: Quick Method (Uses Default)**
The code will use your app's default icon. **No action needed!**

**Option B: Custom Icon (Recommended)**

1. **Generate Icon Online:**

   - Go to: https://romannurik.github.io/AndroidAssetStudio/icons-notification.html
   - **Upload:** A simple wallpaper/gallery icon (white on transparent)
   - **Name:** ic_notification
   - **Click:** Download ZIP

2. **Extract and Copy Files:**

   ```bash
   # Extract the zip file
   # You'll get folders: drawable-hdpi, drawable-mdpi, etc.

   # Copy all folders to:
   android/app/src/main/res/
   ```

3. **Verify Structure:**
   ```
   android/app/src/main/res/
   ├── drawable-hdpi/ic_notification.png
   ├── drawable-mdpi/ic_notification.png
   ├── drawable-xhdpi/ic_notification.png
   ├── drawable-xxhdpi/ic_notification.png
   └── drawable-xxxhdpi/ic_notification.png
   ```

**Icon Suggestions:**

- 🖼️ Picture frame icon
- 🏞️ Landscape/mountain icon
- 🎨 Gallery icon
- 📷 Image icon

---

### Step 2: Rebuild the App

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Rebuild and run
npm run android
```

For iOS:

```bash
cd ios && pod install && cd ..
npm run ios
```

---

### Step 3: Test It!

**Test 1: Foreground (App Open)**

1. Open your app
2. Send a message from another device/emulator
3. ✅ **Expected:** Notification shows "Wallpaper update available"

**Test 2: Background (App Minimized)**

1. Press Home button (don't close app)
2. Send a message
3. ✅ **Expected:** Notification appears with wallpaper message
4. Tap it → App opens

**Test 3: Lock Screen**

1. Lock your device
2. Send a message
3. ✅ **Expected:** Shows "Wallpaper" with disguised message
4. ❌ **Should NOT show:** Sender name or message content

---

## 🎯 What You Get

### Before (Regular Notifications):

```
[App Icon] Wallpaper Chat
John Doe: Hey, how are you?
Just now
```

❌ **Problems:**

- Reveals it's a messaging app
- Shows sender name
- Shows message content
- Privacy compromised

---

### After (Disguised Notifications):

```
[Wallpaper Icon] Wallpaper
Wallpaper update available
Just now
```

✅ **Benefits:**

- Looks like wallpaper app
- No personal info
- Maintains disguise
- Privacy protected

---

## 📋 Verification Checklist

After setup, verify:

- [ ] App builds successfully
- [ ] No console errors about notifications
- [ ] Notification permission granted (check on app start)
- [ ] FCM token generated (check console: "FCM Token: ...")
- [ ] Foreground notification shows disguised message
- [ ] Background notification shows disguised message
- [ ] Lock screen shows disguised message
- [ ] Tapping notification opens app
- [ ] Multiple notifications show different messages (random)
- [ ] No actual message content visible in notifications

---

## 🔧 Troubleshooting

### "Notifications not appearing"

**Solution 1:** Check Permissions

```bash
# Android: Settings → Apps → Wallpaper → Notifications → Allow
# iOS: Settings → Wallpaper → Notifications → Allow
```

**Solution 2:** Check Console Logs

```
Look for:
✅ "Notification permission granted"
✅ "FCM Token: [token]"
❌ "Permission not granted" → Re-request in app
```

**Solution 3:** Reinstall App

```bash
# Android
npm run android

# iOS
npm run ios
```

---

### "Seeing actual message content in notifications"

**This should NOT happen!** If it does:

1. **Verify Files Updated:**

   - Check `index.js` has `handleBackgroundMessage` import
   - Check `App.tsx` has `initializeNotifications` call

2. **Clear Cache:**

   ```bash
   # Clear Metro cache
   npm start -- --reset-cache

   # Rebuild
   npm run android
   ```

3. **Check Service:**
   - Open `DisguisedNotificationService.ts`
   - Verify `displayDisguisedNotification` function exists
   - Should replace message content with disguised message

---

### "App crashes on notification"

**Check:**

1. **Dependencies Installed:**

   ```bash
   npm install @notifee/react-native @react-native-firebase/messaging
   ```

2. **iOS Pods:**

   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android Gradle Sync:**
   - Open Android Studio
   - File → Sync Project with Gradle Files

---

## 📱 Platform-Specific Notes

### Android

**Battery Optimization:**
Some Android devices aggressively kill apps. Users may need to:

1. Settings → Battery → Battery Optimization
2. Find your app → Don't Optimize

**Notification Channels:**
The app creates a channel called "Wallpaper Updates"

- Users can customize sound/vibration per channel
- Channel shows in: Settings → Apps → Wallpaper → Notifications

---

### iOS

**Silent Push (Optional):**
If you want truly silent notifications (no badge/sound):

Edit in `DisguisedNotificationService.ts`:

```typescript
ios: {
  sound: undefined, // No sound
  foregroundPresentationOptions: {
    alert: true,
    badge: false, // No badge
    sound: false, // No sound
  },
}
```

**Badge Count:**
The app manages badge count automatically:

- New message → Badge increments
- Read message → Badge decrements
- Can be customized in service

---

## 🎨 Customization

### Change Disguised Messages

Edit `DisguisedNotificationService.ts`:

```typescript
const DISGUISED_MESSAGES = [
  'Wallpaper update available',
  'New wallpaper collection ready',
  // Add your own messages:
  'Your custom message here',
  'Another custom message',
];
```

**Tips:**

- Keep them wallpaper-themed
- Use variety (random selection)
- Make them believable
- Don't use time-specific phrases

---

### Change App Name in Notifications

**Android:**
Edit `android/app/src/main/res/values/strings.xml`:

```xml
<string name="app_name">Wallpaper</string>
```

**iOS:**
Edit `ios/wallpe/Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>Wallpaper</string>
```

**Suggestions:**

- "Wallpaper"
- "HD Walls"
- "WallpaperHub"
- "Wallz"

---

## 🔐 Security Notes

### What's Protected:

✅ Message content hidden
✅ Sender identity hidden
✅ App purpose disguised
✅ Privacy maintained

### What's Visible:

⚠️ App name ("Wallpaper")
⚠️ App icon (should be wallpaper-themed)
⚠️ That app sent a notification (but content is disguised)

### Recommendations:

1. **Use believable app name** (wallpaper-themed)
2. **Use believable icon** (not a lock or shield)
3. **Test on lock screen** (most vulnerable)
4. **Educate users** about the feature

---

## 📊 Testing Checklist

### Manual Tests:

**Test 1: Foreground**

- [ ] Open app
- [ ] Send message from another device
- [ ] See notification with disguised message
- [ ] No actual content visible

**Test 2: Background**

- [ ] Minimize app (Home button)
- [ ] Send message
- [ ] See notification
- [ ] Tap notification → App opens

**Test 3: Quit State**

- [ ] Force close app (swipe from recent apps)
- [ ] Send message
- [ ] See notification
- [ ] Tap notification → App launches

**Test 4: Lock Screen**

- [ ] Lock device
- [ ] Send message
- [ ] Check lock screen notification
- [ ] Verify no personal info shown
- [ ] Unlock → Tap notification → App opens

**Test 5: Multiple Messages**

- [ ] Send 3-5 messages quickly
- [ ] Each notification shows different disguised message
- [ ] All look like wallpaper updates

---

## 🎉 You're Done!

If all tests pass, congratulations! You now have:

✅ Fully disguised notifications
✅ Maximum privacy protection
✅ Professional implementation
✅ Cross-platform support

Users can now receive message notifications without revealing:

- It's a messaging app
- Who messaged them
- What the message says

**Perfect for journalists, activists, or anyone who values privacy!**

---

## 📞 Need Help?

### Common Issues:

1. **No notifications at all:**

   - Check permissions (system settings)
   - Check FCM token generated
   - Check Firebase Console for errors

2. **Wrong message showing:**

   - Verify service is being used
   - Clear app data and reinstall
   - Check console logs

3. **Notification not opening app:**
   - Check intent filters (Android)
   - Check notification press action
   - Verify app not force-stopped

### Debug Logs:

Check console for these logs:

```
🚀 Initializing disguised notification service...
✅ Notification permission granted
🔑 FCM Token: [your-token]
📬 Message received
📱 Displaying disguised notification
```

If you don't see these, check:

- `initializeNotifications()` is called in App.tsx
- `handleBackgroundMessage()` is used in index.js
- Dependencies are installed

---

## 🚀 Next Steps

1. **Test thoroughly** on real devices
2. **Show someone** the lock screen notifications
3. **Verify privacy** is maintained
4. **Deploy with confidence!**

**Your messaging app is now truly private - even the notifications! 🎯🔐**

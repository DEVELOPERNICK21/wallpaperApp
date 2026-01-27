# 🔄 Wallpaper Auto-Update Setup Guide

## ⚠️ IMPORTANT: Current Implementation Status

### What Works NOW (App-Opened Trigger)
- ✅ Wallpaper updates when user **opens the app**
- ✅ Checks if a day has passed since last update
- ✅ Works on Android
- ✅ Works on iOS (manual only - Apple restriction)

### What Does NOT Work (True Background Updates)
- ❌ Wallpaper does NOT update automatically in background
- ❌ No true daily scheduled updates
- ❌ iOS will NEVER allow automatic wallpaper changes (Apple restriction)

## 🎯 The Reality Check

**Current Implementation = "App-Opened Trigger"**
- When user opens app → checks if update needed → updates wallpaper
- This is NOT a true background task
- Wallpaper is static once set (doesn't update itself)

**What You Need for TRUE Daily Auto-Update:**
- Background task library (react-native-background-fetch)
- Android WorkManager configuration
- Device battery optimization whitelisting
- Still won't work on iOS (Apple restriction)

---

## 📱 Option 1: True Background Tasks (Android Only)

### Step 1: Install Dependencies

```bash
npm install react-native-background-fetch
# or
yarn add react-native-background-fetch
```

### Step 2: Android Configuration

#### 2.1 Update `android/app/src/main/AndroidManifest.xml`

```xml
<manifest>
    <!-- Add permissions -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <application>
        <!-- Add background fetch service -->
        <service
            android:name="com.transistorsoft.rnbackgroundfetch.HeadlessTask"
            android:exported="false" />
    </application>
</manifest>
```

#### 2.2 Update `android/app/build.gradle`

```gradle
dependencies {
    // ... existing dependencies
    implementation 'com.google.android.gms:play-services-location:18.0.0'
}
```

### Step 3: Configure Background Task

The service file is already created at:
`src/services/WallpaperBackgroundService.ts`

**To enable it:**

1. Import the service in your app entry point:
```typescript
import { initializeBackgroundTask } from './src/services/WallpaperBackgroundService';

// When app starts
initializeBackgroundTask();
```

2. The service will:
   - Run daily (minimum 15-minute intervals)
   - Check if wallpaper needs updating
   - Update wallpaper automatically

### Step 4: Device Configuration (CRITICAL)

Users MUST whitelist your app in battery optimization:

**Xiaomi/Huawei/Oppo:**
- Settings → Battery → Battery optimization → Your App → Don't optimize

**Samsung:**
- Settings → Apps → Your App → Battery → Unrestricted

**OnePlus:**
- Settings → Battery → Battery optimization → Your App → Don't optimize

**Generic Android:**
- Settings → Apps → Your App → Battery → Unrestricted / Background activity → Allow

### Step 5: Limitations

⚠️ **Even with background tasks:**
- OEMs may still kill background tasks
- Battery optimization may prevent execution
- Not guaranteed to run exactly at midnight
- Minimum interval is 15 minutes (Android restriction)

---

## 🍎 iOS Reality Check

**iOS will NEVER allow:**
- Automatic wallpaper changes
- Background wallpaper updates
- Programmatic wallpaper setting (except in very limited contexts)

**What iOS users can do:**
1. Open app daily
2. Tap "Set as Wallpaper" button
3. Manually set from Photos app

**Alternative for iOS:**
- Use Widgets (iOS 14+) - but widgets ≠ wallpapers
- Shortcuts automation (user must run manually)

---

## 🔥 Option 2: Live Wallpaper (Android, Native Only)

This is the ONLY way to have a truly dynamic wallpaper that updates in real-time.

### Requirements:
- Native Android development (Kotlin/Java)
- Android WallpaperService API
- Canvas rendering
- React Native bridge (or separate native module)

### Why This is Hard:
- React Native cannot create live wallpapers directly
- Requires native Android code
- Must draw dots on Canvas
- System manages wallpaper lifecycle
- 10x more complex than static wallpaper

### If You Want This:
1. Create native Android module
2. Implement WallpaperService
3. Draw calendar dots on Canvas
4. Recalculate dates in service
5. System redraws automatically

---

## 📋 Option 3: Manual Update (Current Default)

**What most apps do:**
- User opens app
- Taps "Update Wallpaper" button
- Wallpaper updates

**Pros:**
- ✅ Works on all platforms
- ✅ No background task complexity
- ✅ App Store friendly
- ✅ Reliable

**Cons:**
- ❌ Not automatic
- ❌ Requires user action

---

## 🎯 Recommendation

### For MVP/Portfolio:
**Use Option 3 (Manual Update)**
- Simple
- Reliable
- Works everywhere
- Users understand it

### For Production Android App:
**Implement Option 1 (Background Tasks)**
- Install react-native-background-fetch
- Configure WorkManager
- Add clear instructions for battery whitelisting
- Accept that it's not 100% reliable

### For Serious Product:
**Consider Option 2 (Live Wallpaper)**
- True dynamic wallpaper
- Updates automatically
- No background task issues
- But requires native development

---

## 📝 Current Code Status

### What's Implemented:
✅ App-opened trigger (updates when app opens)
✅ Daily check logic
✅ Wallpaper setting functionality
✅ UI with clear limitations shown
✅ Background service structure (ready for react-native-background-fetch)

### What's NOT Implemented:
❌ True background task execution (requires react-native-background-fetch)
❌ Live wallpaper (requires native Android code)
❌ iOS automatic updates (impossible due to Apple restrictions)

---

## 🚀 Next Steps

1. **For immediate use:** Current implementation works when app opens
2. **For true background:** Install react-native-background-fetch and configure
3. **For iOS:** Accept manual-only updates (Apple restriction)
4. **For best UX:** Consider live wallpaper (native Android only)

---

## 📚 Resources

- [react-native-background-fetch Docs](https://github.com/transistorsoft/react-native-background-fetch)
- [Android WorkManager Guide](https://developer.android.com/topic/libraries/architecture/workmanager)
- [Android WallpaperService API](https://developer.android.com/reference/android/service/wallpaper/WallpaperService)
- [iOS Widgets (Alternative)](https://developer.apple.com/documentation/widgetkit)

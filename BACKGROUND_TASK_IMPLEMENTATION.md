# 🔄 Background Task Implementation Guide

## ✅ Implementation Complete!

The background task system for dynamic wallpaper updates is now fully integrated.

---

## 📋 What Was Implemented

### 1. **AndroidManifest.xml Updates**
- ✅ Added background fetch permissions (`WAKE_LOCK`, `RECEIVE_BOOT_COMPLETED`, `FOREGROUND_SERVICE`)
- ✅ Registered headless task service

### 2. **Background Service** (`src/services/WallpaperBackgroundService.ts`)
- ✅ Background fetch configuration
- ✅ Daily update checking logic
- ✅ Wallpaper setting functionality
- ✅ Callback system for calendar capture

### 3. **Headless Task Handler** (`src/services/HeadlessTask.ts`)
- ✅ Handles background tasks when app is terminated
- ✅ Shows notification when update is needed
- ✅ Registered with AppRegistry

### 4. **YearCalendar Integration**
- ✅ Registers capture callback with background service
- ✅ Initializes/stops background tasks based on user preference
- ✅ Auto-updates when app opens (if enabled)

### 5. **Index.js Registration**
- ✅ Headless task imported and registered

---

## 🎯 How It Works

### **Scenario 1: App is Active (Foreground/Background)**
1. Background fetch task fires (every 15+ minutes)
2. Checks if wallpaper needs updating (new day started)
3. If yes, uses registered `captureCalendar()` callback
4. Captures calendar image using ViewShot
5. Sets wallpaper automatically
6. Saves last update date

### **Scenario 2: App is Terminated**
1. Background fetch task fires
2. Headless task handler runs
3. Checks if update needed
4. **Cannot render React components** → Shows notification
5. User opens app → Wallpaper updates automatically

---

## ⚙️ Configuration

### **Enable Auto-Update:**
1. Open Year Calendar component
2. Toggle "Daily Auto-Update" switch ON
3. Select update type (Home/Lock/Both)
4. Background task initializes automatically

### **Disable Auto-Update:**
1. Toggle "Daily Auto-Update" switch OFF
2. Background task stops automatically

---

## 🔧 Technical Details

### **Background Fetch Configuration:**
```typescript
{
  minimumFetchInterval: 15, // Minimum 15 minutes (Android restriction)
  stopOnTerminate: false,    // Continue after app closes
  startOnBoot: true,         // Start on device boot
  enableHeadless: true,      // Enable headless tasks
  requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Works offline
}
```

### **Update Check Logic:**
- Compares last update date with current date
- Only updates if a new day has started
- Prevents multiple updates per day

### **Callback System:**
- YearCalendar registers `captureCalendar()` function
- Background service calls it when update needed
- Works seamlessly when app is active

---

## ⚠️ Limitations & Notes

### **What Works:**
✅ Automatic updates when app is active (foreground/background)
✅ Daily check logic
✅ Prevents duplicate updates
✅ Headless task notifications

### **What Doesn't Work:**
❌ **Cannot render React components in headless mode**
- When app is terminated, headless task can't capture calendar
- Shows notification instead
- User must open app to complete update

### **Why This Limitation Exists:**
- React Native components require React context
- Headless tasks run in isolated JavaScript context
- No access to ViewShot or component rendering

### **Solutions for True Headless Updates:**

#### **Option 1: Native Module** (Recommended for production)
- Create native Android module
- Generate calendar image using Canvas/Skia
- No React components needed
- True background updates

#### **Option 2: Pre-generated Images**
- Generate calendar images for entire year
- Store in app/assets
- Headless task selects correct image
- Limited flexibility

#### **Option 3: Server-Side Rendering**
- Generate calendar images on server
- Headless task downloads and sets
- Requires internet connection

---

## 📱 User Experience

### **Best Case (App Active):**
1. Background task fires
2. Calendar captures automatically
3. Wallpaper updates seamlessly
4. User sees updated wallpaper

### **Worst Case (App Terminated):**
1. Background task fires
2. Notification appears
3. User opens app
4. Wallpaper updates automatically

### **Typical Case:**
- Most users open app daily anyway
- Wallpaper updates when they open app
- Background task ensures it happens automatically
- No user interaction needed

---

## 🧪 Testing

### **Test Background Task:**
1. Enable auto-update
2. Set wallpaper manually (to set last update date)
3. Change device date to tomorrow
4. Wait for background task (or trigger manually in dev)
5. Check if wallpaper updates

### **Test Headless Task:**
1. Enable auto-update
2. Force close app
3. Wait for background task
4. Check notification appears
5. Open app
6. Verify wallpaper updates

---

## 🚀 Next Steps (Optional Enhancements)

### **For Production:**
1. **Native Module** for headless calendar rendering
2. **Battery optimization** whitelist instructions in UI
3. **Status indicator** showing last update time
4. **Error handling** for failed updates
5. **Analytics** for update success rate

### **For Better UX:**
1. **Silent updates** when app is active
2. **Notification** only when app terminated
3. **Update history** log
4. **Manual refresh** button

---

## 📚 Files Modified/Created

### **Modified:**
- `android/app/src/main/AndroidManifest.xml` - Added permissions & service
- `index.js` - Registered headless task
- `src/component/YearCalendar/YearCalendar.tsx` - Integrated background service

### **Created:**
- `src/services/WallpaperBackgroundService.ts` - Background service
- `src/services/HeadlessTask.ts` - Headless task handler
- `src/utils/CalendarImageGenerator.ts` - Utility (for future native module)

---

## ✅ Status: **READY FOR USE**

The background task system is fully implemented and ready to use. It will:
- ✅ Update wallpaper automatically when app is active
- ✅ Show notifications when app is terminated
- ✅ Prevent duplicate updates
- ✅ Work seamlessly with user preferences

**Note:** For true headless updates (without user opening app), you'll need to implement a native module for calendar image generation.

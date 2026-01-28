# 📱 Dynamic Wallpaper Update - How It Works

## ⚠️ IMPORTANT: Install Required Package First!

You need to install `react-native-view-shot` to capture the calendar as an image:

```bash
yarn add react-native-view-shot
# or
npm install react-native-view-shot
```

Then rebuild your app:
```bash
# Android
cd android && ./gradlew clean && cd ..
yarn android

# iOS
cd ios && pod install && cd ..
yarn ios
```

---

## 🔄 How Dynamic Wallpaper Updates Work

### **Current Implementation:**

#### ✅ **What IS Dynamic:**
1. **Calendar dots update automatically** based on current date
   - Every time the component renders, it calculates:
     - Days passed in the year
     - Today's date
     - Which dots should be filled
   - The visual representation is always current

2. **When app is ACTIVE (foreground/background):**
   - Background task runs every 15+ minutes
   - Checks if a new day started
   - If yes → Captures calendar → Sets wallpaper automatically
   - **No user interaction needed!**

#### ⚠️ **What is NOT Fully Dynamic:**

1. **When app is TERMINATED:**
   - Background task runs
   - Cannot render React components (limitation)
   - Shows notification instead
   - User opens app → Wallpaper updates automatically

2. **Wallpaper itself is static:**
   - Once set, wallpaper is a JPG image
   - It doesn't change until you update it again
   - This is how Android/iOS wallpapers work (they're images, not live)

---

## 🎯 Real-World Behavior

### **Scenario 1: User Opens App Daily** (Most Common)
- ✅ User opens app
- ✅ Calendar renders with current date
- ✅ Background task checks if update needed
- ✅ If new day → Captures & updates wallpaper automatically
- ✅ **Result: Wallpaper stays up-to-date**

### **Scenario 2: User Doesn't Open App**
- ⚠️ Background task runs (every 15+ minutes)
- ⚠️ If app is terminated → Shows notification
- ⚠️ User opens app → Wallpaper updates
- ⚠️ **Result: Wallpaper updates when user opens app**

### **Scenario 3: App Always Running** (Best Case)
- ✅ Background task runs regularly
- ✅ Calendar captures automatically
- ✅ Wallpaper updates daily without user opening app
- ✅ **Result: True automatic updates**

---

## 🔧 Technical Details

### **How Calendar Updates:**
```typescript
// Every render, calculates current progress
const today = new Date();
const startOfYear = new Date(currentYear, 0, 1);
const daysPassed = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

// Dots are colored based on:
- daysPassed → filled dots (white)
- daysPassed - 1 → today's dot (orange)
- future days → empty dots (white with opacity)
```

### **How Background Task Works:**
```typescript
// Background task runs every 15+ minutes
BackgroundFetch.configure({
  minimumFetchInterval: 15,
  // ...
}, async (taskId) => {
  // Check if new day started
  const needsUpdate = await shouldUpdateWallpaper();
  
  if (needsUpdate && app is active) {
    // Capture calendar
    const image = await captureCalendar();
    // Set wallpaper
    await setWallpaper(image);
  }
});
```

---

## ✅ Is It Really Dynamic?

### **YES, if:**
- ✅ App is active (foreground/background)
- ✅ Background task is enabled
- ✅ Device allows background tasks
- ✅ Battery optimization is disabled for your app

### **PARTIALLY, if:**
- ⚠️ App is terminated
- ⚠️ Shows notification instead
- ⚠️ Updates when user opens app

### **NO, if:**
- ❌ Background tasks are disabled
- ❌ Device kills background tasks (Xiaomi, Huawei, etc.)
- ❌ Battery optimization blocks tasks

---

## 🚀 To Make It More Dynamic:

### **Option 1: Ensure App Stays Active**
- Whitelist app in battery optimization
- Keep app in background
- Background tasks will run regularly

### **Option 2: Native Live Wallpaper** (Advanced)
- Create native Android module
- Use WallpaperService API
- Draw calendar directly on Canvas
- Updates automatically without background tasks

### **Option 3: Widget** (iOS Alternative)
- Create iOS widget
- Shows calendar on home screen
- Updates automatically
- But it's a widget, not wallpaper

---

## 📋 Summary

**Your wallpaper WILL update dynamically IF:**
1. ✅ `react-native-view-shot` is installed
2. ✅ Auto-update is enabled
3. ✅ App is active (or user opens it daily)
4. ✅ Background tasks are allowed

**It's "dynamic" in the sense that:**
- Calendar always shows current date
- Wallpaper updates automatically when app is active
- No manual intervention needed (when app is active)

**It's NOT "dynamic" in the sense that:**
- Wallpaper doesn't change itself (it's a static image)
- Requires app to be active for automatic updates
- When terminated, needs user to open app

---

## 🎯 Bottom Line

**For most users:** Open app daily → Wallpaper updates automatically ✅

**For power users:** Keep app active → True automatic updates ✅

**For perfection:** Need native live wallpaper (complex) 🔥

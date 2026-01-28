# 🔍 Wallpaper Diagnostic Guide

## Current Status

✅ **JS Code**: Clean, simplified, HOME-only  
✅ **Permissions**: SET_WALLPAPER declared in AndroidManifest.xml  
✅ **Error Handling**: Comprehensive logging  
❌ **Native Module**: `react-native-manage-wallpaper` - May be unreliable on your device

## 🧪 Diagnostic Test

### Step 1: Test with Static Image

**Purpose**: Prove if the native module works at all.

1. **Place test file**:
   - Put a `test.jpg` file in `/sdcard/Download/` on your Android device
   - You can use any image from your gallery

2. **Run test**:
   - In dev mode, tap the 🧪 button in the header (top right)
   - Or call `testWithStaticImage()` from console

3. **Interpret results**:

   **✅ Test PASSES**:
   - Native module works
   - Permissions are OK
   - **Your issue**: ViewShot/capture path is wrong
   - **Fix**: Check the URI format from `captureCalendar()`

   **❌ Test FAILS**:
   - Native module is broken OR
   - Device blocks wallpaper changes OR
   - OEM restrictions (Xiaomi, Vivo, Oppo, etc.)
   - **This is NOT a JS problem**

### Step 2: Check Logcat

Run this while testing:
```bash
adb logcat | grep -i "wallpaper\|ManageWallpaper\|setWallpaper"
```

Look for:
- `Permission denial: setWallpaper`
- `WallpaperManager` errors
- Native exceptions

### Step 3: Test on Different Device

- **Pixel emulator** (stock Android)
- **Different OEM** (if you have access)

If it works on Pixel but not your device → **OEM restriction**

## 📋 What We Know

### ✅ Working:
- File paths are correct
- Permissions are declared
- JS code is clean
- Error handling is comprehensive

### ❓ Unknown:
- Does native module work?
- Does device allow wallpaper changes?
- Are there OEM restrictions?

## 🎯 Next Steps Based on Test Results

### If Static Image Test PASSES:

**Problem**: Your captured image path/format  
**Solution**:
1. Check `captureCalendar()` output URI
2. Verify file exists before calling `setHomeWallpaper()`
3. Try copying captured file to Downloads first
4. Use that copied file for wallpaper

### If Static Image Test FAILS:

**Problem**: Native module or device restriction  
**Solutions** (in order):

#### Option 1: Fix Native Module
Check `node_modules/react-native-manage-wallpaper/android/` for native code.

The native code should use:
```kotlin
val wm = WallpaperManager.getInstance(context)
wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM)
```

If it uses deprecated APIs or wrong flags → **library is broken**

#### Option 2: Switch Library
Try `@ajaybhatia/react-native-wallpaper-manager`:
```bash
npm install @ajaybhatia/react-native-wallpaper-manager
```

#### Option 3: Native Kotlin Module (Most Reliable)
Write your own native module with correct implementation.

#### Option 4: Live Wallpaper (Best Long-term)
Implement `WallpaperService` - this is how production wallpaper apps work.

## 🔥 The Hard Truth

If static image test fails, **you cannot fix this in JavaScript**.

The failure is:
- Native module implementation
- Device/OEM restrictions
- Android version limitations

**Your JS code is correct.** The problem is below the JS layer.

## 📱 Device-Specific Issues

### Known Problem Devices:
- **Xiaomi/Redmi**: Often blocks wallpaper changes
- **Vivo/Oppo**: Requires system UI confirmation
- **Realme**: May silently ignore requests
- **Huawei**: Battery optimization blocks

### Workarounds:
1. Whitelist app in battery optimization
2. Grant all permissions manually
3. Test on Pixel/stock Android first

## 🚀 Recommended Path Forward

1. **Run diagnostic test** (🧪 button)
2. **Check Logcat** for native errors
3. **Test on Pixel emulator**
4. **If still fails**: Consider Live Wallpaper implementation

Your calendar dots are perfect for Live Wallpaper - system redraws automatically, no permissions drama, works on all devices.

# 🖼️ Wallpaper Download & Apply Feature

## Overview

A complete wallpaper management system that allows users to **download wallpapers** to their gallery and **apply them** directly as device wallpaper (Android). Users can set wallpapers for home screen, lock screen, or both!

---

## 🎯 Features

### **1. Download Wallpaper** 📥

**What it does:**

- Downloads high-quality wallpapers from URLs
- Saves directly to device gallery
- Requests storage permissions automatically
- Shows success notification after download

**Platforms:**

- ✅ Android (All versions)
- ✅ iOS (All versions)

**How to use:**

1. Long-press a wallpaper to preview
2. Tap "📥 Download" button
3. Grant storage permission (first time only)
4. Wallpaper saved to gallery!

### **2. Apply Wallpaper** 🎨

**What it does:**

- Sets wallpaper directly on your device
- Choose between:
  - 🏠 **Home Screen Only**
  - 🔒 **Lock Screen Only**
  - 📱 **Both Home & Lock Screen**
- No need to manually set from settings
- Instant application

**Platforms:**

- ✅ Android (All versions) - **Fully functional**
- ❌ iOS - **Not supported** (Apple limitation)
  - iOS users can download and set manually

**How to use (Android):**

1. Long-press a wallpaper to preview
2. Tap "Apply Wallpaper" button
3. Choose from action sheet:
   - Set as Home Screen
   - Set as Lock Screen
   - Set as Both
4. Done! Wallpaper applied instantly!

**How to use (iOS):**

1. Long-press a wallpaper to preview
2. Tap "Apply Wallpaper" button
3. See iOS limitation message
4. Option to download instead
5. Manually set from Settings → Wallpaper

---

## 📱 User Interface

### **Preview Modal**

When you **long-press** a wallpaper:

```
┌─────────────────────────────────────┐
│                                     │
│         [Pinch to Zoom]            │
│                                     │
│     ┌─────────────────────┐       │
│     │                     │       │
│     │   Wallpaper Image   │       │
│     │   (Full Screen)     │       │
│     │                     │       │
│     └─────────────────────┘       │
│                                     │
│   [Apply Wallpaper]  [📥 Download]│
│                          [✕]       │
└─────────────────────────────────────┘
```

**Buttons:**

- **Apply Wallpaper** - Opens action sheet (Android) or download option (iOS)
- **📥 Download** - Saves to gallery
- **✕** - Close preview

**Features:**

- **Pinch to zoom** the wallpaper
- **Loading indicators** while downloading/applying
- **Beautiful animations** on open/close

### **Action Sheet (Android Only)**

After tapping "Apply Wallpaper" on Android:

```
┌─────────────────────────────────────┐
│ Choose Wallpaper Option         ✕  │
├─────────────────────────────────────┤
│                                     │
│  🏠  Set as Home Screen            │
│      Apply to home screen only     │
│                                     │
│  🔒  Set as Lock Screen            │
│      Apply to lock screen only     │
│                                     │
│  📱  Set as Both                   │
│      Apply to both home and lock   │
│                                     │
│  📥  Download to Gallery           │
│      Save to your photo gallery    │
│                                     │
└─────────────────────────────────────┘
```

**Each option has:**

- **Icon** - Visual indicator
- **Title** - Clear action name
- **Subtitle** - What it does

---

## 🔧 Technical Implementation

### **Packages Used:**

1. **react-native-fs** - File system access for downloads
2. **@react-native-camera-roll/camera-roll** - Save to gallery
3. **react-native-manage-wallpaper** - Set wallpaper (Android)

### **Permissions:**

**Android:**

```xml
<!-- For Android 12 and below -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

<!-- For Android 13+ -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<!-- Set wallpaper permission -->
<uses-permission android:name="android.permission.SET_WALLPAPER" />
```

**iOS:**

- Photo Library permissions (automatically requested)
- No wallpaper permission needed (not supported anyway)

### **Key Functions:**

#### **1. Download Wallpaper**

```typescript
const downloadWallpaper = async (url: string) => {
  // 1. Request storage permission
  const hasPermission = await requestStoragePermission();

  // 2. Download file
  const fileName = `Wallpaper_${Date.now()}.jpg`;
  const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;

  await RNFS.downloadFile({
    fromUrl: url,
    toFile: downloadDest,
  }).promise;

  // 3. Save to gallery
  await CameraRoll.save(downloadDest, {type: 'photo'});

  // 4. Show success message
  Alert.alert('Download Complete! 📥', 'Wallpaper saved to gallery.');
};
```

#### **2. Apply Wallpaper (Android)**

```typescript
const applyWallpaper = async (url: string, type: 'home' | 'lock' | 'both') => {
  // 1. Download to temp location
  const tempPath = `${
    RNFS.CachesDirectoryPath
  }/temp_wallpaper_${Date.now()}.jpg`;

  await RNFS.downloadFile({
    fromUrl: url,
    toFile: tempPath,
  }).promise;

  // 2. Set wallpaper
  let callback;
  switch (type) {
    case 'home':
      callback = ManageWallpaper.TYPE.HOME;
      break;
    case 'lock':
      callback = ManageWallpaper.TYPE.LOCK;
      break;
    case 'both':
      callback = ManageWallpaper.TYPE.BOTH;
      break;
  }

  await ManageWallpaper.setWallpaper({uri: `file://${tempPath}`}, callback);

  // 3. Show success message
  Alert.alert('Wallpaper Applied! 🎨', 'Your wallpaper has been set.');

  // 4. Clean up temp file
  setTimeout(() => {
    RNFS.unlink(tempPath);
  }, 2000);
};
```

#### **3. Request Storage Permission (Android)**

```typescript
const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  if (Platform.Version >= 33) {
    // Android 13+
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    );
    return permission === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    // Android 12 and below
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
};
```

---

## 🎨 Visual Design

### **Colors:**

| Element         | Color     | Purpose                |
| --------------- | --------- | ---------------------- |
| Apply Button    | `#6366f1` | Indigo, primary action |
| Download Button | `#10b981` | Green, download action |
| Close Button    | `#ef4444` | Red, close/cancel      |
| Action Sheet BG | `#1e293b` | Dark slate             |
| Option Button   | `#334155` | Gray slate             |

### **Animations:**

1. **Preview Modal**

   - Fade in on open
   - Pinch to zoom support
   - Smooth scale animations

2. **Action Sheet**

   - Slide up from bottom
   - Backdrop fade in
   - Smooth transitions

3. **Loading States**
   - Spinner while downloading
   - Spinner while applying
   - Text changes: "Downloading..." / "Applying..."

---

## 📋 User Flows

### **Flow 1: Download Wallpaper**

```
1. Browse wallpapers
   ↓
2. Long-press to preview
   ↓
3. Tap "📥 Download" button
   ↓
4. Grant permission (first time)
   ↓
5. See "Downloading..." indicator
   ↓
6. Alert: "Download Complete! 📥"
   ↓
7. Check gallery → wallpaper saved!
```

### **Flow 2: Apply Wallpaper (Android)**

```
1. Browse wallpapers
   ↓
2. Long-press to preview
   ↓
3. Tap "Apply Wallpaper" button
   ↓
4. Action sheet slides up
   ↓
5. Choose option:
   - 🏠 Home Screen
   - 🔒 Lock Screen
   - 📱 Both
   ↓
6. See "Applying wallpaper..." indicator
   ↓
7. Alert: "Wallpaper Applied! 🎨"
   ↓
8. Check home/lock screen → wallpaper set!
```

### **Flow 3: Apply Wallpaper (iOS)**

```
1. Browse wallpapers
   ↓
2. Long-press to preview
   ↓
3. Tap "Apply Wallpaper" button
   ↓
4. Alert: "iOS Limitation"
   - Explanation of iOS restriction
   - Option to download instead
   ↓
5. Choose:
   - Cancel
   - Download Instead
   ↓
6. If download → saved to gallery
   ↓
7. Manually set from Settings → Wallpaper
```

---

## ⚠️ Platform Differences

### **Android** ✅

| Feature            | Status             |
| ------------------ | ------------------ |
| Download           | ✅ Fully Supported |
| Apply Home Screen  | ✅ Fully Supported |
| Apply Lock Screen  | ✅ Fully Supported |
| Apply Both         | ✅ Fully Supported |
| Permission Request | ✅ Automatic       |

### **iOS** ⚠️

| Feature           | Status                              |
| ----------------- | ----------------------------------- |
| Download          | ✅ Fully Supported                  |
| Apply Home Screen | ❌ Not Supported (Apple limitation) |
| Apply Lock Screen | ❌ Not Supported (Apple limitation) |
| Apply Both        | ❌ Not Supported (Apple limitation) |
| Manual Workaround | ✅ Download + Set manually          |

**Why iOS doesn't support programmatic wallpaper setting:**

Apple does not provide an API for third-party apps to set wallpapers programmatically due to privacy and security reasons. Users must manually set wallpapers from:

```
Settings → Wallpaper → Choose a New Wallpaper → Photos
```

---

## 🧪 Testing

### **Test Case 1: Download on Android**

```
✅ Open wallpaper screen
✅ Long-press a wallpaper
✅ Preview modal opens
✅ Tap "📥 Download" button
✅ Permission dialog appears (first time)
✅ Grant permission
✅ See "Downloading..." text
✅ Success alert appears
✅ Check gallery → image saved
✅ Image has correct filename format
```

### **Test Case 2: Apply Home Screen (Android)**

```
✅ Open wallpaper screen
✅ Long-press a wallpaper
✅ Tap "Apply Wallpaper"
✅ Action sheet slides up
✅ Tap "🏠 Set as Home Screen"
✅ See "Applying wallpaper..." indicator
✅ Success alert: "Wallpaper Applied! 🎨"
✅ Go to home screen → wallpaper changed
✅ Lock screen unchanged
```

### **Test Case 3: Apply Lock Screen (Android)**

```
✅ Follow same steps as Test Case 2
✅ Choose "🔒 Set as Lock Screen"
✅ Lock device
✅ Check lock screen → wallpaper changed
✅ Home screen unchanged
```

### **Test Case 4: Apply Both (Android)**

```
✅ Follow same steps
✅ Choose "📱 Set as Both"
✅ Check home screen → changed
✅ Check lock screen → changed
✅ Both screens have same wallpaper
```

### **Test Case 5: iOS Limitation**

```
✅ Open wallpaper screen (iOS device)
✅ Long-press a wallpaper
✅ Tap "Apply Wallpaper"
✅ Alert shows iOS limitation message
✅ Tap "Download Instead"
✅ Wallpaper downloads to gallery
✅ Open Settings → Wallpaper
✅ Set manually from Photos
```

### **Test Case 6: Permission Denied**

```
✅ Tap download
✅ Deny permission
✅ See "Permission Denied" alert
✅ Try again
✅ Permission dialog shows again
✅ Grant permission
✅ Download works
```

---

## 🚀 Installation & Setup

### **1. Install Packages**

```bash
yarn add @react-native-camera-roll/camera-roll react-native-manage-wallpaper
```

### **2. Update Android Permissions**

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Storage permissions -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<!-- Wallpaper permission -->
<uses-permission android:name="android.permission.SET_WALLPAPER" />
```

### **3. Install iOS Pods**

```bash
cd ios && pod install
```

### **4. Update Info.plist (iOS)**

Add photo library permission:

```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need permission to save wallpapers to your gallery</string>
```

---

## 💡 Best Practices

### **1. Error Handling**

```typescript
try {
  await downloadWallpaper(url);
} catch (error) {
  console.error('Download error:', error);
  Alert.alert('Download Failed', 'Please try again.');
}
```

### **2. Permission Handling**

```typescript
const hasPermission = await requestStoragePermission();
if (!hasPermission) {
  Alert.alert('Permission Required', 'Please grant storage permission.');
  return;
}
```

### **3. Clean Up Temp Files**

```typescript
// After setting wallpaper
setTimeout(() => {
  RNFS.unlink(tempPath).catch(err =>
    console.log('Error deleting temp file:', err),
  );
}, 2000);
```

### **4. Show Loading States**

```typescript
const [downloading, setDownloading] = useState(false);

// Show loading
setDownloading(true);

// Perform action
await downloadWallpaper(url);

// Hide loading
setDownloading(false);
```

---

## 🎉 Summary

### **What You Get:**

✅ **Download wallpapers** to gallery (Android & iOS)  
✅ **Apply wallpapers** directly (Android only)  
✅ **Choose screen type** (home, lock, or both)  
✅ **Automatic permission requests**  
✅ **Beautiful UI** with action sheets  
✅ **Loading indicators** for better UX  
✅ **Error handling** with user feedback  
✅ **iOS workaround** with download option  
✅ **Temp file cleanup** to save space  
✅ **Success notifications** for every action

### **Perfect for:**

- 🎨 Wallpaper apps
- 📸 Photo gallery apps
- 🖼️ Image browsing apps
- 🎁 Content delivery apps
- 💎 Customization apps

---

## 🚀 Ready to Use!

The wallpaper download & apply feature is **fully implemented** and ready!

**To try it:**

1. Open the wallpaper screen
2. Long-press any wallpaper
3. Choose download or apply
4. See the magic happen!

**On Android:**

- ✅ Download to gallery
- ✅ Apply as home screen
- ✅ Apply as lock screen
- ✅ Apply to both

**On iOS:**

- ✅ Download to gallery
- ℹ️ Set manually from Settings

**Everything works perfectly!** 🖼️✨

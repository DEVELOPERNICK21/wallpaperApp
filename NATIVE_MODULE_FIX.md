# 🔧 Native Module Fix - "Native module not found"

## Problem
After installing `react-native-get-random-values`, you're getting "Native module not found" error.

## Solution

### For iOS:

1. **Install Pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Clean Build:**
   ```bash
   # Clean Xcode build folder
   cd ios
   xcodebuild clean
   cd ..
   ```

3. **Rebuild App:**
   ```bash
   npm run ios
   # OR
   npx react-native run-ios
   ```

### For Android:

1. **Clean Build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Rebuild App:**
   ```bash
   npm run android
   # OR
   npx react-native run-android
   ```

### Universal Steps (Both Platforms):

1. **Clear Metro Cache:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Stop Metro Bundler** (if running)

3. **Rebuild the app completely**

---

## Why This Happens

React Native 0.77 uses **autolinking**, which should automatically link native modules. However, after installing a new native module, you need to:

- **iOS:** Run `pod install` to link the native module
- **Android:** Usually auto-linked, but sometimes needs a clean rebuild
- **Both:** Rebuild the app completely

---

## Verification

After rebuilding, check:

1. **Console logs** should show no "Native module not found" errors
2. **Key initialization** should work without errors
3. **You should see:** `✅ Encryption keys initialized successfully`

---

## If Still Not Working

1. **Check if module is installed:**
   ```bash
   npm list react-native-get-random-values
   ```

2. **Verify import in index.js:**
   ```javascript
   import 'react-native-get-random-values';
   ```
   Should be at the very top, before any other imports.

3. **Check node_modules:**
   ```bash
   ls node_modules/react-native-get-random-values
   ```

4. **Try reinstalling:**
   ```bash
   npm uninstall react-native-get-random-values
   npm install react-native-get-random-values@1.11.0 --legacy-peer-deps
   ```

5. **For iOS, check Podfile.lock:**
   ```bash
   cd ios
   pod install --repo-update
   ```

---

**Last Updated:** Auto-generated


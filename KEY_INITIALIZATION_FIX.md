# 🔧 Key Initialization Fix Guide

## Error: "Failed to Initialize Keys"

If you're getting this error when trying to initialize encryption keys, follow these steps:

---

## Quick Fixes

### 1. **Check Device Status**
- ✅ Ensure your device is **unlocked**
- ✅ Make sure the app has **keychain access permissions**
- ✅ Check if **biometric authentication** is blocking (Face ID/Touch ID)

### 2. **Check Internet Connection**
- ✅ Ensure you have **active internet connection**
- ✅ Check if Firestore is accessible
- ✅ Try switching between WiFi and mobile data

### 3. **Try Logging Out and Back In**
1. Log out completely
2. Close the app
3. Reopen the app
4. Log back in
5. Keys should initialize automatically

---

## Common Error Messages & Solutions

### Error: "Unable to access device keychain"
**Cause:** Device keychain is locked or inaccessible

**Solutions:**
1. Unlock your device
2. Go to Settings → Face ID & Passcode (or Touch ID & Passcode)
3. Ensure the app has keychain access
4. Try initializing keys again

---

### Error: "Biometric authentication failed"
**Cause:** Face ID/Touch ID is blocking keychain access

**Solutions:**
1. Go to Settings → Face ID & Passcode
2. Check if the app is enabled for Face ID/Touch ID
3. Try using your passcode instead
4. Disable biometrics temporarily and try again

---

### Error: "Network error" or "Failed to store public keys in Firestore"
**Cause:** Cannot connect to Firestore

**Solutions:**
1. Check your internet connection
2. Verify Firestore is accessible
3. Check Firestore security rules allow write access
4. Try again after a few seconds

---

### Error: "Permission denied"
**Cause:** Firestore security rules blocking write

**Solutions:**
1. Check Firebase Console → Firestore → Rules
2. Ensure users can write to `Users/{userId}` collection
3. Example rule:
   ```
   match /Users/{userId} {
     allow write: if request.auth != null && request.auth.uid == userId;
   }
   ```

---

### Error: "Invalid user ID"
**Cause:** User ID is missing or invalid

**Solutions:**
1. Log out and log back in
2. Ensure you're properly authenticated
3. Check console logs for user ID

---

## Step-by-Step Diagnostic

### Check Console Logs

When you try to initialize keys, check for these logs:

**Success:**
```
🔄 Force re-initializing encryption keys for user: [ID]
✅ Key pair generated
✅ Public key encoded
✅ Private key stored in keychain
✅ Public keys stored in Firestore
✅ Keys force re-initialized successfully
```

**Failure:**
```
❌ Error storing private key in keychain: [error]
❌ Error storing public keys in Firestore: [error]
```

### Verify Keychain Access

The app needs keychain access to store your private key. If you see keychain errors:

1. **iOS:** Go to Settings → [Your App] → Enable Keychain Sharing
2. **Android:** Keychain access is usually automatic, but check app permissions

### Verify Firestore Access

Check if you can write to Firestore:

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Try creating a test document manually
4. If it fails, check security rules

---

## Advanced Troubleshooting

### If Nothing Works

1. **Clear App Data** (Last Resort)
   - iOS: Delete and reinstall app
   - Android: Settings → Apps → [Your App] → Clear Data
   - **Warning:** This will delete all local data including keys

2. **Check Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /Users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

3. **Check Keychain Permissions**
   - iOS: Check Info.plist for keychain sharing entitlements
   - Android: Usually automatic, but check AndroidManifest.xml

4. **Check Network Connectivity**
   - Ensure Firestore is reachable
   - Check firewall/proxy settings
   - Try on different network

---

## Prevention

### Ensure Proper Setup

1. **On First Login:**
   - Keys should initialize automatically
   - Check console for "✅ Encryption keys initialized successfully"
   - If you see errors, log out and back in

2. **Regular Checks:**
   - App checks for keys before sending messages
   - If keys are missing, you'll be prompted to initialize
   - Don't ignore key initialization errors

3. **Backup Strategy:**
   - Keys are stored locally (can't be backed up)
   - If you lose keys, old encrypted messages become unreadable
   - This is by design for security

---

## Technical Details

### Key Storage Locations

- **Private Key:** Device keychain (secure, local only)
- **Public Key:** Firestore `Users/{userId}/publicKeys`

### Key Initialization Process

1. Generate new key pair (NaCl box)
2. Encode public key to base64
3. Store private key in keychain
4. Store public key in Firestore
5. Verify both storage operations succeeded

### Why Initialization Can Fail

1. **Keychain Issues:**
   - Device locked
   - Biometric authentication failed
   - Keychain permissions denied
   - Storage full

2. **Firestore Issues:**
   - Network connectivity
   - Permission denied (security rules)
   - Firestore service unavailable
   - Invalid user ID

---

## Still Having Issues?

If you've tried everything above and still can't initialize keys:

1. **Check Console Logs** - Look for specific error messages
2. **Try Different Device** - Rule out device-specific issues
3. **Check Firebase Status** - Ensure Firestore is operational
4. **Contact Support** - Provide error messages and logs

---

**Last Updated:** Auto-generated  
**Related Files:**
- `src/services/EncryptionService.ts`
- `src/screens/ChatScreen/ChatScreen.js`


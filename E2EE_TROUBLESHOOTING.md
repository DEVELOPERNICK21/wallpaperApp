# 🔐 E2E Encryption Troubleshooting Guide

## Error: "Failed to encrypt message. Sending as plain text."

This error occurs when the app cannot encrypt your message. The app will now **prevent sending** unencrypted messages in 1-on-1 chats to maintain security.

---

## Common Causes & Solutions

### 1. **Your Encryption Keys Are Missing**

**Error Message:**
> "Your encryption keys are missing. Please log out and log back in to initialize your keys."

**Cause:**
- Your private key is missing from device storage
- Keys were not initialized during login
- Device storage was cleared

**Solution:**
1. Log out of the app
2. Log back in
3. Keys will be automatically initialized on login
4. Try sending the message again

---

### 2. **Recipient's Encryption Keys Are Missing**

**Error Message:**
> "Recipient's encryption keys are missing. They need to log in to initialize their keys."

**Cause:**
- The person you're messaging hasn't logged in since encryption was implemented
- Their keys were not initialized
- Their keys were deleted from Firestore

**Solution:**
1. Ask the recipient to log out and log back in
2. Once they log in, their keys will be automatically initialized
3. Try sending the message again

---

### 3. **Invalid Key Format**

**Error Message:**
> "Invalid recipient public key format" or "Invalid key format detected"

**Cause:**
- Keys were corrupted during storage
- Keys were manually modified
- Database migration issue

**Solution:**
1. Log out and log back in (both users)
2. This will regenerate keys with correct format
3. Try sending the message again

---

### 4. **Public Keys Not Found in Firestore**

**Error Message:**
> "Recipient's encryption keys not found. User ID: [ID]. They may need to log in again to initialize their keys."

**Cause:**
- Public keys were not saved to Firestore during initialization
- Firestore document was deleted
- User document doesn't exist

**Solution:**
1. Ask the recipient to log out and log back in
2. This will recreate their public keys in Firestore
3. Try sending the message again

---

## How to Verify Your Keys Are Set Up

### Check Console Logs

When you log in, you should see:
```
🔐 Initializing encryption keys for user: [your-user-id]
✅ Encryption keys initialized successfully
```

Or if keys already exist:
```
✅ Encryption keys already exist
```

### Check Firestore

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Open `Users` collection
4. Find your user document
5. Check if `publicKeys` field exists with `identityPublicKey`

### Check Device Keychain

The private key is stored securely in the device keychain. You can verify it exists by checking the app logs when trying to encrypt.

---

## Step-by-Step Fix

### For Sender (You):

1. **Log out** of the app completely
2. **Log back in** with your credentials
3. Wait for keys to initialize (check console logs)
4. Try sending the message again

### For Recipient:

1. Ask them to **log out** of the app
2. Ask them to **log back in**
3. Wait for their keys to initialize
4. Try sending the message again

---

## Prevention

### Ensure Keys Are Initialized

Keys are automatically initialized on login. Make sure:
- ✅ Login process completes successfully
- ✅ No errors during key initialization
- ✅ Console shows "✅ Encryption keys initialized successfully"

### For New Users

When a new user signs up:
1. Keys are automatically created on first login
2. Public keys are stored in Firestore
3. Private keys are stored in device keychain

---

## Debugging

### Enable Detailed Logging

Check your console/logs for:
- `🔐 Initializing encryption keys for user: [ID]`
- `✅ Encryption keys initialized successfully`
- `❌ Error encrypting message: [error details]`
- `❌ Error initializing encryption keys: [error details]`

### Common Error Patterns

**Pattern 1: Keys not initialized**
```
❌ Error encrypting message: Your encryption keys not found
```
→ Solution: Log out and log back in

**Pattern 2: Recipient keys missing**
```
❌ Error encrypting message: Recipient's encryption keys not found
```
→ Solution: Ask recipient to log out and log back in

**Pattern 3: Key format error**
```
❌ Error encrypting message: Invalid recipient public key format
```
→ Solution: Both users log out and log back in

---

## Technical Details

### Key Storage

- **Private Keys**: Stored in device keychain (`react-native-keychain`)
  - Accessible only to your app
  - Never leaves the device
  - Deleted if app is uninstalled

- **Public Keys**: Stored in Firestore (`Users/{userId}/publicKeys`)
  - Safe to store publicly
  - Used by others to encrypt messages for you
  - Persists across devices

### Key Initialization Flow

1. User logs in
2. App checks if keys exist (`hasKeys()`)
3. If keys don't exist:
   - Generate new key pair
   - Store private key in keychain
   - Store public key in Firestore
4. If keys exist:
   - Skip initialization
   - Use existing keys

---

## Still Having Issues?

If the problem persists after trying the solutions above:

1. **Check both users have logged in** since encryption was implemented
2. **Verify Firestore connection** - ensure app can read/write to Firestore
3. **Check device storage** - ensure keychain is accessible
4. **Review console logs** - look for specific error messages
5. **Try on a different device** - to rule out device-specific issues

---

## Security Note

The app now **prevents sending unencrypted messages** in 1-on-1 chats. This ensures:
- ✅ All messages are encrypted end-to-end
- ✅ No plain text messages are accidentally sent
- ✅ Users are notified if encryption fails

If encryption fails, the message will **not be sent** until the issue is resolved.

---

**Last Updated:** Auto-generated  
**Related Files:**
- `src/services/EncryptionService.ts`
- `src/screens/ChatScreen/ChatScreen.js`
- `src/screens/LoginScreen/LoginScreen.tsx`


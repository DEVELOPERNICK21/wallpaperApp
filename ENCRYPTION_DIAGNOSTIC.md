# 🔍 Encryption Diagnostic Guide

## Quick Diagnostic Steps

### 1. **Check if PRNG is Available**

The encryption requires a Pseudo-Random Number Generator (PRNG). Check your console logs when the app starts:

**Look for:**
- `✅ PRNG test passed: Random bytes generated successfully` - Good!
- `❌ PRNG test failed` - Problem!

### 2. **Check Console Logs on Login**

When you log in, you should see:

**Success:**
```
🔐 Initializing encryption keys for user: [your-id]
✅ PRNG test passed: Random bytes generated successfully
✅ Key pair generated successfully
✅ Private key stored in keychain
✅ Public keys stored in Firestore
✅ Encryption keys initialized successfully
```

**Failure:**
```
❌ PRNG test failed: [error]
OR
❌ Error generating key pair: [error]
```

### 3. **Test Encryption Manually**

Try sending a message in a 1-on-1 chat. Check console for:

**Success:**
```
🔐 Message encrypted successfully
```

**Failure:**
```
❌ Error encrypting message: [error]
```

---

## Common Issues & Fixes

### Issue 1: "PRNG is not available"

**Symptoms:**
- Error: "PRNG (Pseudo-Random Number Generator) is not available"
- Keys fail to generate

**Fix:**
1. Ensure `react-native-get-random-values` is imported at the TOP of `index.js`:
   ```javascript
   import 'react-native-get-random-values';
   ```
2. **Rebuild the app completely** (not just reload)
3. Restart Metro bundler with `--reset-cache`

### Issue 2: "Native module not found"

**Symptoms:**
- Error: "Native module not found"
- App crashes or encryption fails

**Fix:**
1. For iOS: Run `cd ios && pod install && cd ..`
2. **Rebuild the app** (not just reload)
3. Make sure you're running a fresh build, not a cached one

### Issue 3: Keys not initializing

**Symptoms:**
- No error, but keys don't exist
- "Your encryption keys are missing" message

**Fix:**
1. Check console logs for errors
2. Try manual initialization from chat screen
3. Check if device is unlocked
4. Check internet connection (needed for Firestore)

### Issue 4: Encryption fails silently

**Symptoms:**
- Messages send but aren't encrypted
- No error messages

**Fix:**
1. Check console logs for warnings
2. Verify both users have keys initialized
3. Check if it's a direct chat (1-on-1)

---

## Step-by-Step Debugging

### Step 1: Verify PRNG Import

Check `index.js` - should have at the very top:
```javascript
import 'react-native-get-random-values';
```

### Step 2: Verify Module Installation

```bash
npm list react-native-get-random-values
```

Should show: `react-native-get-random-values@1.11.0`

### Step 3: Verify Pods (iOS)

```bash
cd ios
pod install
cd ..
```

### Step 4: Clean Rebuild

```bash
# Clear Metro cache
npx react-native start --reset-cache

# In another terminal, rebuild
npm run ios  # or npm run android
```

### Step 5: Check Console Logs

1. Open React Native debugger or check Metro logs
2. Log out and log back in
3. Look for PRNG test and key initialization logs

---

## Testing Encryption

### Test 1: Key Generation

Try initializing keys manually from chat screen. Should see:
- `✅ PRNG test passed`
- `✅ Key pair generated successfully`
- `✅ Keys initialized`

### Test 2: Message Encryption

Send a message in a 1-on-1 chat. Should see:
- `🔐 Message encrypted successfully`
- Message stored with `isEncrypted: true`

### Test 3: Message Decryption

Receive a message in a 1-on-1 chat. Should see:
- Message decrypted automatically
- Plain text displayed (not encrypted text)

---

## Still Not Working?

1. **Share console logs** - Copy all encryption-related logs
2. **Check error messages** - What exact error do you see?
3. **Verify rebuild** - Did you rebuild after installing the module?
4. **Check platform** - iOS or Android? (different steps)

---

**Last Updated:** Auto-generated


# 🔍 Debug: Inactivity Lock Timing Issue

## Issue

User reports the app locks after **3 minutes** instead of **1 minute**.

---

## 🧪 **Debugging Steps**

### **Step 1: Check Console Logs**

When the app loads, you should see:

```
🔒 Screen lock settings loaded: {
  enabled: true,
  timer: '1min',
  timeout: '60s',
  timeoutMs: 60000,
  raw: { screenLock: 'true', lockTimer: '1min' }
}
```

**Check These Values:**

- ✅ `timer` should be `'1min'`
- ✅ `timeout` should be `'60s'`
- ✅ `timeoutMs` should be `60000`

**If `timer` is NOT `'1min'`:**

- Your settings might be set to a different value
- Go to **Profile → Privacy & Security → Lock Timer**
- Set it to **1 Minute**

---

### **Step 2: Verify Timer Start**

When the timer starts, you should see:

```
⏱️ Starting inactivity timer: 60s (60000ms) Lock enabled: true Start time: 10:30:45 AM
```

**Check These Values:**

- ✅ First value should be `60s`
- ✅ Second value should be `(60000ms)`
- ✅ `Lock enabled` should be `true`

**If timeout is NOT 60000ms:**

- ❌ There's a problem with the settings conversion
- ❌ AsyncStorage might have wrong value

---

### **Step 3: Wait and Check Timer Fire**

After waiting, you should see:

```
⏰ Inactivity timer fired!
   Expected timeout: 60s (60000ms)
   Actual wait time: 60.123s (60123ms)
   Inactive duration: 60.123s (60123ms)
   Fire time: 10:31:45 AM
🔒 Locking app due to inactivity
```

**Check These Values:**

- ✅ **Expected timeout** should be `60s (60000ms)`
- ✅ **Actual wait time** should be ~60s (within 1-2 seconds)
- ✅ **Inactive duration** should be ~60s

**If Actual wait time is ~180s (3 minutes):**

- ❌ The lockTimeout variable has wrong value
- ❌ Check the raw timer value in AsyncStorage

---

## 🔧 **Manual Fix: Force 1 Minute**

### **Option 1: Clear and Reset Settings**

Run this in your React Native debug console or add temporarily to code:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear and reset
await AsyncStorage.removeItem('screenLock');
await AsyncStorage.removeItem('screenLockTimer');

// Set to 1 minute
await AsyncStorage.setItem('screenLock', 'true');
await AsyncStorage.setItem('screenLockTimer', '1min');

// Restart app
```

---

### **Option 2: Check Current Values**

Add this temporarily to `App.tsx` to see exact AsyncStorage values:

```typescript
// Add this inside useEffect after line 55
const debugSettings = async () => {
  const allKeys = await AsyncStorage.getAllKeys();
  const lockKeys = allKeys.filter(
    key => key.includes('lock') || key.includes('Lock'),
  );
  console.log('🔍 Lock-related keys:', lockKeys);

  for (const key of lockKeys) {
    const value = await AsyncStorage.getItem(key);
    console.log(`🔍 ${key} = ${value}`);
  }
};
debugSettings();
```

---

### **Option 3: Force 60 Seconds in Code**

Temporarily hardcode the timeout to verify it's a settings issue:

```typescript
// In App.tsx, line 78, change:
setLockTimeout(timeout);

// To:
setLockTimeout(60000); // Force 1 minute for testing
console.log('⚠️ TESTING: Forced timeout to 60 seconds');
```

If this works, the issue is with the AsyncStorage settings or conversion.

---

## 🔍 **Common Issues**

### **Issue 1: Settings Not Saved**

**Symptom:** Console shows `timer: null` or `timer: undefined`

**Fix:**

1. Go to **Privacy & Security**
2. Toggle **Screen Lock** OFF
3. Toggle **Screen Lock** ON
4. Set **Lock Timer** to **1 Minute**
5. Restart app

---

### **Issue 2: Wrong Timer Value in AsyncStorage**

**Symptom:** Console shows `timer: '5min'` or other value

**Fix:**

1. Clear AsyncStorage keys
2. Reset in settings
3. Or manually set using code above

---

### **Issue 3: Multiple Timers Running**

**Symptom:** Timer fires multiple times or at odd intervals

**Fix:**

- Check if timer is being cleared properly
- Look for multiple `setTimeout` calls in logs
- Ensure old timers are cleared before starting new ones

---

### **Issue 4: Timer Multiplied by 3**

**Symptom:** 1 minute becomes 3 minutes (180 seconds)

**Possible Causes:**

1. **Default value used instead of setting:**

   - Check if `lockTimer` is `null`
   - Default might be wrong

2. **Conversion error:**

   - 60000ms \* 3 = 180000ms
   - Check if there's a multiplication somewhere

3. **Timer reset 3 times:**
   - Check reset logs
   - Each reset adds to wait time

---

## 📝 **Expected Console Output**

### **For 1 Minute Lock:**

```
// App start
🔒 Screen lock settings loaded: {
  enabled: true,
  timer: '1min',
  timeout: '60s',
  timeoutMs: 60000,
  raw: { screenLock: 'true', lockTimer: '1min' }
}

// App ready
🔄 Timer effect triggered: {
  screenLockEnabled: true,
  isLoading: false,
  isLocked: false,
  lockTimeout: '60s'
}
✅ Starting inactivity timer now
⏱️ Starting inactivity timer: 60s (60000ms) Lock enabled: true Start time: 10:30:00 AM

// [User does nothing for 60 seconds]

// Timer fires
⏰ Inactivity timer fired!
   Expected timeout: 60s (60000ms)
   Actual wait time: 60.123s (60123ms)
   Inactive duration: 60.123s (60123ms)
   Fire time: 10:31:00 AM
🔒 Locking app due to inactivity
```

---

### **For 3 Minute Lock (Wrong - What You're Seeing):**

```
// App start
🔒 Screen lock settings loaded: {
  enabled: true,
  timer: ???,  // ← Check this value!
  timeout: '180s',  // ← This should be 60s!
  timeoutMs: 180000,  // ← This should be 60000!
  raw: { screenLock: 'true', lockTimer: ??? }
}

// Timer starts with wrong value
⏱️ Starting inactivity timer: 180s (180000ms) ...

// Timer fires after 3 minutes
⏰ Inactivity timer fired!
   Expected timeout: 180s (180000ms)
   Actual wait time: 180.123s (180123ms)
   ...
```

---

## 🎯 **Action Plan**

1. **Check Console Logs**

   - Look for the settings loaded log
   - Verify `timeoutMs` value
   - Should be `60000`, not `180000`

2. **If timeoutMs is Wrong:**

   - Check `timer` value in raw settings
   - Should be `'1min'`
   - If not, go to settings and set to 1 Minute

3. **If timer is Null/Undefined:**

   - Settings not saved properly
   - Clear and re-save settings

4. **If Everything Looks Correct but Still 3 Minutes:**
   - Try force-setting to 60000 in code
   - Check for multiple timer starts
   - Look for timer reset logs

---

## 💡 **Quick Test Script**

Add this to check and fix settings:

```typescript
// Add to App.tsx temporarily for debugging
useEffect(() => {
  const checkAndFixSettings = async () => {
    console.log('🔍 === DEBUGGING LOCK SETTINGS ===');

    // Check current values
    const screenLock = await AsyncStorage.getItem('screenLock');
    const lockTimer = await AsyncStorage.getItem('screenLockTimer');

    console.log('Current values:', {screenLock, lockTimer});

    // Force correct values for testing
    if (lockTimer !== '1min') {
      console.log('⚠️ FIXING: Setting timer to 1min');
      await AsyncStorage.setItem('screenLockTimer', '1min');
      await AsyncStorage.setItem('screenLock', 'true');
      console.log('✅ Settings updated. Please restart app.');
    } else {
      console.log('✅ Settings are correct');
    }
  };

  checkAndFixSettings();
}, []);
```

---

## 📊 **Conversion Reference**

| Setting    | String Value  | Milliseconds | Seconds | Minutes |
| ---------- | ------------- | ------------ | ------- | ------- |
| Immediate  | `'immediate'` | 0            | 0s      | 0min    |
| 1 Minute   | `'1min'`      | 60000        | 60s     | 1min    |
| 5 Minutes  | `'5min'`      | 300000       | 300s    | 5min    |
| 30 Minutes | `'30min'`     | 1800000      | 1800s   | 30min   |

**Your Issue:** Getting **180s (180000ms) = 3 minutes** instead of **60s (60000ms) = 1 minute**

---

## 🎉 **Resolution**

Once you see:

```
timeoutMs: 60000
```

And the timer fires after:

```
Actual wait time: 60.XXXs
```

Then it's working correctly! 🔒✅

---

**Next Step:** Run the app, check the console logs, and report back what values you see for `timeoutMs` and `timer`.

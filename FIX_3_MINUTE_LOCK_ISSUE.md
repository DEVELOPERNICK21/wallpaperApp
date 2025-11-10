# 🔧 Fix: 3 Minute Lock Instead of 1 Minute

## What I've Added

I've added **comprehensive debugging logs** to help identify why the lock is happening after 3 minutes instead of 1 minute.

---

## 🔍 **How to Debug**

### **Step 1: Check App Startup Logs**

When you open the app, look for this log:

```
🔒 Screen lock settings loaded: {
  enabled: true,
  timer: '1min',      ← Should be '1min'
  timeout: '60s',      ← Should be '60s'
  timeoutMs: 60000,    ← Should be 60000
  raw: { screenLock: 'true', lockTimer: '1min' }
}
```

**❌ If `timer` is NOT '1min':** Your settings are wrong. Go to Step 2.

**❌ If `timeoutMs` is NOT 60000:** There's a conversion bug. Report these values.

---

### **Step 2: Reset Settings to 1 Minute**

1. Go to **Profile** → **Privacy & Security**
2. Tap **Lock Timer**
3. Select **1 Minute**
4. You'll see a popup: "Timer Set - Lock timer set to 1 minute"

**Console should show:**

```
⏱️ User selected: 1 Minute lock timer
✅ Saved screenLockTimer = 1min
```

5. **Restart the app** completely (force close and reopen)

---

### **Step 3: Watch Timer Start**

After app loads, you should see:

```
✅ Starting inactivity timer now
⏱️ Starting inactivity timer: 60s (60000ms) Lock enabled: true Start time: 10:30:00 AM
```

**Check the timeout value:**

- ✅ Should say `60s (60000ms)`
- ❌ If it says `180s (180000ms)` → Settings still wrong

---

### **Step 4: Test Inactivity (Don't Touch!)**

1. Put phone down
2. **Don't touch the screen at all**
3. Watch the console logs
4. After ~60 seconds, you should see:

```
⏰ Inactivity timer fired!
   Expected timeout: 60s (60000ms)
   Actual wait time: 60.123s (60123ms)    ← Should be ~60s
   Inactive duration: 60.123s (60123ms)
   Fire time: 10:31:00 AM
🔒 Locking app due to inactivity
```

**Check these values:**

- ✅ **Expected timeout:** Should be `60s (60000ms)`
- ✅ **Actual wait time:** Should be approximately 60 seconds (±1-2 seconds)
- ❌ If **Actual wait time** is ~180s → Something is wrong with timer

---

### **Step 5: Track Activity Resets**

When you tap the screen, you should see:

```
👆 User activity detected, resetting timer (was inactive for 15.5s)
⏱️ Starting inactivity timer: 60s (60000ms) Lock enabled: true ...
```

**This tells you:**

- How long you were inactive before the tap
- That the timer is restarting with correct timeout

---

## 🐛 **Possible Causes of 3 Minute Lock**

### **Cause 1: Settings Not Saved Correctly**

**Symptom:**

```
timer: null  OR  timer: '5min'  OR  timer: undefined
```

**Fix:**

1. Go to Privacy & Security
2. Set Lock Timer to "1 Minute"
3. Restart app

---

### **Cause 2: Default Value Being Used**

**Symptom:**

```
timer: null
timeoutMs: 60000  ← BUT you still wait 3 minutes
```

**Fix:**

- The default might be overridden somewhere
- Check `PrivacySecurityScreen.tsx` line 76
- Should default to `'1min'` not `'immediate'`

---

### **Cause 3: Timer Multiplied by 3**

**Symptom:**

```
timeoutMs: 180000  (should be 60000)
```

**Possible Reasons:**

- Settings conversion has a bug
- AsyncStorage has wrong value
- Timer value is being multiplied somewhere

**Check:**

- Raw value from AsyncStorage in logs
- Should show `lockTimer: '1min'`

---

### **Cause 4: Timer Reset Multiple Times**

**Symptom:**

- You see 3+ "Starting inactivity timer" logs
- Before any user activity

**Fix:**

- useEffect might be running multiple times
- Check dependency array

---

## 🔧 **Manual Fix**

If settings don't work, **temporarily add this** to `App.tsx` (line 78):

```typescript
setLockTimeout(timeout);
console.log('🔒 Screen lock settings loaded:', {
  enabled: screenLock === 'true',
  timer: lockTimer,
  timeout: timeout / 1000 + 's',
  timeoutMs: timeout,
  raw: {screenLock, lockTimer},
});

// ADD THIS FOR TESTING:
if (timeout !== 60000) {
  console.warn('⚠️ FORCING timeout to 60 seconds for testing!');
  setLockTimeout(60000);
}
```

This will force 1 minute regardless of settings, to verify the timer logic works.

---

## 📊 **What the Logs Tell You**

| Log Message                  | Meaning                    |
| ---------------------------- | -------------------------- |
| `timeoutMs: 60000`           | ✅ Correct - 1 minute      |
| `timeoutMs: 180000`          | ❌ Wrong - 3 minutes       |
| `timeoutMs: 300000`          | ❌ Wrong - 5 minutes       |
| `Actual wait time: 60.XXXs`  | ✅ Timer working correctly |
| `Actual wait time: 180.XXXs` | ❌ Timer is 3x too long    |

---

## 🎯 **Action Items**

1. **Run the app** and check startup logs
2. **Copy the `🔒 Screen lock settings loaded` log** and send it to me
3. **Wait for lock** and copy the `⏰ Inactivity timer fired!` log
4. **Tell me:**
   - What does `timeoutMs` show?
   - What does `Actual wait time` show?
   - What does `timer` value show in raw settings?

---

## 🚀 **Expected Result**

After fixing, you should see:

```
🔒 Screen lock settings loaded: {
  enabled: true,
  timer: '1min',
  timeout: '60s',
  timeoutMs: 60000,    ← This is the key value!
  raw: { screenLock: 'true', lockTimer: '1min' }
}
```

And lock after exactly ~60 seconds:

```
⏰ Inactivity timer fired!
   Expected timeout: 60s (60000ms)
   Actual wait time: 60.XXXs    ← ~60 seconds!
   ...
```

---

**Please run the app, check the console logs, and send me the exact values you see!** 🔍📱

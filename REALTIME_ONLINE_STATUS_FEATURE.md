# 👁️ Real-Time Online Status Feature

## Overview

Implemented a comprehensive presence tracking system that shows **real-time online/offline status** for users in direct chats. When a user goes offline, other users can see their "last seen" timestamp.

---

## ✨ **Features**

### **1. Real-Time Presence Tracking** 📡

- Automatically updates user's online status when app goes to foreground/background
- Tracks last seen timestamp
- Updates Firestore in real-time

### **2. Visual Status Indicators** 🟢

- **Green dot** = User is online
- **No dot + text** = User is offline with "last seen" time
- **Group chats** = Show member count

### **3. Automatic Status Updates** 🔄

- **App opens** → Set user online
- **App goes to background** → Set user offline
- **App closes** → Set user offline

### **4. Smart Last Seen** ⏰

- "last seen just now" (< 1 minute)
- "last seen 5 minutes ago"
- "last seen 2 hours ago"
- "last seen 3 days ago"

---

## 📁 **Files Created/Modified**

### **New File: `src/utils/presenceTracker.ts`**

A singleton class that manages user presence:

```typescript
class PresenceTracker {
  initialize(); // Start tracking
  setUserOnline(); // Mark user as online
  setUserOffline(); // Mark user as offline
  listenToUserStatus(); // Listen to other user's status
  cleanup(); // Stop tracking
}

export const presenceTracker = new PresenceTracker();
export const formatLastSeen = lastSeen => string;
```

**Key Methods:**

1. **`initialize()`**

   - Sets user online
   - Listens to AppState changes
   - Auto-updates status

2. **`setUserOnline()`**

   - Updates Firestore: `isOnline: true`
   - Updates `lastSeen` timestamp

3. **`setUserOffline()`**

   - Updates Firestore: `isOnline: false`
   - Updates `lastSeen` timestamp

4. **`listenToUserStatus(userId, callback)`**

   - Real-time listener for another user's status
   - Calls callback with `(isOnline, lastSeen)`

5. **`formatLastSeen(lastSeen)`**
   - Formats timestamp into readable text
   - Returns "last seen X ago"

---

### **Modified: `App.tsx`**

**Lines 20, 300-310:**

```typescript
import {presenceTracker} from './src/utils/presenceTracker';

// Initialize presence tracking when app is ready
useEffect(() => {
  if (!isLoading) {
    console.log('🚀 App ready, initializing presence tracking');
    presenceTracker.initialize();
  }

  return () => {
    // Cleanup presence tracking when app unmounts
    presenceTracker.cleanup();
  };
}, [isLoading]);
```

**What This Does:**

- Starts presence tracking after splash screen
- Automatically updates status on app state changes
- Cleans up when app closes

---

### **Modified: `src/screens/ChatScreen/ChatScreen.js`**

**Lines 29, 70-73:**

```javascript
import {presenceTracker, formatLastSeen} from '../../utils/presenceTracker';

const [otherUserOnlineStatus, setOtherUserOnlineStatus] = useState({
  isOnline: false,
  lastSeen: null,
});
```

**Lines 757-784:**

```javascript
// Listen to other user's online status (for direct chats only)
useEffect(() => {
  if (!groupData || !groupData.members || groupData.members.length !== 2) {
    // Not a direct chat, reset status
    setOtherUserOnlineStatus({isOnline: false, lastSeen: null});
    return;
  }

  // Get other user's ID
  const otherUserId = groupData.members.find(id => id !== currentUser?.uid);

  if (!otherUserId) return;

  console.log('👂 Setting up online status listener for user:', otherUserId);

  // Listen to other user's status
  const unsubscribe = presenceTracker.listenToUserStatus(
    otherUserId,
    (isOnline, lastSeen) => {
      setOtherUserOnlineStatus({isOnline, lastSeen});
    },
  );

  return () => {
    console.log('🧹 Cleaning up online status listener');
    unsubscribe();
  };
}, [groupData, currentUser]);
```

**Lines 1405-1426 (Header UI):**

```javascript
<View style={styles.onlineStatusContainer}>
  {groupData && groupData.members && groupData.members.length > 2 ? (
    <>
      <View style={styles.onlineDot} />
      <Text style={styles.onlineStatus}>
        {groupData.members.length} members
      </Text>
    </>
  ) : (
    <>
      {otherUserOnlineStatus.isOnline && <View style={styles.onlineDot} />}
      <Text style={styles.onlineStatus}>
        {otherUserOnlineStatus.isOnline
          ? 'Online'
          : formatLastSeen(otherUserOnlineStatus.lastSeen)}
      </Text>
    </>
  )}
</View>
```

---

## 🔥 **Firestore Structure**

### **Users Collection**

```javascript
Users/{userId}/
  {
    email: "user@example.com",
    displayName: "John Doe",
    isOnline: true,              // ✅ NEW - Online status
    lastSeen: Timestamp,         // ✅ NEW - Last seen time
    privacySettings: {...},
    // ... other fields
  }
```

**New Fields:**

- `isOnline` (boolean): `true` = online, `false` = offline
- `lastSeen` (Timestamp): Last time user was active

---

## 🎯 **How It Works**

### **Scenario 1: User Opens App**

```
User opens app
   ↓
App.tsx initializes
   ↓
presenceTracker.initialize() called
   ↓
Firestore updated: { isOnline: true, lastSeen: now() }
   ↓
All listeners notified
   ↓
Other users see: "🟢 Online"
```

---

### **Scenario 2: User Closes App**

```
User closes app / goes to background
   ↓
AppState changes to 'background'
   ↓
presenceTracker.setUserOffline() called
   ↓
Firestore updated: { isOnline: false, lastSeen: now() }
   ↓
All listeners notified
   ↓
Other users see: "last seen just now"
```

---

### **Scenario 3: User Returns to App**

```
User returns to app
   ↓
AppState changes to 'active'
   ↓
presenceTracker.setUserOnline() called
   ↓
Firestore updated: { isOnline: true, lastSeen: now() }
   ↓
All listeners notified
   ↓
Other users see: "🟢 Online" again
```

---

### **Scenario 4: Viewing Chat**

```
User opens direct chat
   ↓
ChatScreen mounts
   ↓
useEffect gets other user's ID
   ↓
presenceTracker.listenToUserStatus(otherUserId, callback)
   ↓
Real-time listener established
   ↓
Every status change triggers callback
   ↓
UI updates automatically:
  - "🟢 Online" when other user is active
  - "last seen 5 minutes ago" when offline
```

---

## 📱 **UI Display**

### **Direct Chat (2 members):**

**When Other User is Online:**

```
┌──────────────────────────────┐
│  John Doe                  ⋯ │
│  🟢 Online                    │
└──────────────────────────────┘
```

**When Other User is Offline:**

```
┌──────────────────────────────┐
│  John Doe                  ⋯ │
│  last seen 5 minutes ago     │
└──────────────────────────────┘
```

---

### **Group Chat (3+ members):**

```
┌──────────────────────────────┐
│  Family Group              ⋯ │
│  🟢 5 members                 │
└──────────────────────────────┘
```

---

## ⏰ **Last Seen Formatting**

| Time Difference | Display                   |
| --------------- | ------------------------- |
| < 1 minute      | "last seen just now"      |
| 1-59 minutes    | "last seen 5 minutes ago" |
| 1-23 hours      | "last seen 3 hours ago"   |
| 1+ days         | "last seen 2 days ago"    |

---

## 🔍 **Console Logs**

### **App Initialization:**

```
🚀 App ready, initializing presence tracking
👁️ Initializing presence tracking for user: xyz123
✅ User status set to ONLINE
```

### **App State Changes:**

```
📱 App state changed: background
❌ User went offline
❌ User status set to OFFLINE

📱 App state changed: active
✅ User came online
✅ User status set to ONLINE
```

### **Chat Screen:**

```
👂 Setting up online status listener for user: abc456
📡 User status update: abc456 ONLINE
📡 User status update: abc456 OFFLINE
🧹 Cleaning up online status listener
```

---

## 🧪 **Testing**

### **Test 1: Your Status Updates**

1. Open app
2. Check Firestore → `Users/{yourId}` → `isOnline` should be `true`
3. Close app (or minimize)
4. Check Firestore → `isOnline` should be `false`
5. ✅ Your status updates correctly

---

### **Test 2: See Other User's Status**

1. User A opens app (goes online)
2. User B opens chat with User A
3. User B should see: "🟢 Online"
4. User A closes app (goes offline)
5. User B should see: "last seen just now"
6. ✅ Real-time status works

---

### **Test 3: Last Seen Time**

1. User A goes offline
2. Wait 5 minutes
3. User B opens chat with User A
4. User B should see: "last seen 5 minutes ago"
5. ✅ Last seen formatting works

---

### **Test 4: Group Chats**

1. Open a group chat (3+ members)
2. Should see: "🟢 X members"
3. NOT individual online status
4. ✅ Group chats show member count

---

## 🔧 **Troubleshooting**

### **Issue 1: Status Not Updating**

**Symptom:** Users always show as offline

**Fix:**

1. Check console logs for presence tracker initialization
2. Verify Firestore permissions allow write to Users collection
3. Check if AppState listener is working

**Debug:**

```javascript
// Add to App.tsx temporarily
console.log('Presence initialized:', presenceTracker);
```

---

### **Issue 2: Status Stuck on "Online"**

**Symptom:** User closed app but still shows online

**Fix:**

1. Check if `cleanup()` is being called
2. Verify AppState listener is active
3. Check Firestore rules

**Debug:**

```javascript
// Check Firestore manually
const userDoc = await firestore().collection('Users').doc(userId).get();
console.log('User status:', userDoc.data()?.isOnline);
```

---

### **Issue 3: "last seen recently" Always Shows**

**Symptom:** Last seen never shows specific time

**Fix:**

1. Check if `lastSeen` field exists in Firestore
2. Verify timestamp is being set
3. Check `formatLastSeen` function

**Debug:**

```javascript
// In ChatScreen
console.log('Last seen:', otherUserOnlineStatus.lastSeen);
console.log('Formatted:', formatLastSeen(otherUserOnlineStatus.lastSeen));
```

---

## 🎯 **Benefits**

1. ✅ **Real-Time Updates** - Instant status changes
2. ✅ **Accurate Status** - No more fake "Online" for offline users
3. ✅ **Battery Efficient** - Uses Firestore listeners (not polling)
4. ✅ **Automatic** - No manual status updates needed
5. ✅ **Privacy Friendly** - Can be extended to respect privacy settings
6. ✅ **Group Chat Safe** - Doesn't show individual status in groups

---

## 🚀 **Future Enhancements**

### **Possible Additions:**

1. **Privacy Settings**

   - Hide online status
   - Hide last seen
   - "Online" without timestamp

2. **Custom Statuses**

   - "Available"
   - "Busy"
   - "Away"
   - Custom message

3. **Typing Indicator Integration**

   - Show "typing..." when online

4. **Connection Quality**
   - Show connection strength
   - "Online (slow connection)"

---

## 📊 **Performance Impact**

### **Minimal Overhead:**

- **Firestore Writes:** 2 per app session (open + close)
- **Firestore Reads:** Real-time listeners (efficient)
- **Battery:** Negligible (uses existing Firebase connection)
- **Data:** ~50 bytes per status update

### **Scalability:**

- Works for any number of users
- Each chat only listens to relevant users
- Group chats don't track individual status

---

## 🎉 **Result**

Users can now see **accurate, real-time online status** for their contacts!

**Before:**

- ❌ Everyone always showed "Online"
- ❌ No way to know if user is actually available

**After:**

- ✅ Real-time "Online" status with green dot
- ✅ "last seen X ago" when offline
- ✅ Automatic status updates
- ✅ Works in all direct chats

**Status:** 🟢 **FULLY IMPLEMENTED**

---

**Your online status now updates automatically! Test it by opening and closing the app!** 👁️✨

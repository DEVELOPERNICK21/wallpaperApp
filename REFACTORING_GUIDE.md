# 🔄 Refactoring Guide - Migration to New Architecture

## Overview

This guide explains the new architecture and how to migrate existing code to use centralized services.

---

## ✅ What's New

### 1. **Centralized Firebase Service** (`src/services/firebase/FirebaseService.ts`)

All Firebase operations are now centralized in one service.

**Before:**

```typescript
// Scattered Firebase code in every component
const snapshot = await firestore()
  .collection('GroupChats')
  .where('members', 'array-contains', userId)
  .get();
```

**After:**

```typescript
// Use the service
import FirebaseService from '../services/firebase/FirebaseService';

const chats = await FirebaseService.getUserGroupChats(userId);
```

### 2. **Custom Hooks** (`src/hooks/useFirebase.ts`)

Reusable hooks for common Firebase patterns.

**Before:**

```typescript
// Complex useEffect with Firebase listeners in every screen
useEffect(() => {
  const unsubscribe = firestore()
    .collection('GroupChats')
    .doc(chatId)
    .collection('Messages')
    .onSnapshot(snapshot => {
      setMessages(snapshot.docs.map(doc => ({...})));
    });
  return () => unsubscribe();
}, [chatId]);
```

**After:**

```typescript
// Simple one-liner
import {useChatMessages} from '../hooks/useFirebase';

const {messages, loading, error} = useChatMessages(chatId);
```

### 3. **TypeScript Types** (`src/types/index.ts`)

All types are now centralized.

**Before:**

```typescript
// Types defined inline
const [chat, setChat] = useState<any>(null);
```

**After:**

```typescript
import {GroupChat} from '../types';

const [chat, setChat] = useState<GroupChat | null>(null);
```

### 4. **Constants** (`src/config/constants.ts`)

No more magic strings and numbers.

**Before:**

```typescript
if (members.length < 2) {
  Alert.alert('Error', 'Select at least two users');
}
```

**After:**

```typescript
import {CHAT_CONFIG, ERROR_MESSAGES} from '../config/constants';

if (members.length < CHAT_CONFIG.MIN_GROUP_MEMBERS) {
  Alert.alert('Error', ERROR_MESSAGES.CHAT.MIN_MEMBERS);
}
```

### 5. **Error Handling** (`src/utils/errorHandler.ts`)

Standardized error handling across the app.

**Before:**

```typescript
try {
  await operation();
} catch (error) {
  Alert.alert('Error', error.message || 'Something went wrong');
}
```

**After:**

```typescript
import {showErrorToast, handleAsync} from '../utils/errorHandler';

// Option 1: Auto-handle errors
const {data, error} = await handleAsync(
  () => FirebaseService.deleteChat(id),
  'Delete Chat',
);

// Option 2: Manual handling
try {
  await operation();
} catch (error) {
  showErrorToast(error);
}
```

### 6. **Validation** (`src/utils/validation.ts`)

Consistent validation across all forms.

**Before:**

```typescript
if (!email || !email.includes('@')) {
  setError('Invalid email');
}
```

**After:**

```typescript
import {validateEmail} from '../utils/validation';

const validation = validateEmail(email);
if (!validation.isValid) {
  setError(validation.error);
}
```

### 7. **Storage** (`src/utils/storage.ts`)

Centralized storage with proper typing.

**Before:**

```typescript
// Scattered AsyncStorage calls
await AsyncStorage.setItem('user', JSON.stringify(user));
const userStr = await AsyncStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;
```

**After:**

```typescript
import {storeUser, getUser} from '../utils/storage';

await storeUser(user);
const user = await getUser(); // Returns User | null
```

---

## 📝 Migration Checklist

### For Each Screen/Component:

- [ ] Replace direct Firebase calls with `FirebaseService` methods
- [ ] Use custom hooks (`useGroupChats`, `useChatMessages`, etc.)
- [ ] Replace inline types with types from `src/types`
- [ ] Replace magic strings/numbers with constants from `src/config/constants`
- [ ] Use `errorHandler` utilities for error handling
- [ ] Use `validation` utilities for form validation
- [ ] Use `storage` utilities for AsyncStorage
- [ ] Update imports to use new structure
- [ ] Remove duplicate code
- [ ] Add TypeScript types if missing

---

## 🔨 Common Migration Patterns

### Pattern 1: Fetching Group Chats

**Before:**

```typescript
const [chats, setChats] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

const fetchChats = async () => {
  try {
    setLoading(true);
    const snapshot = await firestore()
      .collection('GroupChats')
      .where('members', 'array-contains', userId)
      .get();

    const chatData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setChats(chatData);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchChats();
}, []);
```

**After:**

```typescript
import {useGroupChats} from '../hooks/useFirebase';

const {chats, loading, refreshing, refresh} = useGroupChats(userId);

// That's it! The hook handles everything
```

### Pattern 2: Listening to Messages

**Before:**

```typescript
const [messages, setMessages] = useState([]);

useEffect(() => {
  if (!chatId) return;

  const unsubscribe = firestore()
    .collection('GroupChats')
    .doc(chatId)
    .collection('Messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot(snapshot => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

  return () => unsubscribe();
}, [chatId]);
```

**After:**

```typescript
import {useChatMessages} from '../hooks/useFirebase';

const {messages, loading, error} = useChatMessages(chatId);
```

### Pattern 3: Sending Messages

**Before:**

```typescript
const sendMessage = async () => {
  try {
    await firestore()
      .collection('GroupChats')
      .doc(chatId)
      .collection('Messages')
      .add({
        text: messageText,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        createdAt: firestore.FieldValue.serverTimestamp(),
        seenBy: [currentUser.uid],
      });

    setMessageText('');
  } catch (error) {
    Alert.alert('Error', 'Failed to send message');
  }
};
```

**After:**

```typescript
import FirebaseService from '../services/firebase/FirebaseService';
import {showErrorToast, showSuccessToast} from '../utils/errorHandler';

const sendMessage = async () => {
  try {
    await FirebaseService.sendMessage(
      chatId,
      messageText,
      currentUser.uid,
      currentUser.displayName,
    );

    setMessageText('');
    showSuccessToast('Message sent');
  } catch (error) {
    showErrorToast(error);
  }
};
```

### Pattern 4: Creating Group

**Before:**

```typescript
const createGroup = async () => {
  if (selectedUsers.length < 2) {
    Alert.alert('Error', 'Select at least two users');
    return;
  }

  if (!groupName.trim()) {
    Alert.alert('Error', 'Please enter a group name');
    return;
  }

  try {
    await firestore()
      .collection('GroupChats')
      .add({
        name: groupName,
        members: [...selectedUsers, currentUser.uid],
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdBy: currentUser.uid,
      });

    Alert.alert('Success', 'Group created!');
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', 'Failed to create group');
  }
};
```

**After:**

```typescript
import FirebaseService from '../services/firebase/FirebaseService';
import {validateGroupName, validateGroupMembers} from '../utils/validation';
import {showErrorToast, showSuccessToast} from '../utils/errorHandler';
import {SUCCESS_MESSAGES} from '../config/constants';

const createGroup = async () => {
  // Validate
  const nameValidation = validateGroupName(groupName);
  if (!nameValidation.isValid) {
    showErrorToast(nameValidation.error);
    return;
  }

  const membersValidation = validateGroupMembers(selectedUsers);
  if (!membersValidation.isValid) {
    showErrorToast(membersValidation.error);
    return;
  }

  // Create
  try {
    await FirebaseService.createGroupChat(
      groupName,
      selectedUsers,
      currentUser.uid,
    );

    showSuccessToast(SUCCESS_MESSAGES.CHAT.GROUP_CREATED);
    navigation.goBack();
  } catch (error) {
    showErrorToast(error);
  }
};
```

### Pattern 5: Form Validation

**Before:**

```typescript
const handleLogin = async () => {
  if (!email || !email.includes('@')) {
    setEmailError('Invalid email');
    return;
  }

  if (!password || password.length < 8) {
    setPasswordError('Password must be at least 8 characters');
    return;
  }

  // Login logic...
};
```

**After:**

```typescript
import {validateLoginForm} from '../utils/validation';

const handleLogin = async () => {
  const {isValid, errors} = validateLoginForm(email, password);

  if (!isValid) {
    setEmailError(errors.email);
    setPasswordError(errors.password);
    return;
  }

  // Login logic...
};
```

---

## 🗑️ Files to Remove

After migration, these files can be safely deleted:

1. `src/reduxrf/` - Duplicate Redux implementation (unused)
2. `src/helper/asyncStorage.js` - Empty file
3. Any other duplicated utility files

---

## ⚙️ Next Steps After Migration

1. **Run the app** and test all features
2. **Remove old Firebase code** from components
3. **Update imports** across the project
4. **Run tests** to ensure nothing broke
5. **Remove unused dependencies**:

   ```bash
   npm uninstall firebase  # Remove Web Firebase SDK
   npm install  # Clean install
   ```

6. **Clean build**:

   ```bash
   # Android
   cd android && ./gradlew clean && cd ..

   # iOS
   cd ios && pod install && cd ..
   ```

---

## 🎯 Benefits of New Architecture

1. **Single Source of Truth** - All Firebase logic in one place
2. **Reusability** - Custom hooks eliminate code duplication
3. **Type Safety** - Proper TypeScript types throughout
4. **Maintainability** - Easier to update and debug
5. **Consistency** - Standardized patterns across the app
6. **Error Handling** - Unified error handling approach
7. **Testing** - Easier to mock and test services

---

## 📚 Additional Resources

- See `ARCHITECTURE.md` for full architecture documentation
- Check `src/services/firebase/FirebaseService.ts` for all available methods
- Review `src/hooks/useFirebase.ts` for available hooks
- Look at `src/config/constants.ts` for all constants

---

## ❓ Questions?

If you have questions about the new architecture:

1. Check the documentation files (ARCHITECTURE.md, this file)
2. Look at migrated components as examples
3. Ask the team for clarification

---

**Happy Coding! 🚀**

# 🚀 Quick Start - New Architecture

## Installation & Setup

```bash
# 1. Clean install
rm -rf node_modules
npm install

# 2. Clean build
cd android && ./gradlew clean && cd ..
cd ios && rm -rf Pods && pod install && cd ..

# 3. Run the app
npm run android  # or
npm run ios
```

---

## 📦 Quick Import Reference

### Services

```typescript
import FirebaseService from '@/services/firebase/FirebaseService';
// OR
import {FirebaseService} from '@/services';
```

### Hooks

```typescript
import {useGroupChats, useChatMessages} from '@/hooks/useFirebase';
// OR
import {useGroupChats, useChatMessages} from '@/hooks';
```

### Utils

```typescript
import {showErrorToast, showSuccessToast} from '@/utils/errorHandler';
import {validateEmail, validatePassword} from '@/utils/validation';
import {storeUser, getUser} from '@/utils/storage';
```

### Constants

```typescript
import {
  CHAT_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@/config/constants';
```

### Types

```typescript
import {User, GroupChat, Message, RootState} from '@/types';
```

---

## 🎯 Common Use Cases

### 1. Fetch Group Chats

```typescript
import {useGroupChats} from '@/hooks';

const {chats, loading, refresh, refreshing} = useGroupChats(userId);
```

### 2. Listen to Messages

```typescript
import {useChatMessages} from '@/hooks';

const {messages, loading, error} = useChatMessages(chatId);
```

### 3. Send Message

```typescript
import {FirebaseService} from '@/services';
import {showErrorToast} from '@/utils';

try {
  await FirebaseService.sendMessage(chatId, text, userId, userName);
} catch (error) {
  showErrorToast(error);
}
```

### 4. Create Group

```typescript
import {FirebaseService} from '@/services';
import {validateGroupName, validateGroupMembers} from '@/utils';
import {showErrorToast, showSuccessToast} from '@/utils';
import {SUCCESS_MESSAGES} from '@/config/constants';

// Validate
const nameVal = validateGroupName(name);
if (!nameVal.isValid) {
  showErrorToast(nameVal.error);
  return;
}

const membersVal = validateGroupMembers(members);
if (!membersVal.isValid) {
  showErrorToast(membersVal.error);
  return;
}

// Create
try {
  await FirebaseService.createGroupChat(name, members, userId);
  showSuccessToast(SUCCESS_MESSAGES.CHAT.GROUP_CREATED);
} catch (error) {
  showErrorToast(error);
}
```

### 5. Validate Form

```typescript
import {validateLoginForm} from '@/utils';

const {isValid, errors} = validateLoginForm(email, password);

if (!isValid) {
  setEmailError(errors.email);
  setPasswordError(errors.password);
  return;
}
```

### 6. Storage Operations

```typescript
import {storeUser, getUser, removeUser} from '@/utils';

// Save
await storeUser(userData);

// Load
const user = await getUser();

// Delete
await removeUser();
```

---

## 📝 Code Templates

### New Screen Template

```typescript
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// Services & Hooks
import {useGroupChats} from '@/hooks';

// Utils
import {showErrorToast} from '@/utils';

// Types
import {GroupChat} from '@/types';

// Constants
import {CHAT_CONFIG} from '@/config/constants';

const MyScreen = () => {
  const navigation = useNavigation();
  const {chats, loading, refresh, refreshing} = useGroupChats(userId);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <FlatList
        data={chats}
        refreshing={refreshing}
        onRefresh={refresh}
        renderItem={({item}) => <ChatItem chat={item} />}
      />
    </View>
  );
};

export default MyScreen;
```

### New Component Template

```typescript
import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {GroupChat} from '@/types';

interface Props {
  chat: GroupChat;
  onPress: (chat: GroupChat) => void;
}

const ChatItem: React.FC<Props> = ({chat, onPress}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(chat)}>
      <Text style={styles.name}>{chat.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatItem;
```

---

## 🔍 Available Services

### FirebaseService Methods

**Group Chats:**

- `getUserGroupChats(userId)`
- `createGroupChat(name, members, creatorId)`
- `deleteGroupChat(chatId)`
- `getGroupChat(chatId)`
- `subscribeToGroupChat(chatId, onUpdate, onError)`

**Messages:**

- `sendMessage(chatId, text, senderId, senderName, replyTo?)`
- `sendImageMessage(chatId, imageUrl, senderId, senderName)`
- `deleteMessage(chatId, messageId)`
- `clearChatMessages(chatId)`
- `markMessageAsSeen(chatId, messageId, userId)`
- `markChatAsRead(chatId, userId)`
- `subscribeToMessages(chatId, onUpdate, onError)`
- `getLastMessages(chatId, limit)`

**Users:**

- `getAllUsers()`
- `getUser(userId)`
- `updateUserFCMToken(userId, token)`

**Typing:**

- `updateTypingStatus(chatId, userName)`

**Storage:**

- `uploadImage(uri, path, onProgress?)`
- `deleteImage(path)`

**Auth:**

- `getCurrentUser()`
- `signOut()`

---

## 🎣 Available Hooks

- `useGroupChats(userId)` - Fetch & manage group chats
- `useChatMessages(chatId)` - Real-time messages
- `useGroupChat(chatId)` - Single chat updates
- `useTypingIndicator(chatId, userName)` - Typing status
- `useUsers()` - Fetch all users
- `useNewMessageDetector(chats, userId)` - New message detection
- `useDebounce(callback, delay)` - Debounced functions

---

## 🛠 Available Utils

### Error Handling

- `showErrorToast(error, fallback?)`
- `showSuccessToast(message, description?)`
- `showInfoToast(message, description?)`
- `showWarningToast(message, description?)`
- `showErrorAlert(error, title?, onPress?)`
- `showConfirmAlert(title, message, onConfirm, onCancel?)`
- `handleAsync(operation, context?, showToast?)`
- `retryAsync(operation, maxRetries?, delay?)`

### Validation

- `validateEmail(email)`
- `validatePassword(password)`
- `validateDisplayName(name)`
- `validateGroupName(name)`
- `validateGroupMembers(members)`
- `validateMessage(message)`
- `validateLoginForm(email, password)`
- `validateSignUpForm(name, email, password, confirmPassword)`

### Storage

- `storeUser(user)` / `getUser()` / `removeUser()`
- `storeAuthToken(token)` / `getAuthToken()` / `removeAuthToken()`
- `storeTheme(isDark)` / `getTheme()`
- `setOnboardingCompleted()` / `isOnboardingCompleted()`
- `storeFCMToken(token)` / `getFCMToken()`
- `storeData(key, value)` / `getData(key)` / `removeData(key)`

---

## 📚 Documentation Files

1. **`QUICK_START.md`** (this file) - Quick reference
2. **`REFACTORING_SUMMARY.md`** - What was changed
3. **`REFACTORING_GUIDE.md`** - How to migrate code
4. **`ARCHITECTURE.md`** - Full architecture details

---

## ⚡ Pro Tips

1. **Always use hooks for Firebase operations** - No need to write useEffect
2. **Always validate before submitting** - Use validation utils
3. **Always handle errors** - Use error handler utils
4. **Use constants** - Never hard-code strings/numbers
5. **Type everything** - Import types from `@/types`

---

## 🐛 Troubleshooting

### "Cannot find module '@/services'"

Run: `npm install` and rebuild

### "Firebase operation failed"

Check Firebase console and rules

### "Type errors"

Make sure you're importing types from `@/types`

### "Hooks not working"

Check that userId/chatId is defined and not null

---

## 📞 Need Help?

1. Check `ARCHITECTURE.md` for detailed docs
2. Check `REFACTORING_GUIDE.md` for examples
3. Look at existing migrated screens
4. Ask the team

---

**Happy Coding! 🚀**

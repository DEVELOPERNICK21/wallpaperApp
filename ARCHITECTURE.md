# Wallpaper App - Architecture Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Services](#core-services)
5. [State Management](#state-management)
6. [Navigation](#navigation)
7. [Code Guidelines](#code-guidelines)
8. [Common Patterns](#common-patterns)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

Wallpaper is a React Native application that provides real-time group chat functionality with Firebase integration.

### Key Features

- 🔐 User authentication (Email/Password)
- 💬 Real-time group chat
- 📸 Image sharing
- ✉️ Push notifications
- 👥 User management
- 🎨 Custom wallpapers

---

## 🛠 Technology Stack

### Core Technologies

- **React Native** 0.77.0 - Mobile framework
- **TypeScript** 5.0.4 - Type safety
- **Firebase** - Backend services
  - Authentication
  - Firestore (Database)
  - Cloud Messaging (FCM)
  - Storage

### State Management

- **Redux** 5.0.1 - Global state
- **Redux Persist** 6.0.0 - State persistence
- **Redux Thunk** 3.1.0 - Async actions

### Navigation

- **React Navigation** 6.x
  - Stack Navigator
  - Bottom Tab Navigator

### UI Libraries

- **React Native Elements** 3.4.3
- **React Native SVG** 15.7.1
- **React Native Linear Gradient** 2.8.3
- **React Native Flash Message** 0.4.2

---

## 📁 Project Structure

```
src/
├── api/                    # API client and interceptors
├── assets/                 # Static assets
│   ├── color.js           # Color palette
│   ├── fonts/             # Font files
│   ├── icons/             # SVG icons
│   ├── images/            # Image assets
│   └── string.tsx         # Screen dimensions
├── component/             # Reusable components
│   ├── Buttons/          # Button components
│   ├── CheckBox/         # Checkbox components
│   ├── Header/           # Header components
│   ├── Input/            # Input components
│   └── Modal/            # Modal components
├── config/               # App configuration
│   └── constants.ts      # Centralized constants
├── helper/               # Helper utilities (legacy)
├── hooks/                # Custom React hooks
│   └── useFirebase.ts    # Firebase hooks
├── redux/                # Redux store (active)
│   ├── actions/          # Action creators
│   ├── reducers/         # Reducers
│   ├── constants.js      # Action types
│   └── store.js          # Store configuration
├── Routes/               # Navigation configuration
│   ├── AppRoutes.jsx     # Main router
│   ├── AuthNavigation.tsx
│   ├── ScreenConstants.tsx
│   └── UserBottomTabNavigator.jsx
├── screens/              # Screen components
│   ├── HomeScreen/       # Chat list screen
│   ├── ChatScreen/       # Chat detail screen
│   ├── LoginScreen/      # Login screen
│   └── ...               # Other screens
├── services/             # Business logic layer
│   └── firebase/
│       └── FirebaseService.ts  # Firebase operations
├── types/                # TypeScript definitions
│   └── index.ts          # Shared types
└── utils/                # Utility functions
    ├── asynstorage.js    # Storage utilities (legacy)
    ├── errorHandler.ts   # Error handling
    ├── storage.ts        # Centralized storage
    ├── theme.tsx         # Theme utilities
    ├── utilities.tsx     # General utilities
    └── validation.ts     # Form validation
```

---

## 🔧 Core Services

### FirebaseService

Central service for all Firebase operations. Located at `src/services/firebase/FirebaseService.ts`.

#### Key Methods:

**Group Chat Operations:**

```typescript
// Fetch user's group chats
getUserGroupChats(userId: string): Promise<GroupChat[]>

// Create new group
createGroupChat(name: string, members: string[], creatorId: string): Promise<string>

// Delete group
deleteGroupChat(chatId: string): Promise<void>

// Subscribe to real-time updates
subscribeToGroupChat(chatId, onUpdate, onError): () => void
```

**Message Operations:**

```typescript
// Send text message
sendMessage(chatId, text, senderId, senderName, replyTo?): Promise<string>

// Send image message
sendImageMessage(chatId, imageUrl, senderId, senderName): Promise<string>

// Delete message
deleteMessage(chatId, messageId): Promise<void>

// Subscribe to messages
subscribeToMessages(chatId, onUpdate, onError): () => void
```

**User Operations:**

```typescript
// Get all users
getAllUsers(): Promise<User[]>

// Get specific user
getUser(userId): Promise<User | null>

// Update FCM token
updateUserFCMToken(userId, token): Promise<void>
```

---

## 🗂 State Management

### Redux Store Structure

```typescript
{
  user: {
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  appState: {
    isDarkMode: boolean,
    isOnline: boolean,
    lastSync: Date
  },
  theme: {
    isDark: boolean,
    primaryColor: string,
    secondaryColor: string
  }
}
```

### Usage Example

```typescript
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../types';

const MyComponent = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  // Access state
  const isAuthenticated = user.isAuthenticated;

  // Dispatch actions
  dispatch(loginUser(credentials));
};
```

---

## 🧭 Navigation

### Screen Flow

```
Splash Screen
    ↓
Onboarding (first time) → Login/Signup
    ↓                          ↓
Main App (Tab Navigator)  ←────┘
    ├── Home (Chat List)
    ├── Profile
    ├── Settings
    └── Wallpaper

From Chat List → Chat Screen
From Home → Create Group Chat
```

### Navigation Usage

```typescript
import {useNavigation} from '@react-navigation/native';
import ScreenConstants from '../Routes/ScreenConstants';

const MyComponent = () => {
  const navigation = useNavigation();

  const goToChat = (chatId: string, groupName: string) => {
    navigation.navigate(ScreenConstants.CHAT_SCREEN, {
      chatId,
      groupNameed: groupName,
    });
  };
};
```

---

## 📝 Code Guidelines

### File Naming Conventions

- **Components:** PascalCase (e.g., `HomeScreen.tsx`, `CustomButton.tsx`)
- **Utilities:** camelCase (e.g., `errorHandler.ts`, `validation.ts`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_CONFIG`, `ERROR_MESSAGES`)
- **Hooks:** camelCase with `use` prefix (e.g., `useGroupChats`, `useFirebase`)

### TypeScript Usage

✅ **DO:**

```typescript
// Use interfaces for objects
interface User {
  id: string;
  name: string;
}

// Use type for unions/intersections
type Status = 'loading' | 'success' | 'error';

// Always type function parameters and returns
const fetchUser = async (id: string): Promise<User> => {
  // ...
};
```

❌ **DON'T:**

```typescript
// Don't use 'any' without a good reason
const data: any = fetchData();

// Don't leave implicit types
function process(data) {
  // Bad: no types
  return data.map(x => x.value);
}
```

### Import Order

```typescript
// 1. React imports
import React, {useEffect, useState} from 'react';

// 2. React Native imports
import {View, Text, StyleSheet} from 'react-native';

// 3. Third-party imports
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

// 4. Services
import FirebaseService from '../services/firebase/FirebaseService';

// 5. Components
import CustomButton from '../component/CustomButton';

// 6. Utilities & Constants
import {CHAT_CONFIG} from '../config/constants';
import {showErrorToast} from '../utils/errorHandler';

// 7. Types
import {GroupChat, Message} from '../types';

// 8. Styles (last)
import styles from './styles';
```

---

## 🎨 Common Patterns

### 1. Using Firebase Service

```typescript
import FirebaseService from '../services/firebase/FirebaseService';
import {showErrorToast, showSuccessToast} from '../utils/errorHandler';
import {SUCCESS_MESSAGES} from '../config/constants';

const createGroup = async () => {
  try {
    const groupId = await FirebaseService.createGroupChat(
      groupName,
      selectedUsers,
      currentUserId,
    );

    showSuccessToast(SUCCESS_MESSAGES.CHAT.GROUP_CREATED);
    navigation.goBack();
  } catch (error) {
    showErrorToast(error);
  }
};
```

### 2. Using Custom Hooks

```typescript
import {useGroupChats, useChatMessages} from '../hooks/useFirebase';

const HomeScreen = () => {
  const {chats, loading, refresh, refreshing} = useGroupChats(userId);

  return (
    <FlatList
      data={chats}
      refreshing={refreshing}
      onRefresh={refresh}
      renderItem={({item}) => <ChatItem chat={item} />}
    />
  );
};
```

### 3. Form Validation

```typescript
import {validateGroupName, validateGroupMembers} from '../utils/validation';
import {showErrorToast} from '../utils/errorHandler';

const handleSubmit = () => {
  // Validate group name
  const nameValidation = validateGroupName(groupName);
  if (!nameValidation.isValid) {
    showErrorToast(nameValidation.error);
    return;
  }

  // Validate members
  const membersValidation = validateGroupMembers(selectedUsers);
  if (!membersValidation.isValid) {
    showErrorToast(membersValidation.error);
    return;
  }

  // Proceed with creation
  createGroup();
};
```

### 4. Error Handling

```typescript
import {handleAsync, showErrorAlert} from '../utils/errorHandler';

// Approach 1: Using handleAsync
const {data, error} = await handleAsync(
  () => FirebaseService.deleteGroupChat(chatId),
  'Delete Group Chat',
);

if (error) {
  return; // Error already shown via toast
}

// Approach 2: Traditional try-catch
try {
  await FirebaseService.sendMessage(chatId, text, userId, userName);
} catch (error) {
  showErrorAlert(error, 'Send Message Failed');
}
```

### 5. Storage Operations

```typescript
import {storeUser, getUser, removeUser} from '../utils/storage';

// Save user
await storeUser(userData);

// Retrieve user
const user = await getUser();

// Remove user
await removeUser();
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Test Structure

```
__tests__/
├── components/
├── hooks/
├── services/
└── utils/
```

---

## 🚀 Deployment

### Android

```bash
# Debug build
npm run android

# Release build
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### iOS

```bash
# Debug build
npm run ios

# Release build
cd ios
xcodebuild -workspace wallpe.xcworkspace -scheme wallpe -configuration Release
```

---

## 🔐 Environment Variables

Create a `.env` file in the root:

```env
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id

# API
API_BASE_URL=https://api.yourapp.com

# FCM
FCM_SERVER_KEY=your_fcm_server_key
```

---

## 📞 Contact & Support

For questions or issues:

- Create an issue in the repository
- Contact the development team
- Check the internal wiki

---

## 📄 License

Internal use only. All rights reserved.

---

**Last Updated:** October 2025
**Version:** 1.0.0

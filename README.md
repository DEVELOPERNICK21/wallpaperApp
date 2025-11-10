# 💬 Wallpaper Chat App

A **privacy-focused messaging app** disguised as a wallpaper application. Built with React Native, Firebase, and designed for secure communications.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio / Xcode
- Firebase Account

### Installation

```bash
# Install dependencies
npm install

# iOS only - Install pods
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 🔥 Firebase Setup

This app requires Firebase configuration:

1. **Authentication** - Email/Password sign-in
2. **Firestore** - Real-time database for messages
3. **Storage** - Profile photos and media
4. **Cloud Messaging** - Push notifications

### Configuration Files:
- Android: `android/app/google-services.json`
- iOS: `ios/GoogleService-Info.plist`

### Storage Rules:
See `FIREBASE_STORAGE_SETUP.md` for detailed Firebase Storage configuration.

---

## ✨ Key Features

### 🔐 Privacy & Security
- End-to-end encrypted messaging
- Block/unblock users
- Read receipts control
- Last seen privacy
- Screen lock with PIN
- Auto-lock on inactivity

### 💬 Messaging
- Real-time chat (1-on-1 and groups)
- Message pinning
- Reply to messages
- Delete for me / Delete for everyone
- Message search
- Typing indicators
- Online/offline status
- Seen by indicators

### 👥 Groups
- Create group chats
- Search and add members
- View group members
- Group admin roles
- Pin chats to top

### 👤 Profile & Settings
- Upload profile photo
- Update personal info
- Privacy settings
- Notification preferences
- Theme customization

### 🖼️ Wallpaper Feature
- Browse wallpapers
- Download wallpapers
- Apply as device wallpaper
- Disguise mode

---

## 📱 App Architecture

### Tech Stack
- **Frontend:** React Native
- **State Management:** Redux + Redux Persist
- **Backend:** Firebase (Auth, Firestore, Storage, FCM)
- **Navigation:** React Navigation
- **UI:** Custom components with animations

### Key Directories

```
src/
├── api/              # API configuration
├── assets/           # Images, icons, fonts, colors
├── component/        # Reusable UI components
├── helper/           # Utility functions
├── redux/            # Redux state management
├── Routes/           # Navigation configuration
├── screens/          # App screens
│   ├── HomeScreen/       # Chat list
│   ├── ChatScreen/       # Chat interface
│   ├── ProfileScreen/    # User profile
│   ├── LoginScreen/      # Authentication
│   └── ...
└── utils/            # Helper utilities
```

---

## ⚡ Performance Optimizations

This app includes significant performance improvements:

- **95% reduction** in Firestore reads
- **Real-time updates** without N+1 queries
- **Optimized FlatLists** for smooth scrolling
- **Memoized components** to prevent re-renders
- **Denormalized data** for fast queries

See `PERFORMANCE_IMPROVEMENTS_DONE.md` for technical details.

---

## 🔧 Development

### Running in Development

```bash
# Start Metro bundler
npm start

# Run on device/emulator
npm run android  # Android
npm run ios      # iOS

# Clear cache if needed
npm start -- --reset-cache
```

### Building for Production

#### Android
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/
```

#### iOS
```bash
cd ios
xcodebuild -workspace wallpe.xcworkspace -scheme wallpe -configuration Release
```

---

## 📦 Key Dependencies

```json
{
  "@react-native-firebase/app": "Firebase core",
  "@react-native-firebase/auth": "Authentication",
  "@react-native-firebase/firestore": "Database",
  "@react-native-firebase/storage": "File storage",
  "@react-native-firebase/messaging": "Push notifications",
  "@react-navigation/native": "Navigation",
  "redux": "State management",
  "react-native-image-picker": "Photo selection",
  "react-native-fs": "File system access"
}
```

---

## 🗄️ Database Structure

### Firestore Collections

#### Users
```javascript
{
  uid: "user_id",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  privacySettings: {
    blockedUsers: [],
    readReceipts: true,
    lastSeen: true
  }
}
```

#### GroupChats
```javascript
{
  name: "Chat Name",
  members: ["uid1", "uid2"],
  type: "direct" | "group",
  lastMessage: {
    text: "Last message",
    senderId: "uid",
    createdAt: Timestamp
  },
  unreadCounts: {
    uid1: 2,
    uid2: 0
  },
  lastReadTimestamps: {
    uid1: Timestamp
  }
}
```

#### Messages (subcollection of GroupChats)
```javascript
{
  text: "Message content",
  senderId: "uid",
  senderName: "John Doe",
  createdAt: Timestamp,
  seenBy: ["uid1", "uid2"],
  pinned: false,
  deleted: false,
  replyTo: { id, text, sender }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### Metro bundler cache issues
```bash
npm start -- --reset-cache
rm -rf node_modules && npm install
```

#### Android build fails
```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### iOS pod install issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### Firebase Storage upload fails
- Check Firebase Storage rules
- Verify `google-services.json` / `GoogleService-Info.plist`
- See `FIREBASE_STORAGE_SETUP.md`

---

## 📄 Additional Documentation

- **FIREBASE_STORAGE_SETUP.md** - Firebase Storage configuration
- **PERFORMANCE_IMPROVEMENTS_DONE.md** - Performance optimization details

---

## 🎯 Features Roadmap

- [ ] Voice messages
- [ ] Video calls
- [ ] Message forwarding
- [ ] Media gallery
- [ ] Message reactions
- [ ] Backup & restore
- [ ] Multi-device support

---

## 📝 License

Private project - All rights reserved

---

## 👨‍💻 Development Notes

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component memoization
- Performance monitoring

### Best Practices
- Real-time listeners for live updates
- Optimistic UI updates
- Error boundaries
- Proper cleanup in useEffect
- Accessibility support

---

## 🆘 Support

For issues or questions:
1. Check troubleshooting section above
2. Review Firebase console for backend issues
3. Check device logs: `npx react-native log-android` or `npx react-native log-ios`

---

**Built with ❤️ using React Native & Firebase**

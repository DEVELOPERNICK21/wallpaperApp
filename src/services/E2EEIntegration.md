# 🔐 E2EE Integration Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install tweetnacl tweetnacl-util react-native-keychain
cd ios && pod install && cd ..
```

### 2. Initialize Keys on User Registration/Login

```typescript
import EncryptionService from '../services/EncryptionService';
import auth from '@react-native-firebase/auth';

// After user signs in
const user = auth().currentUser;
if (user) {
  const hasKeys = await EncryptionService.hasKeys(user.uid);
  if (!hasKeys) {
    // Initialize keys for new user
    await EncryptionService.initializeUserKeys(user.uid);
    console.log('✅ Encryption keys initialized');
  }
}
```

### 3. Update ChatScreen to Use Encryption

#### In `sendMessage()` function:

```typescript
import EncryptionService from '../services/EncryptionService';

const sendMessage = async () => {
  if (!messageText.trim()) return;

  try {
    // Get current user
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    // Get recipient ID (from chatId or route params)
    const recipientId = getRecipientId(chatId); // You need to implement this

    // Encrypt message
    const encryptedText = await EncryptionService.encryptMessageForUser(
      messageText,
      recipientId,
      currentUser.uid,
    );

    // Store encrypted message in Firestore
    await firestore()
      .collection('GroupChats')
      .doc(chatId)
      .collection('Messages')
      .add({
        encryptedText: encryptedText, // ✅ Encrypted
        text: '', // Keep empty for backward compatibility
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Unknown',
        createdAt: firestore.FieldValue.serverTimestamp(),
        seenBy: [currentUser.uid],
        isEncrypted: true, // Flag to indicate encryption
      });

    setMessageText('');
  } catch (error) {
    console.error('Error sending encrypted message:', error);
    Alert.alert('Error', 'Failed to send message. Please try again.');
  }
};
```

#### In Message Listener (decrypt received messages):

```typescript
useEffect(() => {
  const currentUser = auth().currentUser;
  if (!currentUser) return;

  const unsubscribe = firestore()
    .collection('GroupChats')
    .doc(chatId)
    .collection('Messages')
    .orderBy('createdAt', 'desc')
    .onSnapshot(async snapshot => {
      const messages = await Promise.all(
        snapshot.docs.map(async doc => {
          const data = doc.data();

          // Check if message is encrypted
          if (data.isEncrypted && data.encryptedText) {
            try {
              // Decrypt message
              const decryptedText =
                await EncryptionService.decryptMessageFromUser(
                  data.encryptedText,
                  data.senderId,
                  currentUser.uid,
                );

              return {
                ...data,
                text: decryptedText, // Decrypted text
                id: doc.id,
              };
            } catch (error) {
              console.error('Error decrypting message:', error);
              // Return encrypted message with error flag
              return {
                ...data,
                text: '[Unable to decrypt message]',
                decryptionError: true,
                id: doc.id,
              };
            }
          }

          // Plain text message (backward compatibility)
          return {
            ...data,
            id: doc.id,
          };
        }),
      );

      setMessages(messages);
    });

  return () => unsubscribe();
}, [chatId]);
```

### 4. Handle Group Chats (Simplified)

For group chats, you can use a shared group key:

```typescript
// Generate group key when group is created
async function generateGroupKey(groupId: string): Promise<string> {
  const keyPair = EncryptionService.generateKeyPair();
  const groupKey = naclUtil.encodeBase64(keyPair.privateKey);

  // Store group key securely (encrypted with each member's public key)
  // For now, store in Firestore (will need proper key sharing)
  await firestore().collection('GroupChats').doc(groupId).set(
    {
      groupKey: groupKey, // ⚠️ This should be encrypted per member
      encryptedAt: firestore.FieldValue.serverTimestamp(),
    },
    {merge: true},
  );

  return groupKey;
}

// Encrypt message for group
async function encryptGroupMessage(
  message: string,
  groupKey: string,
): Promise<string> {
  const keyBytes = naclUtil.decodeBase64(groupKey);
  const nonce = nacl.randomBytes(24);
  const messageBytes = naclUtil.decodeUTF8(message);

  // Use secretbox for symmetric encryption
  const encrypted = nacl.secretbox(messageBytes, nonce, keyBytes);

  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce, 0);
  combined.set(encrypted, nonce.length);

  return naclUtil.encodeBase64(combined);
}
```

### 5. Error Handling

```typescript
// Handle decryption failures gracefully
try {
  const decryptedText = await EncryptionService.decryptMessageFromUser(
    encryptedText,
    senderId,
    currentUser.uid,
  );
  return decryptedText;
} catch (error) {
  if (error.message.includes('keys not found')) {
    // Keys not initialized - prompt user to re-login
    Alert.alert(
      'Encryption Error',
      'Your encryption keys are missing. Please log out and log back in.',
    );
  } else if (error.message.includes('Decryption failed')) {
    // Invalid message or keys - show error message
    return '[Unable to decrypt message]';
  } else {
    // Unknown error
    console.error('Decryption error:', error);
    return '[Message decryption error]';
  }
}
```

### 6. Migration Strategy

#### For Existing Messages:

- Keep plain text messages as-is (backward compatibility)
- New messages will be encrypted
- Optional: Add migration script to encrypt old messages

#### For Existing Users:

- Initialize keys on next login
- Prompt user to re-login if keys are missing
- Show UI indicator for encrypted messages

### 7. UI Indicators

```typescript
// Show encryption status in message list
{
  message.isEncrypted && (
    <View style={styles.encryptionBadge}>
      <Icon name="lock" size={12} color="#4CAF50" />
      <Text style={styles.encryptionText}>Encrypted</Text>
    </View>
  );
}

// Show error for failed decryption
{
  message.decryptionError && (
    <View style={styles.errorBadge}>
      <Icon name="alert-circle" size={12} color="#F44336" />
      <Text style={styles.errorText}>Decryption failed</Text>
    </View>
  );
}
```

## Testing Checklist

- [ ] Initialize keys on user registration
- [ ] Initialize keys on user login (if missing)
- [ ] Encrypt messages before sending
- [ ] Decrypt messages after receiving
- [ ] Handle decryption failures gracefully
- [ ] Test with multiple users (1-on-1 chats)
- [ ] Test group chat encryption
- [ ] Test key rotation (advanced)
- [ ] Test message search (needs indexing)
- [ ] Test message deletion (needs key cleanup)

## Security Best Practices

1. **Never store private keys in Firestore or AsyncStorage**

   - Use `react-native-keychain` for secure storage
   - Use device hardware security when available

2. **Always use unique nonces**

   - Generated automatically by `nacl.randomBytes(24)`
   - Never reuse nonces

3. **Verify public keys**

   - Implement key verification (out-of-band)
   - Show security codes to users

4. **Rotate keys periodically**

   - Implement key rotation for forward secrecy
   - Delete old keys after rotation

5. **Handle errors gracefully**
   - Don't expose encryption errors to users
   - Log errors for debugging
   - Show user-friendly error messages

## Next Steps

1. **Install dependencies** (`tweetnacl`, `react-native-keychain`)
2. **Initialize keys** on user login
3. **Update ChatScreen** to use encryption
4. **Test with 1-on-1 chats** first
5. **Implement group chat encryption** (more complex)
6. **Add UI indicators** for encrypted messages
7. **Security audit** (get professional review)

## Resources

- [E2EE Implementation Plan](./E2EE_IMPLEMENTATION_PLAN.md)
- [tweetnacl-js Documentation](https://github.com/dchest/tweetnacl-js)
- [react-native-keychain](https://github.com/oblador/react-native-keychain)
- [Signal Protocol Documentation](https://signal.org/docs/)

---

**Ready to implement? Start with step 1! 🚀**

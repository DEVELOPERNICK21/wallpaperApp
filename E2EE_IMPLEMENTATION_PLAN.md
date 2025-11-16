# 🔐 End-to-End Encryption Implementation Plan

## 📊 Current State Analysis

### What You Have Now

- ❌ **Messages stored in plain text** in Firestore
- ❌ **No encryption libraries** installed
- ❌ **No key management** system
- ⚠️ **Marketing claims E2EE** but code doesn't implement it
- ✅ **Firebase Auth** for user authentication
- ✅ **Firestore** for message storage
- ✅ **AsyncStorage** for local data

### What Needs to Change

1. Install encryption library (tweetnacl-js recommended)
2. Implement key generation and storage
3. Implement key exchange protocol
4. Encrypt messages before sending to Firestore
5. Decrypt messages after receiving from Firestore
6. Handle group chat encryption (more complex)
7. Implement key rotation

---

## 🎯 Implementation Options

### Option 1: **tweetnacl-js** (Recommended for React Native)

**Pros:**

- ✅ Pure JavaScript, works on React Native
- ✅ Small bundle size (~50KB)
- ✅ Well-audited, used by Signal
- ✅ Supports NaCl crypto (box, secretbox)
- ✅ No native dependencies

**Cons:**

- ⚠️ Slower than native libsodium
- ⚠️ Requires key exchange protocol implementation

**Package:** `tweetnacl-js` or `react-native-tweetnacl`

---

### Option 2: **libsodium.js** (More Features)

**Pros:**

- ✅ More crypto primitives
- ✅ Better performance than tweetnacl
- ✅ Extensive documentation

**Cons:**

- ⚠️ Larger bundle size (~200KB)
- ⚠️ More complex API
- ⚠️ May have React Native compatibility issues

**Package:** `libsodium-wrappers` or `react-native-libsodium`

---

### Option 3: **React Native Crypto** (Native Performance)

**Pros:**

- ✅ Native performance
- ✅ Hardware acceleration

**Cons:**

- ❌ Requires native module compilation
- ❌ More complex setup
- ❌ Platform-specific code

**Package:** `react-native-crypto` (requires native modules)

---

## 🏗️ Recommended Architecture: tweetnacl-js

### Step 1: Install Dependencies

```bash
npm install tweetnacl tweetnacl-util
npm install @react-native-async-storage/async-storage  # Already installed
npm install react-native-keychain  # For secure key storage
```

---

### Step 2: Key Management Structure

```typescript
// Each user has:
// 1. Identity Key Pair (long-term, never changes)
// 2. Pre-Key Pairs (one-time use, for key exchange)
// 3. Signed Pre-Key (signed by identity key)
// 4. Session Keys (derived from key exchange, per chat)

interface UserKeys {
  identityKeyPair: {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
  };
  signedPreKey: {
    keyPair: {publicKey: Uint8Array; privateKey: Uint8Array};
    signature: Uint8Array;
    keyId: number;
  };
  oneTimePreKeys: Array<{
    keyPair: {publicKey: Uint8Array; privateKey: Uint8Array};
    keyId: number;
  }>;
}

// Store in Firestore (public keys only)
// Store private keys in react-native-keychain (secure storage)
```

---

### Step 3: Key Exchange Protocol

#### For 1-on-1 Chats (Simplified X3DH)

1. **User A wants to chat with User B:**

   - Fetch User B's public keys from Firestore
   - Generate ephemeral key pair
   - Perform X3DH key exchange:
     ```
     sharedSecret = X3DH(
       A's identity key,
       A's ephemeral key,
       B's identity key,
       B's signed pre-key,
       B's one-time pre-key
     )
     ```
   - Derive session key from shared secret
   - Store session key securely

2. **Store in Firestore:**

   ```javascript
   // Public keys only (safe to store)
   Users/{userId}/publicKeys: {
     identityPublicKey: base64,
     signedPreKey: {
       publicKey: base64,
       signature: base64,
       keyId: number
     },
     oneTimePreKeys: [
       { publicKey: base64, keyId: number },
       ...
     ]
   }
   ```

3. **Store locally (secure):**
   ```javascript
   // Private keys in react-native-keychain
   await Keychain.setGenericPassword('identityPrivateKey', base64(privateKey));
   ```

---

### Step 4: Message Encryption/Decryption

#### Encrypt Before Sending

```typescript
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

async function encryptMessage(
  messageText: string,
  recipientPublicKey: Uint8Array,
  senderPrivateKey: Uint8Array,
): Promise<string> {
  // Generate nonce (random number, used once)
  const nonce = nacl.randomBytes(24);

  // Convert message to bytes
  const messageBytes = naclUtil.decodeUTF8(messageText);

  // Encrypt using NaCl box (public-key encryption)
  const encrypted = nacl.box(
    messageBytes,
    nonce,
    recipientPublicKey,
    senderPrivateKey,
  );

  // Combine nonce + encrypted message
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce, 0);
  combined.set(encrypted, nonce.length);

  // Encode to base64 for Firestore storage
  return naclUtil.encodeBase64(combined);
}
```

#### Decrypt After Receiving

```typescript
async function decryptMessage(
  encryptedBase64: string,
  senderPublicKey: Uint8Array,
  recipientPrivateKey: Uint8Array,
): Promise<string> {
  // Decode from base64
  const combined = naclUtil.decodeBase64(encryptedBase64);

  // Extract nonce (first 24 bytes)
  const nonce = combined.slice(0, 24);

  // Extract encrypted message (remaining bytes)
  const encrypted = combined.slice(24);

  // Decrypt using NaCl box
  const decrypted = nacl.box.open(
    encrypted,
    nonce,
    senderPublicKey,
    recipientPrivateKey,
  );

  if (!decrypted) {
    throw new Error('Failed to decrypt message');
  }

  // Convert bytes to string
  return naclUtil.encodeUTF8(decrypted);
}
```

---

### Step 5: Update Firestore Structure

#### Current (Plain Text)

```javascript
Messages: {
  text: "Hello, how are you?",  // ❌ Plain text
  senderId: "user123",
  senderName: "John",
  createdAt: timestamp
}
```

#### New (Encrypted)

```javascript
Messages: {
  encryptedText: "base64_encrypted_message",  // ✅ Encrypted
  senderId: "user123",
  senderName: "John",  // Optional: could encrypt this too
  createdAt: timestamp,
  keyId: 123,  // Which pre-key was used
  nonce: "base64_nonce"  // If stored separately
}
```

---

### Step 6: Group Chat Encryption

Group chats are **more complex** because:

- Multiple recipients need to decrypt
- Keys need to be shared securely
- Members joining/leaving requires key rotation

#### Option A: **Sender Keys** (Simpler)

- Each group has a shared symmetric key
- Sender encrypts once with group key
- All members can decrypt
- ⚠️ Key rotation needed when members leave

#### Option B: **Multiple Encryptions** (More Secure)

- Sender encrypts message separately for each member
- Each member has their own encrypted copy
- ✅ More secure (forward secrecy)
- ❌ More storage and computation

**Recommended:** Start with Option A for MVP, upgrade to Option B later.

---

## 📋 Implementation Checklist

### Phase 1: Foundation (Week 1-2)

- [ ] Install `tweetnacl` and `react-native-keychain`
- [ ] Create key generation service
- [ ] Implement secure key storage (react-native-keychain)
- [ ] Create key management utilities
- [ ] Test key generation and storage

### Phase 2: Key Exchange (Week 2-3)

- [ ] Implement X3DH key exchange protocol
- [ ] Create Firestore structure for public keys
- [ ] Build key fetching service
- [ ] Implement session key derivation
- [ ] Test key exchange between two users

### Phase 3: Message Encryption (Week 3-4)

- [ ] Implement `encryptMessage()` function
- [ ] Implement `decryptMessage()` function
- [ ] Update `sendMessage()` to encrypt before Firestore
- [ ] Update message listeners to decrypt after Firestore
- [ ] Test encrypted messaging flow

### Phase 4: Group Chats (Week 4-5)

- [ ] Implement group key generation
- [ ] Implement group key sharing
- [ ] Update group message encryption
- [ ] Implement key rotation on member change
- [ ] Test group chat encryption

### Phase 5: Migration & Testing (Week 5-6)

- [ ] Create migration script for existing messages
- [ ] Add error handling for decryption failures
- [ ] Implement key rotation
- [ ] Add UI indicators for encrypted messages
- [ ] Security audit and testing

---

## 🔒 Security Considerations

### 1. **Key Storage**

- ✅ Use `react-native-keychain` for private keys
- ✅ Never store private keys in AsyncStorage or Firestore
- ✅ Use device hardware security (Keychain/Keystore)

### 2. **Key Exchange**

- ✅ Verify signatures on pre-keys
- ✅ Rotate pre-keys periodically
- ✅ Implement key verification (out-of-band)

### 3. **Message Encryption**

- ✅ Always use unique nonces
- ✅ Implement message authentication (MAC)
- ✅ Handle decryption failures gracefully

### 4. **Forward Secrecy**

- ✅ Rotate session keys periodically
- ✅ Delete old keys after rotation
- ✅ Implement "double ratchet" for perfect forward secrecy (advanced)

### 5. **Group Security**

- ✅ Rotate group keys when members leave
- ✅ Verify member identities
- ✅ Prevent unauthorized key sharing

---

## 🚀 Quick Start Implementation

### 1. Install Dependencies

```bash
npm install tweetnacl tweetnacl-util react-native-keychain
cd ios && pod install && cd ..  # iOS only
```

### 2. Create Encryption Service

Create `src/services/EncryptionService.ts`:

```typescript
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import * as Keychain from 'react-native-keychain';

class EncryptionService {
  // Generate key pair for user
  async generateKeyPair(): Promise<nacl.BoxKeyPair> {
    return nacl.box.keyPair();
  }

  // Store private key securely
  async storePrivateKey(userId: string, privateKey: Uint8Array): Promise<void> {
    const privateKeyBase64 = naclUtil.encodeBase64(privateKey);
    await Keychain.setInternetCredentials(
      `user_${userId}_private_key`,
      userId,
      privateKeyBase64,
    );
  }

  // Get private key from secure storage
  async getPrivateKey(userId: string): Promise<Uint8Array | null> {
    const credentials = await Keychain.getInternetCredentials(
      `user_${userId}_private_key`,
    );
    if (!credentials) return null;
    return naclUtil.decodeBase64(credentials.password);
  }

  // Encrypt message
  encryptMessage(
    message: string,
    recipientPublicKey: Uint8Array,
    senderPrivateKey: Uint8Array,
  ): string {
    const nonce = nacl.randomBytes(24);
    const messageBytes = naclUtil.decodeUTF8(message);
    const encrypted = nacl.box(
      messageBytes,
      nonce,
      recipientPublicKey,
      senderPrivateKey,
    );
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce, 0);
    combined.set(encrypted, nonce.length);
    return naclUtil.encodeBase64(combined);
  }

  // Decrypt message
  decryptMessage(
    encryptedBase64: string,
    senderPublicKey: Uint8Array,
    recipientPrivateKey: Uint8Array,
  ): string {
    const combined = naclUtil.decodeBase64(encryptedBase64);
    const nonce = combined.slice(0, 24);
    const encrypted = combined.slice(24);
    const decrypted = nacl.box.open(
      encrypted,
      nonce,
      senderPublicKey,
      recipientPrivateKey,
    );
    if (!decrypted) {
      throw new Error('Failed to decrypt message');
    }
    return naclUtil.encodeUTF8(decrypted);
  }
}

export default new EncryptionService();
```

### 3. Update ChatScreen to Use Encryption

```typescript
// In ChatScreen.js - sendMessage function
import EncryptionService from '../services/EncryptionService';

const sendMessage = async () => {
  if (!messageText.trim()) return;

  // Get recipient's public key from Firestore
  const recipientDoc = await firestore()
    .collection('Users')
    .doc(recipientId)
    .get();
  const recipientPublicKey = naclUtil.decodeBase64(
    recipientDoc.data().publicKeys.identityPublicKey,
  );

  // Get sender's private key from secure storage
  const senderPrivateKey = await EncryptionService.getPrivateKey(
    currentUser.uid,
  );
  if (!senderPrivateKey) {
    Alert.alert('Error', 'Encryption keys not found');
    return;
  }

  // Encrypt message
  const encryptedText = EncryptionService.encryptMessage(
    messageText,
    recipientPublicKey,
    senderPrivateKey,
  );

  // Store encrypted message in Firestore
  await firestore()
    .collection('GroupChats')
    .doc(chatId)
    .collection('Messages')
    .add({
      encryptedText: encryptedText, // ✅ Encrypted
      text: '', // Keep for backward compatibility (empty)
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      createdAt: firestore.FieldValue.serverTimestamp(),
      seenBy: [currentUser.uid],
    });
};
```

---

## ⚠️ Important Notes

### 1. **Migration Strategy**

- Existing messages will remain in plain text
- New messages will be encrypted
- Consider adding migration script to encrypt old messages (optional)

### 2. **Backward Compatibility**

- Keep `text` field for backward compatibility
- Add `encryptedText` field for new encrypted messages
- Check which field exists when displaying messages

### 3. **Error Handling**

- Handle decryption failures gracefully
- Show user-friendly error messages
- Log encryption errors for debugging

### 4. **Performance**

- Encryption/decryption is CPU-intensive
- Consider background encryption for large messages
- Cache decrypted messages temporarily

### 5. **Testing**

- Test with multiple users
- Test key exchange flow
- Test decryption failures
- Test group chat encryption

---

## 🎯 Next Steps

1. **Review this plan** and choose implementation approach
2. **Install dependencies** (tweetnacl, react-native-keychain)
3. **Create EncryptionService** (start with basic encrypt/decrypt)
4. **Test with 1-on-1 chats** (simplest case)
5. **Implement key exchange** (X3DH protocol)
6. **Add group chat support** (more complex)
7. **Security audit** (get professional review)

---

## 📚 Resources

- [tweetnacl-js Documentation](https://github.com/dchest/tweetnacl-js)
- [Signal Protocol Documentation](https://signal.org/docs/)
- [X3DH Key Agreement Protocol](https://signal.org/docs/specifications/x3dh/)
- [Double Ratchet Algorithm](https://signal.org/docs/specifications/doubleratchet/)
- [react-native-keychain](https://github.com/oblador/react-native-keychain)

---

## 🤔 Decision: Start Simple or Full Implementation?

### **Option A: Simple Encryption (MVP)**

- Use symmetric encryption (shared secret)
- Easier to implement
- Less secure (no perfect forward secrecy)
- Good for MVP/testing

### **Option B: Full E2EE (Production)**

- Use X3DH key exchange
- Implement double ratchet
- Perfect forward secrecy
- More complex, production-ready

**Recommendation:** Start with Option A for MVP, upgrade to Option B for production.

---

**Ready to implement? Let's start with the foundation! 🚀**

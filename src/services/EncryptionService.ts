/**
 * End-to-End Encryption Service
 * Uses tweetnacl-js for encryption/decryption
 * Implements NaCl box (public-key encryption) for 1-on-1 chats
 */

// IMPORTANT: Must import this FIRST to provide PRNG for tweetnacl
import 'react-native-get-random-values';

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import * as Keychain from 'react-native-keychain';
import firestore from '@react-native-firebase/firestore';

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface PublicKeys {
  identityPublicKey: string; // Base64 encoded
  signedPreKey?: {
    publicKey: string;
    signature: string;
    keyId: number;
  };
  oneTimePreKeys?: Array<{
    publicKey: string;
    keyId: number;
  }>;
}

class EncryptionService {
  /**
   * Test if PRNG (random number generator) is available
   */
  testPRNG(): boolean {
    try {
      // Try to generate random bytes - this will fail if PRNG is not available
      const testBytes = nacl.randomBytes(32);
      if (!testBytes || testBytes.length !== 32) {
        console.error('❌ PRNG test failed: Invalid random bytes');
        return false;
      }
      console.log('✅ PRNG test passed: Random bytes generated successfully');
      return true;
    } catch (error: any) {
      console.error('❌ PRNG test failed:', error?.message || error);
      return false;
    }
  }

  /**
   * Generate a new key pair for user
   */
  generateKeyPair(): nacl.BoxKeyPair {
    // Test PRNG before generating keys
    if (!this.testPRNG()) {
      throw new Error(
        'PRNG (Pseudo-Random Number Generator) is not available. Please ensure react-native-get-random-values is imported at the top of index.js'
      );
    }
    
    try {
      const keyPair = nacl.box.keyPair();
      if (!keyPair || !keyPair.publicKey || !keyPair.privateKey) {
        throw new Error('Failed to generate key pair');
      }
      console.log('✅ Key pair generated successfully');
      return keyPair;
    } catch (error: any) {
      console.error('❌ Error generating key pair:', error);
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('PRNG') || errorMessage.includes('random')) {
        throw new Error(
          'Cannot generate encryption keys: Random number generator not available. Please restart the app after installing react-native-get-random-values.'
        );
      }
      throw error;
    }
  }

  /**
   * Store private key securely using react-native-keychain
   */
  async storePrivateKey(userId: string, privateKey: Uint8Array): Promise<void> {
    try {
      const privateKeyBase64 = naclUtil.encodeBase64(privateKey);
      
      // First, try to reset any existing credentials
      try {
        await Keychain.resetInternetCredentials(`user_${userId}_private_key`);
      } catch (resetError) {
        // Ignore if credentials don't exist
        console.log('No existing credentials to reset');
      }

      const result = await Keychain.setInternetCredentials(
        `user_${userId}_private_key`,
        userId,
        privateKeyBase64,
        {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
      
      // Verify the key was stored
      const stored = await Keychain.getInternetCredentials(`user_${userId}_private_key`);
      if (!stored || !stored.password) {
        throw new Error('Failed to verify key storage in keychain');
      }
      
      console.log('✅ Private key stored securely');
    } catch (error: any) {
      console.error('Error storing private key:', error);
      const errorMessage = error?.message || String(error);
      throw new Error(`Keychain error: ${errorMessage}`);
    }
  }

  /**
   * Get private key from secure storage
   */
  async getPrivateKey(userId: string): Promise<Uint8Array | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(
        `user_${userId}_private_key`
      );
      if (!credentials || !credentials.password) {
        return null;
      }
      return naclUtil.decodeBase64(credentials.password);
    } catch (error) {
      console.error('Error getting private key:', error);
      return null;
    }
  }

  /**
   * Store public keys in Firestore (safe to store publicly)
   */
  async storePublicKeys(userId: string, publicKeys: PublicKeys): Promise<void> {
    try {
      await firestore()
        .collection('Users')
        .doc(userId)
        .set(
          {
            publicKeys: publicKeys,
            publicKeysUpdatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      console.log('✅ Public keys stored in Firestore');
    } catch (error) {
      console.error('Error storing public keys:', error);
      throw error;
    }
  }

  /**
   * Get public keys from Firestore
   */
  async getPublicKeys(userId: string): Promise<PublicKeys | null> {
    try {
      const userDoc = await firestore()
        .collection('Users')
        .doc(userId)
        .get();
      if (!userDoc.exists) {
        return null;
      }
      return userDoc.data()?.publicKeys || null;
    } catch (error) {
      console.error('Error getting public keys:', error);
      return null;
    }
  }

  /**
   * Initialize encryption keys for user (first time setup)
   */
  async initializeUserKeys(userId: string): Promise<{
    publicKeys: PublicKeys;
    privateKey: Uint8Array;
  }> {
    try {
      // Generate identity key pair
      const keyPair = this.generateKeyPair();

      // Encode public key to base64 for storage
      const publicKeys: PublicKeys = {
        identityPublicKey: naclUtil.encodeBase64(keyPair.publicKey),
      };

      // Store private key securely
      await this.storePrivateKey(userId, keyPair.privateKey);

      // Store public keys in Firestore
      await this.storePublicKeys(userId, publicKeys);

      console.log('✅ User keys initialized');
      return {
        publicKeys,
        privateKey: keyPair.privateKey,
      };
    } catch (error) {
      console.error('Error initializing user keys:', error);
      throw error;
    }
  }

  /**
   * Encrypt message for recipient
   */
  encryptMessage(
    message: string,
    recipientPublicKey: Uint8Array,
    senderPrivateKey: Uint8Array
  ): string {
    try {
      // Generate random nonce (number used once)
      const nonce = nacl.randomBytes(24);

      // Convert message to bytes
      const messageBytes = naclUtil.decodeUTF8(message);

      // Encrypt using NaCl box (public-key encryption)
      const encrypted = nacl.box(
        messageBytes,
        nonce,
        recipientPublicKey,
        senderPrivateKey
      );

      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      // Combine nonce + encrypted message
      const combined = new Uint8Array(nonce.length + encrypted.length);
      combined.set(nonce, 0);
      combined.set(encrypted, nonce.length);

      // Encode to base64 for Firestore storage
      return naclUtil.encodeBase64(combined);
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw error;
    }
  }

  /**
   * Decrypt message from sender
   */
  decryptMessage(
    encryptedBase64: string,
    senderPublicKey: Uint8Array,
    recipientPrivateKey: Uint8Array
  ): string {
    try {
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
        recipientPrivateKey
      );

      if (!decrypted) {
        throw new Error('Decryption failed - invalid message or keys');
      }

      // Convert bytes to string
      return naclUtil.encodeUTF8(decrypted);
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }

  /**
   * Check if user has encryption keys initialized
   */
  async hasKeys(userId: string): Promise<boolean> {
    const privateKey = await this.getPrivateKey(userId);
    const publicKeys = await this.getPublicKeys(userId);
    return privateKey !== null && publicKeys !== null;
  }

  /**
   * Diagnostic function to check keychain and Firestore accessibility
   */
  async diagnoseKeyStorage(userId: string): Promise<{
    keychainAccessible: boolean;
    firestoreAccessible: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let keychainAccessible = false;
    let firestoreAccessible = false;

    // Test keychain access
    try {
      const testKey = naclUtil.encodeBase64(nacl.randomBytes(32));
      await Keychain.setInternetCredentials(
        `test_${Date.now()}`,
        'test',
        testKey,
        {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
      keychainAccessible = true;
      console.log('✅ Keychain is accessible');
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      issues.push(`Keychain error: ${errorMsg}`);
      console.error('❌ Keychain not accessible:', errorMsg);
    }

    // Test Firestore access
    try {
      const testDoc = await firestore()
        .collection('Users')
        .doc(userId)
        .get();
      firestoreAccessible = true;
      console.log('✅ Firestore is accessible');
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      issues.push(`Firestore error: ${errorMsg}`);
      console.error('❌ Firestore not accessible:', errorMsg);
    }

    return {
      keychainAccessible,
      firestoreAccessible,
      issues,
    };
  }

  /**
   * Diagnose encryption issues and provide helpful error messages
   */
  async diagnoseEncryptionIssue(
    senderUserId: string,
    recipientUserId: string
  ): Promise<{
    canEncrypt: boolean;
    issue: string | null;
    solution: string | null;
  }> {
    // Check sender's keys
    const senderPrivateKey = await this.getPrivateKey(senderUserId);
    const senderPublicKeys = await this.getPublicKeys(senderUserId);

    if (!senderPrivateKey) {
      return {
        canEncrypt: false,
        issue: 'Your encryption keys are missing from device storage.',
        solution: 'Please log out and log back in to initialize your encryption keys.',
      };
    }

    if (!senderPublicKeys?.identityPublicKey) {
      return {
        canEncrypt: false,
        issue: 'Your public keys are missing from Firestore.',
        solution: 'Please log out and log back in to re-initialize your encryption keys.',
      };
    }

    // Check recipient's keys
    const recipientPublicKeys = await this.getPublicKeys(recipientUserId);

    if (!recipientPublicKeys?.identityPublicKey) {
      return {
        canEncrypt: false,
        issue: `Recipient's encryption keys are missing. User ID: ${recipientUserId}`,
        solution: 'The recipient needs to log in to initialize their encryption keys.',
      };
    }

    // Try to decode keys to verify they're valid
    try {
      naclUtil.decodeBase64(senderPublicKeys.identityPublicKey);
      naclUtil.decodeBase64(recipientPublicKeys.identityPublicKey);
    } catch (error) {
      return {
        canEncrypt: false,
        issue: 'Invalid key format detected.',
        solution: 'Please log out and log back in to regenerate your encryption keys.',
      };
    }

    return {
      canEncrypt: true,
      issue: null,
      solution: null,
    };
  }

  /**
   * Force re-initialize keys (useful if keys are corrupted or missing)
   * WARNING: This will generate new keys, making old encrypted messages unreadable
   */
  async forceReinitializeKeys(userId: string): Promise<void> {
    if (!userId || userId.trim() === '') {
      throw new Error('Invalid user ID. Cannot initialize keys without a valid user ID.');
    }

    try {
      console.log('🔄 Force re-initializing encryption keys for user:', userId);
      
      // Generate new key pair
      const keyPair = this.generateKeyPair();
      console.log('✅ Key pair generated');

      // Encode public key to base64 for storage
      const publicKeys: PublicKeys = {
        identityPublicKey: naclUtil.encodeBase64(keyPair.publicKey),
      };
      console.log('✅ Public key encoded');

      // Store private key securely (this will overwrite existing)
      try {
        await this.storePrivateKey(userId, keyPair.privateKey);
        console.log('✅ Private key stored in keychain');
      } catch (keychainError: any) {
        console.error('❌ Error storing private key in keychain:', keychainError);
        const errorMessage = keychainError?.message || String(keychainError);
        
        if (errorMessage.includes('UserCancel') || errorMessage.includes('cancel')) {
          throw new Error('Key initialization cancelled. Please try again.');
        } else if (errorMessage.includes('Biometry') || errorMessage.includes('TouchID') || errorMessage.includes('FaceID')) {
          throw new Error('Biometric authentication failed. Please check your device settings and try again.');
        } else if (errorMessage.includes('Keychain') || errorMessage.includes('keychain')) {
          throw new Error('Unable to access device keychain. Please ensure your device is unlocked and try again.');
        } else {
          throw new Error(`Failed to store private key: ${errorMessage}. Please try logging out and back in.`);
        }
      }

      // Store public keys in Firestore (this will overwrite existing)
      try {
        await this.storePublicKeys(userId, publicKeys);
        console.log('✅ Public keys stored in Firestore');
      } catch (firestoreError: any) {
        console.error('❌ Error storing public keys in Firestore:', firestoreError);
        const errorMessage = firestoreError?.message || String(firestoreError);
        
        // Try to clean up - remove private key if Firestore fails
        try {
          await Keychain.resetInternetCredentials(`user_${userId}_private_key`);
          console.log('⚠️ Cleaned up private key after Firestore failure');
        } catch (cleanupError) {
          console.error('⚠️ Error cleaning up private key:', cleanupError);
        }

        if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
          throw new Error('Permission denied. Please check your Firestore security rules.');
        } else if (errorMessage.includes('network') || errorMessage.includes('Network') || errorMessage.includes('unavailable')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else {
          throw new Error(`Failed to store public keys in Firestore: ${errorMessage}. Please check your internet connection.`);
        }
      }

      console.log('✅ Keys force re-initialized successfully');
    } catch (error) {
      console.error('❌ Error force re-initializing keys:', error);
      // Re-throw with better error message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to initialize encryption keys: ${String(error)}`);
    }
  }

  /**
   * Encrypt message text (helper for Firestore integration)
   */
  async encryptMessageForUser(
    messageText: string,
    recipientUserId: string,
    senderUserId: string
  ): Promise<string> {
    try {
      // Get recipient's public key
      const recipientPublicKeys = await this.getPublicKeys(recipientUserId);
      if (!recipientPublicKeys?.identityPublicKey) {
        throw new Error(
          `Recipient's encryption keys not found. User ID: ${recipientUserId}. They may need to log in again to initialize their keys.`
        );
      }

      let recipientPublicKey: Uint8Array;
      try {
        recipientPublicKey = naclUtil.decodeBase64(
          recipientPublicKeys.identityPublicKey
        );
      } catch (error) {
        throw new Error(
          `Invalid recipient public key format. User ID: ${recipientUserId}`
        );
      }

      // Get sender's private key
      const senderPrivateKey = await this.getPrivateKey(senderUserId);
      if (!senderPrivateKey) {
        throw new Error(
          `Your encryption keys not found. Please log out and log back in to initialize your keys. User ID: ${senderUserId}`
        );
      }

      // Encrypt message
      return this.encryptMessage(
        messageText,
        recipientPublicKey,
        senderPrivateKey
      );
    } catch (error) {
      console.error('Error encrypting message for user:', error);
      // Re-throw with more context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Encryption failed: ${String(error)}`);
    }
  }

  /**
   * Decrypt message text (helper for Firestore integration)
   */
  async decryptMessageFromUser(
    encryptedText: string,
    senderUserId: string,
    recipientUserId: string
  ): Promise<string> {
    try {
      // Get sender's public key
      const senderPublicKeys = await this.getPublicKeys(senderUserId);
      if (!senderPublicKeys?.identityPublicKey) {
        throw new Error('Sender public keys not found');
      }

      const senderPublicKey = naclUtil.decodeBase64(
        senderPublicKeys.identityPublicKey
      );

      // Get recipient's private key
      const recipientPrivateKey = await this.getPrivateKey(recipientUserId);
      if (!recipientPrivateKey) {
        throw new Error('Recipient private key not found');
      }

      // Decrypt message
      return this.decryptMessage(
        encryptedText,
        senderPublicKey,
        recipientPrivateKey
      );
    } catch (error) {
      console.error('Error decrypting message from user:', error);
      throw error;
    }
  }
}

export default new EncryptionService();


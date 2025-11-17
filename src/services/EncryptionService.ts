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
    
    // Ensure PRNG is available by generating some random bytes first
    try {
      const testBytes = nacl.randomBytes(32);
      if (!testBytes || testBytes.length !== 32) {
        throw new Error('PRNG test bytes generation failed');
      }
    } catch (prngError: any) {
      throw new Error(
        `PRNG not working properly: ${prngError?.message || String(prngError)}`
      );
    }
    
    try {
      console.log('🔐 Attempting to generate key pair...');
      console.log('🔐 nacl available:', typeof nacl === 'object');
      console.log('🔐 nacl.box available:', typeof nacl.box === 'object');
      console.log('🔐 nacl.box.keyPair available:', typeof nacl.box.keyPair === 'function');
      
      // Try to generate key pair
      let keyPair: nacl.BoxKeyPair;
      try {
        keyPair = nacl.box.keyPair();
      } catch (keyPairError: any) {
        console.error('❌ nacl.box.keyPair() threw an error:', keyPairError);
        console.error('❌ Error details:', keyPairError?.message, keyPairError?.stack);
        throw new Error(
          `Failed to call nacl.box.keyPair(): ${keyPairError?.message || String(keyPairError)}`
        );
      }
      
      console.log('🔐 keyPair result:', keyPair);
      console.log('🔐 keyPair type:', typeof keyPair);
      console.log('🔐 keyPair is object:', keyPair && typeof keyPair === 'object');
      
      if (!keyPair) {
        console.error('❌ keyPair is null or undefined');
        throw new Error('Failed to generate key pair: keyPair is null or undefined');
      }
      
      // tweetnacl returns secretKey, not privateKey
      const secretKey = (keyPair as any).secretKey || (keyPair as any).privateKey;
      
      if (!keyPair.publicKey) {
        console.error('❌ keyPair.publicKey is missing');
        console.error('❌ keyPair keys:', Object.keys(keyPair));
        console.error('❌ keyPair values:', Object.values(keyPair));
        throw new Error('Failed to generate key pair: publicKey is missing');
      }
      
      if (!secretKey) {
        console.error('❌ keyPair.secretKey/privateKey is missing');
        console.error('❌ keyPair keys:', Object.keys(keyPair));
        console.error('❌ keyPair values:', Object.values(keyPair));
        throw new Error('Failed to generate key pair: secretKey/privateKey is missing');
      }
      
      // Verify key lengths
      if (keyPair.publicKey.length !== 32) {
        console.error('❌ Invalid public key length:', keyPair.publicKey.length);
        throw new Error(`Invalid public key length: ${keyPair.publicKey.length}, expected 32`);
      }
      
      if (secretKey.length !== 32) {
        console.error('❌ Invalid secret key length:', secretKey.length);
        throw new Error(`Invalid secret key length: ${secretKey.length}, expected 32`);
      }
      
      console.log('✅ Key pair generated successfully');
      console.log('✅ Public key length:', keyPair.publicKey.length);
      console.log('✅ Secret key length:', secretKey.length);
      
      // Return with privateKey property for consistency with our interface
      return {
        publicKey: keyPair.publicKey,
        privateKey: secretKey,
      } as nacl.BoxKeyPair;
    } catch (error: any) {
      console.error('❌ Error generating key pair:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);
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
      console.log(`🔐 Attempting to store private key for user: ${userId}`);
      const privateKeyBase64 = naclUtil.encodeBase64(privateKey);
      console.log(`🔐 Key encoded, length: ${privateKeyBase64.length}`);

      // First, try to reset any existing credentials
      try {
        await Keychain.resetInternetCredentials(`user_${userId}_private_key`);
        console.log('✅ Existing credentials reset');
      } catch (resetError: any) {
        // Ignore if credentials don't exist
        const resetErrorMsg = resetError?.message || String(resetError);
        if (
          resetErrorMsg.includes('not found') ||
          resetErrorMsg.includes('No credentials')
        ) {
          console.log('ℹ️ No existing credentials to reset');
        } else {
          console.warn('⚠️ Error resetting credentials (non-fatal):', resetErrorMsg);
        }
      }

      console.log('🔐 Storing credentials in keychain...');
      const result = await Keychain.setInternetCredentials(
        `user_${userId}_private_key`,
        userId,
        privateKeyBase64,
        {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );

      if (!result) {
        throw new Error('Keychain.setInternetCredentials returned false');
      }
      console.log('✅ Credentials stored in keychain');

      // Wait a bit for keychain to sync
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the key was stored
      console.log('🔍 Verifying key storage...');
      const stored = await Keychain.getInternetCredentials(`user_${userId}_private_key`);
      if (!stored) {
        throw new Error('Keychain.getInternetCredentials returned null');
      }
      if (!stored.password) {
        throw new Error('Stored credentials missing password field');
      }
      if (stored.password !== privateKeyBase64) {
        throw new Error('Stored key does not match original key');
      }

      console.log('✅ Private key stored and verified successfully');
    } catch (error: any) {
      console.error('❌ Error storing private key:', error);
      const errorMessage = error?.message || String(error);
      console.error('❌ Keychain error details:', errorMessage);

      // Provide more specific error messages
      if (errorMessage.includes('UserCancel') || errorMessage.includes('cancel')) {
        throw new Error('Keychain access was cancelled. Please try again.');
      } else if (
        errorMessage.includes('Biometry') ||
        errorMessage.includes('TouchID') ||
        errorMessage.includes('FaceID')
      ) {
        throw new Error(
          'Biometric authentication failed. Please check your device settings.',
        );
      } else if (
        errorMessage.includes('Keychain') ||
        errorMessage.includes('keychain')
      ) {
        throw new Error(
          'Unable to access device keychain. Please ensure your device is unlocked.',
        );
      } else {
        throw new Error(`Keychain error: ${errorMessage}`);
      }
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
   * Note: Using namespaced API (deprecated but still supported in v21)
   * Will migrate to modular API when React Native Firebase v22 is released
   */
  async storePublicKeys(userId: string, publicKeys: PublicKeys): Promise<void> {
    try {
      // Using namespaced API - deprecation warning is for future v22 migration
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
   * Note: Using namespaced API (deprecated but still supported in v21)
   * Will migrate to modular API when React Native Firebase v22 is released
   */
  async getPublicKeys(userId: string): Promise<PublicKeys | null> {
    try {
      // Using namespaced API - deprecation warning is for future v22 migration
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
      console.log(`🔐 Starting key initialization for user: ${userId}`);
      
      // Generate identity key pair
      const keyPair = this.generateKeyPair();
      console.log('✅ Key pair generated');

      // Encode public key to base64 for storage
      const publicKeys: PublicKeys = {
        identityPublicKey: naclUtil.encodeBase64(keyPair.publicKey),
      };
      console.log('✅ Public key encoded');

      // Store private key securely
      console.log('🔐 Storing private key in keychain...');
      await this.storePrivateKey(userId, keyPair.privateKey);
      console.log('✅ Private key stored in keychain');

      // Verify private key was stored
      const verifyPrivateKey = await this.getPrivateKey(userId);
      if (!verifyPrivateKey) {
        throw new Error('Private key verification failed - key was not stored properly');
      }
      console.log('✅ Private key verified');

      // Store public keys in Firestore
      console.log('🔐 Storing public keys in Firestore...');
      await this.storePublicKeys(userId, publicKeys);
      console.log('✅ Public keys stored in Firestore');

      // Verify public keys were stored
      const verifyPublicKeys = await this.getPublicKeys(userId);
      if (!verifyPublicKeys?.identityPublicKey) {
        throw new Error('Public keys verification failed - keys were not stored properly');
      }
      console.log('✅ Public keys verified');

      console.log('✅ User keys initialized successfully');
      return {
        publicKeys,
        privateKey: keyPair.privateKey,
      };
    } catch (error) {
      console.error('❌ Error initializing user keys:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error details:', errorMessage);
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
   * Clear encryption keys for a user (used on logout)
   */
  async clearUserKeys(userId: string): Promise<void> {
    try {
      console.log(`🔐 Clearing encryption keys for user: ${userId}`);
      
      // Clear private key from keychain
      try {
        await Keychain.resetInternetCredentials(`user_${userId}_private_key`);
        console.log('✅ Private key cleared from keychain');
      } catch (keychainError: any) {
        // Ignore if credentials don't exist
        const errorMsg = keychainError?.message || String(keychainError);
        if (!errorMsg.includes('not found') && !errorMsg.includes('No credentials')) {
          console.warn('⚠️ Error clearing keychain (non-fatal):', errorMsg);
        } else {
          console.log('ℹ️ No private key found to clear');
        }
      }

      // Note: We don't delete public keys from Firestore on logout
      // because they might be needed for decrypting old messages
      // Public keys are safe to keep publicly
      
      console.log('✅ Encryption keys cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing encryption keys:', error);
      // Don't throw - logout should continue even if key clearing fails
    }
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
      // Check if sender has keys first, and initialize if missing
      const senderHasKeys = await this.hasKeys(senderUserId);
      if (!senderHasKeys) {
        console.log('🔐 Sender keys missing in encryptMessageForUser, initializing...');
        try {
          await this.initializeUserKeys(senderUserId);
          console.log('✅ Keys initialized in encryptMessageForUser');
        } catch (initError) {
          console.error('❌ Failed to initialize keys in encryptMessageForUser:', initError);
          throw new Error(
            `Your encryption keys not found and could not be initialized. Please log out and log back in to initialize your keys. User ID: ${senderUserId}`
          );
        }
      }

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

      // Get sender's private key (should exist now after initialization check)
      const senderPrivateKey = await this.getPrivateKey(senderUserId);
      if (!senderPrivateKey) {
        // Try one more time to initialize
        console.log('⚠️ Private key still missing, attempting re-initialization...');
        try {
          await this.initializeUserKeys(senderUserId);
          const retryKey = await this.getPrivateKey(senderUserId);
          if (!retryKey) {
            throw new Error('Private key still missing after initialization');
          }
          // Use the retry key
          return this.encryptMessage(
            messageText,
            recipientPublicKey,
            retryKey
          );
        } catch (retryError) {
          throw new Error(
            `Your encryption keys not found. Please log out and log back in to initialize your keys. User ID: ${senderUserId}`
          );
        }
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
      // Only log detailed errors in dev mode to reduce noise
      if (__DEV__) {
        console.error('Error decrypting message from user:', error);
      }
      throw error;
    }
  }
}

export default new EncryptionService();


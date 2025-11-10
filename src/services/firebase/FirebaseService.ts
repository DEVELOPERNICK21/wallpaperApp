/**
 * Centralized Firebase Service
 * All Firebase operations go through this service
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

// Type definitions
export interface GroupChat {
  id?: string;
  name: string;
  members: string[];
  createdAt: FirebaseFirestoreTypes.Timestamp | Date;
  createdBy: string;
  lastReadTimestamps?: {[userId: string]: FirebaseFirestoreTypes.Timestamp};
  typingUser?: string;
}

export interface Message {
  id?: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  senderName: string;
  createdAt: FirebaseFirestoreTypes.Timestamp | Date;
  seenBy: string[];
  replyTo?: {
    id: string;
    text: string;
    sender: string;
  } | null;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  fcmToken?: string;
  photoURL?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
}

class FirebaseService {
  // ============ GROUP CHAT OPERATIONS ============

  /**
   * Get all group chats for a user
   */
  async getUserGroupChats(userId: string): Promise<GroupChat[]> {
    try {
      const snapshot = await firestore()
        .collection('GroupChats')
        .where('members', 'array-contains', userId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as GroupChat[];
    } catch (error) {
      console.error('Error fetching user group chats:', error);
      throw error;
    }
  }

  /**
   * Create a new group chat
   */
  async createGroupChat(
    name: string,
    members: string[],
    creatorId: string,
  ): Promise<string> {
    try {
      const docRef = await firestore()
        .collection('GroupChats')
        .add({
          name: name.trim(),
          members: [...members, creatorId], // Always include creator
          createdAt: firestore.FieldValue.serverTimestamp(),
          createdBy: creatorId,
          lastReadTimestamps: {},
          typingUser: '',
        });

      console.log('✅ Group chat created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating group chat:', error);
      throw error;
    }
  }

  /**
   * Delete a group chat
   */
  async deleteGroupChat(chatId: string): Promise<void> {
    try {
      // Delete all messages first
      const messagesSnapshot = await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .get();

      if (messagesSnapshot.size > 0) {
        const batch = firestore().batch();
        messagesSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      // Delete the group chat document
      await firestore().collection('GroupChats').doc(chatId).delete();

      console.log('✅ Group chat deleted:', chatId);
    } catch (error) {
      console.error('Error deleting group chat:', error);
      throw error;
    }
  }

  /**
   * Get group chat details
   */
  async getGroupChat(chatId: string): Promise<GroupChat | null> {
    try {
      const doc = await firestore().collection('GroupChats').doc(chatId).get();

      if (doc.exists) {
        return {id: doc.id, ...doc.data()} as GroupChat;
      }
      return null;
    } catch (error) {
      console.error('Error fetching group chat:', error);
      throw error;
    }
  }

  /**
   * Listen to group chat changes
   */
  subscribeToGroupChat(
    chatId: string,
    onUpdate: (chat: GroupChat) => void,
    onError?: (error: Error) => void,
  ): () => void {
    return firestore()
      .collection('GroupChats')
      .doc(chatId)
      .onSnapshot(
        snapshot => {
          if (snapshot.exists) {
            onUpdate({id: snapshot.id, ...snapshot.data()} as GroupChat);
          }
        },
        error => {
          console.error('Error in group chat subscription:', error);
          onError?.(error);
        },
      );
  }

  // ============ MESSAGE OPERATIONS ============

  /**
   * Send a text message
   */
  async sendMessage(
    chatId: string,
    text: string,
    senderId: string,
    senderName: string,
    replyTo?: Message['replyTo'],
  ): Promise<string> {
    try {
      const docRef = await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .add({
          text,
          senderId,
          senderName,
          createdAt: firestore.FieldValue.serverTimestamp(),
          seenBy: [senderId],
          replyTo: replyTo || null,
        });

      // Clear typing indicator
      await this.updateTypingStatus(chatId, '');

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send an image message
   */
  async sendImageMessage(
    chatId: string,
    imageUrl: string,
    senderId: string,
    senderName: string,
  ): Promise<string> {
    try {
      const docRef = await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .add({
          imageUrl,
          senderId,
          senderName,
          createdAt: firestore.FieldValue.serverTimestamp(),
          seenBy: [senderId],
        });

      await this.updateTypingStatus(chatId, '');

      return docRef.id;
    } catch (error) {
      console.error('Error sending image message:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .doc(messageId)
        .delete();
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Clear all messages in a chat
   */
  async clearChatMessages(chatId: string): Promise<void> {
    try {
      const messagesSnapshot = await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .get();

      if (messagesSnapshot.size > 0) {
        const batch = firestore().batch();
        messagesSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error('Error clearing messages:', error);
      throw error;
    }
  }

  /**
   * Mark message as seen
   */
  async markMessageAsSeen(
    chatId: string,
    messageId: string,
    userId: string,
  ): Promise<void> {
    try {
      await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .doc(messageId)
        .update({
          seenBy: firestore.FieldValue.arrayUnion(userId),
        });
    } catch (error) {
      console.error('Error marking message as seen:', error);
      throw error;
    }
  }

  /**
   * Mark chat as read
   */
  async markChatAsRead(chatId: string, userId: string): Promise<void> {
    try {
      await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .update({
          [`lastReadTimestamps.${userId}`]:
            firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  }

  /**
   * Listen to messages in a chat
   */
  subscribeToMessages(
    chatId: string,
    onUpdate: (messages: Message[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    return firestore()
      .collection('GroupChats')
      .doc(chatId)
      .collection('Messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        snapshot => {
          const messages = snapshot.docs.map(
            doc =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Message),
          );
          onUpdate(messages);
        },
        error => {
          console.error('Error in messages subscription:', error);
          onError?.(error);
        },
      );
  }

  /**
   * Get last N messages
   */
  async getLastMessages(
    chatId: string,
    limit: number = 50,
  ): Promise<Message[]> {
    try {
      const snapshot = await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs
        .map(
          doc =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Message),
        )
        .reverse();
    } catch (error) {
      console.error('Error fetching last messages:', error);
      throw error;
    }
  }

  // ============ TYPING INDICATOR ============

  /**
   * Update typing status
   */
  async updateTypingStatus(chatId: string, userName: string): Promise<void> {
    try {
      await firestore().collection('GroupChats').doc(chatId).update({
        typingUser: userName,
      });
    } catch (error) {
      console.error('Error updating typing status:', error);
      // Don't throw - typing indicator is non-critical
    }
  }

  // ============ USER OPERATIONS ============

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const snapshot = await firestore().collection('Users').get();

      return snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          } as User),
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const doc = await firestore().collection('Users').doc(userId).get();

      if (doc.exists) {
        return {id: doc.id, ...doc.data()} as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Update user FCM token
   */
  async updateUserFCMToken(userId: string, token: string): Promise<void> {
    try {
      await firestore().collection('Users').doc(userId).update({
        fcmToken: token,
      });
    } catch (error) {
      console.error('Error updating FCM token:', error);
      throw error;
    }
  }

  // ============ STORAGE OPERATIONS ============

  /**
   * Upload image to Firebase Storage
   */
  async uploadImage(
    uri: string,
    path: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    try {
      const reference = storage().ref(path);
      const task = reference.putFile(uri);

      if (onProgress) {
        task.on('state_changed', snapshot => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }

      await task;
      const downloadURL = await reference.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Delete image from Firebase Storage
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const reference = storage().ref(path);
      await reference.delete();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // ============ AUTH HELPERS ============

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth().currentUser;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new FirebaseService();

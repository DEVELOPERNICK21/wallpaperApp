import {getFirestoreAdmin} from './firebaseAdmin';

export type UsageStats = {
  users: number;
  chats: number;
  messages: number;
};

const FALLBACK_STATS: UsageStats = {
  users: Number.parseInt(process.env.NEXT_PUBLIC_SEEDED_USER_COUNT ?? '', 10) || 0,
  chats: 0,
  messages: 0,
};

/**
 * Fetches usage statistics from Firestore
 * Uses count queries for efficient data retrieval
 */
export async function fetchUsageStats(): Promise<UsageStats> {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      console.warn('Firebase Admin not initialized. Check environment variables.');
      return FALLBACK_STATS;
    }

    // Helper function to get count with fallback
    const getCount = async (collectionName: string): Promise<number> => {
      try {
        const snapshot = await db.collection(collectionName).count().get();
        return snapshot.data().count ?? 0;
      } catch (error) {
        console.warn(`Count query failed for ${collectionName}, using alternative:`, error);
        // Fallback: get all documents and count
        const snapshot = await db.collection(collectionName).get();
        return snapshot.size;
      }
    };

    // Fetch user and chat counts in parallel
    const [users, chats] = await Promise.all([
      getCount('Users'),
      getCount('GroupChats'),
    ]);

    console.log('Usage stats:', { users, chats });

    // For messages, we need to count across all chat subcollections
    // This is more expensive, so we'll do it efficiently
    let messages = 0;
    if (chats > 0) {
      // Get all chat documents (using select to avoid fetching full data)
      // Note: For large datasets, consider caching or using aggregation queries
      const chatsSnapshot = await db.collection('GroupChats').select().get();
      
      const messageCountPromises = chatsSnapshot.docs.map(async (chatDoc) => {
        try {
          const messagesSnapshot = await chatDoc.ref.collection('Messages').count().get();
          return messagesSnapshot.data().count ?? 0;
        } catch (error) {
          console.error(`Error counting messages for chat ${chatDoc.id}:`, error);
          return 0;
        }
      });

      const messageCounts = await Promise.all(messageCountPromises);
      messages = messageCounts.reduce((sum, count) => sum + count, 0);
    }

    return {
      users: Math.max(users, 0),
      chats: Math.max(chats, 0),
      messages: Math.max(messages, 0),
    };
  } catch (error) {
    console.error('Failed to fetch usage statistics', error);
    return FALLBACK_STATS;
  }
}


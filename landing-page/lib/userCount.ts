import {getFirestoreAdmin} from './firebaseAdmin';

type UserCountOptions = {
  /**
   * A baseline number to add to the Firestore count.
   * Useful when you only count activated users in Firestore
   * but still want to display your total registrations.
   */
  baseline?: number;
};

const FALLBACK_COUNT =
  Number.parseInt(process.env.NEXT_PUBLIC_SEEDED_USER_COUNT ?? '', 10) || 0;

export async function fetchUserCount(
  options: UserCountOptions = {},
): Promise<number> {
  const baseline = options.baseline ?? 0;

  try {
    const db = getFirestoreAdmin();
    if (!db) {
      console.warn('Firebase Admin not initialized. Check environment variables:', {
        hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      });
      return Math.max(FALLBACK_COUNT + baseline, 0);
    }

    // Try count query first
    try {
      const snapshot = await db.collection('Users').count().get();
      const count = snapshot.data().count ?? 0;
      console.log('User count from Firestore:', count);
      return Math.max(count + baseline, 0);
    } catch (countError) {
      // Fallback: if count query fails, try getting all documents
      console.warn('Count query failed, trying alternative method:', countError);
      const snapshot = await db.collection('Users').get();
      const count = snapshot.size;
      console.log('User count from document size:', count);
      return Math.max(count + baseline, 0);
    }
  } catch (error) {
    console.error('Failed to fetch user count:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return Math.max(FALLBACK_COUNT + baseline, 0);
  }
}

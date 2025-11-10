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
      return Math.max(FALLBACK_COUNT + baseline, 0);
    }

    const snapshot = await db.collection('Users').count().get();
    const count = snapshot.data().count ?? 0;

    return Math.max(count + baseline, 0);
  } catch (error) {
    console.error('Failed to fetch user count', error);
    return Math.max(FALLBACK_COUNT + baseline, 0);
  }
}

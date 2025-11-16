import { NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { fetchUserCount } from '@/lib/userCount';
import { fetchUsageStats } from '@/lib/usageStats';

export async function GET() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'NOT SET',
    },
    firebaseAdmin: {
      initialized: false,
      error: null,
    },
    firestore: {
      connected: false,
      error: null,
    },
    stats: {
      userCount: null,
      usageStats: null,
      errors: [],
    },
  };

  try {
    // Check Firebase Admin initialization
    const db = getFirestoreAdmin();
    if (db) {
      debugInfo.firebaseAdmin.initialized = true;
      debugInfo.firestore.connected = true;

      // Test Firestore connection
      try {
        // Try to fetch user count
        const userCount = await fetchUserCount({ baseline: 0 });
        debugInfo.stats.userCount = userCount;

        // Try to fetch usage stats
        const usageStats = await fetchUsageStats();
        debugInfo.stats.usageStats = usageStats;
      } catch (statsError: any) {
        debugInfo.stats.errors.push({
          type: 'stats_fetch_error',
          message: statsError.message,
          stack: statsError.stack,
        });
      }

      // Try a direct query to verify connection
      try {
        const testSnapshot = await db.collection('Users').limit(1).get();
        debugInfo.firestore.testQuery = {
          success: true,
          documentsFound: testSnapshot.size,
        };
      } catch (queryError: any) {
        debugInfo.firestore.testQuery = {
          success: false,
          error: queryError.message,
        };
      }
    } else {
      debugInfo.firebaseAdmin.error = 'Firebase Admin SDK not initialized. Check environment variables.';
    }
  } catch (error: any) {
    debugInfo.firebaseAdmin.error = error.message;
    debugInfo.firebaseAdmin.stack = error.stack;
  }

  return NextResponse.json(debugInfo, { status: 200 });
}


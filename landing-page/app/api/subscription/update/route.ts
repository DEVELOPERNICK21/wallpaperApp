import {NextRequest, NextResponse} from 'next/server';
import {getFirestoreAdmin} from '@/lib/firebaseAdmin';
import {Timestamp} from 'firebase-admin/firestore';

/**
 * API endpoint to update subscription status after payment
 * This should be called from your payment provider's webhook (Razorpay/Stripe)
 * or manually after payment verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {userId, subscriptionData, paymentId, paymentProvider} = body;

    // Validate required fields
    if (!userId || !subscriptionData) {
      return NextResponse.json(
        {error: 'Missing required fields: userId and subscriptionData'},
        {status: 400},
      );
    }

    // Validate subscription type
    const validTypes = ['basic', 'premium', 'enterprise'];
    if (!validTypes.includes(subscriptionData.type)) {
      return NextResponse.json({error: 'Invalid subscription type'}, {status: 400});
    }

    // Calculate end date (30 days from now for monthly subscription)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Add 1 month

    // Update subscription in Firestore
    const adminDb = getFirestoreAdmin();
    if (!adminDb) {
      return NextResponse.json({error: 'Firebase Admin not initialized'}, {status: 500});
    }

    const userRef = adminDb.collection('Users').doc(userId);

    await userRef.set(
      {
        subscription: {
          isActive: true,
          type: subscriptionData.type,
          subscriptionId: subscriptionData.subscriptionId || paymentId,
          paymentProvider: paymentProvider || 'manual',
          paymentId: paymentId,
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          isLifetime: subscriptionData.isLifetime || false,
          updatedAt: Timestamp.now(),
        },
        subscriptionUpdatedAt: Timestamp.now(),
      },
      {merge: true},
    );

    console.log(`✅ Subscription updated for user ${userId}: ${subscriptionData.type}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: {
        type: subscriptionData.type,
        endDate: endDate.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      {error: 'Failed to update subscription', details: error.message},
      {status: 500},
    );
  }
}

// Allow GET for testing (remove in production)
export async function GET() {
  return NextResponse.json({
    message: 'Subscription update endpoint',
    usage: 'POST with userId, subscriptionData, paymentId, paymentProvider',
  });
}


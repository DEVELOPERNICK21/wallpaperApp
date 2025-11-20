import {NextRequest, NextResponse} from 'next/server';
import crypto from 'crypto';
import {getFirestoreAdmin} from '@/lib/firebaseAdmin';
import {Timestamp} from 'firebase-admin/firestore';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay key secret is configured
    if (!RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return NextResponse.json(
        {error: 'Payment gateway not configured. Please contact support.', success: false},
        {status: 500},
      );
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planType,
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planType) {
      return NextResponse.json(
        {error: 'Missing required fields', success: false},
        {status: 400},
      );
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('❌ Payment signature verification failed');
      return NextResponse.json(
        {error: 'Payment verification failed', success: false},
        {status: 400},
      );
    }

    console.log('✅ Payment signature verified successfully');

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Add 1 month

    // Update subscription in Firestore
    const adminDb = getFirestoreAdmin();
    if (!adminDb) {
      return NextResponse.json(
        {error: 'Firebase Admin not initialized'},
        {status: 500},
      );
    }

    const userRef = adminDb.collection('Users').doc(userId);

    await userRef.set(
      {
        subscription: {
          isActive: true,
          type: planType,
          subscriptionId: razorpay_order_id,
          paymentProvider: 'razorpay',
          paymentId: razorpay_payment_id,
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          isLifetime: false,
          updatedAt: Timestamp.now(),
        },
        subscriptionUpdatedAt: Timestamp.now(),
      },
      {merge: true},
    );

    console.log(`✅ Subscription updated for user ${userId}: ${planType}`);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      subscription: {
        type: planType,
        endDate: endDate.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      {error: 'Failed to verify payment', details: error.message, success: false},
      {status: 500},
    );
  }
}


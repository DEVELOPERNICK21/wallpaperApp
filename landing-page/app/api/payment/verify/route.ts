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
      userPhone,
      planType,
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planType) {
      return NextResponse.json(
        {error: 'Missing required payment fields', success: false},
        {status: 400},
      );
    }

    // Must have either userId or userPhone
    if (!userId && !userPhone) {
      return NextResponse.json(
        {error: 'Please provide either User ID or Mobile Number to identify your account', success: false},
        {status: 400},
      );
    }

    // Normalize phone number (remove spaces, dashes, parentheses)
    const normalizePhoneNumber = (phone: string): string => {
      return phone.replace(/[\s\-()]/g, '').trim();
    };

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

    let finalUserId: string | null = null;

    // If userId is provided, use it directly
    if (userId) {
      finalUserId = userId;
    } else if (userPhone) {
      // Look up user by phone number
      const normalizedPhone = normalizePhoneNumber(userPhone);
      console.log(`🔍 Looking up user by phone number: ${normalizedPhone}`);

      try {
        // Query Firestore for user with matching phone number
        const usersSnapshot = await adminDb
          .collection('Users')
          .where('phone', '==', normalizedPhone)
          .limit(1)
          .get();

        if (usersSnapshot.empty) {
          // Try with different phone formats (with +, without +, etc.)
          const phoneVariations = [
            normalizedPhone,
            `+${normalizedPhone}`,
            normalizedPhone.replace(/^\+/, ''),
            normalizedPhone.startsWith('91') ? normalizedPhone : `91${normalizedPhone}`,
          ];

          for (const phoneVar of phoneVariations) {
            const altSnapshot = await adminDb
              .collection('Users')
              .where('phone', '==', phoneVar)
              .limit(1)
              .get();

            if (!altSnapshot.empty) {
              finalUserId = altSnapshot.docs[0].id;
              console.log(`✅ Found user with phone variation: ${phoneVar}`);
              break;
            }
          }

          if (!finalUserId) {
            console.error(`❌ No user found with phone number: ${normalizedPhone}`);
            return NextResponse.json(
              {
                error: `No account found with mobile number ${userPhone}. Please check the number or use your User ID instead.`,
                success: false,
              },
              {status: 404},
            );
          }
        } else {
          finalUserId = usersSnapshot.docs[0].id;
          console.log(`✅ Found user by phone number: ${finalUserId}`);
        }
      } catch (lookupError: any) {
        console.error('Error looking up user by phone:', lookupError);
        return NextResponse.json(
          {
            error: 'Failed to look up account. Please try using your User ID instead.',
            details: lookupError.message,
            success: false,
          },
          {status: 500},
        );
      }
    }

    if (!finalUserId) {
      return NextResponse.json(
        {error: 'Unable to identify user account', success: false},
        {status: 400},
      );
    }

    const userRef = adminDb.collection('Users').doc(finalUserId);

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

    console.log(`✅ Subscription updated for user ${finalUserId}: ${planType}`);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      userId: finalUserId,
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


import {NextRequest, NextResponse} from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay only if keys are available
let razorpay: Razorpay | null = null;

try {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret) {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
} catch (error) {
  console.error('Error initializing Razorpay:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      console.error(
        'Razorpay not initialized. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.',
      );
      console.error(
        'Key ID present:',
        !!keyId,
        'Key Secret present:',
        !!keySecret,
      );
      console.error('Key ID starts with:', keyId?.substring(0, 8));
      return NextResponse.json(
        {
          error: 'Payment gateway not configured. Please contact support.',
          details:
            'Razorpay keys are missing or invalid. Please check environment variables.',
        },
        {status: 500},
      );
    }

    const body = await request.json();
    const {amount, currency = 'INR', planType, userId, userEmail} = body;

    // Validate required fields
    if (!amount || !planType || !userId) {
      return NextResponse.json(
        {error: 'Missing required fields: amount, planType, userId'},
        {status: 400},
      );
    }

    // Validate plan type
    const validPlans = ['premium', 'pro'];
    if (!validPlans.includes(planType)) {
      return NextResponse.json({error: 'Invalid plan type'}, {status: 400});
    }

    // Validate amount (should be in paise)
    if (amount < 100) {
      return NextResponse.json({error: 'Invalid amount'}, {status: 400});
    }

    // Create Razorpay order
    const options = {
      amount: amount, // Amount in paise
      currency: currency,
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        planType: planType,
        userId: userId,
        userEmail: userEmail || '',
      },
    };

    const order = await razorpay.orders.create(options);

    console.log(
      `✅ Razorpay order created: ${order.id} for user ${userId}, plan: ${planType}`,
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      {error: 'Failed to create order', details: error.message},
      {status: 500},
    );
  }
}

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

    // Log received data for debugging
    console.log('Received order creation request:', {
      amount,
      currency,
      planType,
      userId: userId?.substring(0, 20),
      hasEmail: !!userEmail,
    });

    // Validate required fields
    if (!amount || !planType || !userId) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: `Missing: ${!amount ? 'amount' : ''} ${
            !planType ? 'planType' : ''
          } ${!userId ? 'userId' : ''}`.trim(),
        },
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

    // Ensure amount is a number (not string)
    const amountInPaise =
      typeof amount === 'string' ? parseInt(amount, 10) : amount;

    // Validate amount is a valid number
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json(
        {
          error: 'Invalid amount',
          details: 'Amount must be at least 100 paise (₹1)',
        },
        {status: 400},
      );
    }

    // Create receipt ID (Razorpay has limits on receipt length)
    const receiptId = `receipt_${userId.substring(
      0,
      20,
    )}_${Date.now()}`.substring(0, 40);

    // Create Razorpay order
    const options = {
      amount: amountInPaise, // Amount in paise (must be number)
      currency: currency.toUpperCase(), // Ensure uppercase (INR)
      receipt: receiptId,
      notes: {
        planType: planType,
        userId: userId.substring(0, 100), // Limit note length
        userEmail: (userEmail || '').substring(0, 100),
      },
    };

    console.log('Creating Razorpay order with options:', {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
    });

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
  } catch (error: unknown) {
    console.error('Error creating Razorpay order:', error);

    // Provide more specific error messages
    let errorMessage = 'Failed to create order';
    let errorDetails = 'Unknown error';
    let statusCode: number | undefined;

    if (error && typeof error === 'object') {
      const err = error as {
        message?: string;
        statusCode?: number;
        description?: string;
      };
      errorDetails = err.message || 'Unknown error';
      statusCode = err.statusCode;

      if (err.statusCode === 401) {
        errorMessage = 'Authentication failed';
        errorDetails =
          'Invalid Razorpay keys. Please check your Key ID and Key Secret.';
      } else if (err.statusCode === 400) {
        errorMessage = 'Invalid request';
        errorDetails =
          err.description || err.message || 'Please check the payment details.';
      } else if (
        err.message?.includes('ECONNREFUSED') ||
        err.message?.includes('network')
      ) {
        errorMessage = 'Network error';
        errorDetails =
          'Unable to connect to Razorpay. Please check your internet connection.';
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        statusCode: statusCode,
      },
      {status: 500},
    );
  }
}

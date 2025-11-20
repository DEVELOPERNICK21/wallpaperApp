# Razorpay Payment Gateway Setup Guide

This guide explains how to set up Razorpay payment gateway for the landing page.

## Prerequisites

1. Razorpay account (Sign up at https://razorpay.com)
2. Razorpay API keys (Key ID and Key Secret)

## Setup Steps

### 1. Get Razorpay API Keys

1. Log in to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** for development or **Live Keys** for production
4. Copy your **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Create or update `.env.local` file in the `landing-page` directory:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# Public Key (for client-side)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id_here
```

**Important:**
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are server-side only (used in API routes)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is public (used in payment page client-side)
- Never expose your Key Secret in client-side code

### 3. For Production (Vercel/Other Hosting)

Add these environment variables in your hosting provider's dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add all three variables:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`

### 4. Test the Integration

1. Start the development server:
   ```bash
   cd landing-page
   npm run dev
   ```

2. Navigate to `/subscribe` page
3. Click on a plan (Premium or Pro)
4. You'll be redirected to `/payment?plan=premium` or `/payment?plan=pro`
5. Enter your email and click "Pay"
6. Use Razorpay test cards for testing:
   - **Card Number**: 4111 1111 1111 1111
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **Name**: Any name

### 5. Payment Flow

1. User selects a plan on `/subscribe` page
2. User is redirected to `/payment?plan={planType}&userId={userId}`
3. Payment page creates a Razorpay order via `/api/payment/create-order`
4. Razorpay checkout modal opens
5. User completes payment
6. Payment is verified via `/api/payment/verify`
7. Subscription is updated in Firestore
8. User is redirected to success/failure page

## API Routes

### `/api/payment/create-order`
- Creates a Razorpay order
- Returns order ID for payment

### `/api/payment/verify`
- Verifies payment signature
- Updates subscription in Firestore
- Returns success/failure status

### `/api/subscription/update`
- Updates subscription status in Firestore
- Can be called from webhooks or manually

## Webhook Setup (Optional but Recommended)

For production, set up Razorpay webhooks to handle payment events:

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/payment/webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`

## Security Notes

- ✅ Key Secret is never exposed to client
- ✅ Payment signature is verified server-side
- ✅ All sensitive operations happen in API routes
- ✅ User ID is validated before updating subscription

## Troubleshooting

### Payment modal not opening
- Check if `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
- Verify Razorpay script is loaded (check browser console)

### Payment verification fails
- Check if `RAZORPAY_KEY_SECRET` matches the Key ID
- Verify signature generation logic

### Subscription not updating
- Check Firebase Admin credentials
- Verify user ID is correct
- Check Firestore permissions

## Support

For Razorpay-specific issues, refer to:
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com


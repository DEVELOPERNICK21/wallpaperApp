# Razorpay Testing Guide

## Test Mode Setup

Razorpay provides a **Test Mode** that allows you to test payments without using real money.

### 1. Enable Test Mode

1. Log in to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Make sure you're using **Test Keys** (not Live Keys)
4. Test keys have a different Key ID than Live keys

### 2. Test Cards

Use these test card numbers to simulate different payment scenarios:

#### ✅ Successful Payment Cards

**Card 1:**
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)
- **Name**: Any name
- **Result**: Payment succeeds

**Card 2:**
- **Card Number**: `5104 0600 0000 0008`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name
- **Result**: Payment succeeds

#### ❌ Failed Payment Cards

**Card 3 (Insufficient Funds):**
- **Card Number**: `4000 0000 0000 9995`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Result**: Payment fails with "Insufficient funds"

**Card 4 (Card Declined):**
- **Card Number**: `4000 0000 0000 0002`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Result**: Payment fails with "Card declined"

**Card 5 (Invalid CVV):**
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: `000` (invalid)
- **Expiry**: Any future date
- **Result**: Payment fails with "Invalid CVV"

### 3. Test UPI IDs

For UPI testing:
- **UPI ID**: `success@razorpay` (always succeeds)
- **UPI ID**: `failure@razorpay` (always fails)

### 4. Test Netbanking

- Select any bank from the list
- Use any credentials
- Payment will be simulated

### 5. Test Wallets

- Select any wallet (Paytm, PhonePe, etc.)
- Use any credentials
- Payment will be simulated

## Testing Checklist

### ✅ Test Successful Payment Flow

1. Use test card `4111 1111 1111 1111`
2. Enter any CVV and future expiry
3. Complete payment
4. Verify:
   - Payment succeeds
   - Subscription is activated in Firestore
   - Success page is shown
   - User can see active subscription in app

### ✅ Test Failed Payment Flow

1. Use test card `4000 0000 0000 9995` (insufficient funds)
2. Complete payment
3. Verify:
   - Payment fails
   - Error message is shown
   - Subscription is NOT activated
   - User can retry payment

### ✅ Test Payment Verification

1. Complete a successful payment
2. Check browser console for logs
3. Verify:
   - Order is created
   - Payment signature is verified
   - Firestore is updated correctly

### ✅ Test Edge Cases

1. **Network Error**: Disconnect internet during payment
2. **Modal Closed**: Close Razorpay modal without completing payment
3. **Invalid Amount**: Test with different amounts
4. **Missing User ID**: Test without user ID

## Test Mode vs Live Mode

### Test Mode
- ✅ No real money is charged
- ✅ Use test API keys
- ✅ Use test cards
- ✅ Perfect for development

### Live Mode
- ⚠️ Real money is charged
- ⚠️ Use live API keys
- ⚠️ Use real payment methods
- ⚠️ Only for production

## Switching Between Test and Live Mode

1. **Test Mode**: Use Test API Keys from Razorpay Dashboard
2. **Live Mode**: Use Live API Keys from Razorpay Dashboard

Update your `.env.local`:
```bash
# Test Mode
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Live Mode (Production)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

## Testing in Development

1. Start your development server:
   ```bash
   cd landing-page
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/subscribe`

3. Click on Premium or Pro plan

4. You'll be redirected to: `http://localhost:3000/payment?plan=premium`

5. Use test card: `4111 1111 1111 1111`

6. Complete the payment

7. Check:
   - Browser console for any errors
   - Network tab for API calls
   - Firestore for subscription update

## Common Test Scenarios

### Scenario 1: Successful Payment
- **Card**: `4111 1111 1111 1111`
- **Expected**: Payment succeeds, subscription activated

### Scenario 2: Payment Failure
- **Card**: `4000 0000 0000 9995`
- **Expected**: Payment fails, error shown

### Scenario 3: User Closes Modal
- **Action**: Click outside modal or close button
- **Expected**: Modal closes, no payment processed

### Scenario 4: Network Error
- **Action**: Disconnect internet during payment
- **Expected**: Error message, payment not processed

## Debugging Tips

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: Verify API calls are made
3. **Check Razorpay Dashboard**: View test payments
4. **Check Firestore**: Verify subscription updates
5. **Check Server Logs**: Look for API route errors

## Test Payment Verification

After a successful test payment, verify:

1. ✅ Payment appears in Razorpay Dashboard (Test Mode)
2. ✅ Subscription is updated in Firestore
3. ✅ User can see active subscription in app
4. ✅ Success page is displayed
5. ✅ Payment ID is logged correctly

## Need Help?

- Razorpay Test Mode Docs: https://razorpay.com/docs/payments/test-payments/
- Razorpay Support: support@razorpay.com


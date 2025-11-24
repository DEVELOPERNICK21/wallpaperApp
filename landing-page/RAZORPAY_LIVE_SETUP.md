# Razorpay Live Keys Setup Guide

This guide will help you set up your live Razorpay keys to start accepting real payments.

## ⚠️ Important: Live vs Test Keys

- **Test Keys**: Start with `rzp_test_` - Use for development/testing (no real money)
- **Live Keys**: Start with `rzp_live_` - Use for production (REAL MONEY will be charged)

## Step 1: Get Your Live Keys

1. Log in to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Switch to **Live Mode** (toggle in top right)
4. Generate or copy your **Live Key ID** and **Live Key Secret**
5. Your keys should look like:
   - Key ID: `rzp_live_xxxxxxxxxxxxx`
   - Key Secret: `xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 2: Add Keys to Environment Variables

### For Local Development (.env.local)

Create or update `.env.local` file in the `landing-page` directory:

```bash
# Razorpay Live Keys (Production)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

**Important:**
- Replace `rzp_live_xxxxxxxxxxxxx` with your actual Live Key ID
- Replace `your_live_secret_key_here` with your actual Live Key Secret
- Never commit `.env.local` to git (it should be in `.gitignore`)

### For Production (Vercel)

1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

   **Variable 1:**
   - Name: `RAZORPAY_KEY_ID`
   - Value: `rzp_live_xxxxxxxxxxxxx` (your live key ID)
   - Environment: Production, Preview, Development

   **Variable 2:**
   - Name: `RAZORPAY_KEY_SECRET`
   - Value: `your_live_secret_key_here` (your live secret key)
   - Environment: Production, Preview, Development

   **Variable 3:**
   - Name: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - Value: `rzp_live_xxxxxxxxxxxxx` (same as Key ID)
   - Environment: Production, Preview, Development

5. Click **Save** for each variable
6. **Redeploy** your application for changes to take effect

## Step 3: Verify Configuration

After adding the keys:

1. **Restart your development server** (if testing locally):
   ```bash
   cd landing-page
   npm run dev
   ```

2. **Check the payment page** - The test mode banner should NOT appear (since you're using live keys)

3. **Test with a small amount first** - Make a test payment with a real card to verify everything works

## Step 4: Test Payment Flow

### ⚠️ WARNING: Live Mode Charges Real Money!

1. Go to your website: `https://your-domain.vercel.app/subscribe`
2. Click on Premium or Pro plan
3. You'll be redirected to the payment page
4. **Use a real payment method** (this will charge real money!)
5. Complete the payment
6. Verify:
   - Payment appears in Razorpay Dashboard (Live Mode)
   - Subscription is activated in Firestore
   - Success page is shown

## Step 5: Monitor Payments

1. **Razorpay Dashboard**:
   - Go to **Payments** → **All Payments**
   - Filter by "Live Mode"
   - Monitor all transactions

2. **Check Firestore**:
   - Verify subscriptions are being created correctly
   - Check user documents for subscription data

## Security Best Practices

✅ **DO:**
- Keep your Key Secret secure and never expose it
- Use environment variables (never hardcode keys)
- Regularly check your Razorpay dashboard for suspicious activity
- Set up webhooks for payment notifications
- Monitor failed payments and refunds

❌ **DON'T:**
- Commit keys to git
- Share keys publicly
- Use live keys in development (use test keys instead)
- Expose Key Secret in client-side code

## Switching Between Test and Live

### For Development:
```bash
# .env.local (Development)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

### For Production:
```bash
# Vercel Environment Variables (Production)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

## Troubleshooting

### Payment modal not opening
- Check if `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
- Verify the key starts with `rzp_live_`
- Check browser console for errors

### Payment verification fails
- Verify `RAZORPAY_KEY_SECRET` matches the Key ID
- Check server logs for signature verification errors
- Ensure both keys are from the same mode (both live or both test)

### "Payment gateway not configured" error
- Verify all three environment variables are set
- Restart your server after adding variables
- Check that keys are not empty

## Next Steps

1. ✅ Add live keys to Vercel environment variables
2. ✅ Redeploy your application
3. ✅ Test with a small payment
4. ✅ Set up webhooks (optional but recommended)
5. ✅ Monitor your first few payments closely

## Support

- Razorpay Support: support@razorpay.com
- Razorpay Docs: https://razorpay.com/docs/
- Dashboard: https://dashboard.razorpay.com/


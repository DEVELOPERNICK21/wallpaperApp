# Troubleshooting Payment Issues

## "Failed to create order" Error

If you're seeing "Failed to create order" error, follow these steps:

### Step 1: Check Environment Variables

**For Local Development:**
1. Check if `.env.local` file exists in `landing-page` directory
2. Verify these variables are set:
   ```bash
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   ```
3. Restart your development server after adding variables

**For Production (Vercel):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all 3 Razorpay variables are set
3. Make sure they're set for **Production** environment
4. **Redeploy** your application

### Step 2: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Common errors:
   - "Payment gateway not configured" → Keys missing
   - "Authentication failed" → Invalid keys
   - "Network error" → Connection issue

### Step 3: Check Server Logs

**For Vercel:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Go to **Functions** tab
4. Check logs for `/api/payment/create-order`

**For Local:**
- Check your terminal where `npm run dev` is running
- Look for error messages

### Step 4: Verify Razorpay Keys

1. Log in to Razorpay Dashboard: https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Make sure you're in **Live Mode** (not Test Mode)
4. Verify your Key ID starts with `rzp_live_`
5. Copy the keys again and update environment variables

### Step 5: Test API Route Directly

You can test the API route directly:

```bash
curl -X POST https://your-domain.vercel.app/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 19900,
    "currency": "INR",
    "planType": "premium",
    "userId": "test_user_123",
    "userEmail": "test@example.com"
  }'
```

Expected response:
```json
{
  "success": true,
  "orderId": "order_xxxxx",
  "amount": 19900,
  "currency": "INR"
}
```

## Common Error Messages

### "Payment gateway not configured"
- **Cause**: Environment variables not set
- **Fix**: Add Razorpay keys to `.env.local` (local) or Vercel (production)

### "Authentication failed"
- **Cause**: Invalid Razorpay keys
- **Fix**: Verify keys in Razorpay Dashboard and update environment variables

### "Invalid request"
- **Cause**: Wrong amount format or missing fields
- **Fix**: Check that amount is in paise (₹199 = 19900 paise)

### "Network error"
- **Cause**: Cannot connect to Razorpay API
- **Fix**: Check internet connection, firewall settings

## Quick Checklist

- [ ] Environment variables set in `.env.local` (local) or Vercel (production)
- [ ] Keys start with `rzp_live_` (for live mode)
- [ ] `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` have the same value
- [ ] Server restarted after adding variables (local)
- [ ] Application redeployed after adding variables (Vercel)
- [ ] Browser console checked for errors
- [ ] Server logs checked for detailed errors

## Still Having Issues?

1. Check Razorpay Dashboard for any account issues
2. Verify your Razorpay account is activated
3. Contact Razorpay support: support@razorpay.com
4. Check our documentation: `RAZORPAY_LIVE_SETUP.md`


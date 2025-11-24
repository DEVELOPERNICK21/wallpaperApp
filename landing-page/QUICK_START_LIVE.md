# Quick Start: Enable Live Payments

## 🚀 Quick Setup (5 Minutes)

### Step 1: Add Live Keys to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these 3 variables:

```
RAZORPAY_KEY_ID = rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET = your_live_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID = rzp_live_xxxxxxxxxxxxx
```

5. Select **Production, Preview, Development** for all three
6. Click **Save**

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 3: Test Payment

1. Visit: `https://your-domain.vercel.app/subscribe`
2. Click Premium or Pro plan
3. Enter email and make a test payment
4. Check Razorpay Dashboard → Payments (Live Mode)

## ✅ Verification Checklist

- [ ] Live keys added to Vercel environment variables
- [ ] Application redeployed
- [ ] Test mode banner NOT showing on payment page
- [ ] Payment modal opens correctly
- [ ] Test payment completed successfully
- [ ] Payment appears in Razorpay Dashboard (Live Mode)
- [ ] Subscription updated in Firestore

## 🔒 Security Reminders

- ✅ Keys are in environment variables (secure)
- ✅ Key Secret never exposed to client
- ✅ All payments verified server-side
- ✅ Webhooks can be set up for additional security

## 📞 Need Help?

- Check `RAZORPAY_LIVE_SETUP.md` for detailed guide
- Razorpay Support: support@razorpay.com


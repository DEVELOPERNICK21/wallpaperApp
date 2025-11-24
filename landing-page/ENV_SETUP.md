# Environment Variables Setup Guide

## Required Environment Variables

### 1. Razorpay Configuration (REQUIRED)

Add these to your `.env.local` file (local development) and Vercel Environment Variables (production):

```bash
# Razorpay Live Keys (for production)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

**Where to get these:**

1. Log in to Razorpay Dashboard: https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Switch to **Live Mode** (toggle in top right)
4. Copy your **Key ID** and **Key Secret**

### 2. Firebase Admin (REQUIRED)

```bash
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### 3. Optional Variables

```bash
# User count fallbacks
NEXT_PUBLIC_SEEDED_USER_COUNT=0
NEXT_PUBLIC_USER_COUNT_BASELINE=0

# IPA download URL
NEXT_PUBLIC_IPA_DOWNLOAD_URL=https://your-domain.com/wallpe.ipa
```

## Setup Instructions

### Local Development

1. Create `.env.local` file in the `landing-page` directory:

   ```bash
   cd landing-page
   touch .env.local
   ```

2. Add all required variables to `.env.local`

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Production (Vercel)

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Click **Add New**
   - Enter variable name and value
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**
5. **Redeploy** your application

## Verification

After adding environment variables:

1. **Check payment page**: Visit `/subscribe` → Click a plan
2. **Look for status indicator**:

   - ✅ Green banner = Live mode active
   - 🧪 Yellow banner = Test mode active
   - ⚠️ Red banner = Not configured

3. **Test payment**: Make a small test payment to verify everything works

## Security

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ Key Secret is server-side only (never exposed to client)
- ✅ All sensitive operations happen in API routes
- ✅ Payment signature verified server-side

## Troubleshooting

### "Payment gateway not configured" error

- Check if all 3 Razorpay variables are set
- Verify keys start with `rzp_live_` (for live) or `rzp_test_` (for test)
- Restart server after adding variables

### Payment modal not opening

- Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Verify Razorpay script is loaded (check browser console)
- Check for JavaScript errors

### Payment verification fails

- Verify `RAZORPAY_KEY_SECRET` matches the Key ID
- Ensure both keys are from same mode (both live or both test)
- Check server logs for detailed error messages

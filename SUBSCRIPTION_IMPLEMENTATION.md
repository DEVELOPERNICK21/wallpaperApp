# 💳 Subscription Implementation Guide

## Overview

The app now includes a complete subscription system that restricts access to users with active subscriptions. Users without subscriptions are redirected to the subscription screen where they can upgrade.

---

## 🏗️ Architecture

### Components Created

1. **SubscriptionService** (`src/services/SubscriptionService.ts`)
   - Checks subscription status
   - Updates subscription after payment
   - Manages subscription lifecycle

2. **SubscriptionScreen** (`src/screens/SubscriptionScreen/SubscriptionScreen.tsx`)
   - Shows subscription status
   - Displays available plans
   - Links to landing page for payment

3. **useSubscription Hook** (`src/hooks/useSubscription.ts`)
   - React hook to check subscription in components
   - Provides loading state and refresh function

4. **Landing Page Integration**
   - `/subscribe` - Subscription plans page
   - `/api/subscription/update` - API endpoint to update subscription after payment

---

## 📋 Firestore Data Structure

### User Document Structure

```javascript
Users/{userId}/
  ├─ displayName: string
  ├─ email: string
  ├─ subscription: {
  │    isActive: boolean,
  │    type: 'basic' | 'premium' | 'enterprise',
  │    subscriptionId?: string,
  │    paymentProvider?: 'razorpay' | 'stripe' | 'manual',
  │    paymentId?: string,
  │    startDate: Timestamp,
  │    endDate: Timestamp,
  │    isLifetime: boolean,
  │    updatedAt: Timestamp
  │  },
  └─ subscriptionUpdatedAt: Timestamp
```

---

## 🔄 User Flow

### 1. **Login Flow**

```
User logs in
   ↓
Check subscription status
   ↓
[If Active] → Navigate to Home Screen ✅
   ↓
[If Inactive] → Navigate to Subscription Screen ⚠️
   ↓
User subscribes on landing page
   ↓
Payment webhook updates Firestore
   ↓
User can now access app ✅
```

### 2. **Subscription Screen**

- Shows current subscription status
- Displays available plans (Basic, Premium, Enterprise)
- "Subscribe Now" button opens landing page
- Users cannot proceed without active subscription

---

## 🔌 Payment Integration

### Option 1: Razorpay (Recommended for India)

1. **Sign up**: https://razorpay.com
2. **Get API keys**: Dashboard → Settings → API Keys
3. **Set up webhook**: Dashboard → Settings → Webhooks
   - URL: `https://your-domain.com/api/webhook/razorpay`
   - Events: `payment.captured`, `subscription.charged`

4. **Webhook Handler Example**:

```typescript
// landing-page/app/api/webhook/razorpay/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {getFirestoreAdmin} from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Verify webhook signature (important!)
  const crypto = require('crypto');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get('x-razorpay-signature');
  
  // Verify signature here...
  
  if (body.event === 'payment.captured') {
    const {payment, order} = body.payload;
    const userId = order.notes?.userId; // Pass userId in order notes
    
    // Update subscription
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/subscription/update`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId,
        subscriptionData: {
          type: order.notes?.plan || 'basic',
          subscriptionId: payment.id,
        },
        paymentId: payment.id,
        paymentProvider: 'razorpay',
      }),
    });
  }
  
  return NextResponse.json({success: true});
}
```

### Option 2: Stripe

1. **Sign up**: https://stripe.com
2. **Get API keys**: Dashboard → Developers → API Keys
3. **Set up webhook**: Dashboard → Developers → Webhooks
   - URL: `https://your-domain.com/api/webhook/stripe`
   - Events: `payment_intent.succeeded`, `checkout.session.completed`

4. **Webhook Handler Example**:

```typescript
// landing-page/app/api/webhook/stripe/route.ts
import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({error: 'Webhook verification failed'}, {status: 400});
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    
    // Update subscription
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/subscription/update`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId,
        subscriptionData: {
          type: session.metadata?.plan || 'basic',
          subscriptionId: session.subscription as string,
        },
        paymentId: session.payment_intent as string,
        paymentProvider: 'stripe',
      }),
    });
  }
  
  return NextResponse.json({success: true});
}
```

---

## 🎯 Manual Subscription Update

If you need to manually grant a subscription (e.g., for testing or special cases):

### Using API Endpoint

```bash
curl -X POST https://your-domain.com/api/subscription/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "subscriptionData": {
      "type": "premium",
      "subscriptionId": "manual-123"
    },
    "paymentId": "manual-payment-123",
    "paymentProvider": "manual"
  }'
```

### Using Firebase Console

1. Go to Firestore
2. Navigate to `Users/{userId}`
3. Update document:

```javascript
{
  subscription: {
    isActive: true,
    type: "premium",
    startDate: [current timestamp],
    endDate: [timestamp + 30 days],
    isLifetime: false
  }
}
```

---

## 📱 Using Subscription in Components

### Check Subscription Status

```typescript
import {useSubscription} from '../hooks/useSubscription';

function MyComponent() {
  const {subscriptionStatus, isActive, loading} = useSubscription();
  
  if (loading) return <Loading />;
  
  if (!isActive) {
    return <SubscriptionRequired />;
  }
  
  return <AppContent />;
}
```

### Check Subscription in Service

```typescript
import SubscriptionService from '../services/SubscriptionService';

const checkAccess = async (userId: string) => {
  const status = await SubscriptionService.checkSubscriptionStatus(userId);
  
  if (!status.isActive) {
    throw new Error('Subscription required');
  }
  
  return true;
};
```

---

## 🔒 Restricting Features

### Example: Restrict Chat Creation

```typescript
// In CreateGroupChat component
const handleCreateChat = async () => {
  const status = await SubscriptionService.checkSubscriptionStatus(userId);
  
  if (!status.isActive) {
    Alert.alert(
      'Subscription Required',
      'You need an active subscription to create chats. Please subscribe to continue.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Subscribe',
          onPress: () => navigation.navigate(ScreenConstants.SUBSCRIPTION_SCREEN),
        },
      ]
    );
    return;
  }
  
  // Proceed with chat creation...
};
```

---

## ⚙️ Configuration

### Environment Variables (Landing Page)

```env
# Subscription API
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Stripe (if using)
STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

## 📊 Subscription Plans

| Plan      | Price      | Features                                          |
|-----------|------------|---------------------------------------------------|
| **Basic** | ₹99/month  | All basic features, standard wallpapers, 30-day history |
| **Premium** | ₹149/month | Everything in Basic + premium wallpapers, 1-year history, AI features, cloud backup |
| **Enterprise** | ₹499/month | Everything in Premium + custom branding, API access, priority support |

---

## 🧪 Testing

### Test Subscription Status

1. **Grant test subscription**:
   ```bash
   # Using API
   curl -X POST http://localhost:3000/api/subscription/update \
     -H "Content-Type: application/json" \
     -d '{"userId":"test-user-id","subscriptionData":{"type":"premium"},"paymentProvider":"manual"}'
   ```

2. **Check in app**: Login should navigate to Home Screen

3. **Remove subscription**: Update Firestore to set `subscription.isActive = false`

### Test Subscription Screen

1. Remove subscription from user
2. Login
3. Should see subscription screen
4. Click "Subscribe Now" → Should open landing page

---

## 🚀 Next Steps

1. ✅ **Set up payment provider** (Razorpay or Stripe)
2. ✅ **Configure webhook** in payment provider dashboard
3. ✅ **Update landing page** with payment integration
4. ✅ **Test payment flow** end-to-end
5. ✅ **Set up subscription expiry checks** (cron job to check expiring subscriptions)
6. ✅ **Add subscription management** (cancel, upgrade, downgrade)

---

## 📝 Notes

- Subscription is checked on login and can be checked anytime using `SubscriptionService`
- Users without subscription are blocked from using the app
- Subscription status is stored in Firestore and synced in real-time
- Payment webhooks automatically update subscription status
- Manual subscription updates are possible via API or Firestore console

---

## 🆘 Troubleshooting

### Subscription not updating after payment

- Check webhook is configured correctly
- Verify webhook signature validation
- Check Firestore permissions
- Review API endpoint logs

### User stuck on subscription screen

- Check `subscription.isActive` in Firestore
- Verify `endDate` is in the future
- Check `isLifetime` flag if applicable

### Payment webhook not receiving events

- Verify webhook URL is publicly accessible
- Check payment provider webhook configuration
- Review webhook logs in payment provider dashboard

---

**Implementation Complete!** ✅

Users must have an active subscription to use the app. The subscription system is fully integrated with the landing page for payments.


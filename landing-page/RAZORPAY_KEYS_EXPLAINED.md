# Razorpay Keys Explained

## Understanding the Three Environment Variables

### 1. `RAZORPAY_KEY_ID` (Server-Side Only)
- **Where it's used**: API routes (`/api/payment/create-order`, `/api/payment/verify`)
- **Purpose**: Server-side Razorpay operations
- **Security**: Not exposed to the browser (server-side only)
- **Value**: Your Razorpay Key ID (e.g., `rzp_live_xxxxxxxxxxxxx`)

### 2. `RAZORPAY_KEY_SECRET` (Server-Side Only - NEVER Public)
- **Where it's used**: API routes only (payment verification)
- **Purpose**: Verify payment signatures, create orders
- **Security**: ⚠️ **NEVER expose this to the client** - Server-side only!
- **Value**: Your Razorpay Key Secret (long string)

### 3. `NEXT_PUBLIC_RAZORPAY_KEY_ID` (Client-Side - Public)
- **Where it's used**: Payment page (`/app/payment/page.tsx`)
- **Purpose**: Initialize Razorpay checkout modal in the browser
- **Security**: Exposed to browser (that's okay - Key ID is safe to be public)
- **Value**: **Same as RAZORPAY_KEY_ID** (e.g., `rzp_live_xxxxxxxxxxxxx`)

## Important Points

### ✅ YES - These should be the SAME value:
```bash
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx  # Same value!
```

### ❌ NO - Key Secret is DIFFERENT and PRIVATE:
```bash
RAZORPAY_KEY_SECRET=your_secret_key_here  # Different from Key ID, and NEVER public
```

## Why Two Variables for the Same Key ID?

1. **`RAZORPAY_KEY_ID`** (server-side):
   - Used in API routes
   - Not accessible from browser
   - More secure

2. **`NEXT_PUBLIC_RAZORPAY_KEY_ID`** (client-side):
   - Used in payment page (browser)
   - Must be public (NEXT_PUBLIC_ prefix)
   - Required for Razorpay checkout modal

## Complete Example

```bash
# .env.local or Vercel Environment Variables

# Key ID - Same value for both (safe to be public)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx

# Key Secret - Different value, NEVER public
RAZORPAY_KEY_SECRET=your_secret_key_here_never_share_this
```

## Security Summary

| Variable | Value | Where Used | Public? |
|----------|-------|------------|---------|
| `RAZORPAY_KEY_ID` | Key ID | Server (API) | ❌ No |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **Same Key ID** | Client (Browser) | ✅ Yes (safe) |
| `RAZORPAY_KEY_SECRET` | Key Secret | Server (API) | ❌ **NEVER** |

## Quick Setup

Just copy the same Key ID to both variables:

```bash
# Step 1: Get your Key ID from Razorpay Dashboard
# Example: rzp_live_ABC123XYZ789

# Step 2: Use the SAME value for both
RAZORPAY_KEY_ID=rzp_live_ABC123XYZ789
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_ABC123XYZ789  # Same!

# Step 3: Add your secret (different value)
RAZORPAY_KEY_SECRET=your_secret_key_here
```

## Common Mistakes

❌ **Wrong**: Using different values
```bash
RAZORPAY_KEY_ID=rzp_live_ABC123
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XYZ789  # Different - WRONG!
```

✅ **Correct**: Using same value
```bash
RAZORPAY_KEY_ID=rzp_live_ABC123
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_ABC123  # Same - CORRECT!
```

## Why is Key ID Safe to be Public?

- Key ID is like a username - it's meant to be public
- It's used to identify your Razorpay account
- It cannot be used to make payments without the Key Secret
- Razorpay requires both Key ID + Key Secret for sensitive operations
- Key Secret is always kept server-side and never exposed


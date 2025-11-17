# Fix Vercel Private Key Format Issue

## Problem
You're getting this error:
```
error:1E08010C:DECODER routines::unsupported
```

This means the private key format in Vercel is incorrect.

## Solution: Fix the Private Key Format

The issue is that Vercel's environment variable interface might not handle `\n` characters correctly. You need to use **actual newlines** instead of `\n` characters.

### Option 1: Use Actual Newlines (Recommended)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click on `FIREBASE_ADMIN_PRIVATE_KEY` to edit it
3. **Delete the current value**
4. Copy the private key from your `.env.local` file **WITHOUT the quotes**
5. Paste it into Vercel - it should show as multiple lines
6. The format should look like:
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPa7FwfogUW8j0
   UUMo+yOjjJ31xHEf4bfZpHkEiebtMSNhoa5Jl7kOTlhQ3FUfEVxBfGvPzmgES8U7
   ...
   -----END PRIVATE KEY-----
   ```
   (Each line should be on a separate line, not with `\n`)

### Option 2: Keep `\n` but Remove Quotes

If Option 1 doesn't work, try this:

1. Edit `FIREBASE_ADMIN_PRIVATE_KEY` in Vercel
2. Remove the **outer quotes** (`"` at the beginning and end)
3. Keep the `\n` characters
4. Should look like:
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPa7FwfogUW8j0\n...
   ```

### Option 3: Use Base64 Encoding (Advanced)

If both above don't work, you can base64 encode the key, but this requires code changes.

## Steps to Fix:

1. **Get the correct format from your local file:**
   ```bash
   # In your terminal, run:
   cd landing-page
   cat .env.local | grep FIREBASE_ADMIN_PRIVATE_KEY
   ```

2. **Copy the value** (the part after `=`)

3. **In Vercel:**
   - Edit `FIREBASE_ADMIN_PRIVATE_KEY`
   - Paste the value
   - **Try removing the quotes** if they're there
   - Make sure `\n` characters are preserved OR use actual newlines

4. **Save and Redeploy:**
   - Click Save
   - Go to Deployments → Redeploy

5. **Test again:**
   - Visit: `https://your-project.vercel.app/api/debug-stats`
   - Should show `"testQuery": {"success": true}` instead of error

## Quick Test Format

The private key should start with:
```
-----BEGIN PRIVATE KEY-----
```
And end with:
```
-----END PRIVATE KEY-----
```

If you see `\n` in between, that's fine - the code converts them. But make sure there are NO quotes around the entire value in Vercel.


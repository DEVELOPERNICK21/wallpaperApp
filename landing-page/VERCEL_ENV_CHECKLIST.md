# Vercel Environment Variables Checklist ✅

## Required Variables (All 3 must be added):

### ✅ 1. FIREBASE_ADMIN_PROJECT_ID
- **Value:** `wallpemsg`
- **Format:** Simple text, no quotes needed
- **Status:** ✅ Should be added

### ✅ 2. FIREBASE_ADMIN_CLIENT_EMAIL  
- **Value:** `firebase-adminsdk-fbsvc@wallpemsg.iam.gserviceaccount.com`
- **Format:** Simple text, no quotes needed
- **Status:** ✅ Should be added

### ✅ 3. FIREBASE_ADMIN_PRIVATE_KEY
- **Value:** The entire private key with `\n` characters
- **Format:** Should look like:
  ```
  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPa7FwfogUW8j0\n...\n-----END PRIVATE KEY-----\n"
  ```
- **Important:** 
  - Keep the `\n` characters (they represent newlines)
  - Keep the quotes around the entire value
  - Copy the ENTIRE key from your `.env.local` file
- **Status:** ✅ You've added this (I can see it in your screenshot)

## Verification Steps:

1. **Check all 3 variables are added:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Make sure you see all 3 variables listed

2. **Check environment selection:**
   - For each variable, make sure "Production" is checked ✅
   - Optionally check "Preview" and "Development" too

3. **Redeploy:**
   - After adding/updating variables, you MUST redeploy
   - Go to Deployments → Click "..." on latest → "Redeploy"
   - OR push a new commit to trigger auto-deployment

4. **Test:**
   - Visit: `https://your-project.vercel.app/api/debug-stats`
   - Should show:
     ```json
     {
       "environment": {
         "hasProjectId": true,
         "hasClientEmail": true,
         "hasPrivateKey": true
       },
       "firebaseAdmin": {
         "initialized": true
       },
       "stats": {
         "userCount": [actual number]
       }
     }
     ```

## Common Issues:

### Issue: Still showing 0 users
**Solution:** 
- Make sure you redeployed AFTER adding environment variables
- Variables only apply to NEW deployments

### Issue: Variables not showing in debug endpoint
**Solution:**
- Check variable names are EXACTLY: `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
- Case-sensitive!

### Issue: Private key format error
**Solution:**
- Make sure you copied the ENTIRE value from `.env.local`
- Keep the quotes and `\n` characters
- Should start with `"-----BEGIN` and end with `-----\n"`


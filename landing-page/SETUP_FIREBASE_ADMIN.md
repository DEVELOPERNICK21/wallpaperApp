# Firebase Admin SDK Setup Guide

## Problem
Your landing page shows 0 users because Firebase Admin SDK is not configured. The terminal shows:
```
hasProjectId: false, hasClientEmail: false, hasPrivateKey: false
```

## Solution: Create `.env.local` file

### Step 1: Create the file
In the `landing-page` directory, create a file named `.env.local`

### Step 2: Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wallpemsg**
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Click **Generate Key** in the popup
7. A JSON file will download (e.g., `wallpemsg-firebase-adminsdk-xxxxx.json`)

### Step 3: Extract values from JSON

Open the downloaded JSON file. It looks like this:
```json
{
  "type": "service_account",
  "project_id": "wallpemsg",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@wallpemsg.iam.gserviceaccount.com",
  ...
}
```

### Step 4: Fill in `.env.local`

Create `.env.local` in the `landing-page` directory with this content:

```bash
# Firebase Admin SDK Configuration
FIREBASE_ADMIN_PROJECT_ID=wallpemsg
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@wallpemsg.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Optional fallbacks
NEXT_PUBLIC_SEEDED_USER_COUNT=0
NEXT_PUBLIC_USER_COUNT_BASELINE=0
```

**Important:**
- Replace `firebase-adminsdk-xxxxx@wallpemsg.iam.gserviceaccount.com` with the actual `client_email` from your JSON
- Replace `YOUR_ACTUAL_KEY_HERE` with the actual `private_key` from your JSON
- **Keep the `\n` characters** - they represent newlines and are required
- Keep the quotes around the private key value

### Step 5: Restart your dev server

After creating `.env.local`:
1. Stop your Next.js dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. Check the terminal - you should see:
   ```
   User count from Firestore: [actual number]
   ```

### Step 6: Test the connection

Visit: `http://localhost:3000/api/debug-stats`

This will show you:
- ✅ Environment variables status
- ✅ Firebase Admin initialization status
- ✅ Actual user count from Firestore
- ✅ Any errors

## Troubleshooting

### Still showing 0?
1. **Check file location**: `.env.local` must be in the `landing-page` directory (same level as `package.json`)
2. **Check variable names**: Must be exactly `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
3. **Restart server**: Next.js only loads `.env.local` on startup
4. **Check private key format**: Must include `\n` characters and be wrapped in quotes
5. **Check Firebase Console**: Make sure your Service Account has Firestore read permissions

### Security Note
- `.env.local` is already in `.gitignore` - don't commit it to git
- Never share your private key publicly
- The service account has admin access - keep it secure


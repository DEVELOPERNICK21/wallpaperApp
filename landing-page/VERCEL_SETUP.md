# Vercel Deployment Setup Guide

## Problem

Your landing page works locally but shows 0 users on Vercel because environment variables are not configured in production.

## Solution: Add Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (wallpaperApp or your project name)
3. Click on **Settings** → **Environment Variables**

### Step 2: Add Firebase Admin SDK Credentials

Add these **3 environment variables**:

#### 1. `FIREBASE_ADMIN_PROJECT_ID`

- **Value:** `wallpemsg`
- **Environment:** Production, Preview, Development (select all)

#### 2. `FIREBASE_ADMIN_CLIENT_EMAIL`

- **Value:** `firebase-adminsdk-fbsvc@wallpemsg.iam.gserviceaccount.com`
  - (Or get the new one from Firebase Console if you regenerated the key)
- **Environment:** Production, Preview, Development (select all)

#### 3. `FIREBASE_ADMIN_PRIVATE_KEY`

- **Value:** Copy the entire private key from your `.env.local` file
  - It should look like: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCXWsYKUjjiJ/FZ\n...\n-----END PRIVATE KEY-----\n"`
  - **IMPORTANT:** Keep the `\n` characters and the quotes
- **Environment:** Production, Preview, Development (select all)

### Step 3: Optional Fallback Variables

Add these if you want fallback values:

#### 4. `NEXT_PUBLIC_SEEDED_USER_COUNT`

- **Value:** `0` (or your fallback number)
- **Environment:** Production, Preview, Development

#### 5. `NEXT_PUBLIC_USER_COUNT_BASELINE`

- **Value:** `0`
- **Environment:** Production, Preview, Development

### Step 4: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic redeployment

### Step 5: Verify It Works

1. Wait for deployment to complete
2. Visit your Vercel URL: `https://your-project.vercel.app`
3. Check that user count is displaying correctly
4. Visit: `https://your-project.vercel.app/api/debug-stats` to see detailed connection info

## How to Get Firebase Admin Credentials

If you need to regenerate or get new credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **wallpemsg**
3. Click ⚙️ → **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

6. Extract:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

## Troubleshooting

### Still showing 0 on Vercel?

1. **Check environment variables are set:**

   - Go to Vercel Dashboard → Settings → Environment Variables
   - Make sure all 3 Firebase variables are added
   - Make sure they're enabled for **Production** environment

2. **Check variable names:**

   - Must be exactly: `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
   - Case-sensitive!

3. **Check private key format:**

   - Must include `\n` characters (they represent newlines)
   - Should be wrapped in quotes: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

4. **Redeploy after adding variables:**

   - Environment variables only apply to new deployments
   - You must redeploy after adding/updating variables

5. **Check Vercel logs:**

   - Go to Vercel Dashboard → Your Project → Deployments → Click on latest deployment → **Logs**
   - Look for errors related to Firebase Admin initialization

6. **Test the debug endpoint:**
   - Visit: `https://your-project.vercel.app/api/debug-stats`
   - This will show you exactly what's wrong

## Security Best Practices

✅ **DO:**

- Store credentials in Vercel Environment Variables (encrypted)
- Use different service account keys for different environments if needed
- Rotate keys periodically

❌ **DON'T:**

- Commit `.env.local` to git (already in `.gitignore`)
- Share private keys publicly
- Use the same key for development and production if you have separate Firebase projects

## Quick Checklist

- [ ] Added `FIREBASE_ADMIN_PROJECT_ID` to Vercel
- [ ] Added `FIREBASE_ADMIN_CLIENT_EMAIL` to Vercel
- [ ] Added `FIREBASE_ADMIN_PRIVATE_KEY` to Vercel (with `\n` characters)
- [ ] Enabled all variables for Production environment
- [ ] Redeployed the application
- [ ] Verified user count is showing on production site
- [ ] Tested `/api/debug-stats` endpoint

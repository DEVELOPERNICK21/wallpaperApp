# Fixing 404 Error for APK on Vercel

If you're getting a 404 error for the APK file after deployment, here are the solutions:

## Issue
The APK file (73MB) might not be properly deployed to Vercel or Vercel might have issues serving large files from the `public/` folder.

## Solutions

### Solution 1: Verify File is Committed (Most Common)

1. **Check if file is in git:**
   ```bash
   git ls-files landing-page/public/wallpaper-chat.apk
   ```

2. **If not tracked, add and commit it:**
   ```bash
   git add landing-page/public/wallpaper-chat.apk
   git add landing-page/vercel.json
   git commit -m "Add APK file and Vercel config"
   git push
   ```

3. **Force add if git-ignored:**
   ```bash
   git add -f landing-page/public/wallpaper-chat.apk
   git commit -m "Force add APK file"
   git push
   ```

### Solution 2: Use Firebase Storage (Recommended for Large Files)

Vercel can have issues with files over 50MB. Using Firebase Storage is more reliable:

1. **Upload APK to Firebase Storage:**
   - Go to Firebase Console → Storage
   - Create a bucket or use existing
   - Upload `wallpaper-chat.apk`
   - Make it publicly accessible
   - Copy the download URL

2. **Update the link in `app/page.tsx`:**
   ```tsx
   <Link
     href="https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/apps%2Fwallpaper-chat.apk?alt=media"
     download="wallpaper-chat.apk"
     className="...">
     Download APK
   </Link>
   ```

   Or use environment variable:
   ```bash
   # In .env.local
   NEXT_PUBLIC_APK_DOWNLOAD_URL=https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/apps%2Fwallpaper-chat.apk?alt=media
   ```

   Then in code:
   ```tsx
   const apkUrl = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || '/wallpaper-chat.apk';
   <Link href={apkUrl} download="wallpaper-chat.apk">
   ```

### Solution 3: Check Vercel Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Check the latest deployment logs
3. Look for warnings about file size or missing files
4. If you see "file too large" or similar, use Solution 2

### Solution 4: Vercel File Size Limits

- **Vercel Free Tier**: 100MB per file limit
- **Vercel Pro**: 250MB per file limit
- Your APK is 73MB, so it should work, but Vercel might optimize/ignore it

If hitting limits, either:
- Upgrade to Vercel Pro
- Use Firebase Storage (Solution 2)
- Compress the APK further

### Solution 5: Use Git LFS (For Very Large Files)

If you need to store large files in git:

1. **Install Git LFS:**
   ```bash
   brew install git-lfs  # macOS
   git lfs install
   ```

2. **Track APK files:**
   ```bash
   git lfs track "landing-page/public/*.apk"
   git lfs track "landing-page/public/*.ipa"
   git add .gitattributes
   git add landing-page/public/wallpaper-chat.apk
   git commit -m "Add APK with Git LFS"
   git push
   ```

### Solution 6: Alternative Hosting (CDN)

Use a CDN service:
- **Cloudflare R2**: Free tier available
- **AWS S3**: Pay as you go
- **Backblaze B2**: Free tier available

Then update the download link to point to the CDN URL.

## Quick Check List

- [ ] File is committed to git (`git ls-files` shows it)
- [ ] File is under 100MB (73MB ✓)
- [ ] `vercel.json` is created and committed
- [ ] Deployment logs show no errors
- [ ] Try accessing `https://your-domain.vercel.app/wallpaper-chat.apk` directly

## Most Likely Fix

**The file probably isn't committed to git.** Run:

```bash
git add -f landing-page/public/wallpaper-chat.apk
git add landing-page/vercel.json
git commit -m "Fix: Add APK file for download"
git push
```

Then redeploy on Vercel.

## Test After Fix

1. Visit: `https://your-domain.vercel.app/wallpaper-chat.apk`
2. Should download the APK file (not show 404)
3. Click the download button on your landing page
4. Should trigger download

If still not working after committing, use Firebase Storage (Solution 2) - it's more reliable for large files.


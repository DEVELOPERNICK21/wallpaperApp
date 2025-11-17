# APK Download Setup Guide

This guide explains how to upload your APK file so users can download it from your website.

## Quick Setup (3 Steps)

### Step 1: Copy APK to Public Folder

Copy your APK file to the `landing-page/public/` directory:

```bash
# From the project root
cp android/app/release/Wallpaper.apk landing-page/public/wallpaper-chat.apk
```

Or manually:
1. Navigate to `android/app/release/`
2. Copy `Wallpaper.apk`
3. Paste it into `landing-page/public/`
4. Optionally rename it to `wallpaper-chat.apk` (or keep the original name)

### Step 2: Update Download Link

The download link in `app/page.tsx` is already configured to use `/wallpaper-chat.apk`. If you used a different filename, update line 287 in `app/page.tsx`:

```tsx
<Link
  href="/wallpaper-chat.apk"  // Change this to match your filename
  download="wallpaper-chat.apk"  // Optional: suggested filename for download
  className="...">
  Get the latest APK
</Link>
```

### Step 3: Deploy to Vercel

1. Commit your changes:
   ```bash
   git add landing-page/public/wallpaper-chat.apk
   git add landing-page/app/page.tsx
   git commit -m "Add APK download file"
   ```

2. Push to trigger Vercel deployment:
   ```bash
   git push
   ```

3. Your APK will be available at:
   ```
   https://your-domain.vercel.app/wallpaper-chat.apk
   ```

## File Size Considerations

- **Vercel Free Tier**: 100MB file size limit
- **Vercel Pro/Team**: 250MB file size limit
- If your APK is larger, consider:
  - Using Firebase Storage or AWS S3 for hosting
  - Compressing the APK
  - Using a CDN service

## Alternative: Host APK on Firebase Storage

If your APK is too large for Vercel or you want better control:

1. Upload APK to Firebase Storage
2. Get the public download URL
3. Update the link in `app/page.tsx` to use the Firebase Storage URL

Example:
```tsx
<Link
  href="https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/apps%2Fwallpaper-chat.apk?alt=media"
  className="...">
  Get the latest APK
</Link>
```

## Testing Locally

1. Start the Next.js dev server:
   ```bash
   cd landing-page
   npm run dev
   ```

2. Visit: `http://localhost:3000/wallpaper-chat.apk`
   - Should download the APK file

3. Test the download button on the homepage:
   - Visit: `http://localhost:3000`
   - Click "Get the latest APK" button
   - Should trigger download

## Updating APK Versions

When you release a new version:

1. Build a new APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. Copy the new APK to public folder:
   ```bash
   cp android/app/release/Wallpaper.apk landing-page/public/wallpaper-chat.apk
   ```

3. Optionally add version to filename:
   ```bash
   cp android/app/release/Wallpaper.apk landing-page/public/wallpaper-chat-v1.0.0.apk
   ```
   Then update the link in `page.tsx` accordingly.

4. Commit and push to deploy

## Security Considerations

- ✅ APK files in `public/` are publicly accessible
- ✅ Consider adding version numbers to track downloads
- ✅ Monitor download analytics if needed
- ⚠️ For production apps, consider requiring authentication or email verification before download

## Troubleshooting

### APK doesn't download
- Check file exists in `landing-page/public/`
- Verify filename matches the link in `page.tsx`
- Check browser console for errors
- Ensure file permissions allow reading

### File too large for Vercel
- Use Firebase Storage or AWS S3
- Or upgrade Vercel plan
- Or compress the APK further

### Download works but installation fails
- Ensure APK is properly signed
- Check Android version compatibility
- Verify users have "Install from unknown sources" enabled



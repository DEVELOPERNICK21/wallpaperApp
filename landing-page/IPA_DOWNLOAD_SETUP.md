# IPA Download QR Code Setup Guide

This guide explains how to set up the QR code for iOS IPA downloads on your landing page.

## Overview

The landing page now includes a QR code that iPhone users can scan with their camera to download and install your iOS app (IPA file). The QR code appears in the download section alongside the Android APK download option.

## Quick Setup

### ✅ Already Configured!

The IPA file (`wallpe.ipa`) is already in the `public/` folder and the landing page is configured to use it automatically. The QR code will work out of the box!

### Optional: Custom URL (For Production)

If you want to use a different URL (e.g., from Firebase Storage or CDN), you can set an environment variable:

#### Option A: Environment Variable

Create or update `.env.local` file in the `landing-page` directory:

```bash
NEXT_PUBLIC_IPA_DOWNLOAD_URL=https://your-domain.com/wallpe.ipa
```

Or if using Firebase Storage:
```bash
NEXT_PUBLIC_IPA_DOWNLOAD_URL=https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/apps%2Fwallpe.ipa?alt=media
```

#### Option B: Update Directly in Code

Edit `landing-page/app/page.tsx` line 82-83:

```typescript
const ipaDownloadUrl =
  process.env.NEXT_PUBLIC_IPA_DOWNLOAD_URL || '/wallpe.ipa'; // Default uses public folder
```

### Deploy

1. Commit your changes:
   ```bash
   git add landing-page/components/IPADownloadQR.tsx
   git add landing-page/app/page.tsx
   git add landing-page/.env.local  # If using env variables
   git commit -m "Add iOS IPA download QR code"
   ```

2. Push to trigger deployment:
   ```bash
   git push
   ```

3. If using environment variables, make sure to add `NEXT_PUBLIC_IPA_DOWNLOAD_URL` to your hosting provider's environment variables (e.g., Vercel dashboard).

## How It Works

1. **QR Code Component**: `components/IPADownloadQR.tsx`
   - Uses `qrcode.react` library to generate QR codes
   - Displays the QR code with a white background for better scanning
   - Includes a direct download link as fallback

2. **Landing Page Integration**: 
   - The QR code appears in the download section
   - Side-by-side with Android APK download
   - Responsive design for mobile and desktop

3. **User Experience**:
   - iPhone users open their camera app
   - Point at the QR code on the landing page
   - Tap the notification that appears
   - Browser opens and downloads/installs the IPA

## IPA File Hosting Options

### Option 1: Public Folder (Current Setup) ✅

The IPA file is already in `landing-page/public/wallpe.ipa`:
- Automatically served at `/wallpe.ipa`
- Works immediately without configuration
- QR code automatically converts to full URL when scanned

### Option 2: Firebase Storage

If you prefer Firebase Storage:

1. Upload IPA to Firebase Storage
2. Get the public download URL
3. Set it as `NEXT_PUBLIC_IPA_DOWNLOAD_URL` in environment variables

### Option 3: Direct Hosting

1. Place IPA file in `landing-page/public/` directory (already done!)
2. File is automatically available at `/wallpe.ipa`

### Option 3: CDN/Cloud Storage

Use AWS S3, Cloudflare R2, or similar:
- Upload IPA file
- Get public URL
- Set as environment variable

### Option 4: TestFlight or Enterprise Distribution

If using Apple's distribution methods, you can link to:
- TestFlight: `https://testflight.apple.com/join/XXXXXX`
- Enterprise distribution URL

## Testing

### Local Testing

1. Start dev server:
   ```bash
   cd landing-page
   npm run dev
   ```

2. Visit: `http://localhost:3000/#download`
3. Check QR code appears
4. Test scanning with iPhone camera

### QR Code Verification

- **Size**: 200x200 pixels (adjustable in component)
- **Error Correction**: Level H (highest - 30% error correction)
- **Format**: SVG (scalable, crisp on all displays)
- **Background**: White with padding for better scanning

## Customization

### Adjust QR Code Size

Edit `components/IPADownloadQR.tsx`:

```typescript
<QRCodeSVG
  value={ipaUrl}
  size={250}  // Change from 200 to desired size
  level="H"
  includeMargin={false}
/>
```

### Change Styling

The component uses Tailwind CSS classes. Customize in `IPADownloadQR.tsx`:

```typescript
// Change background color
className="rounded-xl bg-gray-100 p-4"  // Light gray

// Change border/container
className="flex flex-col items-center gap-4 rounded-3xl border-2 border-slate-700..."
```

### Change Title/Description

Either in the component call:

```typescript
<IPADownloadQR
  ipaUrl={ipaDownloadUrl}
  title="Download iOS App"
  description="Scan this QR code with your iPhone"
/>
```

Or modify defaults in `IPADownloadQR.tsx`.

## iOS Installation Notes

**Important**: For users to install an IPA file directly:

1. **iOS Version**: Users need iOS 9.0+ (modern iPhones)
2. **Settings**: Users may need to trust the developer in Settings → General → VPN & Device Management
3. **Distribution**: 
   - Direct IPA download requires Enterprise distribution OR
   - Ad-hoc distribution (limited devices) OR
   - TestFlight beta testing (recommended for public release)
4. **Alternative**: Consider linking to App Store or TestFlight instead

## Troubleshooting

### QR Code Not Appearing

- Check browser console for errors
- Verify `qrcode.react` is installed: `npm list qrcode.react`
- Ensure component is marked with `'use client'` directive

### QR Code Doesn't Scan

- Ensure URL is valid and accessible
- Check QR code isn't too small on mobile
- Verify white background has enough padding
- Test with different QR code scanners

### Wrong URL in QR Code

- Check environment variable is set correctly
- Restart dev server after changing `.env.local`
- Verify variable name: `NEXT_PUBLIC_IPA_DOWNLOAD_URL`
- Check for typos in URL

### IPA Download Fails on iPhone

- Verify IPA file is accessible from public URL
- Check iOS version compatibility
- Ensure proper code signing and provisioning
- Consider using TestFlight for easier distribution

## Files Created/Modified

- ✅ `components/IPADownloadQR.tsx` - QR code component
- ✅ `app/page.tsx` - Added QR code to download section
- ✅ `package.json` - Added `qrcode.react` dependency

## Next Steps

1. ✅ Build your IPA file
2. ✅ Upload to hosting (Firebase Storage, S3, etc.)
3. ✅ Set `NEXT_PUBLIC_IPA_DOWNLOAD_URL` environment variable
4. ✅ Deploy landing page
5. ✅ Test QR code scanning with iPhone

## Related Documentation

- `APK_DOWNLOAD_SETUP.md` - Android APK download setup
- `README.md` - Landing page overview


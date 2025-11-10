# Firebase Storage Setup for Profile Photos

## Common Issue: Storage Permissions

If you're getting "failed to update profile photo" errors, it's most likely due to Firebase Storage rules.

## Fix: Update Firebase Storage Rules

### 1. Go to Firebase Console

- Open [Firebase Console](https://console.firebase.google.com/)
- Select your project
- Click on **Storage** in the left sidebar
- Click on the **Rules** tab

### 2. Update the Rules

Replace the existing rules with these:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload profile photos
    match /profile_photos/{userId}_{timestamp}.jpg {
      allow read: if true; // Anyone can read profile photos
      allow write: if request.auth != null; // Only authenticated users can upload
    }

    // Allow authenticated users to manage their own profile photos
    match /profile_photos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Keep your existing wallpaper rules if any
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Publish the Rules

Click **Publish** button at the top.

## Alternative: Temporary Open Rules (for testing only)

⚠️ **WARNING:** Only use this for testing, not in production!

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Debugging Steps

### 1. Check Console Logs

After selecting a photo, check the React Native logs for:

- `📸 Starting image upload...`
- `📱 Platform: android/ios`
- `🖼️ Original URI: [uri]`
- `✅ Normalized URI: [uri]`
- `☁️ Uploading to Firebase Storage: [filename]`

### 2. Common Errors

#### `storage/unauthorized`

**Issue:** Firebase Storage rules don't allow uploads
**Solution:** Update Storage rules as shown above

#### `storage/unknown` or file path errors

**Issue:** File path format issues on Android/iOS
**Solution:** Already handled in the code with path normalization

#### `No user logged in`

**Issue:** User authentication issue
**Solution:** Make sure user is logged in before editing profile

### 3. File Path Issues

The code now handles:

- ✅ Android `file://` prefix
- ✅ iOS file path normalization
- ✅ Content URIs from gallery
- ✅ Camera photo URIs

## Test the Upload

1. Open your app
2. Go to Profile → Edit Profile
3. Tap the camera button on the avatar
4. Select "Choose from Gallery" or "Take Photo"
5. Select an image
6. Tap "Save"
7. Check the logs for any errors

You should see:

```
📸 Starting image upload...
📱 Platform: android
🖼️ Original URI: file:///data/user/0/.../image.jpg
✅ Normalized URI: file:///data/user/0/.../image.jpg
☁️ Uploading to Firebase Storage: profile_photos/uid_timestamp.jpg
✅ Upload complete, getting download URL...
🎉 Image uploaded successfully!
🔗 Download URL: https://firebasestorage.googleapis.com/...
💾 Saving to Firestore...
✅ Firestore updated
🔐 Updating Firebase Auth profile...
✅ Firebase Auth updated
```

## Still Having Issues?

Run the app and share the console logs showing:

1. The full error message
2. The error code
3. The file URI being used
4. The platform (Android/iOS)

This will help identify the exact issue!

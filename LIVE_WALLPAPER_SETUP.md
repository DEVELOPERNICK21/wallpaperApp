# ✨ Live Wallpaper Setup Guide

## What is Live Wallpaper?

Live Wallpaper is a **dynamic wallpaper** that:
- ✅ Updates automatically every day (no manual refresh)
- ✅ Shows calendar dots with current progress
- ✅ Displays stats (percentage, days passed, days left) in small text
- ✅ Works on all Android devices
- ✅ No permissions needed (system handles it)
- ✅ No background tasks needed

## How to Set It Up

### Step 1: Build the App

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Step 2: Set Live Wallpaper

**Method 1: From the App**
1. Open the Year Calendar screen
2. Tap **"✨ Set as Live Wallpaper"** button
3. Follow the system prompts

**Method 2: From Android Settings**
1. Long press on home screen
2. Select **"Wallpapers"**
3. Choose **"Live Wallpapers"**
4. Select **"Year Calendar"** (or your app name)
5. Tap **"Set Wallpaper"**

## What It Shows

The Live Wallpaper displays:
- **Calendar dots grid** (12 columns, ~31 rows)
  - White dots = Days passed
  - Orange dot = Today (with border)
  - Semi-transparent white = Future days
- **Stats text** (small, at top):
  - Percentage complete (e.g., "45.2%")
  - Days passed (e.g., "165 passed")
  - Days left (e.g., "200 left")

## Customization

### Change Colors

Edit `CalendarWallpaperService.kt`:

```kotlin
// Color theme (Classic theme by default)
private val colorPassed = Color.parseColor("#ffffff")    // Passed days
private val colorToday = Color.parseColor("#f97316")     // Today
private val colorFuture = Color.parseColor("#ffffff")    // Future days
private val colorBackground = Color.parseColor("#000000") // Background
private val colorText = Color.parseColor("#94a3b8")      // Stats text
```

### Change Text Size

Edit the `drawStats` function:

```kotlin
val textSize = 18f // Adjust this value (smaller = less visible, larger = more visible)
```

### Change Grid Layout

Edit the grid calculations:

```kotlin
private val columns = 12  // Number of columns
val colSpacing = 12f      // Spacing between columns
val rowSpacing = 12f      // Spacing between rows
```

## How It Works

1. **WallpaperService**: Android service that draws on the wallpaper canvas
2. **Engine**: Handles drawing logic and updates
3. **Canvas Drawing**: Uses Android Canvas API to draw dots and text
4. **Auto-Update**: System redraws wallpaper when it becomes visible

## Troubleshooting

### Live Wallpaper Not Showing

1. **Check AndroidManifest.xml**: Ensure service is registered
2. **Rebuild app**: `./gradlew clean && npx react-native run-android`
3. **Check permissions**: Live wallpaper doesn't need special permissions
4. **Restart device**: Sometimes needed for wallpaper service to register

### Stats Not Visible

- Increase `textSize` in `drawStats` function
- Change `colorAccent` to a brighter color
- Adjust `textY` position

### Dots Too Small/Large

- Adjust `dotSize` calculation in `onSurfaceChanged`
- Change `columns` value (fewer = larger dots)
- Modify `colSpacing` and `rowSpacing`

## Advantages Over Static Wallpaper

| Feature | Static Wallpaper | Live Wallpaper |
|---------|------------------|----------------|
| Daily Updates | ❌ Manual | ✅ Automatic |
| Permissions | ⚠️ Required | ✅ None |
| Background Tasks | ⚠️ Needed | ✅ Not needed |
| Device Compatibility | ⚠️ Some OEMs block | ✅ Works everywhere |
| Battery Impact | ⚠️ Can drain | ✅ Minimal |

## Next Steps

1. **Test on device**: Set it as wallpaper and verify it works
2. **Customize colors**: Match your app theme
3. **Adjust layout**: Fine-tune dot size and spacing
4. **Add themes**: Allow users to choose different color schemes

## Technical Details

- **Service**: `CalendarWallpaperService.kt`
- **Engine**: `CalendarWallpaperEngine`
- **Drawing**: Canvas API with Paint objects
- **Updates**: System-triggered redraws (no polling needed)

# WallHaven API Integration

Your app now uses the **WallHaven API** to fetch wallpapers instead of hardcoded images!

## What Changed

### 1. **New Service: `WallHavenService.ts`**
   - Located: `src/services/WallHavenService.ts`
   - Handles all API calls to WallHaven
   - Supports search, filtering, pagination, and category browsing
   - Rate limit: 45 requests per minute (handled automatically)

### 2. **Updated: `WallpaperScreen.tsx`**
   - Removed hardcoded wallpaper array
   - Added API integration with loading states
   - Added search functionality
   - Added pagination (loads more as you scroll)
   - Uses thumbnails for grid, full resolution for preview/download

## Features

### ✅ Search Wallpapers
- Type in the search bar and press Enter/Search
- Searches WallHaven's database of wallpapers
- Supports tags, keywords, and advanced queries

### ✅ Category Filtering
- **All**: Shows all categories
- **General**: General wallpapers
- **Anime**: Anime-themed wallpapers
- **People**: People/portrait wallpapers
- **Year Calendar**: Your custom calendar widget

### ✅ Pagination
- Automatically loads more wallpapers as you scroll
- Shows loading indicator at bottom
- Handles "no more results" gracefully

### ✅ Image Optimization
- Grid view uses thumbnails (faster loading)
- Preview/download uses full resolution images
- Error handling with retry option

## API Parameters Used

The integration uses these WallHaven API parameters:

- **`purity: '100'`** - SFW (Safe For Work) content only
- **`atleast: '1920x1080'`** - Minimum resolution for quality
- **`sorting: 'date_added'`** - Latest wallpapers first
- **`categories`** - Filters by General/Anime/People

## Optional: NSFW Content

If you want to allow NSFW content (requires API key):

1. Get API key from: https://wallhaven.cc/settings/account
2. Add to your app settings/config
3. Call: `WallHavenService.setApiKey('your-api-key')`

**Note**: NSFW content requires authentication and may not be suitable for all users.

## API Documentation

Full API docs: https://wallhaven.cc/help/api

### Available Methods

```typescript
// Search wallpapers
WallHavenService.search({
  q: 'nature',           // Search query
  categories: '111',     // All categories
  purity: '100',         // SFW only
  sorting: 'date_added',  // Sort by date
  page: 1,              // Page number
  atleast: '1920x1080'   // Min resolution
})

// Get latest wallpapers
WallHavenService.getLatest()

// Get top wallpapers
WallHavenService.getTop({ topRange: '1M' })

// Get random wallpapers
WallHavenService.getRandom()

// Search by category
WallHavenService.searchByCategory('anime')
```

## Error Handling

- **Rate Limit (429)**: Shows error message, user can retry
- **Unauthorized (401)**: Invalid API key or NSFW without auth
- **Network Errors**: Shows retry option
- **Empty Results**: Shows "No wallpapers found" message

## Performance

- **Thumbnails**: Grid uses `thumbs.large` (~300KB each)
- **Full Images**: Preview/download uses `path` (full resolution)
- **Pagination**: Loads 24 wallpapers per page
- **Caching**: React Native handles image caching automatically

## Future Enhancements

Possible improvements:
- [ ] Save favorite wallpapers locally
- [ ] Filter by resolution/aspect ratio
- [ ] Filter by color
- [ ] Sort by views/favorites
- [ ] Download history
- [ ] Offline mode (cache downloaded wallpapers)

## Testing

1. Run the app: `yarn android` or `yarn ios`
2. Navigate to Wallpapers screen
3. Try searching for: "nature", "abstract", "anime"
4. Scroll down to test pagination
5. Try different categories
6. Test download/apply wallpaper functionality

## Troubleshooting

**No wallpapers loading?**
- Check internet connection
- Check console logs for API errors
- Verify WallHaven API is accessible (not blocked)

**Rate limit errors?**
- Wait 1 minute between requests
- The app handles this automatically

**Images not loading?**
- Check if URLs are accessible
- Some wallpapers may be deleted/removed
- Retry button will reload failed images

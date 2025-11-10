# Performance Optimization Plan

## Critical Issues Identified

### 1. **HomeScreen - N+1 Query Problem** 🔴 HIGH PRIORITY

**Issue:** For each chat, fetching all messages to calculate unread count

```typescript
// Current: O(n * m) where n = chats, m = messages per chat
const allMessagesSnapshot = await firestore()
  .collection('GroupChats')
  .doc(chat.id)
  .collection('Messages')
  .get();
```

**Impact:**

- If you have 20 chats with 100 messages each = 2,000 documents fetched
- Slow initial load
- High Firestore read costs

**Solution:**

- Store `lastMessage` and `unreadCount` directly in GroupChat document
- Update these fields when messages are sent/read
- Use Firestore listeners only for changes

### 2. **ChatScreen - Large Message Lists** 🔴 HIGH PRIORITY

**Issue:** Loading all messages at once, no pagination
**Impact:** Memory usage, slow scrolling
**Solution:**

- Implement pagination (load 50 messages at a time)
- Use `getItemLayout` for FlatList
- Implement windowing

### 3. **Missing React Optimizations** 🟡 MEDIUM PRIORITY

**Issue:** Components re-rendering unnecessarily
**Solutions:**

- Add `React.memo` to list items
- Use `useCallback` for functions
- Use `useMemo` for computed values

### 4. **Image Loading** 🟡 MEDIUM PRIORITY

**Issue:** All images loading at once
**Solution:**

- Implement progressive image loading
- Use `react-native-fast-image` for caching
- Lazy load images

### 5. **Search Performance** 🟡 MEDIUM PRIORITY

**Issue:** Searching all users on every keystroke
**Solution:**

- Already has debouncing (good!)
- Add client-side caching
- Limit results

## Implementation Priority

### Phase 1: Critical Database Optimizations (Now)

1. ✅ Add `lastMessage` to GroupChat document
2. ✅ Add `unreadCount` per user in GroupChat document
3. ✅ Update these fields in real-time when messages are sent/read
4. ✅ Remove N+1 queries from HomeScreen

### Phase 2: Component Optimizations

1. ✅ Memoize chat list items
2. ✅ Memoize message list items
3. ✅ Add useCallback to event handlers
4. ✅ Add useMemo to computed values

### Phase 3: List Performance

1. ✅ Add pagination to ChatScreen
2. ✅ Optimize FlatList props
3. ✅ Add getItemLayout

### Phase 4: Image & Asset Optimization

1. Progressive image loading
2. Image caching
3. Reduce bundle size

## Expected Improvements

- **Initial Load:** 5-10s → 1-2s
- **Chat List Scroll:** Janky → 60 FPS
- **Message Send:** 500ms → <100ms
- **Memory Usage:** Reduce by 40-60%
- **Firestore Reads:** Reduce by 80-90%

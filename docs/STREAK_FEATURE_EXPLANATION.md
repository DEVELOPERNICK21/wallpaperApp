# Streak Feature Explanation

## What is a Streak?

A **streak** is a consecutive count of days where you've completed a specific action or maintained a habit. It's a powerful motivational tool used in many apps (like Duolingo, Snapchat, fitness apps) to encourage daily engagement.

## How Streak Works in Your App

### Basic Concept

- **Day 1**: User performs an action (e.g., opens app, sets wallpaper, completes a task) → Streak = 1
- **Day 2**: User performs the same action again → Streak = 2
- **Day 3**: User performs the action → Streak = 3
- **Day 4**: User **misses** the action → Streak **resets to 0**

### Visual Display on Dynamic Island

When streak mode is enabled, the Dynamic Island shows:
- **Compact view**: `🔥 17` (fire emoji + streak count)
- **Minimal view**: `🔥17` (compact version)
- **Expanded view**: 
  - Leading: Fire emoji
  - Trailing: "17 days"
  - Center: "Streak"
  - Bottom: "Consistency streak"
- **Lock Screen**: `🔥 17-day streak`

## Implementation Requirements

### 1. Track User Actions

You need to track when users perform the action that counts toward the streak. Examples:
- Opening the app daily
- Setting a new wallpaper
- Completing a daily task
- Any other daily engagement metric

### 2. Store Streak Data

Store the following in your app:
- `lastCheckInDate`: The last date the user performed the action
- `streakCount`: Current streak count
- `longestStreak`: Best streak ever achieved (optional)

### 3. Streak Logic

```typescript
// Pseudo-code for streak calculation
function updateStreak(userActionDate: Date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastCheckIn = getLastCheckInDate();
  
  if (isSameDay(userActionDate, today)) {
    // User already checked in today, don't increment
    return;
  }
  
  if (isSameDay(lastCheckIn, yesterday)) {
    // Consecutive day - increment streak
    streakCount += 1;
  } else if (isSameDay(lastCheckIn, today)) {
    // Already checked in today
    return;
  } else {
    // Streak broken - reset to 1
    streakCount = 1;
  }
  
  lastCheckInDate = today;
  saveStreakData();
}
```

### 4. Update Dynamic Island

When starting streak mode:

```typescript
await LiveActivityService.startLiveActivity('streak', {
  streakCount: currentStreakCount
});
```

When streak updates:

```typescript
await LiveActivityService.startLiveActivity('streak', {
  streakCount: newStreakCount
});
```

## Use Cases

### 1. Daily App Usage Streak
- Track consecutive days user opens the app
- Reset if user misses a day
- Show on Dynamic Island: `🔥 5-day streak`

### 2. Wallpaper Setting Streak
- Track consecutive days user sets a new wallpaper
- Motivates daily engagement
- Show on Dynamic Island: `🔥 12-day streak`

### 3. Goal Completion Streak
- Track consecutive days user completes a goal
- Builds habit formation
- Show on Dynamic Island: `🔥 30-day streak`

## Premium Feature: Streak Protection

As mentioned in your monetization plan, you can offer:
- **Free users**: Streak breaks if they miss a day
- **Premium users**: 1-2 "forgiveness days" per month
  - If user misses a day, premium users can "restore" their streak once or twice per month
  - This creates emotional value and subscription motivation

## Example Implementation Flow

1. **User opens app** → Check if they checked in today
2. **If not checked in**:
   - Calculate streak (increment if consecutive, reset if broken)
   - Update `lastCheckInDate` to today
   - Save streak data
   - If streak mode is active, update Dynamic Island
3. **If already checked in** → Do nothing
4. **Background check** (optional):
   - At midnight, check if user checked in yesterday
   - If not, reset streak to 0
   - Update Dynamic Island if active

## Benefits

1. **Habit Formation**: Encourages daily engagement
2. **Emotional Connection**: Users don't want to "break the streak"
3. **Premium Hook**: Streak protection becomes valuable
4. **Social Proof**: Users can share their streaks
5. **Gamification**: Makes app usage fun and rewarding

## Next Steps

To fully implement streak:

1. Create a `StreakService.ts` similar to `PetService.ts`
2. Track user actions (app open, wallpaper set, etc.)
3. Store streak data in AsyncStorage or backend
4. Add streak management UI (view current streak, history, etc.)
5. Integrate with Dynamic Island updates
6. Add premium streak protection feature

The Dynamic Island display is already implemented - you just need to track and update the streak count!

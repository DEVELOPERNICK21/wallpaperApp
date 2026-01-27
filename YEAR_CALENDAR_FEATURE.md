# 📅 Year Calendar Feature - Implementation Guide

## Overview

A dynamic, interactive Year Calendar component that visualizes the year's progress with psychology-based color themes and wallpaper functionality.

---

## ✨ Features

### 1. **Visual Progress Tracking**
- Grid of 365/366 dots (one per day)
- Dots fill in as days pass
- Orange dot highlights today
- Shows percentage complete
- Days passed and remaining count

### 2. **Psychology-Based Color Themes** 🎨

Seven color themes designed to attract attention and evoke emotions:

#### **Ocean Blue** (Default)
- **Colors:** Blue (#3b82f6) for passed days
- **Psychology:** Calm, trustworthy, professional
- **Best for:** Productivity, focus, work environments

#### **Forest Green**
- **Colors:** Emerald (#10b981) for passed days
- **Psychology:** Growth, harmony, balance
- **Best for:** Personal development, health goals

#### **Sunset Orange**
- **Colors:** Orange (#f97316) for passed days
- **Psychology:** Energy, enthusiasm, creativity
- **Best for:** Motivation, active lifestyles

#### **Royal Purple**
- **Colors:** Purple (#a855f7) for passed days
- **Psychology:** Creativity, luxury, wisdom
- **Best for:** Creative professionals, artists

#### **Neon Cyan**
- **Colors:** Cyan (#06b6d4) for passed days
- **Psychology:** Modern, tech, attention-grabbing
- **Best for:** Tech enthusiasts, modern aesthetics

#### **Rose Gold**
- **Colors:** Pink (#ec4899) for passed days
- **Psychology:** Elegance, warmth, sophistication
- **Best for:** Personal use, aesthetic appeal

#### **Classic White**
- **Colors:** White (#ffffff) for passed days
- **Psychology:** Clean, minimal, timeless
- **Best for:** Minimalist preferences

### 3. **Interactive Features**
- Tap any dot to see date details
- Full-screen mode for better visibility
- Theme selector with live preview
- Smooth animations

### 4. **Wallpaper Functionality** 📱
- Capture calendar as image
- Set as wallpaper (Android: home/lock/both)
- Save to gallery (iOS)
- Dynamic updates daily

---

## 🎨 Color Psychology Explained

### Why These Colors Work:

1. **Blue (Ocean)**: 
   - Increases focus and productivity
   - Associated with trust and stability
   - Reduces stress

2. **Green (Forest)**:
   - Promotes balance and harmony
   - Associated with growth and nature
   - Calming effect

3. **Orange (Sunset)**:
   - Energizing and motivating
   - Creates urgency and action
   - Attention-grabbing

4. **Purple (Royal)**:
   - Stimulates creativity
   - Associated with luxury and wisdom
   - Inspires imagination

5. **Cyan (Neon)**:
   - Modern and tech-forward
   - High visibility
   - Appeals to younger demographics

6. **Pink (Rose Gold)**:
   - Warm and inviting
   - Elegant and sophisticated
   - Appeals to aesthetic preferences

7. **White (Classic)**:
   - Clean and minimal
   - Timeless appeal
   - Reduces visual clutter

---

## 📦 Installation Requirements

### Required Package:

```bash
npm install react-native-view-shot
# or
yarn add react-native-view-shot
```

### For iOS:
```bash
cd ios && pod install && cd ..
```

### For Android:
No additional setup needed (auto-linked)

---

## 🚀 Usage

### Basic Usage:

```tsx
import YearCalendar from './component/YearCalendar/YearCalendar';

<YearCalendar />
```

### With Full Screen:

```tsx
<YearCalendar 
  fullScreen={true} 
  onClose={() => setShowCalendar(false)} 
/>
```

### Custom Year:

```tsx
<YearCalendar year={2025} />
```

---

## 🎯 User Flow

### Setting Calendar as Wallpaper:

1. **Select Theme:**
   - User opens Year Calendar
   - Scrolls through theme options
   - Taps preferred theme
   - Calendar updates instantly

2. **Set as Wallpaper:**
   - Taps "📱 Set as Wallpaper" button
   - Chooses: Home / Lock / Both (Android)
   - Calendar captured as image
   - Applied to device wallpaper
   - Success notification shown

3. **Daily Updates:**
   - Calendar updates automatically
   - New dot fills each day
   - Percentage recalculates
   - Wallpaper can be refreshed

---

## 🔧 Technical Implementation

### Color Theme System:

```typescript
const colorThemes = {
  ocean: {
    name: 'Ocean Blue',
    passed: '#3b82f6',
    today: '#f59e0b',
    future: '#1e3a8a',
    background: '#0f172a',
    accent: '#60a5fa',
  },
  // ... more themes
};
```

### Image Capture:

```typescript
const captureCalendar = async () => {
  const uri = await viewShotRef.current.capture();
  return uri;
};
```

### Wallpaper Setting:

```typescript
await ManageWallpaper.setWallpaper(
  {uri},
  ManageWallpaper.TYPE.BOTH
);
```

---

## 📱 Platform Support

### Android:
- ✅ Full wallpaper setting (home/lock/both)
- ✅ Direct application
- ✅ No manual steps

### iOS:
- ✅ Save to gallery
- ⚠️ Manual wallpaper setting (Apple limitation)
- ✅ High-quality image export

---

## 🎨 Theme Customization

### Adding New Themes:

1. Add theme to `colorThemes` object:

```typescript
const colorThemes = {
  // ... existing themes
  custom: {
    name: 'Custom Theme',
    description: 'Your description',
    passed: '#YOUR_COLOR',
    today: '#YOUR_COLOR',
    future: '#YOUR_COLOR',
    background: '#YOUR_COLOR',
    accent: '#YOUR_COLOR',
  },
};
```

2. Theme automatically appears in selector

---

## 💡 Best Practices

### Color Selection:
- **Passed days:** Bright, visible color
- **Today:** Contrasting highlight color
- **Future:** Darker, muted color
- **Background:** Dark for contrast
- **Accent:** Complementary to main color

### Psychology Tips:
- Use blue for productivity apps
- Use green for health/wellness
- Use orange for motivation
- Use purple for creativity
- Use cyan for tech/modern
- Use pink for personal/elegant
- Use white for minimal

---

## 🐛 Troubleshooting

### ViewShot Not Working:
- Install: `npm install react-native-view-shot`
- iOS: Run `pod install`
- Rebuild app

### Wallpaper Not Setting (Android):
- Check permissions
- Verify ManageWallpaper is installed
- Check device compatibility

### Colors Not Updating:
- Ensure theme state is updating
- Check component re-render
- Verify theme object structure

---

## 📊 Performance

- **Rendering:** Optimized with useMemo
- **Animations:** Native driver enabled
- **Image Capture:** Async, non-blocking
- **Memory:** Efficient dot rendering

---

## 🔮 Future Enhancements

- [ ] Custom color picker
- [ ] Gradient themes
- [ ] Animated transitions
- [ ] Export as PNG/SVG
- [ ] Share calendar image
- [ ] Widget support
- [ ] Multiple year views
- [ ] Goal tracking integration

---

**The Year Calendar is now fully interactive with psychology-based themes and wallpaper functionality!** 🎉

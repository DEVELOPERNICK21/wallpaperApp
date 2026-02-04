# Lock Screen Widget – How to Add

The **Year Progress** widget supports the Lock Screen (iOS 16+). If you don’t see it, follow these steps.

## Requirements

- **iOS 16 or later**
- App **wallpe** installed (with the Year Progress widget extension)

## How to add the Lock Screen widget

1. **Wake your iPhone** so the Lock Screen is visible.
2. **Long press** on the Lock Screen until it zooms and “Customize” appears.
3. Tap **Customize**.
4. Tap the **Lock Screen** area (the main area with the time), not the “Home” area at the bottom.
5. Under the time, you’ll see widget slots. Tap one of them (e.g. “Add Widget” or an empty slot).
6. In the widget picker, scroll to **Your Apps** (or “Suggested”) and find **wallpe**.
7. Tap **wallpe** and choose one of:
   - **Rectangular** – days passed, days left, percentage
   - **Circular** – percentage and days passed
   - **Inline** – one line of text (e.g. “9.0% of year • 33 days passed”)
8. Tap **Done** (or outside) to finish.

## If the widget doesn’t appear in the list

- **Rebuild and reinstall** the app (and widget extension) from Xcode.
- **Restart** the device and try adding the widget again.
- Confirm you’re on **iOS 16+** (Settings → General → About → Software Version).
- When adding a widget, make sure you’re editing the **Lock Screen** (top area), not the “Home” section.

## Visibility on the Lock Screen

The rectangular and circular Lock Screen widgets use **AccessoryWidgetBackground()** so they have a visible, system-styled background and are easier to see on the lock screen.

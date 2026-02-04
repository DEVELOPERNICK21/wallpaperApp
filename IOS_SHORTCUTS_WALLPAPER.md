# iOS Shortcuts: Automatic Year Wallpaper

Use the **Shortcuts** app to set your year progress wallpaper automatically (e.g. every day at midnight).

## How it works

1. **Your app** generates the year calendar image.
2. You **save it for Shortcuts** (button in Year Calendar).
3. The image is written to **Files → On My iPhone → wallpe → YearProgressWallpaper.jpg**.
4. You create a **Shortcut automation** that runs at a time you choose (e.g. 12:00 AM), gets that file, and sets it as the lock screen wallpaper.

## Step 1: Save the wallpaper from the app

1. Open the app and go to **Wallpapers**.
2. Open the **Year Calendar** category and tap **Open Full Screen Calendar** (or use the calendar view).
3. Tap **⏰ Save for Shortcuts Automation**.
4. Wait until you see **Saved for Shortcuts**. The file **YearProgressWallpaper.jpg** is now in the app’s folder in Files.

You can repeat this whenever you want to refresh the image (e.g. after changing theme or when the year progress has changed).

## Step 2: Create the automation in Shortcuts

1. Open the **Shortcuts** app.
2. Go to **Automation** (bottom) → **+** → **Create Personal Automation**.
3. Choose **Time of Day**:
   - Set the time (e.g. **12:00 AM** for midnight).
   - Choose **Daily** (or your preference).
   - Tap **Next**.
4. **Add action**:
   - Search for **Get File**.
   - Add **Get File**.
   - Tap **File** and browse to **On My iPhone → wallpe**.
   - Select **YearProgressWallpaper.jpg** (or leave “Ask Each Time” off and use that file).
5. **Add another action**:
   - Search for **Set Wallpaper**.
   - Add **Set Wallpaper**.
   - Set **Lock Screen** (and optionally Home Screen if you want).
6. Tap **Next** → turn **Ask Before Running** **off** if you want it to run without prompting → **Done**.

## Result

- At the chosen time (e.g. 12:00 AM), the automation runs.
- It loads **YearProgressWallpaper.jpg** from the app’s folder.
- It sets that image as your lock screen (and optionally home) wallpaper.

## Reality check

- **Feels automatic** after setup: no need to open the app every day.
- **Image is as current as your last “Save for Shortcuts”**: run that button whenever you want the automation to use an updated calendar (e.g. after opening the app or changing theme).
- **Fully user-enabled**: the automation is created and run by you in Shortcuts; the app only provides the file.

## Troubleshooting

- **“Get File” can’t find the file**  
  Make sure you’ve tapped **Save for Shortcuts Automation** at least once so **YearProgressWallpaper.jpg** exists in **On My iPhone → wallpe**.

- **Wallpaper doesn’t update**  
  Run **Save for Shortcuts Automation** again in the app so the file is updated; the next time the automation runs it will use the new image.

- **Folder “wallpe” not in Files**  
  The app must have **file sharing** enabled (it is in this project). Reinstall the app if the folder still doesn’t appear under **On My iPhone**.

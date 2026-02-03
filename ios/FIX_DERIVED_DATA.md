# Fix: "Couldn't create workspace arena folder" / Unable to write to DerivedData

This error means Xcode cannot write to the project's DerivedData folder. Do the following:

## 1. Free disk space (most common cause)

- **Check free space:** In Terminal run `df -h /` — you need at least **5–10 GB** free.
- Empty **Trash**, remove large unused files, uninstall apps you don't use.
- In **System Settings → General → Storage** (or **About This Mac → Storage**) see what’s using space.

## 2. Delete this project's DerivedData so Xcode can recreate it

**Quit Xcode first**, then in Terminal run:

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/wallpe-*
```

Then reopen the project in Xcode and build again (⌘B or Run). Xcode will create a new DerivedData folder.

## 3. If it still fails: fix permissions

If you see "Permission denied" or similar:

```bash
# Remove the folder (may need your password)
sudo rm -rf ~/Library/Developer/Xcode/DerivedData/wallpe-*
```

Then build again. If the whole DerivedData folder has wrong ownership:

```bash
sudo chown -R $(whoami) ~/Library/Developer/Xcode/DerivedData
```

## 4. Optional: clear all DerivedData (frees a lot of space)

Only if you're okay with Xcode recompiling everything for all projects:

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

After that, open your project and build again.

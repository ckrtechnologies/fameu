# Fix Info.plist and Create New Build - Step by Step Guide

## The Problem
App Store Connect is rejecting your build because it's missing the `NSPhotoLibraryUsageDescription` privacy key in Info.plist.

## Quick Fix (Automated)

Run this command from your project root:

```bash
cd /Users/chandanmallik/projects/Fameu/hiring_app
chmod +x build_and_fix.sh
./build_and_fix.sh
```

This will:
1. ✅ Add all required privacy descriptions
2. ✅ Increment build number
3. ✅ Clean build folders
4. ✅ Reinstall pods
5. ✅ Create new archive

---

## Manual Fix (Step by Step)

### Step 1: Add Privacy Descriptions to Info.plist

**Option A: Using PlistBuddy (Command Line)**
```bash
cd /Users/chandanmallik/projects/Fameu/hiring_app

# Add NSPhotoLibraryUsageDescription
/usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryUsageDescription string 'We need access to your photo library to allow you to select and upload photos for your profile and applications.'" ios/HiringApp/Info.plist

# Add NSCameraUsageDescription
/usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string 'We need access to your camera to take photos for your profile and applications.'" ios/HiringApp/Info.plist

# Add NSPhotoLibraryAddUsageDescription
/usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryAddUsageDescription string 'We need permission to save photos to your library.'" ios/HiringApp/Info.plist
```

**Option B: Using Xcode**
1. Open `ios/HiringApp.xcworkspace` in Xcode
2. Navigate to `HiringApp` target → Info tab
3. Add these keys:
   - **Privacy - Photo Library Usage Description**: "We need access to your photo library to allow you to select and upload photos for your profile and applications."
   - **Privacy - Camera Usage Description**: "We need access to your camera to take photos for your profile and applications."
   - **Privacy - Photo Library Additions Usage Description**: "We need permission to save photos to your library."

**Option C: Edit Info.plist XML Directly**
1. Open `ios/HiringApp/Info.plist` in a text editor
2. Add these lines before the closing `</dict>` tag:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to allow you to select and upload photos for your profile and applications.</string>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to take photos for your profile and applications.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need permission to save photos to your library.</string>
```

### Step 2: Increment Build Number

```bash
# Get current build number
/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" ios/HiringApp/Info.plist

# Set new build number (replace X with current build + 1)
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion X" ios/HiringApp/Info.plist
```

Or in Xcode:
1. Select HiringApp target
2. General tab
3. Increment the Build number

### Step 3: Clean Build

```bash
cd /Users/chandanmallik/projects/Fameu/hiring_app/ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/HiringApp-*
```

### Step 4: Reinstall Pods (Optional but recommended)

```bash
cd /Users/chandanmallik/projects/Fameu/hiring_app/ios
pod install
```

### Step 5: Create Archive

**Using Xcode (Recommended):**
1. Open `ios/HiringApp.xcworkspace`
2. Select "Any iOS Device (arm64)" as the build destination
3. Go to Product → Archive
4. Wait for archive to complete
5. In Organizer, click "Distribute App"
6. Select "App Store Connect"
7. Follow the prompts to upload

**Using Command Line:**
```bash
cd /Users/chandanmallik/projects/Fameu/hiring_app/ios

xcodebuild -workspace HiringApp.xcworkspace \
           -scheme HiringApp \
           -configuration Release \
           -archivePath ./build/HiringApp.xcarchive \
           -allowProvisioningUpdates \
           archive
```

### Step 6: Upload to App Store Connect

**Using Xcode:**
- Window → Organizer (Cmd+Shift+Option+O)
- Select your archive
- Click "Distribute App"
- Choose "App Store Connect"
- Upload!

---

## Verify the Fix

After uploading, you should see your new build appear in App Store Connect within 15-30 minutes. The build should no longer have the missing API issue.

---

## Need Help?

If you encounter any issues:
1. Check that all paths in the scripts match your actual project structure
2. Ensure you have valid provisioning profiles and certificates
3. Check Xcode's build logs for specific errors

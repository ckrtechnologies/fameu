#!/bin/bash

# Complete script to fix Info.plist and create a new build for App Store

set -e  # Exit on error

PROJECT_ROOT="/Users/chandanmallik/projects/Fameu/hiring_app"
INFO_PLIST_PATH="$PROJECT_ROOT/ios/HiringApp/Info.plist"
WORKSPACE="$PROJECT_ROOT/ios/HiringApp.xcworkspace"
SCHEME="HiringApp"

echo "🚀 Starting build process for HiringApp"
echo "================================================"
echo ""

# Step 1: Update Info.plist
echo "📝 Step 1: Updating Info.plist with required privacy descriptions..."
echo ""

if [ ! -f "$INFO_PLIST_PATH" ]; then
    echo "❌ Error: Info.plist not found at $INFO_PLIST_PATH"
    echo "Please check the path and update this script accordingly."
    exit 1
fi

# Add NSPhotoLibraryUsageDescription
/usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryUsageDescription string 'We need access to your photo library to allow you to select and upload photos for your profile and applications.'" "$INFO_PLIST_PATH" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :NSPhotoLibraryUsageDescription 'We need access to your photo library to allow you to select and upload photos for your profile and applications.'" "$INFO_PLIST_PATH"

# Add NSCameraUsageDescription
/usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string 'We need access to your camera to take photos for your profile and applications.'" "$INFO_PLIST_PATH" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :NSCameraUsageDescription 'We need access to your camera to take photos for your profile and applications.'" "$INFO_PLIST_PATH"

# Add NSPhotoLibraryAddUsageDescription
/usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryAddUsageDescription string 'We need permission to save photos to your library.'" "$INFO_PLIST_PATH" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :NSPhotoLibraryAddUsageDescription 'We need permission to save photos to your library.'" "$INFO_PLIST_PATH"

echo "✅ Privacy descriptions added successfully!"
echo ""

# Step 2: Increment build number
echo "📈 Step 2: Incrementing build number..."
CURRENT_BUILD=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST_PATH")
NEW_BUILD=$((CURRENT_BUILD + 1))
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $NEW_BUILD" "$INFO_PLIST_PATH"
echo "   Build number: $CURRENT_BUILD → $NEW_BUILD"
echo "✅ Build number incremented!"
echo ""

# Step 3: Clean build folder
echo "🧹 Step 3: Cleaning build folder..."
cd "$PROJECT_ROOT/ios"
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/HiringApp-*
echo "✅ Build folder cleaned!"
echo ""

# Step 4: Install pods
echo "📦 Step 4: Installing CocoaPods dependencies..."
pod install
echo "✅ Pods installed!"
echo ""

# Step 5: Archive the app
echo "📦 Step 5: Creating archive..."
ARCHIVE_PATH="$PROJECT_ROOT/ios/build/HiringApp.xcarchive"
xcodebuild -workspace "$WORKSPACE" \
           -scheme "$SCHEME" \
           -configuration Release \
           -archivePath "$ARCHIVE_PATH" \
           -allowProvisioningUpdates \
           archive | xcpretty || xcodebuild -workspace "$WORKSPACE" \
           -scheme "$SCHEME" \
           -configuration Release \
           -archivePath "$ARCHIVE_PATH" \
           -allowProvisioningUpdates \
           archive

if [ $? -eq 0 ]; then
    echo "✅ Archive created successfully!"
    echo "   Location: $ARCHIVE_PATH"
else
    echo "❌ Archive failed. Please check the errors above."
    exit 1
fi
echo ""

# Step 6: Export for App Store
echo "📤 Step 6: Exporting for App Store..."
echo ""
echo "⚠️  You need to complete this step manually in Xcode:"
echo "   1. Open Xcode"
echo "   2. Go to Window → Organizer (or Cmd+Shift+Option+O)"
echo "   3. Select the archive we just created"
echo "   4. Click 'Distribute App'"
echo "   5. Select 'App Store Connect'"
echo "   6. Follow the prompts to upload"
echo ""
echo "Or run this command to export:"
echo "   xcodebuild -exportArchive \\"
echo "     -archivePath $ARCHIVE_PATH \\"
echo "     -exportPath $PROJECT_ROOT/ios/build \\"
echo "     -exportOptionsPlist $PROJECT_ROOT/ios/ExportOptions.plist"
echo ""

echo "================================================"
echo "✅ Build process completed!"
echo ""
echo "📋 Summary of changes:"
echo "   ✓ Added NSPhotoLibraryUsageDescription"
echo "   ✓ Added NSCameraUsageDescription"
echo "   ✓ Added NSPhotoLibraryAddUsageDescription"
echo "   ✓ Build number incremented to: $NEW_BUILD"
echo "   ✓ Archive created"
echo ""
echo "🎯 Next: Upload the archive to App Store Connect using Xcode Organizer"
echo ""

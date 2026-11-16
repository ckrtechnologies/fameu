#!/bin/bash

# Script to add required privacy usage descriptions to Info.plist
# This fixes the App Store Connect rejection for missing NSPhotoLibraryUsageDescription

INFO_PLIST_PATH="ios/HiringApp/Info.plist"

echo "🔍 Looking for Info.plist at: $INFO_PLIST_PATH"

if [ ! -f "$INFO_PLIST_PATH" ]; then
    echo "❌ Error: Info.plist not found at $INFO_PLIST_PATH"
    echo "📝 Please update the INFO_PLIST_PATH variable in this script to match your Info.plist location"
    exit 1
fi

echo "✅ Found Info.plist"
echo "📝 Adding privacy usage descriptions..."

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
echo "📋 Added the following keys:"
echo "   - NSPhotoLibraryUsageDescription"
echo "   - NSCameraUsageDescription"
echo "   - NSPhotoLibraryAddUsageDescription"
echo ""
echo "🎯 Next steps:"
echo "   1. Verify the changes in $INFO_PLIST_PATH"
echo "   2. Increment your build number"
echo "   3. Create a new archive and upload to App Store Connect"
echo ""
echo "Done! 🚀"

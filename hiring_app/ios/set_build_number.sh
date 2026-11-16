#!/bin/bash

# Script to set the build number in Info.plist

INFO_PLIST_PATH="/Users/chandanmallik/projects/Fameu/hiring_app/ios/HiringApp/Info.plist"

echo "🔧 Setting build number in Info.plist..."
echo ""

if [ ! -f "$INFO_PLIST_PATH" ]; then
    echo "❌ Error: Info.plist not found at $INFO_PLIST_PATH"
    exit 1
fi

# Set build number to 1
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion 1" "$INFO_PLIST_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Build number set to: 1"
    echo ""
    echo "Verifying..."
    BUILD_NUMBER=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST_PATH")
    echo "✅ Current build number: $BUILD_NUMBER"
    echo ""
    echo "🎉 Info.plist is now ready!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Open Xcode: open /Users/chandanmallik/projects/Fameu/hiring_app/ios/HiringApp.xcworkspace"
    echo "   2. Select 'Any iOS Device (arm64)' as build destination"
    echo "   3. Go to Product → Archive"
    echo "   4. Wait for archive to complete"
    echo "   5. In Organizer: Distribute App → App Store Connect"
    echo ""
else
    echo "❌ Failed to set build number"
    exit 1
fi

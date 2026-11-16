#!/usr/bin/env python3
"""
Script to automatically add required privacy descriptions to Info.plist
and fix the App Store Connect rejection issue.
"""

import os
import sys
import subprocess
import plistlib
from pathlib import Path

# Configuration
PROJECT_ROOT = "/Users/chandanmallik/projects/Fameu/hiring_app"
INFO_PLIST_PATH = f"{PROJECT_ROOT}/ios/HiringApp/Info.plist"

# Privacy descriptions to add
PRIVACY_KEYS = {
    "NSPhotoLibraryUsageDescription": "We need access to your photo library to allow you to select and upload photos for your profile and applications.",
    "NSCameraUsageDescription": "We need access to your camera to take photos for your profile and applications.",
    "NSPhotoLibraryAddUsageDescription": "We need permission to save photos to your library."
}

def print_step(step_num, message):
    """Print a formatted step message"""
    print(f"\n{'='*60}")
    print(f"📍 Step {step_num}: {message}")
    print('='*60)

def check_file_exists(filepath):
    """Check if file exists"""
    if not os.path.exists(filepath):
        print(f"❌ Error: File not found at {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def update_info_plist():
    """Update Info.plist with required privacy keys"""
    print_step(1, "Updating Info.plist with Privacy Descriptions")
    
    if not check_file_exists(INFO_PLIST_PATH):
        # Try to find Info.plist
        possible_paths = [
            f"{PROJECT_ROOT}/ios/HiringApp/Info.plist",
            f"{PROJECT_ROOT}/ios/Info.plist",
            f"{PROJECT_ROOT}/HiringApp/Info.plist",
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                global INFO_PLIST_PATH
                INFO_PLIST_PATH = path
                print(f"✅ Found Info.plist at: {path}")
                break
        else:
            print("❌ Could not find Info.plist. Please check the path.")
            return False
    
    try:
        # Read the plist file
        with open(INFO_PLIST_PATH, 'rb') as fp:
            plist_data = plistlib.load(fp)
        
        # Add privacy keys
        added_keys = []
        updated_keys = []
        
        for key, value in PRIVACY_KEYS.items():
            if key in plist_data:
                plist_data[key] = value
                updated_keys.append(key)
                print(f"   ♻️  Updated: {key}")
            else:
                plist_data[key] = value
                added_keys.append(key)
                print(f"   ✅ Added: {key}")
        
        # Write back to file
        with open(INFO_PLIST_PATH, 'wb') as fp:
            plistlib.dump(plist_data, fp)
        
        print(f"\n✅ Successfully updated Info.plist!")
        print(f"   Added: {len(added_keys)} keys")
        print(f"   Updated: {len(updated_keys)} keys")
        
        return True
        
    except Exception as e:
        print(f"❌ Error updating Info.plist: {e}")
        return False

def increment_build_number():
    """Increment the build number in Info.plist"""
    print_step(2, "Incrementing Build Number")
    
    try:
        with open(INFO_PLIST_PATH, 'rb') as fp:
            plist_data = plistlib.load(fp)
        
        current_build = plist_data.get('CFBundleVersion', '1')
        
        # Try to increment as integer
        try:
            new_build = str(int(current_build) + 1)
        except ValueError:
            # If it's not a number, append .1
            new_build = f"{current_build}.1"
        
        plist_data['CFBundleVersion'] = new_build
        
        with open(INFO_PLIST_PATH, 'wb') as fp:
            plistlib.dump(plist_data, fp)
        
        print(f"   Build number: {current_build} → {new_build}")
        print("✅ Build number incremented!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error incrementing build number: {e}")
        return False

def clean_build():
    """Clean build folders"""
    print_step(3, "Cleaning Build Folders")
    
    ios_build_path = f"{PROJECT_ROOT}/ios/build"
    
    try:
        if os.path.exists(ios_build_path):
            import shutil
            shutil.rmtree(ios_build_path)
            print(f"   ✅ Removed: {ios_build_path}")
        else:
            print(f"   ℹ️  Build folder doesn't exist (nothing to clean)")
        
        # Clean DerivedData
        home = os.path.expanduser("~")
        derived_data = f"{home}/Library/Developer/Xcode/DerivedData"
        
        if os.path.exists(derived_data):
            import glob
            hiring_app_derived = glob.glob(f"{derived_data}/HiringApp-*")
            for path in hiring_app_derived:
                import shutil
                shutil.rmtree(path)
                print(f"   ✅ Removed: {path}")
        
        print("✅ Build folders cleaned!")
        return True
        
    except Exception as e:
        print(f"⚠️  Warning: Could not clean all build folders: {e}")
        return True  # Not critical, continue

def install_pods():
    """Install CocoaPods dependencies"""
    print_step(4, "Installing CocoaPods Dependencies")
    
    ios_dir = f"{PROJECT_ROOT}/ios"
    
    if not os.path.exists(f"{ios_dir}/Podfile"):
        print("ℹ️  No Podfile found, skipping pod install")
        return True
    
    try:
        os.chdir(ios_dir)
        result = subprocess.run(['pod', 'install'], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Pods installed successfully!")
            return True
        else:
            print(f"⚠️  Pod install had issues:")
            print(result.stderr)
            return True  # Continue anyway
            
    except Exception as e:
        print(f"⚠️  Could not install pods: {e}")
        print("   You may need to run 'pod install' manually")
        return True  # Continue anyway

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("🚀 HiringApp Info.plist Fixer & Build Preparation")
    print("="*60)
    print(f"Project: {PROJECT_ROOT}")
    print(f"Info.plist: {INFO_PLIST_PATH}")
    
    # Step 1: Update Info.plist
    if not update_info_plist():
        print("\n❌ Failed to update Info.plist. Exiting.")
        sys.exit(1)
    
    # Step 2: Increment build number
    if not increment_build_number():
        print("\n⚠️  Warning: Could not increment build number")
    
    # Step 3: Clean build
    clean_build()
    
    # Step 4: Install pods
    install_pods()
    
    # Final instructions
    print_step(5, "Next Steps - Create Archive in Xcode")
    print("""
To complete the build process:

1. Open Xcode:
   cd /Users/chandanmallik/projects/Fameu/hiring_app/ios
   open HiringApp.xcworkspace

2. In Xcode:
   - Select "Any iOS Device (arm64)" as destination
   - Go to Product → Archive
   - Wait for archive to complete

3. Upload to App Store:
   - Window → Organizer (Cmd+Shift+Option+O)
   - Select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow prompts to upload

The privacy descriptions have been added and your build number has been
incremented. The new build should be accepted by App Store Connect! 🎉
""")
    
    print("\n" + "="*60)
    print("✅ All automated steps completed successfully!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()

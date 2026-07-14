import os
from PIL import Image, ImageFilter

def process_images():
    output_dir = "/Users/chandanmallik/projects/Fameu/playstore_assets"
    os.makedirs(output_dir, exist_ok=True)
    
    brain_dir = "/Users/chandanmallik/.gemini/antigravity-ide/brain/e4e13327-e3d3-48dd-824c-6358947a7266"
    icon_path = os.path.join(brain_dir, "fameu_app_icon_1783920201165.png")
    feature_path = os.path.join(brain_dir, "fameu_feature_graphic_1783920211108.png")
    phone1_path = os.path.join(brain_dir, "fameu_phone_screen_1_1783920221264.png")
    phone2_path = os.path.join(brain_dir, "fameu_phone_screen_2_1783920231935.png")

    def create_padded_screenshot(img_path, out_path, target_w, target_h):
        with Image.open(img_path) as img:
            # Determine scale to fit entire image inside canvas
            scale = min(target_w / img.width, target_h / img.height)
            # Make the image take up 85% of the shortest side to leave nice padding
            scale *= 0.85
            
            new_w = int(img.width * scale)
            new_h = int(img.height * scale)
            
            img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Create blurred background from original image (fill the whole target area)
            bg_scale = max(target_w / img.width, target_h / img.height)
            bg_w = int(img.width * bg_scale)
            bg_h = int(img.height * bg_scale)
            bg_resized = img.resize((bg_w, bg_h), Image.Resampling.LANCZOS)
            
            # Crop center of bg_resized to fit exactly target_w, target_h
            left = (bg_w - target_w) / 2
            top = (bg_h - target_h) / 2
            right = (bg_w + target_w) / 2
            bottom = (bg_h + target_h) / 2
            bg = bg_resized.crop((left, top, right, bottom))
            
            bg = bg.filter(ImageFilter.GaussianBlur(radius=30))
            
            # Darken the background slightly
            dark_layer = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 100))
            bg.paste(dark_layer, (0,0), dark_layer)
            
            # Paste the resized image
            paste_x = (target_w - new_w) // 2
            paste_y = (target_h - new_h) // 2
            bg.paste(img_resized, (paste_x, paste_y))
            
            bg.convert('RGB').save(out_path, format="PNG")

    print("Re-processing phone screenshots...")
    create_padded_screenshot(phone1_path, os.path.join(output_dir, "phone_screenshot_1.png"), 1080, 1920)
    create_padded_screenshot(phone2_path, os.path.join(output_dir, "phone_screenshot_2.png"), 1080, 1920)

    print("Re-processing tablet screenshots...")
    # Tablet landscape (16:9)
    create_padded_screenshot(phone1_path, os.path.join(output_dir, "tablet_screenshot_1.png"), 1920, 1080)
    create_padded_screenshot(phone2_path, os.path.join(output_dir, "tablet_screenshot_2.png"), 1920, 1080)
    
    print("Done!")

if __name__ == "__main__":
    process_images()

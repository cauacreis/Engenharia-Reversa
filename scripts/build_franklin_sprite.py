import os
from PIL import Image

def crop_atlas_part(atlas_dir, page_name, xy_str, size_str, rotate_str):
    img_path = os.path.join(atlas_dir, page_name)
    img = Image.open(img_path)
    
    x, y = [int(v.strip()) for v in xy_str.split(",")]
    w, h = [int(v.strip()) for v in size_str.split(",")]
    rotate = (rotate_str.lower() == "true")
    
    # In Spine atlas, if rotate is true, the packed dimensions in the image are (h, w)
    if rotate:
        crop_box = (x, y, x + h, y + w)
        cropped = img.crop(crop_box)
        cropped = cropped.transpose(Image.ROTATE_270)
    else:
        crop_box = (x, y, x + w, y + h)
        cropped = img.crop(crop_box)
        
    return cropped

def main():
    atlas_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenAssets"
    
    # Crop key body parts
    body = crop_atlas_part(atlas_dir, "skeleton9.png", "711, 862", "160, 236", "true")
    head = crop_atlas_part(atlas_dir, "skeleton10.png", "433, 4", "95, 108", "true")
    leg1 = crop_atlas_part(atlas_dir, "skeleton11.png", "109, 404", "66, 122", "false")
    leg2 = crop_atlas_part(atlas_dir, "skeleton10.png", "795, 4", "95, 113", "true")
    hand1 = crop_atlas_part(atlas_dir, "skeleton11.png", "107, 282", "120, 91", "true")
    hand2 = crop_atlas_part(atlas_dir, "skeleton11.png", "705, 266", "66, 95", "false")
    fist = crop_atlas_part(atlas_dir, "skeleton2.png", "649, 122", "57, 48", "false")
    foot = crop_atlas_part(atlas_dir, "skeleton7.png", "73, 2", "46, 23", "false")
    eye = crop_atlas_part(atlas_dir, "skeleton.png", "834, 606", "20, 16", "false")
    
    # Create canvas 400x500
    canvas = Image.new("RGBA", (400, 500), (0, 0, 0, 0))
    
    # Layer from back to front:
    # 1. Back leg
    canvas.paste(leg2, (180, 310), leg2)
    canvas.paste(foot, (190, 410), foot)
    
    # 2. Back arm
    canvas.paste(hand2, (240, 210), hand2)
    
    # 3. Body
    canvas.paste(body, (110, 160), body)
    
    # 4. Front leg
    canvas.paste(leg1, (130, 310), leg1)
    canvas.paste(foot, (120, 420), foot)
    
    # 5. Head
    canvas.paste(head, (160, 80), head)
    canvas.paste(eye, (195, 120), eye)
    
    # 6. Front arm / boxing glove / fist
    canvas.paste(hand1, (80, 200), hand1)
    canvas.paste(fist, (50, 240), fist)
    
    # Crop to content bbox
    bbox = canvas.getbbox()
    if bbox:
        franklin = canvas.crop(bbox)
        # Add 10px margin
        final_img = Image.new("RGBA", (franklin.width + 20, franklin.height + 20), (0, 0, 0, 0))
        final_img.paste(franklin, (10, 10), franklin)
        
        out1 = os.path.join(atlas_dir, "franklin_player.png")
        final_img.save(out1)
        print(f"Saved {out1} ({final_img.size})")

        # Also create a Punching pose
        punch_canvas = Image.new("RGBA", (500, 500), (0, 0, 0, 0))
        punch_canvas.paste(leg2, (170, 310), leg2)
        punch_canvas.paste(foot, (180, 410), foot)
        punch_canvas.paste(body, (120, 160), body)
        punch_canvas.paste(leg1, (140, 310), leg1)
        punch_canvas.paste(foot, (130, 420), foot)
        punch_canvas.paste(head, (180, 80), head)
        punch_canvas.paste(eye, (215, 120), eye)
        # Extended punch arm
        canvas_fist = fist.resize((int(fist.width * 1.4), int(fist.height * 1.4)))
        punch_canvas.paste(hand1, (220, 160), hand1)
        punch_canvas.paste(canvas_fist, (290, 170), canvas_fist)
        
        p_bbox = punch_canvas.getbbox()
        if p_bbox:
            p_final = punch_canvas.crop(p_bbox)
            out2 = os.path.join(atlas_dir, "franklin_punch.png")
            p_final.save(out2)
            print(f"Saved {out2} ({p_final.size})")

if __name__ == "__main__":
    main()

import os
import math
from PIL import Image

def crop_atlas_part(atlas_dir, page_name, xy_str, size_str, rotate_str):
    img_path = os.path.join(atlas_dir, page_name)
    img = Image.open(img_path)
    
    x, y = [int(v.strip()) for v in xy_str.split(",")]
    w, h = [int(v.strip()) for v in size_str.split(",")]
    rotate = (rotate_str.lower() == "true")
    
    if rotate:
        crop_box = (x, y, x + h, y + w)
        cropped = img.crop(crop_box)
        cropped = cropped.transpose(Image.ROTATE_270)
    else:
        crop_box = (x, y, x + w, y + h)
        cropped = img.crop(crop_box)
        
    return cropped

def build_all_animations():
    src_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\chicken_character"
    out_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenAssets\Anims"
    os.makedirs(out_dir, exist_ok=True)
    
    # Body parts
    body = crop_atlas_part(src_dir, "skeleton9.png", "711, 862", "160, 236", "true")
    head = crop_atlas_part(src_dir, "skeleton10.png", "433, 4", "95, 108", "true")
    leg1 = crop_atlas_part(src_dir, "skeleton11.png", "109, 404", "66, 122", "false")
    leg2 = crop_atlas_part(src_dir, "skeleton10.png", "795, 4", "95, 113", "true")
    hand1 = crop_atlas_part(src_dir, "skeleton11.png", "107, 282", "120, 91", "true")
    hand2 = crop_atlas_part(src_dir, "skeleton11.png", "705, 266", "66, 95", "false")
    fist = crop_atlas_part(src_dir, "skeleton2.png", "649, 122", "57, 48", "false")
    fist_heavy = fist.resize((int(fist.width * 1.5), int(fist.height * 1.5)), Image.Resampling.LANCZOS)
    foot = crop_atlas_part(src_dir, "skeleton7.png", "73, 2", "46, 23", "false")
    eye = crop_atlas_part(src_dir, "skeleton.png", "834, 606", "20, 16", "false")

    def make_frame(name, leg1_off, leg2_off, body_off, head_off, hand1_off, fist_off, hand2_off, fist_img=fist):
        c = Image.new("RGBA", (450, 500), (0, 0, 0, 0))
        # 1. Back leg
        c.paste(leg2, (180 + leg2_off[0], 310 + leg2_off[1]), leg2)
        c.paste(foot, (190 + leg2_off[0], 410 + leg2_off[1]), foot)
        # 2. Back arm
        c.paste(hand2, (240 + hand2_off[0], 210 + hand2_off[1]), hand2)
        # 3. Body
        c.paste(body, (110 + body_off[0], 160 + body_off[1]), body)
        # 4. Front leg
        c.paste(leg1, (130 + leg1_off[0], 310 + leg1_off[1]), leg1)
        c.paste(foot, (120 + leg1_off[0], 420 + leg1_off[1]), foot)
        # 5. Head
        c.paste(head, (160 + head_off[0], 80 + head_off[1]), head)
        c.paste(eye, (195 + head_off[0], 120 + head_off[1]), eye)
        # 6. Front arm + fist
        c.paste(hand1, (80 + hand1_off[0], 200 + hand1_off[1]), hand1)
        c.paste(fist_img, (50 + fist_off[0], 240 + fist_off[1]), fist_img)

        bbox = c.getbbox()
        if bbox:
            cropped = c.crop(bbox)
            padded = Image.new("RGBA", (cropped.width + 20, cropped.height + 20), (0, 0, 0, 0))
            padded.paste(cropped, (10, 10), cropped)
            target = os.path.join(out_dir, f"{name}.png")
            padded.save(target)
            print(f"Generated {name}.png ({padded.size})")

    # 1. IDLE (3 frames)
    make_frame("franklin_idle_0", (0, 0), (0, 0), (0, 0), (0, 0), (0, 0), (0, 0), (0, 0))
    make_frame("franklin_idle_1", (0, 0), (0, 0), (0, 6), (0, 8), (0, 6), (0, 6), (0, 6))
    make_frame("franklin_idle_2", (0, 0), (0, 0), (0, 12), (0, 14), (0, 10), (0, 10), (0, 10))

    # 2. RUN / WALK (4 frames)
    make_frame("franklin_run_0", (-25, -15), (25, 10), (5, 5), (8, 6), (-15, -10), (-20, -10), (20, 10))
    make_frame("franklin_run_1", (-10, 0), (10, 0), (0, 0), (0, 0), (0, 0), (0, 0), (0, 0))
    make_frame("franklin_run_2", (25, 10), (-25, -15), (5, 5), (8, 6), (20, 10), (20, 10), (-15, -10))
    make_frame("franklin_run_3", (10, 0), (-10, 0), (0, 0), (0, 0), (0, 0), (0, 0), (0, 0))

    # 3. JUMP
    make_frame("franklin_jump", (0, -35), (10, -40), (0, -20), (0, -25), (-20, -30), (-25, -30), (20, -25))

    # 4. DUCK / CROUCH
    make_frame("franklin_duck", (-10, 30), (10, 30), (0, 45), (0, 55), (-10, 40), (-10, 40), (0, 40))

    # 5. PUNCH COMBOS (Jab, Cross, Uppercut, Hook)
    # Jab (Soco Esquerdo)
    make_frame("franklin_punch_jab", (0, 0), (0, 0), (10, 0), (12, 0), (80, -20), (130, -25), (-20, 10))
    # Cross (Direto Pesado de Direita)
    make_frame("franklin_punch_cross", (0, 0), (0, 0), (15, 0), (15, 0), (120, -30), (190, -40), (-30, 20), fist_img=fist_heavy)
    # Uppercut (Gancho Brawler Ascendente)
    make_frame("franklin_punch_uppercut", (0, 0), (0, 0), (5, -10), (10, -15), (50, -80), (70, -120), (-10, 20), fist_img=fist_heavy)
    # Heavy Hook (Cruzado Titânico)
    make_frame("franklin_punch_hook", (0, 0), (0, 0), (20, 0), (20, 0), (140, -10), (220, -20), (-40, 20), fist_img=fist_heavy)

    # Also copy to root ChickenAssets for backward compatibility
    import shutil
    shutil.copy(os.path.join(out_dir, "franklin_idle_0.png"), os.path.join(src_dir, "..", "..", "..", "..", "Program Files (x86)", "Steam", "steamapps", "common", "Cuphead", "BepInEx", "plugins", "ChickenAssets", "franklin_player.png"))
    shutil.copy(os.path.join(out_dir, "franklin_punch_cross.png"), os.path.join(src_dir, "..", "..", "..", "..", "Program Files (x86)", "Steam", "steamapps", "common", "Cuphead", "BepInEx", "plugins", "ChickenAssets", "franklin_punch.png"))
    print("Animation suite successfully generated!")

if __name__ == "__main__":
    build_all_animations()

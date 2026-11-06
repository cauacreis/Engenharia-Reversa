import os
from PIL import Image, ImageEnhance

def generate_suite():
    parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"
    out_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenAssets\Anims"
    root_assets = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenAssets"
    os.makedirs(out_dir, exist_ok=True)

    # Load authentic Franklin parts
    head = Image.open(os.path.join(parts_dir, "Head.png"))
    crest = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Crest.png"))
    shades = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Aviator_Sunglasses.png"))
    body = Image.open(os.path.join(parts_dir, "Body.png"))
    glove = Image.open(os.path.join(parts_dir, "Weapon_Boxing_Gloves.png"))
    glove_heavy = glove.resize((int(glove.width * 1.35), int(glove.height * 1.35)), Image.Resampling.LANCZOS)
    leg1 = Image.open(os.path.join(parts_dir, "Leg1.png"))
    leg2 = Image.open(os.path.join(parts_dir, "Leg2.png"))
    foot1 = Image.open(os.path.join(parts_dir, "Foot1.png"))
    foot2 = Image.open(os.path.join(parts_dir, "Foot2.png"))
    arm1 = Image.open(os.path.join(parts_dir, "a1.png"))
    arm2 = Image.open(os.path.join(parts_dir, "Arm2.png"))
    hand1 = Image.open(os.path.join(parts_dir, "Hand1.png"))
    hand2 = Image.open(os.path.join(parts_dir, "Hand2.png"))

    def render_frame(name,
                     leg1_off=(0,0), foot1_off=(0,0),
                     leg2_off=(0,0), foot2_off=(0,0),
                     body_off=(0,0),
                     head_off=(0,0),
                     arm1_off=(0,0), hand1_off=(0,0), glove1_off=(0,0),
                     arm2_off=(0,0), hand2_off=(0,0), glove2_off=(0,0),
                     front_glove_img=glove,
                     canvas_size=(550, 560)):
        
        c = Image.new("RGBA", canvas_size, (0, 0, 0, 0))

        # Base anchor coordinates on canvas
        # 1. Back leg & foot (layer 1)
        c.paste(leg2, (150 + leg2_off[0], 320 + leg2_off[1]), leg2)
        c.paste(foot2, (170 + foot2_off[0], 420 + foot2_off[1]), foot2)

        # 2. Back arm, hand & glove (layer 2)
        c.paste(arm2, (130 + arm2_off[0], 160 + arm2_off[1]), arm2)
        c.paste(hand2, (110 + hand2_off[0], 190 + hand2_off[1]), hand2)
        glove_back = glove.resize((int(glove.width * 0.9), int(glove.height * 0.9)), Image.Resampling.LANCZOS)
        c.paste(glove_back, (90 + glove2_off[0], 210 + glove2_off[1]), glove_back)

        # 3. Torso (layer 3)
        c.paste(body, (130 + body_off[0], 140 + body_off[1]), body)

        # 4. Front leg & foot (layer 4)
        c.paste(leg1, (180 + leg1_off[0], 320 + leg1_off[1]), leg1)
        c.paste(foot1, (190 + foot1_off[0], 430 + foot1_off[1]), foot1)

        # 5. Head (layer 5)
        hx = 195 + head_off[0]
        hy = 55 + head_off[1]
        c.paste(head, (hx, hy), head)

        # 6. Aviator Sunglasses (layer 6 - perched over eyes)
        c.paste(shades, (hx + 30, hy + 33), shades)

        # 7. Red Rooster Crest (layer 7 - crown on head)
        c.paste(crest, (hx - 20, hy - 50), crest)

        # 8. Front arm, hand & glove (layer 8 - foreground boxer guard/punch)
        c.paste(arm1, (210 + arm1_off[0], 170 + arm1_off[1]), arm1)
        c.paste(hand1, (240 + hand1_off[0], 200 + hand1_off[1]), hand1)
        c.paste(front_glove_img, (260 + glove1_off[0], 200 + glove1_off[1]), front_glove_img)

        # Crop to contents with uniform 20px padding
        bbox = c.getbbox()
        if bbox:
            cropped = c.crop(bbox)
            padded = Image.new("RGBA", (cropped.width + 30, cropped.height + 30), (0, 0, 0, 0))
            padded.paste(cropped, (15, 15), cropped)
            target_path = os.path.join(out_dir, f"{name}.png")
            padded.save(target_path)
            print(f"Generated {name}.png - Size: {padded.size}")
            return padded

    print("=== GENERATING AUTHENTIC FRANKLIN SCHNEIDER ANIMATION SUITE ===")

    # 1. IDLE CYCLE (3 frames - breathing, athletic boxer stance)
    render_frame("franklin_idle_0",
                 body_off=(0, 0), head_off=(0, 0),
                 arm1_off=(0, 0), hand1_off=(0, 0), glove1_off=(0, 0),
                 arm2_off=(0, 0), hand2_off=(0, 0), glove2_off=(0, 0))

    render_frame("franklin_idle_1",
                 body_off=(0, 5), head_off=(0, 6),
                 arm1_off=(0, 5), hand1_off=(0, 5), glove1_off=(0, 5),
                 arm2_off=(0, 4), hand2_off=(0, 4), glove2_off=(0, 4))

    render_frame("franklin_idle_2",
                 body_off=(0, 10), head_off=(0, 12),
                 arm1_off=(0, 9), hand1_off=(0, 9), glove1_off=(0, 9),
                 arm2_off=(0, 8), hand2_off=(0, 8), glove2_off=(0, 8))

    # 2. RUNNING CYCLE (4 frames - dynamic fighter stride)
    render_frame("franklin_run_0",
                 leg1_off=(-25, -15), foot1_off=(-25, -20),
                 leg2_off=(25, 10), foot2_off=(25, 10),
                 body_off=(5, 5), head_off=(8, 6),
                 arm1_off=(-15, -10), hand1_off=(-15, -10), glove1_off=(-20, -10),
                 arm2_off=(20, 10), hand2_off=(20, 10), glove2_off=(20, 10))

    render_frame("franklin_run_1",
                 leg1_off=(-10, 0), foot1_off=(-10, 0),
                 leg2_off=(10, 0), foot2_off=(10, 0),
                 body_off=(0, 0), head_off=(0, 0),
                 arm1_off=(0, 0), hand1_off=(0, 0), glove1_off=(0, 0),
                 arm2_off=(0, 0), hand2_off=(0, 0), glove2_off=(0, 0))

    render_frame("franklin_run_2",
                 leg1_off=(25, 10), foot1_off=(25, 10),
                 leg2_off=(-25, -15), foot2_off=(-25, -20),
                 body_off=(5, 5), head_off=(8, 6),
                 arm1_off=(20, 10), hand1_off=(20, 10), glove1_off=(20, 10),
                 arm2_off=(-15, -10), hand2_off=(-15, -10), glove2_off=(-20, -10))

    render_frame("franklin_run_3",
                 leg1_off=(10, 0), foot1_off=(10, 0),
                 leg2_off=(-10, 0), foot2_off=(-10, 0),
                 body_off=(0, 0), head_off=(0, 0),
                 arm1_off=(0, 0), hand1_off=(0, 0), glove1_off=(0, 0),
                 arm2_off=(0, 0), hand2_off=(0, 0), glove2_off=(0, 0))

    # 3. JUMP (Airborne athletic tuck)
    render_frame("franklin_jump",
                 leg1_off=(0, -40), foot1_off=(0, -45),
                 leg2_off=(10, -35), foot2_off=(10, -40),
                 body_off=(0, -20), head_off=(0, -25),
                 arm1_off=(-10, -30), hand1_off=(-15, -30), glove1_off=(-20, -30),
                 arm2_off=(15, -25), hand2_off=(15, -25), glove2_off=(15, -25))

    # 4. DUCK / CROUCH (Guardia baixa protetora)
    render_frame("franklin_duck",
                 leg1_off=(-10, 35), foot1_off=(-10, 35),
                 leg2_off=(10, 35), foot2_off=(10, 35),
                 body_off=(0, 45), head_off=(0, 55),
                 arm1_off=(-15, 35), hand1_off=(-15, 35), glove1_off=(-20, 30),
                 arm2_off=(10, 35), hand2_off=(10, 35), glove2_off=(10, 35))

    # 5. PUNCH COMBOS (Jab, Cross, Uppercut, Hook)
    # Jab (Soco Esquerdo Veloz)
    render_frame("franklin_punch_jab",
                 body_off=(12, 0), head_off=(15, 0),
                 arm1_off=(45, -10), hand1_off=(70, -15), glove1_off=(95, -20),
                 arm2_off=(-20, 10), hand2_off=(-20, 10), glove2_off=(-25, 10))

    # Cross (Direto de Direita Pesado)
    render_frame("franklin_punch_cross",
                 body_off=(18, 0), head_off=(20, 0),
                 arm1_off=(70, -15), hand1_off=(110, -20), glove1_off=(150, -25),
                 arm2_off=(-30, 20), hand2_off=(-30, 20), glove2_off=(-35, 20),
                 front_glove_img=glove_heavy)

    # Uppercut (Gancho Brawler Ascendente)
    render_frame("franklin_punch_uppercut",
                 body_off=(8, -12), head_off=(10, -15),
                 arm1_off=(35, -50), hand1_off=(55, -85), glove1_off=(75, -115),
                 arm2_off=(-10, 20), hand2_off=(-10, 20), glove2_off=(-15, 20),
                 front_glove_img=glove_heavy)

    # Hook (Cruzado Devastador)
    render_frame("franklin_punch_hook",
                 body_off=(25, 0), head_off=(28, 0),
                 arm1_off=(85, -5), hand1_off=(135, -10), glove1_off=(180, -15),
                 arm2_off=(-40, 20), hand2_off=(-40, 20), glove2_off=(-45, 20),
                 front_glove_img=glove_heavy)

    # 6. ROOT SPRITES & FIST PROJECTILE
    import shutil
    shutil.copy(os.path.join(out_dir, "franklin_idle_0.png"), os.path.join(root_assets, "franklin_player.png"))
    shutil.copy(os.path.join(out_dir, "franklin_punch_cross.png"), os.path.join(root_assets, "franklin_punch.png"))

    # Fist projectile: Authentic red boxing glove
    proj_glove = glove.resize((120, 105), Image.Resampling.LANCZOS)
    proj_glove.save(os.path.join(root_assets, "fist_projectile.png"))
    print("Updated fist_projectile.png with authentic red boxing glove!")

    print("\nSUCCESS: All authentic Franklin Schneider animations generated and deployed!")

if __name__ == "__main__":
    generate_suite()

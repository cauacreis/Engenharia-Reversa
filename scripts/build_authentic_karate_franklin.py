import os
from PIL import Image

def build_karate_franklin_suite():
    parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"
    out_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenAssets\Anims"
    root_assets = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenAssets"
    brain_dir = r"C:\Users\Cauã Felype\.gemini\antigravity\brain\78753bbc-b9f7-4391-80af-6f4ae1b15257"
    os.makedirs(out_dir, exist_ok=True)

    # 1. Load exact parts matching the user's reference image
    head = Image.open(os.path.join(parts_dir, "Head.png"))
    crest = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Crest.png"))
    body = Image.open(os.path.join(parts_dir, "Body.png"))
    gi = Image.open(os.path.join(parts_dir, "Armor_Body_Karategi_b.png"))
    gi_sleeve = Image.open(os.path.join(parts_dir, "Armor_Body_Karategi_h1.png"))
    
    # Legs and feet
    leg1 = Image.open(os.path.join(parts_dir, "Leg1.png"))
    leg2 = Image.open(os.path.join(parts_dir, "Leg2.png"))
    foot1 = Image.open(os.path.join(parts_dir, "Foot1.png"))
    foot2 = Image.open(os.path.join(parts_dir, "Foot2.png"))
    
    # Bare muscular arms and clenched fists
    arm1 = Image.open(os.path.join(parts_dir, "a1.png"))
    arm2 = Image.open(os.path.join(parts_dir, "Arm2.png"))
    hand1 = Image.open(os.path.join(parts_dir, "Hand1.png"))
    hand2 = Image.open(os.path.join(parts_dir, "Hand2.png"))
    fist2 = Image.open(os.path.join(parts_dir, "fist2.png"))

    def render_karate_frame(name,
                            leg1_off=(0,0), foot1_off=(0,0),
                            leg2_off=(0,0), foot2_off=(0,0),
                            body_off=(0,0),
                            head_off=(0,0),
                            arm1_off=(0,0), hand1_off=(0,0),
                            arm2_off=(0,0), hand2_off=(0,0),
                            hand1_img=hand1,
                            canvas_size=(550, 560)):
        
        c = Image.new("RGBA", canvas_size, (0, 0, 0, 0))

        # Layer 1: Back leg & foot
        c.paste(leg2, (150 + leg2_off[0], 320 + leg2_off[1]), leg2)
        c.paste(foot2, (170 + foot2_off[0], 420 + foot2_off[1]), foot2)

        # Layer 2: Back arm & back bare fist (held cocked in martial arts guard)
        c.paste(arm2, (130 + arm2_off[0], 160 + arm2_off[1]), arm2)
        c.paste(hand2, (100 + hand2_off[0], 190 + hand2_off[1]), hand2)

        # Layer 3: Torso + White Karate Gi with Black Belt
        c.paste(body, (130 + body_off[0], 140 + body_off[1]), body)
        c.paste(gi, (130 + body_off[0], 145 + body_off[1]), gi)

        # Layer 4: Front leg & foot
        c.paste(leg1, (180 + leg1_off[0], 320 + leg1_off[1]), leg1)
        c.paste(foot1, (190 + foot1_off[0], 430 + foot1_off[1]), foot1)

        # Layer 5: Rooster Head (yellow beak, red wattle, fierce eye, NO sunglasses)
        hx = 195 + head_off[0]
        hy = 55 + head_off[1]
        c.paste(head, (hx, hy), head)

        # Layer 6: Red Rooster Comb / Crest (top crown)
        c.paste(crest, (hx - 20, hy - 50), crest)

        # Layer 7: Front muscular arm + Gi sleeve + bare clenched fist
        c.paste(arm1, (210 + arm1_off[0], 170 + arm1_off[1]), arm1)
        c.paste(gi_sleeve, (195 + arm1_off[0], 170 + arm1_off[1]), gi_sleeve)
        c.paste(hand1_img, (240 + hand1_off[0], 190 + hand1_off[1]), hand1_img)

        # Crop to tight bounding box with uniform 20px padding
        bbox = c.getbbox()
        if bbox:
            cropped = c.crop(bbox)
            padded = Image.new("RGBA", (cropped.width + 30, cropped.height + 30), (0, 0, 0, 0))
            padded.paste(cropped, (15, 15), cropped)
            target_path = os.path.join(out_dir, f"{name}.png")
            padded.save(target_path)
            print(f"Generated {name}.png - Size: {padded.size}")
            return padded

    print("=== BUILDING AUTHENTIC KARATE FRANKLIN SCHNEIDER (MATCHING USER REFERENCE) ===")

    # 1. IDLE (3 frames - breathing karate guard)
    idle_0 = render_karate_frame("franklin_idle_0",
                                 body_off=(0, 0), head_off=(0, 0),
                                 arm1_off=(0, 0), hand1_off=(0, 0),
                                 arm2_off=(0, 0), hand2_off=(0, 0))

    render_karate_frame("franklin_idle_1",
                        body_off=(0, 4), head_off=(0, 5),
                        arm1_off=(0, 4), hand1_off=(0, 4),
                        arm2_off=(0, 3), hand2_off=(0, 3))

    render_karate_frame("franklin_idle_2",
                        body_off=(0, 8), head_off=(0, 10),
                        arm1_off=(0, 7), hand1_off=(0, 7),
                        arm2_off=(0, 6), hand2_off=(0, 6))

    # 2. RUN (4 frames - karate martial arts stride)
    render_karate_frame("franklin_run_0",
                        leg1_off=(-25, -15), foot1_off=(-25, -20),
                        leg2_off=(25, 10), foot2_off=(25, 10),
                        body_off=(5, 5), head_off=(8, 6),
                        arm1_off=(-15, -10), hand1_off=(-20, -10),
                        arm2_off=(20, 10), hand2_off=(20, 10))

    render_karate_frame("franklin_run_1",
                        leg1_off=(-10, 0), foot1_off=(-10, 0),
                        leg2_off=(10, 0), foot2_off=(10, 0),
                        body_off=(0, 0), head_off=(0, 0),
                        arm1_off=(0, 0), hand1_off=(0, 0),
                        arm2_off=(0, 0), hand2_off=(0, 0))

    render_karate_frame("franklin_run_2",
                        leg1_off=(25, 10), foot1_off=(25, 10),
                        leg2_off=(-25, -15), foot2_off=(-25, -20),
                        body_off=(5, 5), head_off=(8, 6),
                        arm1_off=(20, 10), hand1_off=(20, 10),
                        arm2_off=(-15, -10), hand2_off=(-20, -10))

    render_karate_frame("franklin_run_3",
                        leg1_off=(10, 0), foot1_off=(10, 0),
                        leg2_off=(-10, 0), foot2_off=(-10, 0),
                        body_off=(0, 0), head_off=(0, 0),
                        arm1_off=(0, 0), hand1_off=(0, 0),
                        arm2_off=(0, 0), hand2_off=(0, 0))

    # 3. JUMP (Flying karate kick / leap)
    render_karate_frame("franklin_jump",
                        leg1_off=(0, -40), foot1_off=(0, -45),
                        leg2_off=(10, -35), foot2_off=(10, -40),
                        body_off=(0, -20), head_off=(0, -25),
                        arm1_off=(-10, -30), hand1_off=(-15, -30),
                        arm2_off=(15, -25), hand2_off=(15, -25))

    # 4. DUCK (Low martial arts tiger crouch)
    render_karate_frame("franklin_duck",
                        leg1_off=(-10, 35), foot1_off=(-10, 35),
                        leg2_off=(10, 35), foot2_off=(10, 35),
                        body_off=(0, 45), head_off=(0, 55),
                        arm1_off=(-15, 35), hand1_off=(-20, 30),
                        arm2_off=(10, 35), hand2_off=(10, 35))

    # 5. PUNCH COMBOS (Bare martial arts karate strikes)
    # Scaled fist for heavy impact strikes
    hand1_heavy = hand1.resize((int(hand1.width * 1.3), int(hand1.height * 1.3)), Image.Resampling.LANCZOS)

    # Jab (Soco Rápido de Direita / Kisami Zuki)
    render_karate_frame("franklin_punch_jab",
                        body_off=(12, 0), head_off=(15, 0),
                        arm1_off=(40, -10), hand1_off=(80, -15),
                        arm2_off=(-20, 10), hand2_off=(-20, 10))

    # Cross (Gyaku Zuki - Soco Inverso Potente)
    punch_cross = render_karate_frame("franklin_punch_cross",
                                      body_off=(18, 0), head_off=(20, 0),
                                      arm1_off=(65, -15), hand1_off=(130, -20),
                                      arm2_off=(-30, 20), hand2_off=(-30, 20),
                                      hand1_img=hand1_heavy)

    # Uppercut (Gancho Shita Zuki Ascendente)
    render_karate_frame("franklin_punch_uppercut",
                        body_off=(8, -12), head_off=(10, -15),
                        arm1_off=(30, -45), hand1_off=(60, -85),
                        arm2_off=(-10, 20), hand2_off=(-10, 20),
                        hand1_img=hand1_heavy)

    # Hook (Mawashi Zuki Cruzado de Impacto)
    render_karate_frame("franklin_punch_hook",
                        body_off=(25, 0), head_off=(28, 0),
                        arm1_off=(75, -5), hand1_off=(150, -10),
                        arm2_off=(-40, 20), hand2_off=(-40, 20),
                        hand1_img=hand1_heavy)

    # 6. ROOT SPRITES
    import shutil
    shutil.copy(os.path.join(out_dir, "franklin_idle_0.png"), os.path.join(root_assets, "franklin_player.png"))
    shutil.copy(os.path.join(out_dir, "franklin_punch_cross.png"), os.path.join(root_assets, "franklin_punch.png"))

    # 7. MARTIAL ARTS PUNCH PROJECTILE
    # Create an authentic bare feather fist with punch shockwave
    proj_canvas = Image.new("RGBA", (140, 90), (0, 0, 0, 0))
    # Clenched feathered fist
    fist_scaled = fist2.resize((85, 70), Image.Resampling.LANCZOS)
    proj_canvas.paste(fist_scaled, (45, 10), fist_scaled)
    # Add subtle punch wind lines behind the fist
    from PIL import ImageDraw
    draw = ImageDraw.Draw(proj_canvas)
    draw.line([(5, 25), (45, 25)], fill=(255, 255, 255, 180), width=4)
    draw.line([(0, 45), (40, 45)], fill=(240, 235, 200, 220), width=5)
    draw.line([(8, 65), (48, 65)], fill=(255, 255, 255, 180), width=4)
    
    proj_path = os.path.join(root_assets, "fist_projectile.png")
    proj_canvas.save(proj_path)
    print("Generated authentic karate punch projectile:", proj_path)

    # Copy previews to brain dir
    shutil.copy(os.path.join(out_dir, "franklin_idle_0.png"), os.path.join(brain_dir, "franklin_karategi_idle.png"))
    shutil.copy(os.path.join(out_dir, "franklin_punch_cross.png"), os.path.join(brain_dir, "franklin_karategi_punch.png"))
    shutil.copy(proj_path, os.path.join(brain_dir, "franklin_karate_proj.png"))

    print("\nSUCCESS: Authentic Karate Gi Franklin Schneider completely deployed!")

if __name__ == "__main__":
    build_karate_franklin_suite()

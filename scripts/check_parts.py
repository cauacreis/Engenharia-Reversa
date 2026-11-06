import os
from PIL import Image

parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"
needed = [
    "Head.png",
    "Armor_HeadArmor_Crest.png",
    "Armor_HeadArmor_Aviator_Sunglasses.png",
    "Body.png",
    "Weapon_Boxing_Gloves.png",
    "Weapon_Hand_Wrap.png",
    "a1.png",
    "Arm2.png",
    "Hand1.png",
    "Hand2.png",
    "Leg1.png",
    "Leg2.png",
    "Foot1.png",
    "Foot2.png"
]

print("=== CHECKING PARTS ===")
for p in needed:
    fpath = os.path.join(parts_dir, p)
    if os.path.exists(fpath):
        img = Image.open(fpath)
        print(f"FOUND: {p} - size: {img.size}, mode: {img.mode}")
    else:
        print(f"MISSING: {p}")

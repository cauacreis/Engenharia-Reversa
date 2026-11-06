import json
import os
import math
from PIL import Image

# Load skeleton JSON
with open(r'c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\textasset_1_skeleton.txt', 'r', encoding='utf-8') as f:
    skel = json.load(f)

parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"

# Build bone map
bones_data = {b['name']: b for b in skel.get('bones', [])}
bones_order = [b['name'] for b in skel.get('bones', [])]

# Attachment definition map
skin_default = skel.get('skins', {}).get('default', {})

# We choose our active attachments:
active_attachments = {
    'Arm2': ('Arm2', 'Arm2.png'),
    'Hand2': ('Hand2', 'Hand2.png'),
    'Fist2': ('Weapon/Boxing Gloves', 'Weapon_Boxing_Gloves.png'),
    'Leg2': ('Leg2', 'Leg2.png'),
    'Foot2': ('Foot2', 'Foot2.png'),
    'Leg1': ('Leg1', 'Leg1.png'),
    'Foot1': ('Foot1', 'Foot1.png'),
    'Body': ('Body', 'Body.png'),
    'Head': ('Head', 'Head.png'),
    'Armor/Masks/Glasses': ('Armor/HeadArmor/Aviator Sunglasses', 'Armor_HeadArmor_Aviator_Sunglasses.png'),
    'Armor/HeadArmor/Chicken': ('Armor/HeadArmor/Crest', 'Armor_HeadArmor_Crest.png'),
    'Arm1': ('a1', 'a1.png'),
    'Hand1': ('Hand1', 'Hand1.png'),
    'Fist1': ('Weapon/Boxing Gloves', 'Weapon_Boxing_Gloves.png'),
}

slots_list = skel.get('slots', [])
slot_to_bone = {s['name']: s['bone'] for s in slots_list}
draw_order = [s['name'] for s in slots_list if s['name'] in active_attachments]

print("Draw order of active attachments:", draw_order)

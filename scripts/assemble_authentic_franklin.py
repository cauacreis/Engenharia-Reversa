import os
from PIL import Image

parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"
out_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin"

head = Image.open(os.path.join(parts_dir, "Head.png"))
crest = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Crest.png"))
shades = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Aviator_Sunglasses.png"))
body = Image.open(os.path.join(parts_dir, "Body.png"))
glove = Image.open(os.path.join(parts_dir, "Weapon_Boxing_Gloves.png"))
leg1 = Image.open(os.path.join(parts_dir, "Leg1.png"))
leg2 = Image.open(os.path.join(parts_dir, "Leg2.png"))
foot1 = Image.open(os.path.join(parts_dir, "Foot1.png"))
foot2 = Image.open(os.path.join(parts_dir, "Foot2.png"))
arm1 = Image.open(os.path.join(parts_dir, "a1.png"))
arm2 = Image.open(os.path.join(parts_dir, "Arm2.png"))
hand1 = Image.open(os.path.join(parts_dir, "Hand1.png"))
hand2 = Image.open(os.path.join(parts_dir, "Hand2.png"))

print(f"Body: {body.size}")
print(f"Head: {head.size}")
print(f"Crest: {crest.size}")
print(f"Shades: {shades.size}")
print(f"Glove: {glove.size}")
print(f"Leg1: {leg1.size}, Leg2: {leg2.size}")

# Let's inspect the orientation of each part
# If Head needs to face right (or left):
# Cuphead's default character facing in Unity:
# Cuphead player faces RIGHT by default, and flips when facing left!

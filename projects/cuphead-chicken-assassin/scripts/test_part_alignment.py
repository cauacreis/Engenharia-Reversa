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

print("=== PART SIZES ===")
print("Head:", head.size)
print("Crest:", crest.size)
print("Shades:", shades.size)
print("Body:", body.size)
print("Glove:", glove.size)
print("Arm1:", arm1.size, "Arm2:", arm2.size)
print("Leg1:", leg1.size, "Leg2:", leg2.size)
print("Foot1:", foot1.size, "Foot2:", foot2.size)

# Let's see: on Head.png:
# Where is the top of the head for the crest?
# Where are the eyes for the sunglasses?
# Let's inspect Head.png non-transparent bounds
head_bbox = head.getbbox()
print("Head non-transparent bbox:", head_bbox)

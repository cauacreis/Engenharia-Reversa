import os
from PIL import Image

parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"
out_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin"

head = Image.open(os.path.join(parts_dir, "Head.png"))
crest = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Crest.png"))
body = Image.open(os.path.join(parts_dir, "Body.png"))
gi = Image.open(os.path.join(parts_dir, "Armor_Body_Karategi_b.png"))
gi_sleeve = Image.open(os.path.join(parts_dir, "Armor_Body_Karategi_h1.png"))
leg1 = Image.open(os.path.join(parts_dir, "Leg1.png"))
leg2 = Image.open(os.path.join(parts_dir, "Leg2.png"))
foot1 = Image.open(os.path.join(parts_dir, "Foot1.png"))
foot2 = Image.open(os.path.join(parts_dir, "Foot2.png"))
arm1 = Image.open(os.path.join(parts_dir, "a1.png"))
arm2 = Image.open(os.path.join(parts_dir, "Arm2.png"))
hand1 = Image.open(os.path.join(parts_dir, "Hand1.png"))
hand2 = Image.open(os.path.join(parts_dir, "Hand2.png"))

# Create canvas
canvas = Image.new("RGBA", (500, 520), (0, 0, 0, 0))

# 1. Back leg & foot (layer 1)
canvas.paste(leg2, (150, 320), leg2)
canvas.paste(foot2, (170, 420), foot2)

# 2. Back arm & back bare fist (layer 2)
canvas.paste(arm2, (130, 160), arm2)
canvas.paste(hand2, (100, 190), hand2)

# 3. Torso + Karate Gi (layers 3 & 4)
canvas.paste(body, (130, 140), body)
canvas.paste(gi, (130, 150), gi)

# 4. Front leg & foot (layer 5)
canvas.paste(leg1, (180, 320), leg1)
canvas.paste(foot1, (190, 430), foot1)

# 5. Head (layer 6 - rooster head with yellow beak, red wattle, fierce eye)
canvas.paste(head, (195, 55), head)

# 6. Red Rooster Crest (layer 7 - crown on head)
canvas.paste(crest, (175, 5), crest)

# 7. Front arm & front bare fist (layer 8 - martial arts karate punch)
canvas.paste(arm1, (210, 170), arm1)
# gi sleeve on front shoulder
canvas.paste(gi_sleeve, (195, 170), gi_sleeve)
canvas.paste(hand1, (240, 190), hand1)

# Crop
bbox = canvas.getbbox()
cropped = canvas.crop(bbox)
padded = Image.new("RGBA", (cropped.width + 30, cropped.height + 30), (0, 0, 0, 0))
padded.paste(cropped, (15, 15), cropped)
padded.save(os.path.join(out_dir, "test_karate_franklin.png"))
print("Saved test_karate_franklin.png! Size:", padded.size)

import os
from PIL import Image

parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"
out_img = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\test_franklin_full.png"

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

# Create canvas
canvas = Image.new("RGBA", (500, 520), (0, 0, 0, 0))

# 1. Back leg and foot
canvas.paste(leg2, (150, 320), leg2)
canvas.paste(foot2, (170, 420), foot2)

# 2. Back arm and back glove
canvas.paste(arm2, (130, 160), arm2)
canvas.paste(hand2, (110, 190), hand2)
# Glove can be slightly scaled or positioned
glove_back = glove.resize((int(glove.width * 0.9), int(glove.height * 0.9)), Image.Resampling.LANCZOS)
canvas.paste(glove_back, (90, 210), glove_back)

# 3. Torso
canvas.paste(body, (130, 140), body)

# 4. Front leg and foot
canvas.paste(leg1, (180, 320), leg1)
canvas.paste(foot1, (190, 430), foot1)

# 5. Head
canvas.paste(head, (195, 55), head)

# 6. Aviator Sunglasses (perched across the eyes)
canvas.paste(shades, (225, 88), shades)

# 7. Red Rooster Crest (on top of head)
canvas.paste(crest, (175, 5), crest)

# 8. Front arm and front glove (boxing stance)
canvas.paste(arm1, (210, 170), arm1)
canvas.paste(hand1, (240, 200), hand1)
canvas.paste(glove, (260, 200), glove)

# Crop to tight bounding box with padding
bbox = canvas.getbbox()
print("Assembled bbox:", bbox)
cropped = canvas.crop(bbox)
padded = Image.new("RGBA", (cropped.width + 30, cropped.height + 30), (0, 0, 0, 0))
padded.paste(cropped, (15, 15), cropped)
padded.save(out_img)
print(f"Saved assembled Franklin test image to {out_img} (Size: {padded.size})")

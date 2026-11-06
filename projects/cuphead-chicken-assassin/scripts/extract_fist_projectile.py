import os
from PIL import Image

src_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\chicken_character"
out_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenAssets"

img = Image.open(os.path.join(src_dir, "skeleton2.png"))
# Crop fist
fist = img.crop((649, 122, 649 + 57, 122 + 48))
# Resize slightly and save
fist_big = fist.resize((fist.width * 2, fist.height * 2), Image.Resampling.LANCZOS)
fist_big.save(os.path.join(out_dir, "fist_projectile.png"))
print("Saved fist_projectile.png!")

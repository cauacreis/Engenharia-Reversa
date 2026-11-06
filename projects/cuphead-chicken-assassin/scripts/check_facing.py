import os
import math
from PIL import Image

parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"
out_test = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\test_franklin_head_assembled.png"

head = Image.open(os.path.join(parts_dir, "Head.png"))
crest = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Crest.png"))
shades = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Aviator_Sunglasses.png"))

print(f"Originals: Head={head.size}, Crest={crest.size}, Shades={shades.size}")

# Let's test different rotations or direct alignment:
# Let's see: on the real Franklin rooster:
# Head.png: the rooster head is facing LEFT (or facing RIGHT?).
# Let's check which way Head.png is facing!

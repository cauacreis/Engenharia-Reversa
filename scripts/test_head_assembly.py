import os
from PIL import Image

parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"
out_test = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\test_head.png"

head = Image.open(os.path.join(parts_dir, "Head.png"))
crest = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Crest.png"))
sunglasses = Image.open(os.path.join(parts_dir, "Armor_HeadArmor_Aviator_Sunglasses.png"))

print(f"Head: {head.size}, Crest: {crest.size}, Sunglasses: {sunglasses.size}")

# Let's create a canvas for the head assembly
canvas = Image.new("RGBA", (250, 250), (0, 0, 0, 0))

# In Spine:
# Head bone is at root.
# Hats bone is at x=70.09, y=-6.77, rot=17.07 relative to Head bone.
# Attachment Crest is at x=13.38, y=20.02, rot=-93.1 relative to Hats bone.
# Glasses bone is at x=34.07, y=-4.25, rot=0 relative to Head bone.
# Attachment Aviator Sunglasses is at x=-5.97, y=-24.57, rot=-77.33 relative to Glasses bone.

# Let's inspect head details:
# Let's find the beak and eye region in head:
# Let's paste head at center:
hx, hy = 80, 80
canvas.paste(head, (hx, hy), head)

# Save canvas with head only first
canvas.save(out_test)
print(f"Saved head test to {out_test}")

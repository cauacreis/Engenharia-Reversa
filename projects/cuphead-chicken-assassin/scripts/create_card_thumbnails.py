import os
from PIL import Image

shop_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenAssets\Shop"
cards_dir = os.path.join(shop_dir, "Cards")
os.makedirs(cards_dir, exist_ok=True)

card_names = [
    "savage.png",
    "rapid_fire.png",
    "ironshirt.png",
    "braaveheart.png",
    "soul_crusher.png",
    "drone_pet.png"
]

for cname in card_names:
    src = os.path.join(shop_dir, cname)
    if os.path.exists(src):
        im = Image.open(src)
        # Resize to 110x216 for crisp UI card display
        thumb = im.resize((110, 216), Image.Resampling.LANCZOS)
        dst = os.path.join(cards_dir, cname)
        thumb.save(dst)
        print(f"Saved card thumb: {cname} (110x216)")

# Also ensure blackmarket_bg.png is a high quality 800x600 for the modal
bg_src = os.path.join(shop_dir, "Bg.png")
if os.path.exists(bg_src):
    bg_im = Image.open(bg_src)
    bg_modal = bg_im.resize((820, 580), Image.Resampling.LANCZOS)
    bg_modal.save(os.path.join(shop_dir, "blackmarket_bg.png"))
    print("Saved high-res blackmarket_bg.png (820x580)")

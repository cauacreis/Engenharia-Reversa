import os
import UnityPy
from PIL import Image

output_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenAssets\Shop"
os.makedirs(output_dir, exist_ok=True)

bundles = [
    r"C:\Program Files (x86)\Steam\steamapps\common\Chicken Assassin Reloaded\ChickenAssassin_Data\StreamingAssets\AssetBundles\blackmarket",
    r"C:\Program Files (x86)\Steam\steamapps\common\Chicken Assassin Reloaded\ChickenAssassin_Data\StreamingAssets\AssetBundles\upgrades",
    r"C:\Program Files (x86)\Steam\steamapps\common\Chicken Assassin Reloaded\ChickenAssassin_Data\StreamingAssets\AssetBundles\menus"
]

extracted = []

for bpath in bundles:
    if not os.path.exists(bpath):
        continue
    env = UnityPy.load(bpath)
    for obj in env.objects:
        if obj.type.name in ['Texture2D', 'Sprite']:
            try:
                data = obj.read()
                name = getattr(data, 'name', '') or getattr(data, 'm_Name', '')
                if not name:
                    continue
                # Specific assets we want:
                targets = [
                    'bg', 'comicbubble_right', 'frontobj', 'frontobj2', 'frontobj3', 'light',
                    'blackmarket', 'arrow', 'btn', 'chicken',
                    'savage', 'braaveheart', 'sharp shooter', 'rapid fire', 'ironshirt', 'first aid',
                    'drone pet', 'soul crusher', 'soulclicker', 'battle', 'resources', 'boombox'
                ]
                if name.lower() in targets and hasattr(data, 'image') and data.image:
                    filename = f"{name.lower().replace(' ', '_')}.png"
                    target_file = os.path.join(output_dir, filename)
                    # Don't overwrite if existing unless larger
                    data.image.save(target_file)
                    extracted.append((filename, data.image.size))
                    print(f"Extracted: {filename} {data.image.size}")
            except Exception as e:
                pass

print(f"Total extracted assets: {len(extracted)}")

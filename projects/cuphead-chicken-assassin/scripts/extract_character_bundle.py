import os
import UnityPy

def extract_bundle(bundle_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    print(f"Loading bundle: {bundle_path}")
    env = UnityPy.load(bundle_path)
    count = 0
    for obj in env.objects:
        try:
            data = obj.read()
            name = getattr(data, 'name', '')
            if not name:
                name = f"obj_{obj.path_id}"
                
            if obj.type.name in ["Texture2D", "Sprite"] and hasattr(data, 'image') and data.image:
                out_file = os.path.join(out_dir, f"{name}.png")
                data.image.save(out_file)
                print(f"  [Image] Saved: {name}.png ({data.image.size})")
                count += 1
            elif obj.type.name == "TextAsset":
                script = getattr(data, 'script', None)
                if script is not None:
                    # Could be bytes or str
                    if isinstance(script, str):
                        content = script.encode('utf-8')
                    else:
                        content = bytes(script)
                    ext = ".json" if "json" in name else (".atlas" if "atlas" in name else ".txt")
                    out_file = os.path.join(out_dir, f"{name}{ext}")
                    with open(out_file, "wb") as f:
                        f.write(content)
                    print(f"  [TextAsset] Saved: {name}{ext} ({len(content)} bytes)")
                    count += 1
        except Exception as e:
            print(f"  Error reading {obj}: {e}")
            
    print(f"Done. Extracted {count} items to {out_dir}")

if __name__ == "__main__":
    bundle = r"C:\Program Files (x86)\Steam\steamapps\common\Chicken Assassin Reloaded\ChickenAssassin_Data\StreamingAssets\AssetBundles\character"
    out = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\chicken_character"
    extract_bundle(bundle, out)

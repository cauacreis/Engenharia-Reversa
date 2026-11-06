import os
import UnityPy

def extract_sprites(asset_path, output_dir, max_count=50):
    print(f"Scanning {asset_path}...")
    env = UnityPy.load(asset_path)
    os.makedirs(output_dir, exist_ok=True)
    
    count = 0
    for obj in env.objects:
        if obj.type.name in ["Texture2D", "Sprite"]:
            try:
                data = obj.read()
                name = getattr(data, 'name', '')
                # Filter for chicken / franklin / rooster / player / attack
                lower_name = name.lower()
                is_match = any(k in lower_name for k in ['chicken', 'franklin', 'rooster', 'fist', 'punch', 'attack', 'anim', 'skin', 'player'])
                
                if is_match and hasattr(data, 'image') and data.image:
                    out_name = f"{name}_{obj.type.name}.png"
                    out_path = os.path.join(output_dir, out_name)
                    data.image.save(out_path)
                    print(f"  Extracted: {out_name} ({data.image.size})")
                    count += 1
                    if count >= max_count:
                        break
            except Exception as e:
                pass
                
    print(f"Done. Extracted {count} images from {os.path.basename(asset_path)}.")
    return count

def main():
    base = r"C:\Program Files (x86)\Steam\steamapps\common\Chicken Assassin Reloaded\ChickenAssassin_Data"
    out = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\chicken_sprites"
    
    total = 0
    for fname in ["sharedassets0.assets", "resources.assets"]:
        p = os.path.join(base, fname)
        if os.path.exists(p):
            total += extract_sprites(p, out, max_count=40)
            
    print(f"\nTotal extracted sprites: {total} in {out}")

if __name__ == "__main__":
    main()

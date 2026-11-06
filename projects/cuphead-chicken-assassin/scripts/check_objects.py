import os
import UnityPy

def inspect_assets(asset_path):
    print(f"--- Object inspection: {os.path.basename(asset_path)} ---")
    env = UnityPy.load(asset_path)
    types_count = {}
    sample_textures = []
    sample_text_assets = []
    
    for obj in env.objects:
        tname = obj.type.name
        types_count[tname] = types_count.get(tname, 0) + 1
        if tname in ["Texture2D", "Sprite"] and len(sample_textures) < 25:
            try:
                d = obj.read()
                sample_textures.append(f"{getattr(d, 'name', 'unnamed')} ({tname})")
            except:
                pass
        elif tname == "TextAsset" and len(sample_text_assets) < 15:
            try:
                d = obj.read()
                sample_text_assets.append(getattr(d, 'name', 'unnamed'))
            except:
                pass
                
    print(f"Type counts: {types_count}")
    print(f"Sample Textures/Sprites: {sample_textures}")
    print(f"Sample TextAssets: {sample_text_assets}")

if __name__ == "__main__":
    base = r"C:\Program Files (x86)\Steam\steamapps\common\Chicken Assassin Reloaded\ChickenAssassin_Data"
    inspect_assets(os.path.join(base, "resources.assets"))

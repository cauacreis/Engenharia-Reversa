import zipfile
import os
import shutil

zip_path = r"C:\Users\Cauã Felype\.gemini\antigravity\brain\78753bbc-b9f7-4391-80af-6f4ae1b15257\hybrid_eng.zip"
target_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies\LauncherData\Mods\Hybrid_Edition\Game"

print("Unpacking hybrid_eng.zip to:", target_dir)
with zipfile.ZipFile(zip_path, 'r') as z:
    for member in z.infolist():
        target_path = os.path.join(target_dir, member.filename)
        if member.is_dir():
            os.makedirs(target_path, exist_ok=True)
        else:
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with z.open(member) as source, open(target_path, "wb") as target:
                shutil.copyfileobj(source, target)
print("Unpack complete!")

# Check unpacked files
for item in os.listdir(target_dir):
    p = os.path.join(target_dir, item)
    if os.path.isfile(p):
        print(f"  {item} ({os.path.getsize(p):,} bytes)")
    else:
        print(f"  {item}/ (dir)")

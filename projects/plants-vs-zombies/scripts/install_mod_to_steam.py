import shutil
import os
import hashlib

src = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_mod\PlantsVsZombies_DLC.exe"
dst = r"C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies\PlantsVsZombies.exe"

print(f"Replacing {dst} with patched DLC executable ({os.path.getsize(src):,} bytes)...")
shutil.copy2(src, dst)

hasher_src = hashlib.sha256()
with open(src, 'rb') as f:
    while chunk := f.read(1024*1024):
        hasher_src.update(chunk)

hasher_dst = hashlib.sha256()
with open(dst, 'rb') as f:
    while chunk := f.read(1024*1024):
        hasher_dst.update(chunk)

print("Source SHA256:", hasher_src.hexdigest())
print("Target SHA256:", hasher_dst.hexdigest())

if hasher_src.hexdigest() == hasher_dst.hexdigest():
    print("SUCCESS: PlantsVsZombies.exe in Steam folder successfully replaced with DLC Edition!")
else:
    print("ERROR: Hashes do not match!")

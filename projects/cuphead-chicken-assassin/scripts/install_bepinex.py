import os
import urllib.request
import zipfile
import shutil
import subprocess

def download_file(url, dest):
    print(f"Downloading {url} -> {dest}")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
        shutil.copyfileobj(response, out_file)
    print(f"Downloaded {os.path.getsize(dest)} bytes.")

def main():
    cuphead_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead"
    zip_dest = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\bepinex_x64.zip"
    
    # Try downloading BepInEx 5.4.23.2 x64
    urls = [
        "https://github.com/BepInEx/BepInEx/releases/download/v5.4.23.2/BepInEx_x64_5.4.23.2.zip",
        "https://github.com/BepInEx/BepInEx/releases/download/v5.4.22/BepInEx_x64_5.4.22.0.zip",
        "https://github.com/BepInEx/BepInEx/releases/download/v5.4.21/BepInEx_x64_5.4.21.0.zip"
    ]
    
    downloaded = False
    for u in urls:
        try:
            download_file(u, zip_dest)
            downloaded = True
            break
        except Exception as e:
            print(f"Failed {u}: {e}")
            
    if not downloaded:
        print("ERROR: Could not download BepInEx!")
        return

    # Extract directly into Cuphead directory
    print(f"Extracting BepInEx into {cuphead_dir}...")
    with zipfile.ZipFile(zip_dest, 'r') as zip_ref:
        zip_ref.extractall(cuphead_dir)
        
    plugins_dir = os.path.join(cuphead_dir, "BepInEx", "plugins")
    os.makedirs(plugins_dir, exist_ok=True)
    print(f"BepInEx installed! Plugins directory: {plugins_dir}")

if __name__ == "__main__":
    main()

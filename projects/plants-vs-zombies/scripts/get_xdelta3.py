import urllib.request
import zipfile
import os

url = "https://github.com/jmacd/xdelta-gpl/releases/download/v3.0.11/xdelta3-3.0.11-x86_64.exe.zip"
out_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_mod\tools"
os.makedirs(out_dir, exist_ok=True)
zip_file = os.path.join(out_dir, "xdelta3.zip")

print("Downloading xdelta3 from GitHub releases...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp, open(zip_file, 'wb') as f:
    f.write(resp.read())

print("Extracting xdelta3...")
with zipfile.ZipFile(zip_file, 'r') as z:
    z.extractall(out_dir)

# Check extracted files
for f in os.listdir(out_dir):
    print("Found tool file:", f)
    if "xdelta3" in f and f.endswith(".exe"):
        exe_path = os.path.join(out_dir, f)
        target = os.path.join(out_dir, "xdelta3.exe")
        if exe_path != target:
            if os.path.exists(target): os.remove(target)
            os.rename(exe_path, target)
        print("xdelta3.exe is ready at:", target)

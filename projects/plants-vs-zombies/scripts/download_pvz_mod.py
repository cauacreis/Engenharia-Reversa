import os
import json
import urllib.request
import time
import zipfile
import hashlib

def download_mod():
    dest_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_mod"
    os.makedirs(dest_dir, exist_ok=True)
    zip_path = os.path.join(dest_dir, "pvz-dlc-v2.7.2.zip")
    extract_dir = os.path.join(dest_dir, "extracted")
    os.makedirs(extract_dir, exist_ok=True)

    # 1. Request fresh download URL from GameJolt
    api_url = "https://gamejolt.com/site-api/web/discover/games/builds/get-download-url/1913641"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://gamejolt.com/games/pvzdlceditionmod/1009738',
        'Content-Type': 'application/json'
    }

    req = urllib.request.Request(api_url, data=b'{}', headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        download_url = data['payload']['url']
        print(f"Obtained Download URL: {download_url[:60]}...")

    # 2. Download file
    print(f"Downloading to {zip_path}...")
    dl_headers = {
        'User-Agent': headers['User-Agent'],
        'Referer': headers['Referer']
    }
    dl_req = urllib.request.Request(download_url, headers=dl_headers)
    
    start_time = time.time()
    with urllib.request.urlopen(dl_req) as response, open(zip_path, 'wb') as out_file:
        total_size = int(response.getheader('Content-Length', 0))
        print(f"Total size: {total_size / (1024*1024):.2f} MB")
        
        downloaded = 0
        chunk_size = 1024 * 1024 # 1MB chunks
        last_log = time.time()
        
        while True:
            chunk = response.read(chunk_size)
            if not chunk:
                break
            out_file.write(chunk)
            downloaded += len(chunk)
            
            if time.time() - last_log > 3.0 or downloaded == total_size:
                elapsed = time.time() - start_time
                speed = downloaded / (1024*1024 * elapsed) if elapsed > 0 else 0
                percent = (downloaded / total_size) * 100 if total_size > 0 else 0
                print(f"Downloaded: {downloaded / (1024*1024):.1f}/{total_size / (1024*1024):.1f} MB ({percent:.1f}%) @ {speed:.2f} MB/s")
                last_log = time.time()

    print(f"\nDownload completed in {time.time() - start_time:.1f}s!")
    
    # Check SHA256
    hasher = hashlib.sha256()
    with open(zip_path, 'rb') as f:
        while chunk := f.read(4096 * 1024):
            hasher.update(chunk)
    sha256 = hasher.hexdigest()
    print(f"SHA-256: {sha256}")

    # 3. Unzip
    print(f"\nExtracting to {extract_dir}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    print("Extraction completed!")

    # 4. List extracted files
    print("\nExtracted files and directories:")
    for root, dirs, files in os.walk(extract_dir):
        rel = os.path.relpath(root, extract_dir)
        print(f"[{rel}]")
        for f in files:
            fp = os.path.join(root, f)
            print(f"  {f} ({os.path.getsize(fp):,} bytes)")

if __name__ == "__main__":
    download_mod()

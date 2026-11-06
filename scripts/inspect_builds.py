import urllib.request
import json

ep = "https://gamejolt.com/site-api/web/discover/games/packages/1009738"
req = urllib.request.Request(ep, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*'
})

with urllib.request.urlopen(req) as resp:
    js = json.loads(resp.read().decode('utf-8'))
    payload = js.get('payload', {})
    
    print("=== PACKAGES ===")
    for p in payload.get('packages', []):
        print(f"ID: {p['id']}, Title: {p['title']}")
        
    print("\n=== BUILDS ===")
    for b in payload.get('builds', []):
        print(f"Build ID: {b.get('id')}, Package ID: {b.get('game_package_id')}, Release ID: {b.get('game_release_id')}")
        print(f"  Filename: {b.get('primary_file', {}).get('filename')}, Filesize: {b.get('primary_file', {}).get('filesize')}")


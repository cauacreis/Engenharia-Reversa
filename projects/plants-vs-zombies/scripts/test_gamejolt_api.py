import urllib.request
import json

endpoints = [
    "https://gamejolt.com/site-api/web/discover/games/1009738",
    "https://gamejolt.com/site-api/web/discover/games/overview/1009738",
    "https://gamejolt.com/site-api/web/discover/games/packages/1009738",
]

for ep in endpoints:
    print(f"\n--- Testing {ep} ---")
    req = urllib.request.Request(ep, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json, text/plain, */*'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode('utf-8')
            print("Status:", resp.status, "Length:", len(data))
            try:
                js = json.loads(data)
                print("Payload keys:", list(js.get('payload', {}).keys()))
                payload = js.get('payload', {})
                if 'game' in payload:
                    print("Game title:", payload['game'].get('title'))
                if 'packages' in payload:
                    print("Packages count:", len(payload['packages']))
                    for p in payload['packages']:
                        print("  Package:", p.get('id'), p.get('title'))
                if 'releases' in payload:
                    print("Releases count:", len(payload['releases']))
                if 'builds' in payload:
                    print("Builds count:", len(payload['builds']))
            except Exception as e:
                print("JSON error:", e)
    except Exception as e:
        print("HTTP error:", e)

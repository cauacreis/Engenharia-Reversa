import urllib.request
import json

endpoints = [
    "https://gamejolt.com/site-api/web/discover/games/builds/download/1913641",
    "https://gamejolt.com/site-api/web/discover/games/builds/get-download-url/1913641",
    "https://gamejolt.com/site-api/web/discover/games/1009738/builds/1913641/download",
    "https://gamejolt.com/site-api/web/download/build/1913641"
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
                print("Response:", js)
            except Exception as e:
                print("Text:", data[:200])
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code, e.read().decode('utf-8', errors='ignore')[:200])
    except Exception as e:
        print("Error:", e)

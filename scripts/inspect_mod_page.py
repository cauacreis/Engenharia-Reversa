import urllib.request
import re
import json

url = 'https://gamejolt.com/games/pvzdlceditionmod/1009738'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8', errors='ignore')
        print(f"HTML length: {len(html)}")
        
        # Look for title
        title_match = re.search(r'<title>(.*?)</title>', html)
        if title_match:
            print("Title:", title_match.group(1))
            
        # Check for GameJolt JSON payload in script tags
        # Gamejolt typically embeds state in window.__INITIAL_STATE__ or similar
        state_match = re.search(r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});\s*</script>', html, re.DOTALL)
        if state_match:
            print("Found __INITIAL_STATE__!")
            try:
                state = json.loads(state_match.group(1))
                print("State keys:", list(state.keys()))
            except Exception as e:
                print("Error parsing state JSON:", e)
        else:
            print("No __INITIAL_STATE__ found, searching for packages/builds...")
            
        # Search for download API patterns or build IDs
        pkg_matches = re.findall(r'/games/[^/]+/\d+/download/build/\d+', html)
        print("Package build links:", set(pkg_matches))
        
        # Search for gamejolt API URLs
        api_matches = re.findall(r'https?://[^\s\"\'<>]+gamejolt[^\s\"\'<>]+', html)
        print("GameJolt URLs found:", len(api_matches))
        for u in set(api_matches)[:10]:
            print("  ", u)

except Exception as e:
    print("Error fetching:", e)

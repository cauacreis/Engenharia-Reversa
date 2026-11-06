import urllib.request
import json

# First, let's visit gamejolt.com to get cookies
cj = urllib.request.HTTPCookieProcessor()
opener = urllib.request.build_opener(cj)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://gamejolt.com/games/pvzdlceditionmod/1009738',
}

# 1. Fetch the main game page to get cookies
req1 = urllib.request.Request("https://gamejolt.com/games/pvzdlceditionmod/1009738", headers=headers)
try:
    with opener.open(req1) as resp1:
        print("Visited game page. Cookies:")
        for cookie in cj.cookiejar:
            print(f"  {cookie.name} = {cookie.value[:20]}...")
except Exception as e:
    print("Error visiting game page:", e)

# 2. Try get-download-url with GET
url = "https://gamejolt.com/site-api/web/discover/games/builds/get-download-url/1913641"
req2 = urllib.request.Request(url, headers=headers)
try:
    with opener.open(req2) as resp2:
        data = resp2.read().decode('utf-8')
        print("\nGET Status:", resp2.status)
        print("Data:", data)
except urllib.error.HTTPError as e:
    print("\nGET HTTPError:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("\nGET Error:", e)

# 3. Try get-download-url with POST (empty JSON)
req3 = urllib.request.Request(url, data=b'{}', headers={**headers, 'Content-Type': 'application/json'})
try:
    with opener.open(req3) as resp3:
        data = resp3.read().decode('utf-8')
        print("\nPOST Status:", resp3.status)
        print("Data:", data)
except urllib.error.HTTPError as e:
    print("\nPOST HTTPError:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("\nPOST Error:", e)

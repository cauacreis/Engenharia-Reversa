import urllib.request

urls = [
    "https://gamejolt.com/games/pvzdlceditionmod/1009738/download/build/1913641",
    "https://gamejolt.com/site-api/web/discover/games/builds/get-download-url/1913641",
]

for url in urls:
    print(f"\nTesting: {url}")
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    })
    try:
        # Create a opener that doesn't automatically follow redirect to see the 302 location if any
        class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, req, fp, code, msg, headers, newurl):
                print(f"  --> Redirect {code} to: {newurl}")
                return urllib.request.HTTPRedirectHandler.redirect_request(self, req, fp, code, msg, headers, newurl)

        opener = urllib.request.build_opener(NoRedirectHandler)
        with opener.open(req) as resp:
            print("Final URL:", resp.geturl())
            print("Status:", resp.status)
            content = resp.read()
            print("Content length:", len(content))
            import re
            m = re.findall(r'https?://[^\s\"\'<>]+(?:download|token|package|build|amazonaws|cloudfront|gamejolt)[^\s\"\'<>]*', content.decode('utf-8', errors='ignore'))
            for match in set(m)[:10]:
                print("  Match:", match)
    except urllib.error.HTTPError as e:
        print("HTTPError:", e.code)
    except Exception as e:
        print("Error:", e)

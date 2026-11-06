import urllib.request

url = 'https://docs.google.com/document/d/1NunZNi-F4L05HdFgrZ3FRn7_77EbkfGTgndH1UFYSVY/export?format=txt'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        text = resp.read().decode('utf-8', errors='ignore')
        with open('scripts/install_guide.txt', 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Saved install_guide.txt ({len(text)} chars)")
        for line in text.splitlines()[:50]:
            if line.strip():
                print(line.strip())
except Exception as e:
    print('Error:', e)

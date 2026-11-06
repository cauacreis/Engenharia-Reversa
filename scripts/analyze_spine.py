import json

with open(r'c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\textasset_1_skeleton.txt', 'r', encoding='utf-8') as f:
    skel = json.load(f)

print("=== SLOTS DRAW ORDER (Back to Front) ===")
for i, s in enumerate(skel.get('slots', [])):
    print(f"{i}: {s.get('name')}")

print("\n=== ANIMATIONS LIST ===")
for anim in skel.get('animations', {}):
    if 'idle' in anim or 'punch' in anim or 'fist' in anim or 'attack' in anim:
        print(anim)

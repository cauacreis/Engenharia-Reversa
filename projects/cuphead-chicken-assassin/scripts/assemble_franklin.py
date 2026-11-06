import os
import re
from PIL import Image

def find_parts():
    atlas_path = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\chicken_character\skeleton.atlas_1.atlas.txt"
    with open(atlas_path, "r", encoding="utf-8") as f:
        text = f.read()

    pages = text.split("\n\n")
    part_info = {}
    
    for page in pages:
        lines = [l.strip() for l in page.splitlines() if l.strip()]
        if not lines:
            continue
        page_name = lines[0] # e.g. skeleton.png, skeleton2.png ...
        
        i = 1
        while i < len(lines):
            line = lines[i]
            if ":" not in line:
                region_name = line
                info = {}
                i += 1
                while i < len(lines) and ":" in lines[i]:
                    k, v = lines[i].split(":", 1)
                    info[k.strip()] = v.strip()
                    i += 1
                part_info[region_name] = (page_name, info)
            else:
                i += 1
                
    return part_info

def main():
    parts = find_parts()
    target_parts = ['Body', 'Head', 'Leg1', 'Leg2', 'Hand1', 'Hand2', 'fist2', 'Fist3', 'Foot1', 'Foot2', 'eyeballs', 'pupil1', 'EyeObj', 'Shell']
    for tp in target_parts:
        if tp in parts:
            page, info = parts[tp]
            print(f"{tp:10} in {page:15} -> xy: {info.get('xy')}, size: {info.get('size')}, rotate: {info.get('rotate')}")
            
if __name__ == "__main__":
    main()

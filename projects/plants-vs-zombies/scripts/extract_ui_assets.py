import os
import struct

pak_path = r"C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies\main.pak"
out_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_launcher_assets"
os.makedirs(out_dir, exist_ok=True)

with open(pak_path, 'rb') as f:
    full_data = bytearray(f.read())

# Decrypt header/dir
print("Decrypting full PAK...")
for i in range(len(full_data)):
    full_data[i] ^= 0xF7

magic = struct.unpack('<I', full_data[0:4])[0]
pos = 8
file_entries = []
while pos < len(full_data):
    flags = full_data[pos]
    pos += 1
    if flags != 0:
        break
    name_len = full_data[pos]
    pos += 1
    if name_len == 0:
        break
    name = full_data[pos:pos+name_len].decode('latin1')
    pos += name_len
    size, mtime = struct.unpack('<IQ', full_data[pos:pos+12])
    pos += 12
    file_entries.append((name, size))

data_start = pos
print(f"Data starts at {data_start}. Extracting UI & font assets...")

cur_offset = data_start
extracted_count = 0
for name, size in file_entries:
    lower = name.lower()
    # Check if UI asset, font, button, dialog, woodsign, selector, etc.
    if any(k in lower for k in ['dialog', 'button', 'font', 'woodsign', 'selector', 'tombstone', 'lawn', 'title', 'logo', 'zombiehand', 'dirt']):
        target_path = os.path.join(out_dir, name)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, 'wb') as out_f:
            out_f.write(full_data[cur_offset:cur_offset+size])
        extracted_count += 1
    cur_offset += size

print(f"Extracted {extracted_count} authentic assets to {out_dir}!")

import os
import struct

pak_path = r"C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies\main.pak"

with open(pak_path, 'rb') as f:
    data = f.read()

# Decrypt with 0xF7
dec = bytes(b ^ 0xF7 for b in data[:1024*500]) # First 500KB to parse directory

magic = struct.unpack('<I', dec[0:4])[0]
print(f"Magic: {hex(magic)}") # Should be 0xBAC04AC0

pos = 8 # After magic (4) + version (4)
files = []
while pos < len(dec):
    flags = dec[pos]
    pos += 1
    if flags != 0:
        # End of directory or invalid
        break
    name_len = dec[pos]
    pos += 1
    if name_len == 0:
        break
    name = dec[pos:pos+name_len].decode('latin1')
    pos += name_len
    size, mtime = struct.unpack('<IQ', dec[pos:pos+12])
    pos += 12
    files.append((name, size))
    if len(files) < 20:
        print(f"File: {name} ({size:,} bytes)")

print(f"Total files in index: {len(files)}")
dialog_files = [f for f in files if 'dialog' in f[0].lower() or 'button' in f[0].lower() or 'font' in f[0].lower() or 'user' in f[0].lower()]
print(f"Found {len(dialog_files)} UI/Dialog/Font files:")
for f in dialog_files[:30]:
    print(f"  {f[0]} ({f[1]:,} bytes)")

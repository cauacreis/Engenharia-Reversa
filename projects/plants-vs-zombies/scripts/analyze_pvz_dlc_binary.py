import pefile
import os
import re

exe_path = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_mod\PlantsVsZombies_DLC.exe"

print("=== PE HEADER ANALYSIS ===")
pe = pefile.PE(exe_path)
print(f"Machine: {hex(pe.FILE_HEADER.Machine)} (0x14c = i386 32-bit)")
print(f"TimeDateStamp: {pe.FILE_HEADER.TimeDateStamp}")
print(f"NumberOfSections: {pe.FILE_HEADER.NumberOfSections}")
print(f"AddressOfEntryPoint: {hex(pe.OPTIONAL_HEADER.AddressOfEntryPoint)}")
print(f"ImageBase: {hex(pe.OPTIONAL_HEADER.ImageBase)}")
print(f"Subsystem: {pe.OPTIONAL_HEADER.Subsystem} (2 = Windows GUI)")

print("\n=== SECTIONS ===")
for section in pe.sections:
    name = section.Name.decode('utf-8', errors='ignore').strip('\x00')
    print(f"Section {name:<8} VirtualSize: {hex(section.Misc_VirtualSize):<10} RawSize: {hex(section.SizeOfRawData):<10} Entropy: {section.get_entropy():.2f}")

print("\n=== IMPORTED DLLs ===")
imported_dlls = []
for entry in pe.DIRECTORY_ENTRY_IMPORT:
    dll_name = entry.dll.decode('utf-8', errors='ignore')
    imported_dlls.append(dll_name)
    func_count = len(entry.imports)
    print(f"  {dll_name:<20} ({func_count} functions)")
    if "steam" in dll_name.lower():
        print("    --> STEAM API FOUND!")
        for imp in entry.imports:
            if imp.name:
                print(f"      {imp.name.decode('utf-8', errors='ignore')}")

print("\n=== STRING SECURITY AUDIT ===")
with open(exe_path, 'rb') as f:
    data = f.read()

# Search for URLs / IPs / Webhooks
urls = re.findall(b'https?://[a-zA-Z0-9./?=_~%-]+', data)
unique_urls = set(u.decode('utf-8', errors='ignore') for u in urls)
print(f"URLs found ({len(unique_urls)}):")
for u in sorted(unique_urls):
    if not any(ign in u for ign in ['w3.org', 'schemas.microsoft.com', 'xml.org']):
        print(f"  {u}")

# Search for Save paths or userdata
save_paths = re.findall(b'[a-zA-Z0-9_\\\\]*userdata[a-zA-Z0-9_\\\\]*|[a-zA-Z0-9_\\\\]*ProgramData[a-zA-Z0-9_\\\\]*', data)
print(f"\nSave path references ({len(save_paths)}):")
for sp in set(s.decode('utf-8', errors='ignore') for s in save_paths[:20]):
    print(f"  {sp}")

# Search for DLC Edition strings / signatures
dlc_strings = re.findall(b'DLC[^\x00]{2,30}|Plants vs[^\x00]{2,30}', data)
print(f"\nDLC Title strings:")
for s in set(s.decode('utf-8', errors='ignore') for s in dlc_strings[:10]):
    print(f"  {s}")

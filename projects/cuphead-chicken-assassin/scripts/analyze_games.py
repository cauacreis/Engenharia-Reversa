import os
import sys
import dnfile
from dnfile.enums import MetadataTables

def inspect_assembly(dll_path, name):
    print(f"==================================================")
    print(f"ANALYZING ASSEMBLY: {name}")
    print(f"Path: {dll_path}")
    print(f"Size: {os.path.getsize(dll_path)} bytes")
    print(f"==================================================")
    
    dn = dnfile.dnPE(dll_path)
    if not hasattr(dn, 'net') or not dn.net:
        print("Not a .NET assembly!")
        return []

    type_defs = []
    if MetadataTables.TypeDef in dn.net.mdtables.tables:
        table = dn.net.mdtables.tables[MetadataTables.TypeDef]
        for row in table.rows:
            namespace = getattr(row, 'TypeNamespace', '')
            tname = getattr(row, 'TypeName', '')
            full = f"{namespace}.{tname}" if namespace else str(tname)
            type_defs.append(full)
            
    print(f"Total TypeDefs found: {len(type_defs)}")
    return type_defs

def main():
    cuphead_dll = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed\Assembly-CSharp.dll"
    chicken_dll = r"C:\Program Files (x86)\Steam\steamapps\common\Chicken Assassin Reloaded\ChickenAssassin_Data\Managed\Assembly-CSharp.dll"
    
    print("Starting disassembly & analysis...")
    cuphead_types = inspect_assembly(cuphead_dll, "Cuphead")
    chicken_types = inspect_assembly(chicken_dll, "Chicken Assassin Reloaded")
    
    # Filter interesting types
    print("\n--- CUPHEAD: Player / Weapon / Animation types ---")
    ch_interesting = [t for t in cuphead_types if any(k in t.lower() for k in ['player', 'weapon', 'animation', 'character', 'damage'])]
    for t in sorted(ch_interesting)[:30]:
        print(f"  [Cuphead] {t}")
    print(f"  ... total matching: {len(ch_interesting)}")

    print("\n--- CHICKEN ASSASSIN: Player / Franklin / Combat / Weapon types ---")
    ca_interesting = [t for t in chicken_types if any(k in t.lower() for k in ['player', 'franklin', 'rooster', 'chicken', 'weapon', 'attack', 'combat', 'skill'])]
    for t in sorted(ca_interesting)[:30]:
        print(f"  [ChickenAssassin] {t}")
    print(f"  ... total matching: {len(ca_interesting)}")

if __name__ == "__main__":
    main()

import dnfile
from dnfile.enums import MetadataTables

def inspect_type_details(dll_path, target_names):
    dn = dnfile.dnPE(dll_path)
    if not hasattr(dn, 'net') or not dn.net:
        return
        
    type_table = dn.net.mdtables.tables[MetadataTables.TypeDef]
    print(f"\n=======================================================")
    print(f"Details for {dll_path}")
    print(f"=======================================================")
    
    for row in type_table.rows:
        tname = str(getattr(row, 'TypeName', ''))
        if tname in target_names:
            print(f"\n[CLASS: {tname}]")
            methods = []
            if hasattr(row, 'MethodList') and row.MethodList:
                for m in row.MethodList:
                    if hasattr(m, 'row'):
                        methods.append(str(getattr(m.row, 'Name', '')))
                    else:
                        methods.append(str(getattr(m, 'Name', str(m))))
            print(f"  Methods ({len(methods)}): {', '.join(methods[:40])}")
            
            fields = []
            if hasattr(row, 'FieldList') and row.FieldList:
                for f in row.FieldList:
                    if hasattr(f, 'row'):
                        fields.append(str(getattr(f.row, 'Name', '')))
                    else:
                        fields.append(str(getattr(f, 'Name', str(f))))
            print(f"  Fields ({len(fields)}): {', '.join(fields[:40])}")

def main():
    chicken_dll = r"C:\Program Files (x86)\Steam\steamapps\common\Chicken Assassin Reloaded\ChickenAssassin_Data\Managed\Assembly-CSharp.dll"
    cuphead_dll = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed\Assembly-CSharp.dll"
    
    inspect_type_details(chicken_dll, ['Player', 'PlayerAnimationController', 'PlayerInfo', 'WeaponType'])
    inspect_type_details(cuphead_dll, ['CupheadPlayerController', 'AbstractPlayerController', 'PlayerWeaponManager', 'CupheadPlayerAnimationController'])

if __name__ == "__main__":
    main()

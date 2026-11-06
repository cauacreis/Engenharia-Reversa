import dnfile
from dnfile.enums import MetadataTables

def inspect_cuphead_weapons(dll_path):
    dn = dnfile.dnPE(dll_path)
    type_table = dn.net.mdtables.tables[MetadataTables.TypeDef]
    for row in type_table.rows:
        tname = str(getattr(row, 'TypeName', ''))
        if tname in ['PlayerWeaponManager', 'CupheadPlayerController', 'AbstractPlayerWeapon']:
            print(f"\n[CLASS: {tname}]")
            methods = []
            if hasattr(row, 'MethodList') and row.MethodList:
                for m in row.MethodList:
                    mname = getattr(m.row, 'Name', '') if hasattr(m, 'row') else getattr(m, 'Name', str(m))
                    methods.append(str(mname))
            print(f"  Methods: {', '.join(methods)}")

if __name__ == "__main__":
    cuphead_dll = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed\Assembly-CSharp.dll"
    inspect_cuphead_weapons(cuphead_dll)

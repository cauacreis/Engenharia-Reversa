import dnfile
from dnfile.enums import MetadataTables

def inspect_cuphead_player():
    dll = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed\Assembly-CSharp.dll"
    dn = dnfile.dnPE(dll)
    table = dn.net.mdtables.tables[MetadataTables.TypeDef]
    
    target_names = ['LevelPlayerController', 'LevelPlayerMotor', 'LevelPlayerWeaponManager', 'LevelPlayerAnimationController']
    
    for row in table.rows:
        tname = str(getattr(row, 'TypeName', ''))
        if tname in target_names:
            print(f"\n=======================================================")
            print(f"CUPHEAD CLASS: {tname}")
            print(f"=======================================================")
            
            methods = []
            if hasattr(row, 'MethodList') and row.MethodList:
                for m in row.MethodList:
                    mname = getattr(m.row, 'Name', '') if hasattr(m, 'row') else getattr(m, 'Name', str(m))
                    methods.append(str(mname))
            print(f"Methods ({len(methods)}):\n  " + "\n  ".join([", ".join(methods[i:i+6]) for i in range(0, len(methods), 6)]))
            
            fields = []
            if hasattr(row, 'FieldList') and row.FieldList:
                for f in row.FieldList:
                    fname = getattr(f.row, 'Name', '') if hasattr(f, 'row') else getattr(f, 'Name', str(f))
                    fields.append(str(fname))
            print(f"\nFields ({len(fields)}):\n  " + "\n  ".join([", ".join(fields[i:i+6]) for i in range(0, len(fields), 6)]))

if __name__ == "__main__":
    inspect_cuphead_player()

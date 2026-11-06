import dnfile
from dnfile.enums import MetadataTables

def inspect_animation_controller():
    dll = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed\Assembly-CSharp.dll"
    dn = dnfile.dnPE(dll)
    table = dn.net.mdtables.tables[MetadataTables.TypeDef]
    
    for row in table.rows:
        tname = str(getattr(row, 'TypeName', ''))
        if tname == 'LevelPlayerAnimationController':
            print("Found LevelPlayerAnimationController!")
            # Inspect fields
            for f in row.FieldList:
                fname = getattr(f.row, 'Name', '') if hasattr(f, 'row') else getattr(f, 'Name', str(f))
                print(f"  Field: {fname}")

if __name__ == "__main__":
    inspect_animation_controller()

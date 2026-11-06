import dnfile
from dnfile.enums import MetadataTables

def inspect_setsprites():
    p = r'C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed\Assembly-CSharp.dll'
    dn = dnfile.dnPE(p)
    for r in dn.net.mdtables.tables[MetadataTables.TypeDef].rows:
        if getattr(r, 'TypeName', '') == 'LevelPlayerAnimationController':
            for m in r.MethodList:
                if getattr(m.row, 'Name', '') == 'SetSprites':
                    print('SetSprites Method RVA:', hex(m.row.Rva))

if __name__ == "__main__":
    inspect_setsprites()

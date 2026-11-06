import dnfile
from dnfile.enums import MetadataTables

def find_cuphead_classes():
    dll = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed\Assembly-CSharp.dll"
    dn = dnfile.dnPE(dll)
    for row in dn.net.mdtables.tables[MetadataTables.TypeDef].rows:
        n = str(getattr(row, 'TypeName', ''))
        ns = str(getattr(row, 'TypeNamespace', ''))
        if any(x in n.lower() for x in ['playercontroller', 'weaponmanager', 'playerweapon']):
            print(f"{ns}.{n}")

if __name__ == "__main__":
    find_cuphead_classes()

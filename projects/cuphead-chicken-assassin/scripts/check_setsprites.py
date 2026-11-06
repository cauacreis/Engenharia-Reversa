import dnfile
from dnfile.enums import MetadataTables

def disassemble_rva(rva):
    dll = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed\Assembly-CSharp.dll"
    with open(dll, 'rb') as f:
        data = f.read()
    dn = dnfile.dnPE(dll)
    offset = dn.get_offset_from_rva(rva)
    print(f"File offset for RVA {hex(rva)}: {hex(offset)}")
    header = data[offset]
    print(f"Header byte: {hex(header)}")

if __name__ == "__main__":
    disassemble_rva(0x21cccc)

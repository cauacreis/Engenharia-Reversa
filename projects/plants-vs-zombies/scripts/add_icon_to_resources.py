import os
import base64

def add_icon():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ico_path = os.path.join(script_dir, "..", "src", "PvZLauncher", "pvz.ico")
    cs_path = os.path.join(script_dir, "..", "src", "PvZLauncher", "PvZResources.cs")

    with open(ico_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")

    with open(cs_path, "r", encoding="utf-8") as f:
        code = f.read()

    # If already added, skip
    if "GetAppIcon" in code:
        print("GetAppIcon already present in PvZResources.cs")
        return

    method_code = (
        "        public static Icon GetAppIcon()\n"
        "        {\n"
        "            try\n"
        "            {\n"
        "                byte[] bytes = Convert.FromBase64String(PVZ_ICON_B64);\n"
        "                using (MemoryStream ms = new MemoryStream(bytes))\n"
        "                {\n"
        "                    return new Icon(ms);\n"
        "                }\n"
        "            }\n"
        "            catch\n"
        "            {\n"
        "                return SystemIcons.Application;\n"
        "            }\n"
        "        }\n\n"
        f'        private const string PVZ_ICON_B64 = "{b64}";\n'
        "    }\n"
        "}\n"
    )

    idx = code.rfind("    }\n}")
    if idx == -1:
        idx = code.rfind("    }\r\n}")

    if idx != -1:
        updated = code[:idx] + method_code
        with open(cs_path, "w", encoding="utf-8") as f:
            f.write(updated)
        print("Successfully injected GetAppIcon() and PVZ_ICON_B64 into PvZResources.cs!")
    else:
        print("Failed to find insertion point.")

if __name__ == "__main__":
    add_icon()

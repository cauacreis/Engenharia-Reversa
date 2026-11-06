import os
import base64

asset_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_launcher_assets\images"
out_cs = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\src\PvZLauncher\PvZResources.cs"
os.makedirs(os.path.dirname(out_cs), exist_ok=True)

files = [
    ("DialogTopLeft", "dialog_topleft.png"),
    ("DialogTopMiddle", "dialog_topmiddle.png"),
    ("DialogTopRight", "dialog_topright.png"),
    ("DialogCenterLeft", "dialog_centerleft.png"),
    ("DialogCenterMiddle", "dialog_centermiddle.png"),
    ("DialogCenterRight", "dialog_centerright.png"),
    ("DialogBottomLeft", "dialog_bottomleft.png"),
    ("DialogBottomMiddle", "dialog_bottommiddle.png"),
    ("DialogBottomRight", "dialog_bottomright.png"),
    ("DialogHeader", "dialog_header.png"),
    ("ButtonLeft", "button_left.png"),
    ("ButtonMiddle", "button_middle.png"),
    ("ButtonRight", "button_right.png"),
    ("ButtonDownLeft", "button_down_left.png"),
    ("ButtonDownMiddle", "button_down_middle.png"),
    ("ButtonDownRight", "button_down_right.png"),
]

code_lines = [
    "using System;",
    "using System.Drawing;",
    "using System.IO;",
    "",
    "namespace PvZLauncher",
    "{",
    "    public static class PvZResources",
    "    {",
]

for var_name, fname in files:
    fpath = os.path.join(asset_dir, fname)
    if os.path.exists(fpath):
        with open(fpath, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        code_lines.append(f'        private static readonly string B64_{var_name} = "{b64}";')
        code_lines.append(f'        public static Bitmap Get{var_name}() {{ return LoadBitmap(B64_{var_name}); }}')
        code_lines.append("")
    else:
        print(f"WARNING: missing {fname}")

code_lines.extend([
    "        private static Bitmap LoadBitmap(string b64)",
    "        {",
    "            if (string.IsNullOrEmpty(b64)) return new Bitmap(1, 1);",
    "            byte[] bytes = Convert.FromBase64String(b64);",
    "            using (MemoryStream ms = new MemoryStream(bytes))",
    "            {",
    "                return new Bitmap(ms);",
    "            }",
    "        }",
    "    }",
    "}",
])

with open(out_cs, "w", encoding="utf-8") as f:
    f.write("\n".join(code_lines))

print(f"Successfully generated C# 5 compatible {out_cs} ({os.path.getsize(out_cs):,} bytes)!")

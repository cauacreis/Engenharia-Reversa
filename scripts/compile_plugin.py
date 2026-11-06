import os
import subprocess

def compile_mod():
    csc = r"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    src = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\scripts\ChickenAssassinCupheadMod\ChickenCupheadPlugin.cs"
    out = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenCupheadMod.dll"
    
    cuphead_managed = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed"
    bepinex_core = r"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\core"
    
    # Strictly reference Cuphead's own Mono .NET 2.0/3.5 libraries and BepInEx
    refs = [
        os.path.join(cuphead_managed, "mscorlib.dll"),
        os.path.join(cuphead_managed, "System.dll"),
        os.path.join(cuphead_managed, "System.Core.dll"),
        os.path.join(bepinex_core, "BepInEx.dll"),
        os.path.join(bepinex_core, "0Harmony.dll"),
        os.path.join(cuphead_managed, "UnityEngine.dll"),
        os.path.join(cuphead_managed, "UnityEngine.CoreModule.dll"),
        os.path.join(cuphead_managed, "UnityEngine.AnimationModule.dll"),
        os.path.join(cuphead_managed, "UnityEngine.ImageConversionModule.dll"),
        os.path.join(cuphead_managed, "UnityEngine.IMGUIModule.dll"),
        os.path.join(cuphead_managed, "UnityEngine.TextRenderingModule.dll"),
        os.path.join(cuphead_managed, "UnityEngine.AudioModule.dll"),
        os.path.join(cuphead_managed, "UnityEngine.UIModule.dll"),
        os.path.join(cuphead_managed, "UnityEngine.UI.dll"),
        os.path.join(cuphead_managed, "Assembly-CSharp.dll"),
    ]
    
    ref_args = [f"/reference:{r}" for r in refs if os.path.exists(r)]
    
    cmd = [
        csc,
        "/target:library",
        f"/out:{out}",
        "/noconfig",
        "/nostdlib+",
        "/platform:anycpu",
        "/optimize+",
    ] + ref_args + [src]
    
    print(f"Compiling plugin targeting Cuphead's Mono runtime with /noconfig /nostdlib+...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    print(f"Return code: {result.returncode}")
    if result.stdout:
        print("STDOUT:\n", result.stdout)
    if result.stderr:
        print("STDERR:\n", result.stderr)
        
    if result.returncode == 0 and os.path.exists(out):
        print(f"SUCCESS! Built {out} ({os.path.getsize(out)} bytes)")
    else:
        print("COMPILATION FAILED!")

if __name__ == "__main__":
    compile_mod()

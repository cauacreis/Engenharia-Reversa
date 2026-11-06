import os
import subprocess

def compile_launcher():
    csc = r"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    script_dir = os.path.dirname(os.path.abspath(__file__))
    src_dir = os.path.abspath(os.path.join(script_dir, "..", "src", "PvZLauncher"))
    out_exe = os.path.join(src_dir, "PlantsVsZombies_Launcher.exe")
    
    cs_files = [
        os.path.join(src_dir, "ModEntry.cs"),
        os.path.join(src_dir, "ModManager.cs"),
        os.path.join(src_dir, "SaveManager.cs"),
        os.path.join(src_dir, "PvZResources.cs"),
        os.path.join(src_dir, "PvZLauncherForm.cs"),
        os.path.join(src_dir, "Program.cs"),
    ]
    
    cmd = [
        csc,
        "/target:winexe",
        f"/out:{out_exe}",
        "/platform:anycpu",
        "/optimize+",
        "/reference:System.dll",
        "/reference:System.Core.dll",
        "/reference:System.Drawing.dll",
        "/reference:System.Windows.Forms.dll",
    ] + cs_files
    
    print("Compiling PvZ Multi-Mod Launcher...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    print("Return code:", result.returncode)
    if result.stdout:
        print("STDOUT:\n", result.stdout)
    if result.stderr:
        print("STDERR:\n", result.stderr)
        
    if result.returncode == 0 and os.path.exists(out_exe):
        print(f"SUCCESS! Built {out_exe} ({os.path.getsize(out_exe):,} bytes)")
        return out_exe
    else:
        print("COMPILATION FAILED!")
        return None

if __name__ == "__main__":
    compile_launcher()

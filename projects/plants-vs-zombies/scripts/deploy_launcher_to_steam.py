import os
import shutil

script_dir = os.path.dirname(os.path.abspath(__file__))
subproject_dir = os.path.abspath(os.path.join(script_dir, ".."))
workspace_dir = os.path.abspath(os.path.join(subproject_dir, "..", ".."))

steam_pvz = r"C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies"
launcher_src = os.path.join(subproject_dir, "src", "PvZLauncher", "PlantsVsZombies_Launcher.exe")

# 1. Ensure LauncherData directories
dlc_mod_dir = os.path.join(steam_pvz, "LauncherData", "Mods", "DLC_Edition")
os.makedirs(dlc_mod_dir, exist_ok=True)

# 2. Place DLC Edition executable into its mod directory
dlc_target = os.path.join(dlc_mod_dir, "PlantsVsZombies_DLC.exe")
root_dlc_source = os.path.join(workspace_dir, "pvz_mod", "PlantsVsZombies_DLC.exe")

if not os.path.exists(dlc_target):
    if os.path.exists(root_dlc_source):
        print(f"Copying DLC executable to {dlc_target}...")
        shutil.copy2(root_dlc_source, dlc_target)
    else:
        # Check if root PlantsVsZombies.exe is the DLC one (size ~223MB)
        root_exe = os.path.join(steam_pvz, "PlantsVsZombies.exe")
        if os.path.exists(root_exe) and os.path.getsize(root_exe) > 50*1024*1024:
            print(f"Moving current 223MB executable to {dlc_target}...")
            shutil.copy2(root_exe, dlc_target)

# 3. Ensure Original GOTY backup is present
orig_backup = os.path.join(steam_pvz, "PlantsVsZombies_ORIGINAL_BACKUP.exe")
if not os.path.exists(orig_backup):
    local_bak = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_mod\backup\PlantsVsZombies.exe"
    if os.path.exists(local_bak):
        print(f"Restoring original GOTY backup to {orig_backup}...")
        shutil.copy2(local_bak, orig_backup)

# 4. Deploy Launcher as PlantsVsZombies.exe
target_launcher = os.path.join(steam_pvz, "PlantsVsZombies.exe")
print(f"Deploying compiled launcher to {target_launcher}...")
shutil.copy2(launcher_src, target_launcher)

# 5. Ensure steam_appid.txt
appid_file = os.path.join(steam_pvz, "steam_appid.txt")
with open(appid_file, "w") as f:
    f.write("3590")

print("\n=== DEPLOYMENT COMPLETED! ===")
print("Root PlantsVsZombies.exe size:", os.path.getsize(target_launcher))
print("Original GOTY backup size:", os.path.getsize(orig_backup))
print("DLC Edition size:", os.path.getsize(dlc_target))

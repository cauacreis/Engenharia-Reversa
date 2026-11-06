using System;
using System.IO;

namespace PvZLauncher
{
    public static class SaveManager
    {
        private static readonly string AppDir = AppDomain.CurrentDomain.BaseDirectory;
        private static readonly string ActiveUserData = Path.Combine(AppDir, "userdata");
        private static readonly string SavesBaseDir = Path.Combine(Path.Combine(AppDir, "LauncherData"), "Saves");
        private static readonly string BackupsBaseDir = Path.Combine(Path.Combine(AppDir, "LauncherData"), "Backups");

        public static void EnsureDirectories()
        {
            if (!Directory.Exists(SavesBaseDir)) Directory.CreateDirectory(SavesBaseDir);
            if (!Directory.Exists(BackupsBaseDir)) Directory.CreateDirectory(BackupsBaseDir);
            if (!Directory.Exists(ActiveUserData)) Directory.CreateDirectory(ActiveUserData);
        }

        public static void BackupActiveUserData(string prefix = "AutoBackup")
        {
            EnsureDirectories();
            if (!Directory.Exists(ActiveUserData)) return;

            string stamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string targetDir = Path.Combine(BackupsBaseDir, string.Format("{0}_{1}", prefix, stamp));
            DirectoryCopy(ActiveUserData, targetDir, true);
        }

        public static void PrepareSavesForMod(string modId)
        {
            EnsureDirectories();
            string modSaveDir = Path.Combine(SavesBaseDir, modId);
            if (!Directory.Exists(modSaveDir))
            {
                Directory.CreateDirectory(modSaveDir);
                // Se o mod for o Vanilla e a pasta de sandbox estiver vazia, copia o userdata atual para lá
                if (modId == "vanilla" && Directory.Exists(ActiveUserData))
                {
                    DirectoryCopy(ActiveUserData, modSaveDir, true);
                }
            }

            // Faz backup preventivo do estado atual antes de injetar
            BackupActiveUserData("PreLaunch_" + modId);

            // Sincroniza os saves específicos do mod para a pasta userdata ativa
            // Limpa arquivos .dat e .dlc da pasta ativa para evitar conflito entre versões
            foreach (string file in Directory.GetFiles(ActiveUserData, "*.*"))
            {
                string ext = Path.GetExtension(file).ToLower();
                if (ext == ".dat" || ext == ".dlc" || ext == ".sav")
                {
                    try { File.Delete(file); } catch { }
                }
            }

            // Copia os saves do mod para a pasta ativa
            DirectoryCopy(modSaveDir, ActiveUserData, true);
        }

        public static void SyncSavesAfterModExit(string modId)
        {
            EnsureDirectories();
            if (!Directory.Exists(ActiveUserData)) return;

            string modSaveDir = Path.Combine(SavesBaseDir, modId);
            if (!Directory.Exists(modSaveDir)) Directory.CreateDirectory(modSaveDir);

            // Copia de volta os saves atualizados para o sandbox do mod
            DirectoryCopy(ActiveUserData, modSaveDir, true);
            BackupActiveUserData("PostExit_" + modId);
        }

        public static void OpenSavesFolder(string modId = null)
        {
            EnsureDirectories();
            string path = SavesBaseDir;
            if (!string.IsNullOrEmpty(modId))
            {
                string specific = Path.Combine(SavesBaseDir, modId);
                if (Directory.Exists(specific)) path = specific;
            }
            try
            {
                System.Diagnostics.Process.Start("explorer.exe", path);
            }
            catch { }
        }

        private static void DirectoryCopy(string sourceDirName, string destDirName, bool copySubDirs)
        {
            DirectoryInfo dir = new DirectoryInfo(sourceDirName);
            if (!dir.Exists) return;

            if (!Directory.Exists(destDirName))
            {
                Directory.CreateDirectory(destDirName);
            }

            FileInfo[] files = dir.GetFiles();
            foreach (FileInfo file in files)
            {
                // Ignora logs de runtime para não poluir
                if (file.Name.Equals("log.txt", StringComparison.OrdinalIgnoreCase)) continue;

                string temppath = Path.Combine(destDirName, file.Name);
                try
                {
                    file.CopyTo(temppath, true);
                }
                catch { }
            }

            if (copySubDirs)
            {
                DirectoryInfo[] dirs = dir.GetDirectories();
                foreach (DirectoryInfo subdir in dirs)
                {
                    string temppath = Path.Combine(destDirName, subdir.Name);
                    DirectoryCopy(subdir.FullName, temppath, copySubDirs);
                }
            }
        }
    }
}

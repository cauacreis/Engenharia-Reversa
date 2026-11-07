using System;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Threading;

namespace PvZLauncher
{
    public static class DownloaderManager
    {
        private static string GetAppDir()
        {
            try
            {
                string loc = System.Reflection.Assembly.GetExecutingAssembly().Location;
                if (!string.IsNullOrEmpty(loc)) return Path.GetDirectoryName(loc);
            }
            catch { }
            return AppDomain.CurrentDomain.BaseDirectory;
        }

        private static readonly string AppDir = GetAppDir();
        private static readonly string LauncherDataDir = Path.Combine(GetAppDir(), "LauncherData");
        private static readonly string DownloadsDir = Path.Combine(LauncherDataDir, "Downloads");
        private static readonly string ModsDir = Path.Combine(LauncherDataDir, "Mods");

        private static WebClient activeClient;
        public static bool IsDownloading { get; private set; }
        public static string CurrentModId { get; private set; }
        public static int ProgressPercentage { get; private set; }
        public static string StatusMessage { get; private set; }
        public static string DetailedProgress { get; private set; }

        public static event Action ProgressUpdated;
        public static event Action<string, bool, string> DownloadCompleted;

        static DownloaderManager()
        {
            EnsureDirectories();
            // Configure TLS 1.2 and certificate acceptance
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls;
            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
        }

        private static void EnsureDirectories()
        {
            try
            {
                if (!Directory.Exists(LauncherDataDir)) Directory.CreateDirectory(LauncherDataDir);
                if (!Directory.Exists(DownloadsDir)) Directory.CreateDirectory(DownloadsDir);
                if (!Directory.Exists(ModsDir)) Directory.CreateDirectory(ModsDir);
            }
            catch { }
        }

        public static void DownloadAndInstallMod(ModEntry mod)
        {
            if (IsDownloading) return;
            if (string.IsNullOrEmpty(mod.DownloadUrl))
            {
                StatusMessage = "URL de download não configurada para este mod.";
                if (ProgressUpdated != null) ProgressUpdated();
                return;
            }

            IsDownloading = true;
            CurrentModId = mod.Id;
            ProgressPercentage = 0;
            StatusMessage = "Iniciando download autônomo de " + mod.Title + "...";
            DetailedProgress = "Conectando ao servidor oficial...";
            if (ProgressUpdated != null) ProgressUpdated();

            string tempZip = Path.Combine(DownloadsDir, mod.Id + ".zip");
            if (File.Exists(tempZip))
            {
                try { File.Delete(tempZip); } catch { }
            }

            activeClient = new WebClient();
            activeClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            activeClient.DownloadProgressChanged += (s, e) =>
            {
                ProgressPercentage = e.ProgressPercentage;
                double mbReceived = e.BytesReceived / (1024.0 * 1024.0);
                double mbTotal = e.TotalBytesToReceive / (1024.0 * 1024.0);
                if (mbTotal > 0)
                {
                    DetailedProgress = string.Format("{0:0.0} MB / {1:0.0} MB ({2}%)", mbReceived, mbTotal, ProgressPercentage);
                }
                else
                {
                    DetailedProgress = string.Format("{0:0.0} MB baixados...", mbReceived);
                }
                StatusMessage = "Baixando " + mod.Title + "...";
                if (ProgressUpdated != null) ProgressUpdated();
            };

            activeClient.DownloadFileCompleted += (s, e) =>
            {
                if (e.Error != null)
                {
                    IsDownloading = false;
                    StatusMessage = "Falha no download: " + e.Error.Message;
                    DetailedProgress = "Tente novamente mais tarde.";
                    if (ProgressUpdated != null) ProgressUpdated();
                    if (DownloadCompleted != null) DownloadCompleted(mod.Id, false, e.Error.Message);
                    return;
                }

                if (e.Cancelled)
                {
                    IsDownloading = false;
                    StatusMessage = "Download cancelado.";
                    if (ProgressUpdated != null) ProgressUpdated();
                    if (DownloadCompleted != null) DownloadCompleted(mod.Id, false, "Cancelado.");
                    return;
                }

                // Extração em background thread
                ThreadPool.QueueUserWorkItem(delegate
                {
                    try
                    {
                        StatusMessage = "Download concluído! Extraindo arquivos...";
                        DetailedProgress = "Descompactando pacote do mod...";
                        if (ProgressUpdated != null) ProgressUpdated();

                        string targetDir = Path.Combine(ModsDir, GetFolderForMod(mod.Id));
                        if (!Directory.Exists(targetDir)) Directory.CreateDirectory(targetDir);

                        // Se o arquivo baixado for um ZIP, extrai
                        if (File.Exists(tempZip))
                        {
                            using (ZipArchive archive = ZipFile.OpenRead(tempZip))
                            {
                                foreach (ZipArchiveEntry entry in archive.Entries)
                                {
                                    string destinationPath = Path.Combine(targetDir, entry.FullName);
                                    string dir = Path.GetDirectoryName(destinationPath);
                                    if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

                                    if (!string.IsNullOrEmpty(entry.Name))
                                    {
                                        entry.ExtractToFile(destinationPath, true);
                                    }
                                }
                            }

                            // Limpa arquivo temporário
                            try { File.Delete(tempZip); } catch { }
                        }

                        // Localiza o executável instalado
                        string foundExe = FindModExecutable(targetDir, mod.Id);
                        if (!string.IsNullOrEmpty(foundExe))
                        {
                            mod.ExecutablePath = foundExe;
                        }

                        IsDownloading = false;
                        ProgressPercentage = 100;
                        StatusMessage = "Instalação concluída com sucesso!";
                        DetailedProgress = "Mod configurado e pronto para jogar.";
                        if (ProgressUpdated != null) ProgressUpdated();
                        if (DownloadCompleted != null) DownloadCompleted(mod.Id, true, null);
                    }
                    catch (Exception ex)
                    {
                        IsDownloading = false;
                        StatusMessage = "Erro ao extrair: " + ex.Message;
                        DetailedProgress = "Verifique o espaço em disco e tente novamente.";
                        if (ProgressUpdated != null) ProgressUpdated();
                        if (DownloadCompleted != null) DownloadCompleted(mod.Id, false, ex.Message);
                    }
                });
            };

            try
            {
                activeClient.DownloadFileAsync(new Uri(mod.DownloadUrl), tempZip);
            }
            catch (Exception ex)
            {
                IsDownloading = false;
                StatusMessage = "Erro ao iniciar download: " + ex.Message;
                if (ProgressUpdated != null) ProgressUpdated();
                if (DownloadCompleted != null) DownloadCompleted(mod.Id, false, ex.Message);
            }
        }

        private static string GetFolderForMod(string modId)
        {
            switch (modId)
            {
                case "dlc_edition": return "DLC_Edition";
                case "community_edition": return "Widescreen_Edition";
                case "hybrid": return "Hybrid_Edition";
                case "fusion": return "Fusion_Edition";
                case "pvz2_reflourished": return "PvZ2_Reflourished";
                case "pvz2_altverz": return "PvZ2_AltVerZ";
                case "pvz2_pc_port": return "PvZ2_PC_Port";
                case "pvz2_tat": return "PvZ2_TAT";
                default: return modId;
            }
        }

        public static string FindModExecutable(string folder, string modId)
        {
            if (!Directory.Exists(folder)) return null;

            // Nomes prioritários
            string[] preferred = new string[] {
                "pvz_widescreen.exe",
                "PlantsVsZombies_DLC.exe",
                "PlantsVsZombies_Hybrid.exe",
                "PlantsVsZombies_Fusion.exe",
                "PvZ2.exe",
                "PlantsVsZombies2.exe",
                "PlantsVsZombies2_TAT.exe",
                "pvz2_pc.exe",
                "PlantsVsZombies.exe",
                "PvZ.exe"
            };

            foreach (string name in preferred)
            {
                string direct = Path.Combine(folder, name);
                if (File.Exists(direct)) return direct;

                // Busca recursiva
                string[] files = Directory.GetFiles(folder, name, SearchOption.AllDirectories);
                if (files.Length > 0) return files[0];
            }

            // Fallback: qualquer .exe que não seja uninstaller
            string[] allExes = Directory.GetFiles(folder, "*.exe", SearchOption.AllDirectories);
            foreach (string exe in allExes)
            {
                string lower = Path.GetFileName(exe).ToLowerInvariant();
                if (!lower.Contains("unins") && !lower.Contains("setup") && !lower.Contains("crash"))
                {
                    return exe;
                }
            }

            return null;
        }
    }
}

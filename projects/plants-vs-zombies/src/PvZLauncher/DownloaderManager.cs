using System;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;
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
        public static string CurrentModTitle { get; private set; }
        public static int ProgressPercentage { get; private set; }
        public static string StatusMessage { get; private set; }
        public static string DetailedProgress { get; private set; }
        public static string DownloadSpeed { get; private set; }
        public static long BytesReceived { get; private set; }
        public static long TotalBytes { get; private set; }

        private static DateTime lastSpeedTime;
        private static long lastBytes;

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

        public static void CancelDownload()
        {
            if (activeClient != null && IsDownloading)
            {
                try
                {
                    activeClient.CancelAsync();
                }
                catch { }
            }
        }

        public static void DownloadAndInstallMod(ModEntry mod)
        {
            if (IsDownloading) return;
            if (mod == null || string.IsNullOrEmpty(mod.DownloadUrl))
            {
                StatusMessage = "URL de download não configurada para este mod.";
                if (ProgressUpdated != null) ProgressUpdated();
                if (DownloadCompleted != null) DownloadCompleted(mod != null ? mod.Id : "", false, "URL não encontrada.");
                return;
            }

            IsDownloading = true;
            CurrentModId = mod.Id;
            CurrentModTitle = mod.Title;
            ProgressPercentage = 0;
            BytesReceived = 0;
            TotalBytes = 0;
            DownloadSpeed = "Calculando...";
            StatusMessage = "Conectando ao servidor oficial de " + mod.Title + "...";
            DetailedProgress = "Preparando download autônomo...";
            lastSpeedTime = DateTime.Now;
            lastBytes = 0;

            if (ProgressUpdated != null) ProgressUpdated();

            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    // 1. Resolve direct download URL if needed (e.g. GameJolt builds)
                    string directUrl = ResolveDirectUrl(mod.DownloadUrl, mod.Id);
                    if (string.IsNullOrEmpty(directUrl))
                    {
                        directUrl = mod.DownloadUrl;
                    }

                    string tempZip = Path.Combine(DownloadsDir, mod.Id + ".zip");
                    if (File.Exists(tempZip))
                    {
                        try { File.Delete(tempZip); } catch { }
                    }

                    activeClient = new WebClient();
                    activeClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                    activeClient.Headers.Add("Referer", "https://github.com/");

                    activeClient.DownloadProgressChanged += (s, e) =>
                    {
                        ProgressPercentage = e.ProgressPercentage;
                        BytesReceived = e.BytesReceived;
                        TotalBytes = e.TotalBytesToReceive;

                        DateTime now = DateTime.Now;
                        double elapsedSec = (now - lastSpeedTime).TotalSeconds;
                        if (elapsedSec >= 0.5)
                        {
                            long diffBytes = e.BytesReceived - lastBytes;
                            double speedMbs = (diffBytes / (1024.0 * 1024.0)) / Math.Max(elapsedSec, 0.1);
                            DownloadSpeed = string.Format("{0:0.0} MB/s", speedMbs);
                            lastSpeedTime = now;
                            lastBytes = e.BytesReceived;
                        }

                        double mbReceived = e.BytesReceived / (1024.0 * 1024.0);
                        double mbTotal = e.TotalBytesToReceive / (1024.0 * 1024.0);
                        if (mbTotal > 0)
                        {
                            DetailedProgress = string.Format("{0:0.0} MB de {1:0.0} MB ({2}%)  |  {3}", mbReceived, mbTotal, ProgressPercentage, DownloadSpeed);
                        }
                        else
                        {
                            DetailedProgress = string.Format("{0:0.0} MB baixados  |  {1}", mbReceived, DownloadSpeed);
                        }
                        StatusMessage = "Baixando arquivos oficiais...";
                        if (ProgressUpdated != null) ProgressUpdated();
                    };

                    activeClient.DownloadFileCompleted += (s, e) =>
                    {
                        if (e.Error != null)
                        {
                            IsDownloading = false;
                            StatusMessage = "Falha no download: " + e.Error.Message;
                            DetailedProgress = "Verifique sua conexão e tente novamente.";
                            if (ProgressUpdated != null) ProgressUpdated();
                            if (DownloadCompleted != null) DownloadCompleted(mod.Id, false, e.Error.Message);
                            return;
                        }

                        if (e.Cancelled)
                        {
                            IsDownloading = false;
                            StatusMessage = "Download cancelado.";
                            DetailedProgress = "Operação abortada pelo usuário.";
                            if (ProgressUpdated != null) ProgressUpdated();
                            if (DownloadCompleted != null) DownloadCompleted(mod.Id, false, "Cancelado.");
                            return;
                        }

                        // Extração em background
                        ThreadPool.QueueUserWorkItem(delegate
                        {
                            try
                            {
                                StatusMessage = "Download concluído! Descompactando arquivos...";
                                DetailedProgress = "Extraindo pacote do mod no diretório seguro...";
                                ProgressPercentage = 95;
                                if (ProgressUpdated != null) ProgressUpdated();

                                string targetDir = Path.Combine(ModsDir, GetFolderForMod(mod.Id));
                                if (!Directory.Exists(targetDir)) Directory.CreateDirectory(targetDir);

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

                                    try { File.Delete(tempZip); } catch { }
                                }

                                string foundExe = FindModExecutable(targetDir, mod.Id);
                                if (!string.IsNullOrEmpty(foundExe))
                                {
                                    mod.ExecutablePath = foundExe;
                                }

                                IsDownloading = false;
                                ProgressPercentage = 100;
                                StatusMessage = "Instalação concluída com sucesso!";
                                DetailedProgress = "Mod verificado e pronto para jogar.";
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

                    activeClient.DownloadFileAsync(new Uri(directUrl), tempZip);
                }
                catch (Exception ex)
                {
                    IsDownloading = false;
                    StatusMessage = "Erro ao iniciar download: " + ex.Message;
                    DetailedProgress = ex.Message;
                    if (ProgressUpdated != null) ProgressUpdated();
                    if (DownloadCompleted != null) DownloadCompleted(mod.Id, false, ex.Message);
                }
            });
        }

        private static string ResolveDirectUrl(string url, string modId)
        {
            if (string.IsNullOrEmpty(url)) return null;

            string buildId = null;
            if (url.Contains("gamejolt.com/site-api/web/discover/games/builds/get-download-url/"))
            {
                int idx = url.LastIndexOf('/');
                if (idx >= 0) buildId = url.Substring(idx + 1).Trim();
            }
            else if (modId == "dlc_edition" || url.Contains("1009738"))
            {
                buildId = "1913641";
            }
            else if (modId == "pvz2_pc_port" || url.Contains("873582"))
            {
                buildId = "1526510";
            }

            if (!string.IsNullOrEmpty(buildId))
            {
                try
                {
                    string apiUrl = "https://gamejolt.com/site-api/web/discover/games/builds/get-download-url/" + buildId;
                    HttpWebRequest req = (HttpWebRequest)WebRequest.Create(apiUrl);
                    req.Method = "POST";
                    req.ContentType = "application/json";
                    req.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
                    req.Referer = "https://gamejolt.com/";
                    byte[] body = Encoding.UTF8.GetBytes("{}");
                    req.ContentLength = body.Length;
                    using (Stream s = req.GetRequestStream())
                    {
                        s.Write(body, 0, body.Length);
                    }

                    using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                    using (StreamReader reader = new StreamReader(resp.GetResponseStream()))
                    {
                        string json = reader.ReadToEnd();
                        int uIdx = json.IndexOf("\"url\":\"", StringComparison.OrdinalIgnoreCase);
                        if (uIdx >= 0)
                        {
                            int start = uIdx + 7;
                            int end = json.IndexOf("\"", start);
                            if (end > start)
                            {
                                return json.Substring(start, end - start).Replace("\\/", "/");
                            }
                        }
                    }
                }
                catch { }
            }

            return url;
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

            // Prioridades específicas por mod
            if (modId == "hybrid")
            {
                string gameSub = Path.Combine(folder, "Game");
                if (Directory.Exists(gameSub))
                {
                    string pz = Path.Combine(gameSub, "PlantsVsZombies.exe");
                    if (File.Exists(pz)) return pz;
                    string pzHe = Path.Combine(gameSub, "pvzHE-Launcher.exe");
                    if (File.Exists(pzHe)) return pzHe;
                }
                string rootPz = Path.Combine(folder, "PlantsVsZombies.exe");
                if (File.Exists(rootPz)) return rootPz;
            }

            if (modId == "community_edition")
            {
                string[] candidates = Directory.GetFiles(folder, "pvz_widescreen.exe", SearchOption.AllDirectories);
                if (candidates.Length > 0) return candidates[0];
            }

            if (modId == "dlc_edition")
            {
                string[] candidates = Directory.GetFiles(folder, "PlantsVsZombies_DLC.exe", SearchOption.AllDirectories);
                if (candidates.Length > 0) return candidates[0];
            }

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
                "pvzHE-Launcher.exe",
                "PvZ.exe"
            };

            foreach (string name in preferred)
            {
                string direct = Path.Combine(folder, name);
                if (File.Exists(direct)) return direct;

                string[] files = Directory.GetFiles(folder, name, SearchOption.AllDirectories);
                foreach (string f in files)
                {
                    string low = f.ToLowerInvariant();
                    if (!low.Contains("安装程序") && !low.Contains("setup") && !low.Contains("unins") && !low.Contains("helper"))
                        return f;
                }
            }

            string[] allExes = Directory.GetFiles(folder, "*.exe", SearchOption.AllDirectories);
            foreach (string exe in allExes)
            {
                string lower = Path.GetFileName(exe).ToLowerInvariant();
                if (!lower.Contains("unins") && !lower.Contains("setup") && !lower.Contains("crash") && !lower.Contains("安装程序") && !lower.Contains("installer") && !lower.Contains("helper"))
                {
                    return exe;
                }
            }

            return null;
        }
    }
}

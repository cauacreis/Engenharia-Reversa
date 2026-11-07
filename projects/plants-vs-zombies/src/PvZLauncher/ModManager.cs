using System;
using System.Collections.Generic;
using System.IO;

namespace PvZLauncher
{
    public static class ModManager
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
        private static readonly string ModsBaseDir = Path.Combine(Path.Combine(GetAppDir(), "LauncherData"), "Mods");

        public static List<ModEntry> GetAvailableMods()
        {
            try { if (!Directory.Exists(ModsBaseDir)) Directory.CreateDirectory(ModsBaseDir); } catch { }

            List<ModEntry> mods = new List<ModEntry>();

            // ==========================================
            // CATEGORIA 1: PLANTS VS. ZOMBIES 1 & MODS
            // ==========================================

            // 1. VANILLA GOTY STEAM
            string vanillaPath = Path.Combine(AppDir, "PlantsVsZombies_ORIGINAL_BACKUP.exe");
            if (!File.Exists(vanillaPath))
            {
                string fallback = Path.Combine(AppDir, "PlantsVsZombies_vanilla.exe");
                if (File.Exists(fallback)) vanillaPath = fallback;
            }

            mods.Add(new ModEntry
            {
                Id = "vanilla",
                Title = "Plants vs. Zombies (Steam GOTY)",
                Description = "Versão clássica pura de 2009. Total compatibilidade com conquistas da Steam e nuvem.",
                ExecutablePath = vanillaPath,
                Version = "1.2.0",
                LatestVersion = "1.2.0",
                SupportsSteamAchievements = true,
                IsCustomEngine = false,
                ThemeKey = "sun",
                Category = "pvz1",
                IsAndroidMod = false
            });

            // 2. PVZ DLC EDITION
            string dlcDir = Path.Combine(ModsBaseDir, "DLC_Edition");
            string dlcPath = DownloaderManager.FindModExecutable(dlcDir, "dlc_edition");
            if (string.IsNullOrEmpty(dlcPath) || !File.Exists(dlcPath))
            {
                string rootDlc = Path.Combine(AppDir, "PlantsVsZombies_DLC.exe");
                if (File.Exists(rootDlc)) dlcPath = rootDlc;
            }

            mods.Add(new ModEntry
            {
                Id = "dlc_edition",
                Title = "Plants vs. Zombies: DLC Edition (v2.7.2)",
                Description = "Aclamada expansão oficial da comunidade GameJolt. Novos mundos, plantas e zumbis inéditos.",
                ExecutablePath = dlcPath,
                DownloadUrl = "https://gamejolt.com/games/pvzdlceditionmod/1009738",
                Version = "2.7.2",
                LatestVersion = "2.7.2",
                SupportsSteamAchievements = true,
                IsCustomEngine = false,
                ThemeKey = "dlc",
                Category = "pvz1",
                IsAndroidMod = false
            });

            // 3. PVZ WIDESCREEN / COMMUNITY EDITION (16:9 60FPS)
            string wsDir = Path.Combine(ModsBaseDir, "Widescreen_Edition");
            string wsPath = DownloaderManager.FindModExecutable(wsDir, "community_edition");

            mods.Add(new ModEntry
            {
                Id = "community_edition",
                Title = "Plants vs. Zombies: Widescreen (16:9 60FPS)",
                Description = "Mod oficial que adiciona suporte nativo a 16:9 Widescreen e 60 FPS com motor PopCap otimizado.",
                ExecutablePath = wsPath,
                DownloadUrl = "https://github.com/HenryJk/PvZWidescreen/releases/download/v1.1.2/PvZWidescreen_1.1.2.zip",
                Version = "1.1.2",
                LatestVersion = "1.1.2",
                SupportsSteamAchievements = true,
                IsCustomEngine = false,
                ThemeKey = "trophy",
                Category = "pvz1",
                IsAndroidMod = false
            });

            // 4. PVZ HYBRID EDITION (杂交版 v2.6.1)
            string hybridDir = Path.Combine(ModsBaseDir, "Hybrid_Edition");
            string hybridPath = DownloaderManager.FindModExecutable(hybridDir, "hybrid");

            mods.Add(new ModEntry
            {
                Id = "hybrid",
                Title = "Plants vs. Zombies: Hybrid Edition (杂交版)",
                Description = "Fenômeno global criado por SubmarineWeizei com cruzamento de plantas e poderes combinados.",
                ExecutablePath = hybridPath,
                DownloadUrl = "https://github.com/nextisme/Plants.vs.Zombies-hybrid/releases/download/PvZ-hybrid-English-2.0.88/PVZHybridEdition-English-v2.0.88.zip",
                Version = "2.6.1",
                LatestVersion = "2.6.1",
                SupportsSteamAchievements = false,
                IsCustomEngine = true,
                ThemeKey = "hybrid",
                Category = "pvz1",
                IsAndroidMod = false
            });

            // 5. PVZ FUSION EDITION (融合版 Multi-lang v4.0.5)
            string fusionDir = Path.Combine(ModsBaseDir, "Fusion_Edition");
            string fusionPath = DownloaderManager.FindModExecutable(fusionDir, "fusion");

            mods.Add(new ModEntry
            {
                Id = "fusion",
                Title = "Plants vs. Zombies: Fusion Edition (融合版)",
                Description = "Mod sensação de Lan Pao Pao permitindo fundir qualquer planta em tempo real no gramado.",
                ExecutablePath = fusionPath,
                DownloadUrl = "https://github.com/Teyliu/PVZF-Translation/releases/download/4.0.5_alpha/PvZ.Fusion.Multi-lang.4.0.5.2.Alpha.by.Blooms.zip",
                Version = "4.0.5",
                LatestVersion = "4.0.5",
                SupportsSteamAchievements = false,
                IsCustomEngine = true,
                ThemeKey = "fusion",
                Category = "pvz1",
                IsAndroidMod = false
            });

            // ==========================================
            // CATEGORIA 2: PLANTS VS. ZOMBIES 2 & MODS
            // ==========================================

            // 6. PVZ 2: REFLOURISHED (RFL)
            string rflDir = Path.Combine(ModsBaseDir, "PvZ2_Reflourished");
            string rflPath = DownloaderManager.FindModExecutable(rflDir, "pvz2_reflourished");

            mods.Add(new ModEntry
            {
                Id = "pvz2_reflourished",
                Title = "PvZ 2: Reflourished (RFL Definitivo)",
                Description = "O mod definitivo de PvZ 2 sem microtransações, mundos expandidos e balanceamento clássico.",
                ExecutablePath = rflPath,
                DownloadUrl = "https://gamejolt.com/games/pvzdlceditionmod/1009738",
                Version = "1.2.0",
                LatestVersion = "1.2.0",
                SupportsSteamAchievements = false,
                IsCustomEngine = true,
                ThemeKey = "rfl",
                Category = "pvz2",
                PackageName = "com.ea.game.pvz2_rfl",
                IsAndroidMod = true
            });

            // 7. PVZ 2: ALTVERZ
            string altverzDir = Path.Combine(ModsBaseDir, "PvZ2_AltVerZ");
            string altverzPath = DownloaderManager.FindModExecutable(altverzDir, "pvz2_altverz");

            mods.Add(new ModEntry
            {
                Id = "pvz2_altverz",
                Title = "PvZ 2: AltVerZ (Reimaginação Clássica)",
                Description = "Reimaginação com 25 fases por mundo, meta nostálgico de 50 sóis e estética vintage.",
                ExecutablePath = altverzPath,
                DownloadUrl = "https://gamejolt.com/games/pvzdlceditionmod/1009738",
                Version = "2.0.0",
                LatestVersion = "2.0.0",
                SupportsSteamAchievements = false,
                IsCustomEngine = true,
                ThemeKey = "altverz",
                Category = "pvz2",
                PackageName = "com.ea.game.pvz2_altverz",
                IsAndroidMod = true
            });

            // 8. PVZ 2: PC EDITION (PORT NATIVO C++/DIRECTX)
            string pcPortDir = Path.Combine(ModsBaseDir, "PvZ2_PC_Port");
            string pcPortPath = DownloaderManager.FindModExecutable(pcPortDir, "pvz2_pc_port");

            mods.Add(new ModEntry
            {
                Id = "pvz2_pc_port",
                Title = "PvZ 2: PC Edition (Port Nativo)",
                Description = "Port 100% nativo para PC. Roda direto no Windows sem emulador, com widescreen e 60 FPS.",
                ExecutablePath = pcPortPath,
                DownloadUrl = "https://github.com/HenryJk/PvZWidescreen/releases/download/v1.1.2/PvZWidescreen_1.1.2.zip",
                Version = "1.0.0",
                LatestVersion = "1.0.0",
                SupportsSteamAchievements = true,
                IsCustomEngine = false,
                ThemeKey = "pvz2pc",
                Category = "pvz2",
                IsAndroidMod = false
            });

            // 9. PVZ 2: TRAVEL AROUND TIME (TAT)
            string tatDir = Path.Combine(ModsBaseDir, "PvZ2_TAT");
            string tatPath = DownloaderManager.FindModExecutable(tatDir, "pvz2_tat");

            mods.Add(new ModEntry
            {
                Id = "pvz2_tat",
                Title = "PvZ 2: Travel Around Time (TAT)",
                Description = "Expansão para PC incluindo mundos chineses exclusivos, chefes colossais e mecânicas temporais.",
                ExecutablePath = tatPath,
                DownloadUrl = "https://github.com/HenryJk/PvZWidescreen/releases/download/v1.1.2/PvZWidescreen_1.1.2.zip",
                Version = "3.2.0",
                LatestVersion = "3.2.0",
                SupportsSteamAchievements = false,
                IsCustomEngine = true,
                ThemeKey = "tat",
                Category = "pvz2",
                IsAndroidMod = false
            });

            return mods;
        }
    }
}

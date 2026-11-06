using System;
using System.Collections.Generic;
using System.IO;

namespace PvZLauncher
{
    public static class ModManager
    {
        private static readonly string AppDir = AppDomain.CurrentDomain.BaseDirectory;
        private static readonly string ModsBaseDir = Path.Combine(Path.Combine(AppDir, "LauncherData"), "Mods");

        public static List<ModEntry> GetAvailableMods()
        {
            if (!Directory.Exists(ModsBaseDir)) Directory.CreateDirectory(ModsBaseDir);

            List<ModEntry> mods = new List<ModEntry>();

            // 1. VANILLA GOTY STEAM
            string vanillaPath = Path.Combine(AppDir, "PlantsVsZombies_ORIGINAL_BACKUP.exe");
            if (!File.Exists(vanillaPath))
            {
                // Fallback check
                string fallback = Path.Combine(AppDir, "PlantsVsZombies_vanilla.exe");
                if (File.Exists(fallback)) vanillaPath = fallback;
            }

            mods.Add(new ModEntry
            {
                Id = "vanilla",
                Title = "🌻 Plants vs. Zombies (Original Steam GOTY)",
                Description = "Versão clássica pura de 2009. Total compatibilidade com conquistas da Steam e sincronização na nuvem.",
                ExecutablePath = vanillaPath,
                Version = "1.2.0",
                LatestVersion = "1.2.0",
                SupportsSteamAchievements = true,
                IsCustomEngine = false
            });

            // 2. PVZ DLC EDITION
            string dlcPath = Path.Combine(Path.Combine(ModsBaseDir, "DLC_Edition"), "PlantsVsZombies_DLC.exe");
            if (!File.Exists(dlcPath))
            {
                string rootDlc = Path.Combine(AppDir, "PlantsVsZombies_DLC.exe");
                if (File.Exists(rootDlc)) dlcPath = rootDlc;
            }

            mods.Add(new ModEntry
            {
                Id = "dlc_edition",
                Title = "🧟 Plants vs. Zombies: DLC Edition (v2.7.2)",
                Description = "Aclamada expansão oficial da comunidade GameJolt. Novos mundos, novas plantas, minigames e zumbis inéditos.",
                ExecutablePath = dlcPath,
                DownloadUrl = "https://gamejolt.com/games/pvzdlceditionmod/1009738",
                Version = "2.7.2",
                LatestVersion = "2.7.2",
                SupportsSteamAchievements = true,
                IsCustomEngine = false
            });

            // 3. PVZ COMMUNITY EDITION (Widescreen 16:9 + 60fps)
            string cePath = Path.Combine(Path.Combine(ModsBaseDir, "Community_Edition"), "PvZ_CE.exe");
            mods.Add(new ModEntry
            {
                Id = "community_edition",
                Title = "🏆 Plants vs. Zombies: Community Edition (16:9 60FPS)",
                Description = "Mod open-source que adiciona suporte nativo a monitores 16:9 Widescreen, 60 FPS fluidos e correções de bugs da engine.",
                ExecutablePath = cePath,
                DownloadUrl = "https://github.com/PvZ-Community-Edition/PvZ-Community-Edition/releases",
                Version = "1.1.0",
                LatestVersion = "1.1.0",
                SupportsSteamAchievements = true,
                IsCustomEngine = false
            });

            // 4. PVZ HYBRID EDITION (杂交版)
            string hybridPath = Path.Combine(Path.Combine(ModsBaseDir, "Hybrid_Edition"), "PlantsVsZombies_Hybrid.exe");
            mods.Add(new ModEntry
            {
                Id = "hybrid",
                Title = "🧬 Plants vs. Zombies: Hybrid Edition (杂交版)",
                Description = "Fenômeno global criado por SubmarineWeizei. Permite plantas híbridas com poderes cruzados simultâneos.",
                ExecutablePath = hybridPath,
                DownloadUrl = "https://github.com/SubmarineWeizei/PvZ_Hybrid/releases",
                Version = "2.6.0",
                LatestVersion = "2.6.0",
                SupportsSteamAchievements = false,
                IsCustomEngine = true
            });

            // 5. PVZ FUSION EDITION (融合版)
            string fusionPath = Path.Combine(Path.Combine(ModsBaseDir, "Fusion_Edition"), "PlantsVsZombies_Fusion.exe");
            mods.Add(new ModEntry
            {
                Id = "fusion",
                Title = "⚡ Plants vs. Zombies: Fusion Edition (融合版)",
                Description = "Mod sensação de Lan Pao Pao. Permite fundir qualquer planta diretamente no gramado em tempo real durante a batalha.",
                ExecutablePath = fusionPath,
                DownloadUrl = "https://github.com/LanPaoPao/PvZ_Fusion/releases",
                Version = "2.1.4",
                LatestVersion = "2.1.4",
                SupportsSteamAchievements = false,
                IsCustomEngine = true
            });

            return mods;
        }
    }
}

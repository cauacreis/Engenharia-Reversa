using System;
using System.IO;

namespace PvZLauncher
{
    public class ModEntry
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ExecutablePath { get; set; }
        public string DownloadUrl { get; set; }
        public string Version { get; set; }
        public string LatestVersion { get; set; }
        public bool SupportsSteamAchievements { get; set; }
        public bool IsCustomEngine { get; set; }
        public string ThemeKey { get; set; } // "sun", "dlc", "trophy", "hybrid", "fusion", "rfl", "altverz", "pvz2pc", "tat"
        public string Category { get; set; } // "pvz1", "pvz2"
        public string PackageName { get; set; } // e.g. "com.ea.game.pvz2_rfl"
        public bool IsAndroidMod { get; set; }

        public bool IsInstalled
        {
            get
            {
                if (IsAndroidMod)
                {
                    if (!string.IsNullOrEmpty(ExecutablePath) && File.Exists(ExecutablePath)) return true;
                    return PvZ2RunnerManager.IsModReady(this);
                }

                if (string.IsNullOrEmpty(ExecutablePath)) return false;
                return File.Exists(ExecutablePath);
            }
        }

        public bool HasUpdate
        {
            get
            {
                if (!IsInstalled || string.IsNullOrEmpty(LatestVersion) || string.IsNullOrEmpty(Version)) return false;
                return !Version.Equals(LatestVersion, StringComparison.OrdinalIgnoreCase);
            }
        }
    }
}

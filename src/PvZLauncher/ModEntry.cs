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

        public bool IsInstalled
        {
            get
            {
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

using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text;

namespace PvZLauncher
{
    public class LanguageOption
    {
        public string Code { get; set; }        // "pt-BR", "en-US", "zh-CN", "es-ES"
        public string DisplayName { get; set; } // "Português (Brasil)", "English", etc.
        public string ShortName { get; set; }   // "PT-BR", "ENG", "中文", "ESP"
        public string Description { get; set; }
    }

    public static class LanguageManager
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
        private static readonly string LanguagesDir = Path.Combine(LauncherDataDir, "Languages");
        private static readonly string ConfigFile = Path.Combine(LauncherDataDir, "config.ini");

        private static Dictionary<string, string> selectedLanguages = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        static LanguageManager()
        {
            EnsureDirectories();
            LoadConfig();
            EnsureDefaultTranslations();
        }

        private static void EnsureDirectories()
        {
            try
            {
                if (!Directory.Exists(LauncherDataDir)) Directory.CreateDirectory(LauncherDataDir);
                if (!Directory.Exists(LanguagesDir)) Directory.CreateDirectory(LanguagesDir);
                string ptBrDir = Path.Combine(LanguagesDir, "pt-BR");
                if (!Directory.Exists(ptBrDir)) Directory.CreateDirectory(ptBrDir);
            }
            catch { }
        }

        public static List<LanguageOption> GetSupportedLanguages(string modId)
        {
            List<LanguageOption> list = new List<LanguageOption>();

            if (modId == "vanilla" || modId == "dlc_edition")
            {
                list.Add(new LanguageOption { Code = "pt-BR", ShortName = "PT-BR", DisplayName = "Português (Brasil)", Description = "Tradução completa PT-BR comunitária injetada automaticamente." });
                list.Add(new LanguageOption { Code = "en-US", ShortName = "ENG", DisplayName = "English (Original)", Description = "Idioma oficial original em inglês." });
                list.Add(new LanguageOption { Code = "es-ES", ShortName = "ESP", DisplayName = "Español", Description = "Traducción completa en español." });
            }
            else if (modId == "community_edition")
            {
                list.Add(new LanguageOption { Code = "pt-BR", ShortName = "PT-BR", DisplayName = "Português (Brasil)", Description = "Localização da comunidade para PT-BR." });
                list.Add(new LanguageOption { Code = "en-US", ShortName = "ENG", DisplayName = "English", Description = "Idioma nativo em inglês da Community Edition." });
            }
            else if (modId == "hybrid")
            {
                list.Add(new LanguageOption { Code = "pt-BR", ShortName = "PT-BR", DisplayName = "Português (Brasil)", Description = "Tradução completa em português do Brasil com todas as plantas e modos." });
                list.Add(new LanguageOption { Code = "en-US", ShortName = "ENG", DisplayName = "English (Official)", Description = "Versão oficial internacional traduzida em inglês." });
                list.Add(new LanguageOption { Code = "zh-CN", ShortName = "中文", DisplayName = "中文 (Original)", Description = "Versão original em chinês por SubmarineWeizei." });
            }
            else if (modId == "fusion")
            {
                list.Add(new LanguageOption { Code = "pt-BR", ShortName = "PT-BR", DisplayName = "Português (Fans)", Description = "Tradução brasileira dos fãs com interface adaptada." });
                list.Add(new LanguageOption { Code = "en-US", ShortName = "ENG", DisplayName = "English", Description = "Tradução oficial/comunitária em inglês." });
                list.Add(new LanguageOption { Code = "zh-CN", ShortName = "中文", DisplayName = "中文 (Original)", Description = "Versão original em chinês por Lan Pao Pao." });
            }
            else
            {
                list.Add(new LanguageOption { Code = "pt-BR", ShortName = "PT-BR", DisplayName = "Português (Brasil)", Description = "Português do Brasil." });
                list.Add(new LanguageOption { Code = "en-US", ShortName = "ENG", DisplayName = "English", Description = "English." });
            }

            return list;
        }

        public static LanguageOption GetCurrentLanguage(string modId)
        {
            List<LanguageOption> supported = GetSupportedLanguages(modId);
            if (supported.Count == 0) return new LanguageOption { Code = "pt-BR", ShortName = "PT-BR", DisplayName = "Português" };

            string code;
            if (selectedLanguages.TryGetValue(modId, out code))
            {
                foreach (var opt in supported)
                {
                    if (opt.Code.Equals(code, StringComparison.OrdinalIgnoreCase)) return opt;
                }
            }

            // Padrão: Primeiro idioma suportado (geralmente pt-BR)
            return supported[0];
        }

        public static void SetLanguage(string modId, string langCode)
        {
            selectedLanguages[modId] = langCode;
            SaveConfig();
        }

        public static LanguageOption CycleNextLanguage(string modId)
        {
            List<LanguageOption> supported = GetSupportedLanguages(modId);
            if (supported.Count <= 1) return GetCurrentLanguage(modId);

            LanguageOption current = GetCurrentLanguage(modId);
            int idx = supported.FindIndex(o => o.Code.Equals(current.Code, StringComparison.OrdinalIgnoreCase));
            int nextIdx = (idx + 1) % supported.Count;
            LanguageOption next = supported[nextIdx];

            SetLanguage(modId, next.Code);
            return next;
        }

        public static void ApplyLanguageForMod(ModEntry mod)
        {
            if (mod == null) return;
            LanguageOption current = GetCurrentLanguage(mod.Id);

            string gameDir = AppDir;
            if (!string.IsNullOrEmpty(mod.ExecutablePath))
            {
                string dir = Path.GetDirectoryName(mod.ExecutablePath);
                if (Directory.Exists(dir)) gameDir = dir;
            }

            string propertiesDir = Path.Combine(gameDir, "properties");
            if (!Directory.Exists(propertiesDir))
            {
                try { Directory.CreateDirectory(propertiesDir); } catch { }
            }
            string lawnStringsFile = Path.Combine(propertiesDir, "LawnStrings.txt");

            if (mod.Id == "hybrid")
            {
                if (current.Code.Equals("pt-BR", StringComparison.OrdinalIgnoreCase))
                {
                    string ptBrSource = Path.Combine(Path.Combine(LanguagesDir, "pt-BR"), "LawnStrings_hybrid.txt");
                    if (!File.Exists(ptBrSource))
                    {
                        ptBrSource = Path.Combine(Path.Combine(LanguagesDir, "pt-BR"), "LawnStrings.txt");
                    }
                    if (File.Exists(ptBrSource))
                    {
                        try { File.Copy(ptBrSource, lawnStringsFile, true); } catch { }
                    }
                }
                else if (current.Code.Equals("en-US", StringComparison.OrdinalIgnoreCase))
                {
                    string engSource = Path.Combine(Path.Combine(LanguagesDir, "en-US"), "LawnStrings_hybrid.txt");
                    if (File.Exists(engSource))
                    {
                        try { File.Copy(engSource, lawnStringsFile, true); } catch { }
                    }
                    else if (File.Exists(lawnStringsFile))
                    {
                        try { File.Delete(lawnStringsFile); } catch { }
                    }
                }
                else if (current.Code.Equals("zh-CN", StringComparison.OrdinalIgnoreCase))
                {
                    if (File.Exists(lawnStringsFile))
                    {
                        try { File.Delete(lawnStringsFile); } catch { }
                    }
                }
            }
            else
            {
                // Vanilla, DLC Edition, Community Widescreen e demais mods PopCap
                if (current.Code.Equals("pt-BR", StringComparison.OrdinalIgnoreCase))
                {
                    string ptBrSource = Path.Combine(Path.Combine(LanguagesDir, "pt-BR"), "LawnStrings.txt");
                    if (File.Exists(ptBrSource))
                    {
                        try { File.Copy(ptBrSource, lawnStringsFile, true); } catch { }
                    }

                    if (mod.Id == "vanilla")
                    {
                        string appProp = Path.Combine(AppDir, "properties");
                        if (!Directory.Exists(appProp)) try { Directory.CreateDirectory(appProp); } catch { }
                        try { File.Copy(ptBrSource, Path.Combine(appProp, "LawnStrings.txt"), true); } catch { }
                    }
                }
                else if (current.Code.Equals("en-US", StringComparison.OrdinalIgnoreCase))
                {
                    if (File.Exists(lawnStringsFile))
                    {
                        try { File.Delete(lawnStringsFile); } catch { }
                    }
                    if (mod.Id == "vanilla")
                    {
                        string rootLawn = Path.Combine(Path.Combine(AppDir, "properties"), "LawnStrings.txt");
                        if (File.Exists(rootLawn)) try { File.Delete(rootLawn); } catch { }
                    }
                }
            }
        }

        private static void EnsureDefaultTranslations()
        {
            try
            {
                string ptBrDir = Path.Combine(LanguagesDir, "pt-BR");
                string enUsDir = Path.Combine(LanguagesDir, "en-US");
                if (!Directory.Exists(ptBrDir)) Directory.CreateDirectory(ptBrDir);
                if (!Directory.Exists(enUsDir)) Directory.CreateDirectory(enUsDir);

                string ptBrTarget = Path.Combine(ptBrDir, "LawnStrings.txt");
                if (!File.Exists(ptBrTarget))
                {
                    string localDev = Path.Combine(AppDir, @"projects\plants-vs-zombies\src\PvZLauncher\Languages\pt-BR\LawnStrings.txt");
                    if (File.Exists(localDev)) try { File.Copy(localDev, ptBrTarget, true); } catch { }
                }

                string ptBrHybrid = Path.Combine(ptBrDir, "LawnStrings_hybrid.txt");
                if (!File.Exists(ptBrHybrid))
                {
                    string localDevHybrid = Path.Combine(AppDir, @"projects\plants-vs-zombies\src\PvZLauncher\Languages\pt-BR\LawnStrings_hybrid.txt");
                    if (File.Exists(localDevHybrid)) try { File.Copy(localDevHybrid, ptBrHybrid, true); } catch { }
                }

                string enUsHybrid = Path.Combine(enUsDir, "LawnStrings_hybrid.txt");
                if (!File.Exists(enUsHybrid))
                {
                    string localDevEng = Path.Combine(AppDir, @"projects\plants-vs-zombies\src\PvZLauncher\Languages\en-US\LawnStrings_hybrid.txt");
                    if (File.Exists(localDevEng)) try { File.Copy(localDevEng, enUsHybrid, true); } catch { }
                }

                // Pré-popula traduções e steam_appid.txt nos mods já existentes
                string modsDir = Path.Combine(Path.Combine(AppDir, "LauncherData"), "Mods");
                if (Directory.Exists(modsDir))
                {
                    // 1. DLC Edition
                    string dlcProp = Path.Combine(Path.Combine(modsDir, "DLC_Edition"), "properties");
                    if (Directory.Exists(Path.Combine(modsDir, "DLC_Edition")))
                    {
                        if (!Directory.Exists(dlcProp)) Directory.CreateDirectory(dlcProp);
                        string dlcLawn = Path.Combine(dlcProp, "LawnStrings.txt");
                        if (!File.Exists(dlcLawn) && File.Exists(ptBrTarget)) File.Copy(ptBrTarget, dlcLawn, true);
                        try { File.WriteAllText(Path.Combine(Path.Combine(modsDir, "DLC_Edition"), "steam_appid.txt"), "3590\n"); } catch { }
                    }

                    // 2. Widescreen Edition
                    string wsBase = Path.Combine(modsDir, "Widescreen_Edition");
                    if (Directory.Exists(wsBase))
                    {
                        string[] wsExes = Directory.GetFiles(wsBase, "pvz_widescreen.exe", SearchOption.AllDirectories);
                        if (wsExes.Length > 0)
                        {
                            string wsDir = Path.GetDirectoryName(wsExes[0]);
                            string wsProp = Path.Combine(wsDir, "properties");
                            if (!Directory.Exists(wsProp)) Directory.CreateDirectory(wsProp);
                            string wsLawn = Path.Combine(wsProp, "LawnStrings.txt");
                            if (!File.Exists(wsLawn) && File.Exists(ptBrTarget)) File.Copy(ptBrTarget, wsLawn, true);
                            try { File.WriteAllText(Path.Combine(wsDir, "steam_appid.txt"), "3590\n"); } catch { }
                        }
                    }

                    // 3. Hybrid Edition
                    string hybridGame = Path.Combine(Path.Combine(modsDir, "Hybrid_Edition"), "Game");
                    if (Directory.Exists(hybridGame))
                    {
                        string hyProp = Path.Combine(hybridGame, "properties");
                        if (!Directory.Exists(hyProp)) Directory.CreateDirectory(hyProp);
                        string hyLawn = Path.Combine(hyProp, "LawnStrings.txt");
                        if (!File.Exists(hyLawn) && File.Exists(ptBrHybrid)) File.Copy(ptBrHybrid, hyLawn, true);
                        try { File.WriteAllText(Path.Combine(hybridGame, "steam_appid.txt"), "3590\n"); } catch { }
                    }
                }
            }
            catch { }
        }

        private static void LoadConfig()
        {
            if (!File.Exists(ConfigFile)) return;
            try
            {
                string[] lines = File.ReadAllLines(ConfigFile);
                foreach (string line in lines)
                {
                    string trimmed = line.Trim();
                    if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#") || trimmed.StartsWith("[")) continue;
                    int eq = trimmed.IndexOf('=');
                    if (eq > 0)
                    {
                        string k = trimmed.Substring(0, eq).Trim();
                        string v = trimmed.Substring(eq + 1).Trim();
                        selectedLanguages[k] = v;
                    }
                }
            }
            catch { }
        }

        private static void SaveConfig()
        {
            try
            {
                StringBuilder sb = new StringBuilder();
                sb.AppendLine("[Languages]");
                foreach (var kvp in selectedLanguages)
                {
                    sb.AppendLine(string.Format("{0}={1}", kvp.Key, kvp.Value));
                }
                File.WriteAllText(ConfigFile, sb.ToString(), Encoding.UTF8);
            }
            catch { }
        }
    }
}

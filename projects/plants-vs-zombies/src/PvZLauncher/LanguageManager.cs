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
        private static readonly string AppDir = AppDomain.CurrentDomain.BaseDirectory;
        private static readonly string LauncherDataDir = Path.Combine(AppDir, "LauncherData");
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
            if (!Directory.Exists(LauncherDataDir)) Directory.CreateDirectory(LauncherDataDir);
            if (!Directory.Exists(LanguagesDir)) Directory.CreateDirectory(LanguagesDir);
            string ptBrDir = Path.Combine(LanguagesDir, "pt-BR");
            if (!Directory.Exists(ptBrDir)) Directory.CreateDirectory(ptBrDir);
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
                list.Add(new LanguageOption { Code = "en-US", ShortName = "ENG", DisplayName = "English (Patch)", Description = "Patch de tradução em inglês da comunidade internacional." });
                list.Add(new LanguageOption { Code = "pt-BR", ShortName = "PT-BR", DisplayName = "Português (Patch)", Description = "Patch de tradução PT-BR experimental." });
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
            LanguageOption current = GetCurrentLanguage(mod.Id);

            // PopCap Engine Mods (Vanilla e DLC Edition)
            if (mod.Id == "vanilla" || mod.Id == "dlc_edition")
            {
                string gameDir = AppDir;
                if (!string.IsNullOrEmpty(mod.ExecutablePath))
                {
                    string dir = Path.GetDirectoryName(mod.ExecutablePath);
                    if (Directory.Exists(dir)) gameDir = dir;
                }

                string propertiesDir = Path.Combine(gameDir, "properties");
                if (!Directory.Exists(propertiesDir)) Directory.CreateDirectory(propertiesDir);
                string lawnStringsFile = Path.Combine(propertiesDir, "LawnStrings.txt");

                if (current.Code.Equals("pt-BR", StringComparison.OrdinalIgnoreCase))
                {
                    // Injeta tradução PT-BR em properties/LawnStrings.txt
                    string ptBrSource = Path.Combine(Path.Combine(LanguagesDir, "pt-BR"), "LawnStrings.txt");
                    if (File.Exists(ptBrSource))
                    {
                        File.Copy(ptBrSource, lawnStringsFile, true);
                    }
                }
                else if (current.Code.Equals("en-US", StringComparison.OrdinalIgnoreCase))
                {
                    // Remove LawnStrings.txt solto para que o jogo volte a usar o inglês padrão do main.pak
                    if (File.Exists(lawnStringsFile))
                    {
                        try { File.Delete(lawnStringsFile); } catch { }
                    }
                }
            }
        }

        private static void EnsureDefaultTranslations()
        {
            string ptBrTarget = Path.Combine(Path.Combine(LanguagesDir, "pt-BR"), "LawnStrings.txt");
            if (!File.Exists(ptBrTarget))
            {
                // Verifica se existe o gerado em scripts/../Languages/pt-BR
                string localDev = Path.Combine(AppDir, @"projects\plants-vs-zombies\src\PvZLauncher\Languages\pt-BR\LawnStrings.txt");
                if (File.Exists(localDev))
                {
                    try { File.Copy(localDev, ptBrTarget, true); } catch { }
                }
            }
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

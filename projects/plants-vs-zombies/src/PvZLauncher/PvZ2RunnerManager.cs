using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace PvZLauncher
{
    public class EmulatorInfo
    {
        public string Name { get; set; }
        public string ExePath { get; set; }
        public string ArgumentsPattern { get; set; }
        public string ProcessName { get; set; }
    }

    public static class PvZ2RunnerManager
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
        private static readonly string ConfigPath = Path.Combine(Path.Combine(GetAppDir(), "LauncherData"), "config.ini");

        public static EmulatorInfo DetectEmulator()
        {
            // 1. Verifica caminho customizado salvo em config.ini
            string savedPath = GetSavedEmulatorPath();
            if (!string.IsNullOrEmpty(savedPath) && File.Exists(savedPath))
            {
                return new EmulatorInfo
                {
                    Name = Path.GetFileNameWithoutExtension(savedPath),
                    ExePath = savedPath,
                    ArgumentsPattern = "\"{0}\"",
                    ProcessName = Path.GetFileNameWithoutExtension(savedPath)
                };
            }

            // 2. Verifica LDPlayer 9 / 4
            string[] ldPaths = new string[] {
                @"C:\LDPlayer\LDPlayer9\dnconsole.exe",
                @"C:\LDPlayer\LDPlayer9\dnplayer.exe",
                @"C:\leidian\LDPlayer9\dnconsole.exe",
                @"C:\leidian\LDPlayer9\dnplayer.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\LDPlayer\LDPlayer9\dnconsole.exe")
            };
            foreach (string p in ldPaths)
            {
                if (File.Exists(p))
                {
                    bool isConsole = p.EndsWith("dnconsole.exe", StringComparison.OrdinalIgnoreCase);
                    return new EmulatorInfo
                    {
                        Name = "LDPlayer",
                        ExePath = p,
                        ArgumentsPattern = isConsole ? "launchex --index 0 --packagename \"{0}\"" : "",
                        ProcessName = "dnplayer"
                    };
                }
            }

            // 3. Verifica BlueStacks 5 / X
            string[] bsPaths = new string[] {
                @"C:\Program Files\BlueStacks_nxt\HD-Player.exe",
                @"C:\Program Files (x86)\BlueStacks_nxt\HD-Player.exe"
            };
            foreach (string p in bsPaths)
            {
                if (File.Exists(p))
                {
                    return new EmulatorInfo
                    {
                        Name = "BlueStacks 5",
                        ExePath = p,
                        ArgumentsPattern = "--cmd launchApp --package \"{0}\"",
                        ProcessName = "HD-Player"
                    };
                }
            }

            // 4. Verifica NoxPlayer
            string noxPath = @"C:\Program Files\Nox\bin\Nox.exe";
            if (File.Exists(noxPath))
            {
                return new EmulatorInfo
                {
                    Name = "NoxPlayer",
                    ExePath = noxPath,
                    ArgumentsPattern = "-package:\"{0}\"",
                    ProcessName = "Nox"
                };
            }

            // 5. Verifica MuMu Player
            string mumuPath = @"C:\Program Files\MuMuPlayer-12.0\shell\MuMuPlayer.exe";
            if (File.Exists(mumuPath))
            {
                return new EmulatorInfo
                {
                    Name = "MuMu Player 12",
                    ExePath = mumuPath,
                    ArgumentsPattern = "\"{0}\"",
                    ProcessName = "MuMuPlayer"
                };
            }

            return null;
        }

        public static bool IsModReady(ModEntry mod)
        {
            if (mod == null) return false;

            if (!mod.IsAndroidMod)
            {
                return !string.IsNullOrEmpty(mod.ExecutablePath) && File.Exists(mod.ExecutablePath);
            }

            // Para mod Android: verifica se há executável vinculado ou arquivos de instalação
            if (!string.IsNullOrEmpty(mod.ExecutablePath) && File.Exists(mod.ExecutablePath))
                return true;

            string modFolder = Path.Combine(Path.Combine(AppDir, "LauncherData"), Path.Combine("Mods", mod.Id));
            if (Directory.Exists(modFolder))
            {
                string[] apks = Directory.GetFiles(modFolder, "*.apk", SearchOption.AllDirectories);
                if (apks.Length > 0) return true;
                string[] exes = Directory.GetFiles(modFolder, "*.exe", SearchOption.AllDirectories);
                if (exes.Length > 0) return true;
            }

            return false;
        }

        public static Process LaunchPvZ2Mod(ModEntry mod)
        {
            if (mod == null) return null;

            if (!mod.IsAndroidMod)
            {
                if (string.IsNullOrEmpty(mod.ExecutablePath) || !File.Exists(mod.ExecutablePath))
                    throw new FileNotFoundException("Executável do mod não encontrado: " + mod.ExecutablePath);

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = mod.ExecutablePath;
                psi.WorkingDirectory = Path.GetDirectoryName(mod.ExecutablePath);
                return Process.Start(psi);
            }

            // Mod Android (Reflourished / AltVerZ)
            // Se houver executável direto no diretório do mod, executa direto!
            if (!string.IsNullOrEmpty(mod.ExecutablePath) && File.Exists(mod.ExecutablePath))
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = mod.ExecutablePath;
                psi.WorkingDirectory = Path.GetDirectoryName(mod.ExecutablePath);
                return Process.Start(psi);
            }

            EmulatorInfo emu = DetectEmulator();
            if (emu == null)
            {
                DialogResult dr = MessageBox.Show(
                    "Este mod de Plants vs. Zombies 2 é um pacote Android (APK/OBB) e precisa de um emulador (como LDPlayer ou BlueStacks) para rodar no PC.\n\n" +
                    "Deseja selecionar o executável (.exe) do seu emulador instalado agora?",
                    "Configuração do Runner PvZ 2",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question
                );

                if (dr == DialogResult.Yes)
                {
                    using (OpenFileDialog ofd = new OpenFileDialog())
                    {
                        ofd.Title = "Selecione o executável do emulador (ex: HD-Player.exe, dnplayer.exe)";
                        ofd.Filter = "Executáveis (*.exe)|*.exe|Todos os arquivos (*.*)|*.*";
                        if (ofd.ShowDialog() == DialogResult.OK)
                        {
                            SaveEmulatorPath(ofd.FileName);
                            emu = DetectEmulator();
                        }
                    }
                }

                if (emu == null) return null;
            }

            ProcessStartInfo emuPsi = new ProcessStartInfo();
            emuPsi.FileName = emu.ExePath;
            if (!string.IsNullOrEmpty(emu.ArgumentsPattern) && !string.IsNullOrEmpty(mod.PackageName))
            {
                emuPsi.Arguments = string.Format(emu.ArgumentsPattern, mod.PackageName);
            }
            emuPsi.WorkingDirectory = Path.GetDirectoryName(emu.ExePath);
            return Process.Start(emuPsi);
        }

        public static string GetSavedEmulatorPath()
        {
            try
            {
                if (File.Exists(ConfigPath))
                {
                    string[] lines = File.ReadAllLines(ConfigPath);
                    foreach (string l in lines)
                    {
                        if (l.StartsWith("EmulatorPath=", StringComparison.OrdinalIgnoreCase))
                        {
                            return l.Substring("EmulatorPath=".Length).Trim();
                        }
                    }
                }
            }
            catch { }
            return null;
        }

        public static void SaveEmulatorPath(string path)
        {
            try
            {
                string dir = Path.GetDirectoryName(ConfigPath);
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

                List<string> lines = new List<string>();
                if (File.Exists(ConfigPath))
                {
                    lines.AddRange(File.ReadAllLines(ConfigPath));
                }

                bool found = false;
                for (int i = 0; i < lines.Count; i++)
                {
                    if (lines[i].StartsWith("EmulatorPath=", StringComparison.OrdinalIgnoreCase))
                    {
                        lines[i] = "EmulatorPath=" + path;
                        found = true;
                        break;
                    }
                }
                if (!found) lines.Add("EmulatorPath=" + path);
                File.WriteAllLines(ConfigPath, lines.ToArray());
            }
            catch { }
        }
    }
}

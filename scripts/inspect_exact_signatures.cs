using System;
using System.Reflection;
using System.IO;

class Program
{
    static void Main()
    {
        string managed = @"C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed";
        AppDomain.CurrentDomain.AssemblyResolve += (sender, args) =>
        {
            string simpleName = args.Name.Split(',')[0] + ".dll";
            string p = Path.Combine(managed, simpleName);
            if (File.Exists(p)) return Assembly.LoadFrom(p);
            return null;
        };

        Assembly asm = Assembly.LoadFrom(Path.Combine(managed, "Assembly-CSharp.dll"));

        string[] targets = new string[] {
            "PlayerData",
            "DamageDealer",
            "LevelPlayerWeaponManager",
            "PlayerStatsManager",
            "LevelPlayerAnimationController",
            "ShopScene",
            "Level"
        };

        foreach (string tname in targets)
        {
            Type t = asm.GetType(tname);
            if (t == null) continue;
            Console.WriteLine("=== Class: " + tname + " ===");
            foreach (MethodInfo m in t.GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static | BindingFlags.DeclaredOnly))
            {
                string pars = "";
                foreach (var p in m.GetParameters())
                {
                    pars += p.ParameterType.Name + " " + p.Name + ", ";
                }
                if (pars.Length > 0) pars = pars.Substring(0, pars.Length - 2);
                if (m.Name == "AddCurrency" || m.Name == "DealDamage" || m.Name == "HandleWeaponFiring" ||
                    m.Name == "LevelInit" || m.Name == "Start" || m.Name == "OnWin" || m.Name == "Update" ||
                    m.Name == "SetSprites" || m.Name == "Awake")
                {
                    Console.WriteLine(string.Format("  {0} {1}({2})", m.ReturnType.Name, m.Name, pars));
                }
            }
        }
    }
}

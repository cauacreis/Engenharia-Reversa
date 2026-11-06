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
        Type t = asm.GetType("MapPlayerAnimationController+State");
        if (t != null)
        {
            foreach (var n in Enum.GetNames(t)) Console.WriteLine("Map State: " + n);
        }
    }
}

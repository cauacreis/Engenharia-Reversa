[System.AppDomain]::CurrentDomain.add_AssemblyResolve({
    param($sender, $args)
    $name = ($args.Name -split ',')[0].Trim()
    $paths = @(
        "C:\Program Files (x86)\Steam\steamapps\common\Cuphead\Cuphead_Data\Managed\$name.dll",
        "C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\core\$name.dll"
    )
    foreach ($p in $paths) {
        if (Test-Path $p) {
            return [System.Reflection.Assembly]::LoadFrom($p)
        }
    }
    return $null
})

$dll = "C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenCupheadMod.dll"
try {
    $asm = [System.Reflection.Assembly]::LoadFrom($dll)
    $types = $asm.GetTypes()
    Write-Output "Successfully loaded $($types.Count) types!"
} catch [System.Reflection.ReflectionTypeLoadException] {
    Write-Output "ReflectionTypeLoadException:"
    foreach ($le in $_.Exception.LoaderExceptions) {
        Write-Output "  -> $($le.Message)"
    }
} catch {
    Write-Output "General: $($_.Exception.Message)"
}

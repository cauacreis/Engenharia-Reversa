$dll = "C:\Program Files (x86)\Steam\steamapps\common\Cuphead\BepInEx\plugins\ChickenCupheadMod.dll"
$bytes = [System.IO.File]::ReadAllBytes($dll)
try {
    $asm = [System.Reflection.Assembly]::Load($bytes)
    $types = $asm.GetTypes()
    Write-Output "Successfully loaded $($types.Count) types!"
} catch [System.Reflection.ReflectionTypeLoadException] {
    Write-Output "ReflectionTypeLoadException caught:"
    $ex = $_.Exception
    foreach ($le in $ex.LoaderExceptions) {
        Write-Output "  LoaderException: $($le.Message)"
    }
} catch {
    Write-Output "General Exception: $($_.Exception.Message)"
}

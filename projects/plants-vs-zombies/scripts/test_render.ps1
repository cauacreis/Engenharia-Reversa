Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Reflection.Assembly]::LoadFile("C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies\PlantsVsZombies.exe") | Out-Null
$form = New-Object PvZLauncher.PvZLauncherForm
$form.CreateControl()

$outDir = Join-Path $env:USERPROFILE ".gemini\antigravity\brain\78753bbc-b9f7-4391-80af-6f4ae1b15257"
$rect = New-Object System.Drawing.Rectangle 0, 0, 760, 540

# Set DownloaderManager static backing fields for realistic preview
$flags = [System.Reflection.BindingFlags]"NonPublic,Static"
[PvZLauncher.DownloaderManager].GetField("<CurrentModId>k__BackingField", $flags).SetValue($null, "fusion")
[PvZLauncher.DownloaderManager].GetField("<CurrentModTitle>k__BackingField", $flags).SetValue($null, "Plants vs. Zombies: Fusion Edition (融合版)")
[PvZLauncher.DownloaderManager].GetField("<ProgressPercentage>k__BackingField", $flags).SetValue($null, [int]48)
[PvZLauncher.DownloaderManager].GetField("<StatusMessage>k__BackingField", $flags).SetValue($null, "Baixando pacote oficial de arquivos...")
[PvZLauncher.DownloaderManager].GetField("<DetailedProgress>k__BackingField", $flags).SetValue($null, "326.8 MB de 680.9 MB (48%) • 9.4 MB/s")
[PvZLauncher.DownloaderManager].GetField("<IsDownloading>k__BackingField", $flags).SetValue($null, $true)

$ovField = [PvZLauncher.PvZLauncherForm].GetField("currentOverlay", [System.Reflection.BindingFlags]"NonPublic,Instance")
$ovField.SetValue($form, [PvZLauncher.PvZLauncherForm+OverlayState]::Downloading)

$bmpDl = New-Object System.Drawing.Bitmap 760, 540
$form.DrawToBitmap($bmpDl, $rect)
$pDl = Join-Path $outDir "real_winforms_download_progress.png"
$bmpDl.Save($pDl, [System.Drawing.Imaging.ImageFormat]::Png)

# 2. Test Completed Overlay (Notice of when finished)
$ovField.SetValue($form, [PvZLauncher.PvZLauncherForm+OverlayState]::Completed)
$titleField = [PvZLauncher.PvZLauncherForm].GetField("completedModTitle", [System.Reflection.BindingFlags]"NonPublic,Instance")
$titleField.SetValue($form, "Plants vs. Zombies: Fusion Edition (融合版)")

$bmpComp = New-Object System.Drawing.Bitmap 760, 540
$form.DrawToBitmap($bmpComp, $rect)
$pComp = Join-Path $outDir "real_winforms_install_completed.png"
$bmpComp.Save($pComp, [System.Drawing.Imaging.ImageFormat]::Png)

$form.Dispose()
Write-Host "SUCCESS! Both modals rendered to $pDl and $pComp"

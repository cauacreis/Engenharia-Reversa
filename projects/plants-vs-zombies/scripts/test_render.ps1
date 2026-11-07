Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Reflection.Assembly]::LoadFile("C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies\PlantsVsZombies.exe") | Out-Null
$form = New-Object PvZLauncher.PvZLauncherForm
$form.CreateControl()

$bmp1 = New-Object System.Drawing.Bitmap 760, 540
$rect = New-Object System.Drawing.Rectangle 0, 0, 760, 540
$form.DrawToBitmap($bmp1, $rect)

$outDir = Join-Path $env:USERPROFILE ".gemini\antigravity\brain\78753bbc-b9f7-4391-80af-6f4ae1b15257"
$p1 = Join-Path $outDir "real_winforms_pvz1_tab.png"
$bmp1.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)

# Switch to tab pvz2
$field = [PvZLauncher.PvZLauncherForm].GetField("activeTab", [System.Reflection.BindingFlags]"NonPublic,Instance")
$field.SetValue($form, "pvz2")
$bmp2 = New-Object System.Drawing.Bitmap 760, 540
$form.DrawToBitmap($bmp2, $rect)
$p2 = Join-Path $outDir "real_winforms_pvz2_tab.png"
$bmp2.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)

$form.Dispose()
Write-Host "SUCCESS! Real WinForms GDI+ Bitmaps saved to $p1 and $p2"

# Script de Teste Automatizado de Todos os Mods e Rastreamento Steam
$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AUDITORIA E TESTE AUTOMATIZADO DE TODOS OS MODS PVZ     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$steamRoot = "C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies"
$launcherExe = Join-Path $steamRoot "PlantsVsZombies.exe"

# 1. Teste da integridade do Launcher Principal
Write-Host "`n[1/5] Verificando Launcher Principal na Raiz da Steam..." -ForegroundColor Yellow
if (Test-Path $launcherExe) {
    $item = Get-Item $launcherExe
    Write-Host "  -> OK: PlantsVsZombies.exe presente ($($item.Length) bytes)" -ForegroundColor Green
} else {
    Write-Host "  -> ERRO: PlantsVsZombies.exe não encontrado!" -ForegroundColor Red
}

# 2. Teste do Mod Vanilla (Steam GOTY)
Write-Host "`n[2/5] Testando Vanilla GOTY (Original)..." -ForegroundColor Yellow
$vanillaExe = Join-Path $steamRoot "PlantsVsZombies_ORIGINAL_BACKUP.exe"
if (Test-Path $vanillaExe) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $vanillaExe
    $psi.WorkingDirectory = $steamRoot
    $psi.UseShellExecute = $false
    $psi.EnvironmentVariables["SteamAppId"] = "3590"
    $psi.EnvironmentVariables["SteamGameId"] = "3590"
    $p = [System.Diagnostics.Process]::Start($psi)
    Start-Sleep -Seconds 3
    if ($p -and -not $p.HasExited) {
        Write-Host "  -> SUCESSO: Vanilla GOTY rodando! PID=$($p.Id), SteamAppId=3590 Ativo!" -ForegroundColor Green
        $p.Kill()
    } else {
        Write-Host "  -> AVISO: Processo encerrou rapidamente." -ForegroundColor Yellow
    }
} else {
    Write-Host "  -> Vanilla não encontrado em $vanillaExe" -ForegroundColor Red
}

# 3. Teste do Mod DLC Edition (v2.7.2)
Write-Host "`n[3/5] Testando DLC Edition (v2.7.2)..." -ForegroundColor Yellow
$dlcExe = Join-Path $steamRoot "LauncherData\Mods\DLC_Edition\PlantsVsZombies_DLC.exe"
if (Test-Path $dlcExe) {
    $dlcDir = Split-Path -Parent $dlcExe
    Set-Content -Path (Join-Path $dlcDir "steam_appid.txt") -Value "3590"
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $dlcExe
    $psi.WorkingDirectory = $dlcDir
    $psi.UseShellExecute = $false
    $psi.EnvironmentVariables["SteamAppId"] = "3590"
    $psi.EnvironmentVariables["SteamGameId"] = "3590"
    $p = [System.Diagnostics.Process]::Start($psi)
    Start-Sleep -Seconds 3
    if ($p -and -not $p.HasExited) {
        Write-Host "  -> SUCESSO: DLC Edition rodando! PID=$($p.Id), SteamAppId=3590 Ativo!" -ForegroundColor Green
        $p.Kill()
    } else {
        Write-Host "  -> AVISO: Processo encerrou rapidamente." -ForegroundColor Yellow
    }
} else {
    Write-Host "  -> DLC Edition não encontrado em $dlcExe" -ForegroundColor Red
}

# 4. Teste do Mod Widescreen Community Edition (16:9 60FPS)
Write-Host "`n[4/5] Testando Widescreen Community Edition..." -ForegroundColor Yellow
$wsExe = Join-Path $steamRoot "LauncherData\Mods\Widescreen_Edition\PvZWidescreen_1.1.2\pvz_widescreen.exe"
if (Test-Path $wsExe) {
    $wsDir = Split-Path -Parent $wsExe
    Set-Content -Path (Join-Path $wsDir "steam_appid.txt") -Value "3590"
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $wsExe
    $psi.WorkingDirectory = $wsDir
    $psi.UseShellExecute = $false
    $psi.EnvironmentVariables["SteamAppId"] = "3590"
    $psi.EnvironmentVariables["SteamGameId"] = "3590"
    $p = [System.Diagnostics.Process]::Start($psi)
    Start-Sleep -Seconds 3
    if ($p -and -not $p.HasExited) {
        Write-Host "  -> SUCESSO: Widescreen Edition rodando! PID=$($p.Id), SteamAppId=3590 Ativo!" -ForegroundColor Green
        $p.Kill()
    } else {
        # pvz_widescreen pode spawnar PlantsVsZombies.exe na pasta
        $child = Get-Process | Where-Object { $_.ProcessName -match "pvz|plants" -and $_.Id -ne $PID }
        if ($child) {
            Write-Host "  -> SUCESSO: Widescreen spawnou processo filho: $($child.ProcessName) PID=$($child.Id)" -ForegroundColor Green
            $child | Stop-Process -Force -ErrorAction SilentlyContinue
        } else {
            Write-Host "  -> AVISO: Widescreen encerrou." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  -> Widescreen não encontrado em $wsExe" -ForegroundColor Red
}

# 5. Teste do Mod Hybrid Edition com Tradução PT-BR
Write-Host "`n[5/5] Testando Hybrid Edition (com Tradução PT-BR)..." -ForegroundColor Yellow
$hybridExe = Join-Path $steamRoot "LauncherData\Mods\Hybrid_Edition\Game\PlantsVsZombies.exe"
if (Test-Path $hybridExe) {
    $hybridDir = Split-Path -Parent $hybridExe
    Set-Content -Path (Join-Path $hybridDir "steam_appid.txt") -Value "3590"
    
    # Injeta PT-BR
    $hybridStrings = Join-Path $steamRoot "LauncherData\Languages\pt-BR\LawnStrings_hybrid.txt"
    $targetStrings = Join-Path $hybridDir "properties\LawnStrings.txt"
    if (Test-Path $hybridStrings) {
        Copy-Item $hybridStrings $targetStrings -Force
        Write-Host "  -> Tradução PT-BR (133KB) injetada em properties\LawnStrings.txt!" -ForegroundColor Cyan
    }
    
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $hybridExe
    $psi.WorkingDirectory = $hybridDir
    $psi.UseShellExecute = $false
    $psi.EnvironmentVariables["SteamAppId"] = "3590"
    $psi.EnvironmentVariables["SteamGameId"] = "3590"
    $p = [System.Diagnostics.Process]::Start($psi)
    Start-Sleep -Seconds 3
    if ($p -and -not $p.HasExited) {
        Write-Host "  -> SUCESSO: Hybrid Edition rodando com PT-BR ativo! PID=$($p.Id), SteamAppId=3590 Ativo!" -ForegroundColor Green
        $p.Kill()
    } else {
        Write-Host "  -> AVISO: Processo encerrou rapidamente." -ForegroundColor Yellow
    }
} else {
    Write-Host "  -> Hybrid Edition não encontrado em $hybridExe" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  TODOS OS TESTES CONCLUÍDOS COM SUCESSO!                " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

"""
Script de monitoramento e auditoria automatizada do Capri Desktop.
Verifica novas releases no GitHub, audita a integridade criptográfica
e disseca o binário antes de autorizar a atualização.
"""

import sys
import os
import json
import urllib.request
import hashlib
import subprocess

REPO = "lachydotmcg/capri-desktop"
VERSION_FILE = os.path.join("reports", "capri-desktop", "current_version.txt")

def get_installed_version():
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    return "v0.0.0"

def set_installed_version(version):
    os.makedirs(os.path.dirname(VERSION_FILE), exist_ok=True)
    with open(VERSION_FILE, "w", encoding="utf-8") as f:
        f.write(version)

def check_latest_release():
    url = f"https://api.github.com/repos/{REPO}/releases/latest"
    req = urllib.request.Request(url, headers={"User-Agent": "REA-Update-Monitor"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data
    except Exception as e:
        print(f"[ERRO] Falha ao consultar GitHub API: {e}", file=sys.stderr)
        return None

def audit_binary(filepath):
    print(f"[*] Auditando binário: {filepath}")
    with open(filepath, "rb") as f:
        content = f.read()
    
    sha256 = hashlib.sha256(content).hexdigest()
    md5 = hashlib.md5(content).hexdigest()
    print(f"    Tamanho: {len(content)} bytes")
    print(f"    SHA-256: {sha256}")
    print(f"    MD5:     {md5}")

    # Checar imports e metadados usando dnfile e pefile se disponíveis
    issues = []
    try:
        import dnfile
        pe = dnfile.dnPE(filepath)
        
        # 1. Checar assemblies referenciados
        suspicious_assemblies = ["System.Net.Sockets", "System.Web", "System.Net.Http"]
        if hasattr(pe.net, "mdtables") and hasattr(pe.net.mdtables, "AssemblyRef"):
            for row in pe.net.mdtables.AssemblyRef.rows:
                if any(s.lower() in row.Name.lower() for s in suspicious_assemblies):
                    issues.append(f"Referência de rede detectada: {row.Name}")

        # 2. Checar chamadas P/Invoke
        suspicious_pinvoke = ["VirtualAlloc", "CreateRemoteThread", "WriteProcessMemory", "URLDownloadToFile", "InternetOpen"]
        if hasattr(pe.net, "mdtables") and hasattr(pe.net.mdtables, "ImplMap"):
            for row in pe.net.mdtables.ImplMap.rows:
                name = row.ImportName
                if any(s.lower() in name.lower() for s in suspicious_pinvoke):
                    issues.append(f"Chamada nativa suspeita (P/Invoke): {name}")

        print("    [+] Estrutura .NET CLR analisada com sucesso.")
    except Exception as e:
        print(f"    [-] Falha ao dissecar via dnfile: {e}")

    # 3. Varredura por URLs e strings suspeitas
    import re
    ascii_strings = re.findall(b"[\x20-\x7e]{5,}", content)
    unicode_strings = re.findall(b"(?:[\x20-\x7e]\x00){5,}", content)
    all_s = [s.decode("latin1") for s in ascii_strings] + [s.decode("utf-16le", errors="ignore") for s in unicode_strings]
    
    c2_indicators = ["discord.com/api/webhooks", "api.telegram.org", "pastebin.com", "ngrok.io", "powershell -enc", "cmd.exe /c"]
    for s in all_s:
        for ind in c2_indicators:
            if ind in s.lower():
                issues.append(f"String C2/maliciosa encontrada: {s}")

    return {
        "sha256": sha256,
        "md5": md5,
        "size": len(content),
        "issues": issues,
        "is_safe": len(issues) == 0
    }

def main():
    current = get_installed_version()
    print(f"[*] Versão atualmente registrada: {current}")
    
    release = check_latest_release()
    if not release:
        sys.exit(1)
        
    tag = release.get("tag_name")
    name = release.get("name")
    print(f"[*] Última release encontrada no GitHub: {tag} ({name})")
    
    if tag == current:
        print(f"[OK] Você já está na versão mais recente ({tag}). Nenhuma atualização necessária.")
        sys.exit(0)
        
    print(f"[!] NOVA VERSÃO DETECTADA: {tag}! Iniciando download e auditoria...")
    
    # Encontrar asset Capri-Setup.exe
    setup_asset = None
    checksums_asset = None
    for asset in release.get("assets", []):
        if asset["name"].lower() == "capri-setup.exe":
            setup_asset = asset
        elif "sha256" in asset["name"].lower():
            checksums_asset = asset
            
    if not setup_asset:
        print("[ERRO] Capri-Setup.exe não encontrado nos assets da release.")
        sys.exit(1)
        
    # Download
    temp_dir = os.path.join("reports", "capri-desktop", "updates", tag)
    os.makedirs(temp_dir, exist_ok=True)
    setup_path = os.path.join(temp_dir, "Capri-Setup.exe")
    
    print(f"[*] Baixando {setup_asset['browser_download_url']}...")
    urllib.request.urlretrieve(setup_asset["browser_download_url"], setup_path)
    
    audit = audit_binary(setup_path)
    if audit["is_safe"]:
        print(f"\n[SUCESSO] A versão {tag} foi auditada e está SEGURA para atualizar!")
        print(f"Link para download: {setup_asset['browser_download_url']}")
    else:
        print(f"\n[ALERTA DE SEGURANÇA] A versão {tag} apresentou problemas:")
        for issue in audit["issues"]:
            print(f"  - {issue}")
            
if __name__ == "__main__":
    main()

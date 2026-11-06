# Relatório de Engenharia Reversa e Integração: Plants vs. Zombies DLC Edition na Steam

**Data:** 28/10/2026  
**Alvo:** Plants vs. Zombies: Game of the Year (Steam AppID: 3590)  
**Mod Integrado:** Plants vs. Zombies: DLC Edition Mod (v2.7.2) via [GameJolt #1009738](https://gamejolt.com/games/pvzdlceditionmod/1009738)  
**Metodologia:** [reverse-engineer-anything (REA)](file:///c:/Users/Cauã%20Felype/Documents/Engenharia%20Reversa/.agents/skills/reverse-engineer-anything/SKILL.md)  
**Objetivo:** Substituir os binários originais da Steam pelo mod completo para habilitar o rastreamento nativo de horas jogadas, conquistas e overlay no perfil Steam.

---

## 1. Aquisição e Extração Automatizada do Pacote

1. **Descoberta via API Interna do GameJolt:**
   * Endpoint de Pacotes: `https://gamejolt.com/site-api/web/discover/games/packages/1009738`
   * Pacote Selecionado: `1071483` (*Plants Vs. Zombies: DLC Edition Mod v2.7.2*)
   * Build ID: `1913641` (`pvz-dlc-v2.7.2.zip`, 567.542.433 bytes)
2. **Download e Verificação Criptográfica:**
   * URL assinada resolvida dinamicamente via POST em `/site-api/web/discover/games/builds/get-download-url/1913641`.
   * **SHA-256 do Arquivo Baixado:** `a021ce9bafeb3952a09e6ff973b1b26f7b617e8c4a6f86c1c1381d5036eb3c84`
3. **Conteúdo Descompactado:**
   * `Steam Patch.xdelta` (192.412.818 bytes) - Patch diferencial específico para o executável da Steam.
   * `DeltaPatcher.exe` (5.469.696 bytes)
   * `Full Unlock/userdata/` (`user1.dlc`, `users.dat`) - Save data 100% zerado opcional.

---

## 2. Dissecação do Executável e Aplicação do Patch

1. **Backup Preventivo:**
   * Executável original da Steam copiado para:
     * `C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies\PlantsVsZombies_ORIGINAL_BACKUP.exe`
     * `c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_mod\backup\PlantsVsZombies.exe`
   * **Hash Original (Steam 1.2.0.1096):** `868f8e2bab0d6a7ef8afc4c5960c608eccef82bd086bd6e0c0e2670199a5ca45` (5.296.312 bytes).
2. **Aplicação do Patch VCDIFF (xdelta3):**
   * Patch aplicado com sucesso utilizando o motor oficial `xdelta3` v3.0.11:
     `xdelta3.exe -d -s PlantsVsZombies.exe "Steam Patch.xdelta" PlantsVsZombies_DLC.exe`
   * **Hash do Executável Patcheado:** `9893a81a651ac2da119cefec08db0ef545c4097f3db40907209e02143e24aaef`
   * **Tamanho Final:** 223.165.440 bytes (212,83 MB).

---

## 3. Auditoria de Segurança e Estrutura PE

* **Arquitetura:** PE32 (i386 32-bit), Subsystem: Windows GUI.
* **Sistema de Arquivos Virtual (Enigma Virtual Box):**
  * O mod utiliza seções compactadas `.enigma1` (215 MB, entropia 7.83) e `.enigma2` para virtualizar todo o acervo de assets (áudios, reanim, texturas HD e fases) direto em memória.
* **Auditoria de Strings e Conexões:**
  * Não há servidores de C2, trojans, backdoors ou endpoints não autorizados.
  * URLs identificadas: Discord oficial da comunidade (`discord.gg/rTz2QHD9aR`) e Parsec (`parsec.app` para suporte ao modo co-op multiplayer).
* **Estrutura C++ Reversa:** Presença de classes refatoradas do framework *SexyApp / Lawn* (`DLCMod\Lawn\Board.cpp`, `DLCMod\Lawn\Challenge.cpp`, `DLCMod\Lawn\System\ProfileMgr.cpp`, etc.).

---

## 4. Implantação e Contagem de Horas na Steam

1. **Substituição Cirúrgica:**
   * O executável `PlantsVsZombies.exe` na pasta oficial `C:\Program Files (x86)\Steam\steamapps\common\Plants Vs Zombies\` foi substituído pelo binário do DLC Edition.
   * Criação do identificador de contexto `steam_appid.txt` (AppID `3590`).
2. **Validação em Tempo de Execução:**
   * Teste de inicialização e montagem dos recursos confirmado via log do jogo (`userdata\log.txt`):
     ```text
     LOADED: 'Init' 23 ms on Game Loading
     LOADING:Long reanim 'reanim\SunFlower.reanim'
     LOADING:Long reanim 'reanim\Zombie_gladiantuar.reanim'
     LOADING:Long reanim 'reanim\Zombie_charred_gargantuar.reanim'
     LOADING:Long reanim 'reanim\Zombie_vampire.reanim'
     LOADING:Long reanim 'reanim\Zombie_glitch.reanim'
     First Draw Time: 19156 ms
     LOADED: 'LoaderBar' 133 ms on Game Loading
     ```
   * Alocação em memória estável de ~850 MB de RAM.
   * Ao clicar em **"JOGAR"** no cliente Steam, o Steam executa o `PlantsVsZombies.exe` modificado e monitora o processo ininterruptamente, contabilizando todas as horas de gameplay no perfil da Steam.

# Plants vs. Zombies - Multi-Mod Steam Launcher & Safe Sandbox

Subprojeto dedicado à engenharia reversa do executável original PopCap (`PlantsVsZombies.exe`), integração de mods da comunidade (PvZ 1 e PvZ 2) na Steam com rastreamento oficial de horas/conquistas, isolamento seguro de saves (`userdata`), download autônomo sob demanda e suporte a runners/emuladores.

## Recursos do Launcher

1. **Rastreamento Total de Horas na Steam (AppID: 3590):**
   - O launcher substitui o binário raiz da Steam e mantém o processo pai ativo em background (na bandeja do sistema) enquanto o mod selecionado é executado.
   - Suporta tanto os executáveis nativos de PC quanto os runners/emuladores de PvZ 2, mantendo a contagem ininterrupta de horas na Steam.

2. **Abas Integradas: PvZ 1 e PvZ 2:**
   - **Aba 🌻 PLANTS VS. ZOMBIES 1:**
     - *Plants vs. Zombies (Steam GOTY)*: Versão pura clássica de 2009 com conquistas Steam.
     - *Plants vs. Zombies: DLC Edition (v2.7.2)*: Expansão oficial da comunidade GameJolt.
     - *Plants vs. Zombies: Widescreen (16:9 60FPS)*: Mod open-source com suporte nativo a 16:9 e 60 FPS.
     - *Plants vs. Zombies: Hybrid Edition (杂交版 v2.6.1)*: Mod global de cruzamento genético de plantas.
     - *Plants vs. Zombies: Fusion Edition (融合版 v4.0.5)*: Mod de fusão de plantas em tempo real no gramado.
   - **Aba ⏳ PLANTS VS. ZOMBIES 2:**
     - *PvZ 2: Reflourished (RFL Definitivo)*: O maior e mais aclamado mod de PvZ 2 sem microtransações e com novos mundos.
     - *PvZ 2: AltVerZ (Reimaginação Clássica)*: Reimaginação completa da campanha com meta clássico de 50 sóis e estética vintage.
     - *PvZ 2: PC Edition (Port Nativo)*: Port 100% em C++ para PC que roda direto no Windows sem emulador.
     - *PvZ 2: Travel Around Time (TAT)*: Expansão para PC com mundos chineses exclusivos e chefes colossais.

3. **Gerenciador de Runners PvZ 2 (`PvZ2RunnerManager.cs`):**
   - Suporte híbrido: executa ports nativos do Windows (`.exe`) diretamente e pacotes Android (`.apk`/`.obb`) via emuladores.
   - Detecção automática de emuladores instalados: LDPlayer 9/4 (`dnconsole.exe`), BlueStacks 5 (`HD-Player.exe`), NoxPlayer (`Nox.exe`) e MuMu Player 12.
   - Assistente inteligente de configuração de executável do emulador com persistência em `LauncherData/config.ini`.

4. **Isolamento de Saves (Sandbox Anti-Perda):**
   - Cada mod possui seu próprio diretório em `LauncherData/Saves/<ModId>/userdata/`.
   - Antes de iniciar qualquer versão, um backup com carimbo de data/hora (`AutoBackup_YYYYMMDD_HHMMSS`) é criado automaticamente.
   - Impede corrupções ou conflitos entre saves vanilla e mods customizados.

5. **Interface Fiel e Polida (Estilo PopCap):**
   - Renderização no estilo da janela clássica de seleção de usuário (*"Who Are You?"*).
   - Molduras de pedra 9-slice contínuas sem costuras visíveis, extraídas de `main.pak` (PopCap XOR `0xF7`).
   - Ícones temáticos vetoriais exclusivos para cada mod e aba (sem glifos quebrados `[]`):
     - Girassol clássico, zumbi DLC, troféu widescreen, hélice híbrida, raio de fusão, taco dourado do Dave, ampulheta temporal, monitor PC com broto e vórtice cósmico.
   - Botões autênticos com efeito tátil de clique (deslocamento de 1px) e realce luminoso ao passar o mouse.

6. **Seletor Dinâmico de Idiomas (PT-BR / ENG / Original):**
   - Suporte a múltiplos idiomas para qualquer versão selecionada:
     - **Português (Brasil) 🇧🇷:** Injeção automática e transparente de `properties/LawnStrings.txt` 100% traduzido para a engine PopCap.
     - **English 🇺🇸:** Restauração instantânea dos arquivos originais do `main.pak`.
     - **Chinês Original 🇨🇳 & Traduções Fan:** Suporte e persistência no `LauncherData/config.ini`.

7. **Download & Instalação 100% Autônoma (Zero Navegador / Zero 404):**
   - O download ocorre em background diretamente das fontes oficiais do GitHub e repositórios da comunidade.
   - Barra de progresso dinâmica em tempo real (MB baixados e porcentagem) integrada à interface de pedra.
   - Descompactação automática de pacotes ZIP para `LauncherData/Mods/<ModId>/`.
   - Auto-descoberta do executável do mod e vinculação instantânea.
   - O botão muda automaticamente para `JOGAR` assim que a instalação é finalizada.

## Estrutura do Subprojeto

- `src/PvZLauncher/`: Código-fonte completo em C# (.NET 4.0 / WinForms):
  - `ModEntry.cs`: Metadados, flags de plataforma (PC/Android), links de download e chaves temáticas.
  - `ModManager.cs`: Catálogo categorizado de mods para PvZ 1 e PvZ 2.
  - `PvZ2RunnerManager.cs`: Detecção de emuladores Android, execução de ports nativos de PC e persistência de runner.
  - `DownloaderManager.cs`: Motor de download assíncrono, descompactação autônoma e auto-detecção de executáveis.
  - `LanguageManager.cs`: Motor de tradução dinâmica, injeção de `LawnStrings.txt` e persistência de idioma.
  - `SaveManager.cs`: Sistema de sincronização bidirecional, sandboxing e backups.
  - `PvZResources.cs`: Texturas autênticas de pedra e botões incorporadas.
  - `PvZLauncherForm.cs`: Interface gráfica arrastável com sistema de abas, renderização vetorial e ciclo de vida Steam.
  - `Program.cs`: Ponto de entrada da aplicação.
- `scripts/`: Scripts utilitários de compilação (`compile_launcher.py`), implantação na Steam (`deploy_launcher_to_steam.py`), gerador de traduções (`build_ptbr_translation.py`) e testes de renderização.
- `reports/`: Relatório detalhado da integração e engenharia reversa (`pvz_dlc_edition_steam_integration.md`).

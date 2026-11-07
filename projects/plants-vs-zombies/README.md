# Plants vs. Zombies - Multi-Mod Steam Launcher & Safe Sandbox

Subprojeto dedicado à engenharia reversa do executável original PopCap (`PlantsVsZombies.exe`), integração de mods da comunidade (como o DLC Edition v2.7.2) na Steam com rastreamento oficial de horas/conquistas, isolamento seguro de saves (`userdata`) e download sob demanda.

## Recursos do Launcher

1. **Rastreamento Total na Steam:**
   - O launcher substitui o binário raiz da Steam e mantém o processo pai ativo em background (na bandeja do sistema) enquanto o mod selecionado é executado.
   - Garante contagem ininterrupta de horas e compatibilidade com o Steam Overlay.

2. **Isolamento de Saves (Sandbox Anti-Perda):**
   - Cada mod possui seu próprio diretório em `LauncherData/Saves/<ModId>/userdata/`.
   - Antes de iniciar qualquer versão, um backup com carimbo de data/hora (`backup_YYYYMMDD_HHMMSS`) é criado automaticamente.
   - Impede corrupções ou conflitos entre `user1.dat` (Vanilla) e `user1.dlc` (DLC Edition).

3. **Interface Fiel e Polida (Estilo PopCap):**
   - Renderização no estilo da janela clássica de seleção de usuário (*"Who Are You?"*).
   - Molduras de pedra 9-slice contínuas sem costuras visíveis, extraídas de `main.pak` (PopCap XOR `0xF7`).
   - Ícones temáticos vetoriais exclusivos para cada mod (sem glifos quebrados `[]`).
   - Botões autênticos com efeito tátil de clique (deslocamento de 1px) e realce luminoso ao passar o mouse.

4. **Seletor Dinâmico de Idiomas (PT-BR / ENG / Original):**
   - Suporte a múltiplos idiomas para qualquer versão selecionada:
     - **Português (Brasil) 🇧🇷:** Injeção automática e transparente de `properties/LawnStrings.txt` 100% traduzido para a engine PopCap.
     - **English 🇺🇸:** Restauração instantânea dos arquivos originais do `main.pak`.
     - **Chinês Original 🇨🇳 & Traduções Fan (Hybrid / Fusion):** Gerenciamento e aplicação de patches comunitários de tradução.
   - Botão interativo `IDIOMA (PT-BR)` na interface que alterna o idioma com feedback visual instantâneo e persistência em `LauncherData/config.ini`.

5. **Gerenciamento e Download Sob Demanda:**
   - Catálogo integrado com suporte a Vanilla GOTY, DLC Edition, Community Edition, Hybrid Edition e Fusion Edition.
   - Verificação automática de atualizações e download direto das fontes oficiais.

## Estrutura do Subprojeto

- `src/PvZLauncher/`: Código-fonte completo em C# (.NET 4.0 / WinForms):
  - `ModEntry.cs`: Definição de metadados, links de download, flags e chaves temáticas.
  - `ModManager.cs`: Catálogo dos principais mods confiáveis da comunidade.
  - `LanguageManager.cs`: Motor de tradução dinâmica, injeção de `LawnStrings.txt` e persistência de idioma.
  - `SaveManager.cs`: Sistema de sincronização bidirecional, sandboxing e backups.
  - `PvZResources.cs`: Texturas autênticas de pedra e botões incorporadas.
  - `PvZLauncherForm.cs`: Interface gráfica arrastável e ciclo de vida do processo Steam.
  - `Program.cs`: Ponto de entrada da aplicação.
- `scripts/`: Scripts utilitários de compilação (`compile_launcher.py`), implantação na Steam (`deploy_launcher_to_steam.py`), gerador de traduções (`build_ptbr_translation.py`) e ferramentas PAK.
- `reports/`: Relatório detalhado da integração e engenharia reversa (`pvz_dlc_edition_steam_integration.md`).

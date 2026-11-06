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

3. **Interface Fiel ao Jogo Original:**
   - Renderização no estilo da janela clássica de seleção de usuário (*"Who Are You?"*).
   - Molduras de pedra 9-slice extraídas diretamente do arquivo `main.pak` descriptografado (PopCap XOR `0xF7`).
   - Botões autênticos de madeira e suporte a fontes temáticas (`DwarvenTodcraft`, `BrianneTod`).

4. **Gerenciamento e Download Sob Demanda:**
   - Catálogo integrado com suporte a Vanilla GOTY, DLC Edition, Community Edition, Hybrid Edition e Fusion Edition.
   - Verificação automática de atualizações e download direto das fontes oficiais.

## Estrutura do Subprojeto

- `src/PvZLauncher/`: Código-fonte completo em C# (.NET 4.0 / WinForms):
  - `ModEntry.cs`: Definição de metadados, links de download e verificação de arquivos.
  - `ModManager.cs`: Catálogo dos principais mods confiáveis da comunidade.
  - `SaveManager.cs`: Sistema de sincronização bidirecional, sandboxing e backups.
  - `PvZResources.cs`: Texturas autênticas de pedra e botões incorporadas.
  - `PvZLauncherForm.cs`: Interface gráfica arrastável e ciclo de vida do processo Steam.
  - `Program.cs`: Ponto de entrada da aplicação.
- `scripts/`: Scripts utilitários de compilação (`compile_launcher.py`), implantação na Steam (`deploy_launcher_to_steam.py`) e análise de binários/pak.
- `reports/`: Relatório detalhado da integração e engenharia reversa (`pvz_dlc_edition_steam_integration.md`).

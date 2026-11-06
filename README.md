# Engenharia Reversa

Repositório estruturado para análise estática, análise dinâmica, engenharia reversa de binários, auditoria de segurança e desenvolvimento de mods e launchers com integração direta à Steam.

---

## 🛠️ Metodologia & Skill Padrão

Este repositório adota por padrão o framework e as diretrizes do **REA (Reverse Engineer Anything)**:
- Localização da Skill: [`.agents/skills/reverse-engineer-anything/SKILL.md`](.agents/skills/reverse-engineer-anything/SKILL.md)
- Guias de Referência: [`.agents/skills/reverse-engineer-anything/references/`](.agents/skills/reverse-engineer-anything/references/)

### Princípios Norteadores:
1. **Evidência sobre Especulação**: Todo veredito e relatório é amparado por dados verificáveis (hashes criptográficos, inspeção de cabeçalhos PE/ELF/Mach-O, bytecode/IL, grafos de importação, P/Invoke e análise de strings).
2. **Ambiente Seguro & Isolado**: Extração de payloads sem acionamento de rotinas destrutivas, validação de integridade e auditoria de comunicação externa.
3. **Reprodutibilidade**: Documentação técnica de cada alvo analisado com passos de dissecação.

---

## 📂 Estrutura do Repositório

```text
├── .agents/
│   └── skills/
│       └── reverse-engineer-anything/    # Skill e guias de referência REA
├── reports/                             # Relatórios técnicos de engenharia reversa
│   ├── capri-desktop/                   # Auditorias de integridade do Capri Desktop
│   ├── chicken_cuphead_re_report.md     # Relatório do mod Crossover Cuphead x Chicken Assassin
│   └── pvz_dlc_edition_steam_integration.md # Relatório de integração do PvZ DLC Edition na Steam
├── scripts/                             # Scripts de automação, compilação e extração
│   ├── ChickenAssassinCupheadMod/       # Código-fonte do plugin BepInEx (C# / Harmony)
│   ├── compile_launcher.py              # Compilação automatizada do PvZ Multi-Mod Launcher
│   └── compile_plugin.py                # Compilação do plugin do Cuphead
├── src/
│   └── PvZLauncher/                     # Código-fonte do Launcher Multi-Versões de PvZ (C# WinForms)
│       ├── ModEntry.cs                  # Estrutura de dados e status de mods
│       ├── ModManager.cs                # Catálogo de versões e fontes oficiais
│       ├── SaveManager.cs               # Sandboxing e isolamento de saves (anti-corrupção)
│       ├── PvZResources.cs              # Texturas autênticas de pedra/botões do PvZ embutidas
│       ├── PvZLauncherForm.cs           # Interface visual no estilo do diálogo clássico de seleção
│       └── Program.cs                   # Ponto de entrada do executável
├── AGENTS.md                            # Diretrizes ativas para agentes de IA
├── GEMINI.md                            # Configurações do Antigravity / Gemini CLI
└── README.md
```

---

## 📑 Projetos & Relatórios Realizados

| Data | Alvo / Projeto | Tipo | Veredito / Status | Relatório Técnico |
| :--- | :--- | :--- | :--- | :--- |
| **24/10/2026** | `Capri-Setup.exe` (v0.2.0) | Instalador .NET C# | ✅ Seguro / Benigno | [Ver Relatório](reports/capri-desktop/analysis-report.md) |
| **24/10/2026** | `Capri-Setup.exe` (v0.3.0) | Instalador .NET C# | ✅ Seguro / Benigno | [Ver Relatório](reports/capri-desktop/analysis-report-v0.3.0.md) |
| **25/10/2026** | `Capri-Setup.exe` (v0.3.1) | Instalador .NET C# | ✅ Seguro / Benigno | [Ver Relatório](reports/capri-desktop/analysis-report-v0.3.1.md) |
| **25/10/2026** | `Cuphead x Chicken Assassin` | Mod Crossover (Unity/BepInEx) | 🥊 Franklin Schneider Canônico com Quimono | [Ver Relatório](reports/chicken_cuphead_re_report.md) |
| **28/10/2026** | `PvZ: DLC Edition (v2.7.2)` | Integração Steam / XDelta3 | 🌻 100% Funcional na Steam com Horas | [Ver Relatório](reports/pvz_dlc_edition_steam_integration.md) |
| **06/11/2026** | `PvZ Multi-Mod Steam Launcher` | Launcher Nativo C# (.NET) | 🎮 Multi-Versões, Saves Isolados e Auto-Update | [Código em src/](src/PvZLauncher/) |

---

## 🎮 Destaque: Plants vs. Zombies Multi-Mod Steam Launcher

O **PvZ Multi-Mod Launcher** resolve o maior problema da comunidade de modding: poder jogar diferentes versões e mods sem perder a contagem de horas da Steam e sem correr o risco de corromper o save original do jogo.

### Recursos Implementados:
1. **Contagem Nativa de Horas na Steam:**
   * O launcher assume o lugar de `PlantsVsZombies.exe`.
   * Ao clicar em *JOGAR*, ele inicia o mod selecionado como processo filho e permanece em segundo plano na bandeja do sistema monitorando a sessão. A Steam contabiliza 100% do tempo de jogo no seu perfil.
2. **Sandbox & Isolamento de Saves:**
   * Cada mod possui uma pasta de saves isolada em `LauncherData/Saves/<ModId>/userdata`.
   * Antes de iniciar um mod, o save daquela versão é injetado. Ao fechar, o progresso é salvo de volta para o sandbox com backups automáticos, impedindo que mods com plantas modificadas estraguem seu progresso original.
3. **Estética Autêntica PopCap Games:**
   * Interface gráfica desenvolvida a partir dos assets nativos extraídos de `main.pak` (moldura de pedra em 9 fatias, botões com relevo dourado e tipografia autêntica).
4. **Catálogo Curado de Versões Confiáveis:**
   * **🌻 Vanilla GOTY:** Jogo original de 2009 com conquistas Steam nativas.
   * **🧟 PvZ: DLC Edition (v2.7.2):** Expansão oficial-style do GameJolt.
   * **🏆 PvZ: Community Edition:** Mod open-source com suporte nativo a 16:9 Widescreen e 60 FPS reais.
   * **🧬 PvZ: Hybrid Edition (杂交版):** O mod viral de plantas híbridas de SubmarineWeizei.
   * **⚡ PvZ: Fusion Edition (融合版):** Mod de fusão dinâmica no gramado de Lan Pao Pao.

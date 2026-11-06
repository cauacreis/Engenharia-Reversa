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

## 📂 Estrutura Modular de Subprojetos

O repositório é organizado de forma modular na pasta `projects/`, permitindo que cada projeto de engenharia reversa mantenha seu próprio código-fonte, scripts de compilação/extração e relatórios técnicos independentes:

```text
├── .agents/
│   └── skills/
│       └── reverse-engineer-anything/          # Framework e guias REA
├── projects/
│   ├── capri-desktop/                          # Auditoria e segurança do Capri Desktop
│   │   ├── reports/                            # Relatórios técnicos (v0.3.0, v0.3.1)
│   │   ├── scripts/                            # Verificadores de atualização e hash
│   │   └── README.md
│   ├── cuphead-chicken-assassin/               # Crossover Cuphead x Chicken Assassin
│   │   ├── src/ChickenAssassinCupheadMod/      # Plugin BepInEx/Harmony (C#)
│   │   ├── scripts/                            # Extração de assets Spine e compilação
│   │   ├── reports/                            # Relatório de engenharia reversa
│   │   └── README.md
│   └── plants-vs-zombies/                      # Ecossistema Plants vs. Zombies
│       ├── src/PvZLauncher/                    # Multi-Mod Steam Launcher (C# WinForms)
│       ├── scripts/                            # Compilador, deploy Steam e ferramentas PAK
│       ├── reports/                            # Relatório de integração Steam
│       └── README.md
├── AGENTS.md                                   # Diretrizes ativas para agentes de IA
├── GEMINI.md                                   # Configurações do Antigravity / Gemini CLI
└── README.md
```

---

## 📑 Subprojetos & Relatórios Realizados

| Data | Subprojeto | Tipo | Veredito / Status | Documentação |
| :--- | :--- | :--- | :--- | :--- |
| **24/10/2026** | `projects/capri-desktop` | Instalador .NET C# | ✅ Seguro / Benigno | [Ver Relatórios](projects/capri-desktop/reports/) |
| **25/10/2026** | `projects/cuphead-chicken-assassin` | Mod Crossover (Unity/BepInEx) | 🥊 Franklin Schneider Canônico com Quimono | [Ver Subprojeto](projects/cuphead-chicken-assassin/) |
| **28/10/2026** | `projects/plants-vs-zombies` (DLC Edition) | Integração Steam / XDelta3 | 🌻 100% Funcional na Steam com Horas | [Ver Relatório](projects/plants-vs-zombies/reports/pvz_dlc_edition_steam_integration.md) |
| **06/11/2026** | `projects/plants-vs-zombies` (Launcher) | Launcher Nativo C# (.NET) | 🎮 Multi-Versões, Saves Isolados e Auto-Update | [Código do Launcher](projects/plants-vs-zombies/src/PvZLauncher/) |

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

# Cuphead x Chicken Assassin - Modding & Engine Hooking

Subprojeto dedicado à engenharia reversa de runtimes Unity/Mono, extração de assets esqueléticos 2D (Spine) do *Chicken Assassin: Reloaded* e injeção do protagonista Franklin no motor do *Cuphead* via BepInEx e Harmony.

## Estrutura do Subprojeto

- `src/ChickenAssassinCupheadMod/`: Código-fonte em C# do plugin BepInEx (`ChickenCupheadPlugin.cs`).
  - Substituição dinâmica de sprites do jogador (Cuphead) pelas animações do Franklin.
  - Implementação de ataques customizados (fist projectiles, socos em rajada de luvas vermelhas e gi de karatê).
  - Ancoragem óssea e sincronização com o ciclo de vida do Unity IMGUI/Update.
- `scripts/`: Scripts em Python e PowerShell para dissecação de `.assets`, extração de frames, reconstrução de esqueletos Spine e compilação do plugin Mono.
- `reports/`: Relatório detalhado de engenharia reversa (`chicken_cuphead_re_report.md`).

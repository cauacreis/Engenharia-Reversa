# Engenharia Reversa

Repositório estruturado para análise estática, análise dinâmica, engenharia reversa de binários e auditoria de segurança de artefatos de software.

## 🛠️ Metodologia & Skill Padrão

Este repositório adota por padrão o framework e as diretrizes do **REA (Reverse Engineer Anything)**:
- Localização da Skill: [`.agents/skills/reverse-engineer-anything/SKILL.md`](.agents/skills/reverse-engineer-anything/SKILL.md)
- Guias de Referência: [`.agents/skills/reverse-engineer-anything/references/`](.agents/skills/reverse-engineer-anything/references/)

### Princípios Norteadores:
1. **Evidência sobre Especulação**: Todo veredito e relatório é amparado por dados verificáveis (hashes criptográficos, inspeção de cabeçalhos PE/ELF/Mach-O, bytecode/IL, grafos de importação, P/Invoke e análise de strings).
2. **Ambiente Seguro & Isolado**: Extração de payloads sem acionamento de rotinas destrutivas, validação de certificados e auditoria de comunicação externa.
3. **Reprodutibilidade**: Documentação técnica de cada alvo analisado com passos de dissecação.

---

## 📂 Estrutura do Repositório

```text
├── .agents/
│   └── skills/
│       └── reverse-engineer-anything/    # Skill e guias de referência REA
├── reports/                             # Relatórios técnicos de engenharia reversa
│   └── capri-desktop/                   # Auditoria de malware do Capri-Setup.exe
├── AGENTS.md                            # Diretrizes ativas para agentes de IA
├── GEMINI.md                            # Configurações do Antigravity / Gemini CLI
└── README.md
```

---

## 📑 Relatórios Realizados

| Data | Alvo | Tipo | Veredito | Relatório |
| :--- | :--- | :--- | :--- | :--- |
| **24/10/2026** | `Capri-Setup.exe` (v0.2.0) | Instalador .NET C# | ✅ Seguro / Benigno | [Ver Relatório](reports/capri-desktop/analysis-report.md) |
| **24/10/2026** | `Capri-Setup.exe` (v0.3.0) | Instalador .NET C# | ✅ Seguro / Benigno | [Ver Relatório](reports/capri-desktop/analysis-report-v0.3.0.md) |

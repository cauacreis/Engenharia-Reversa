# Engenharia Reversa - Diretrizes do Workspace

Este repositório é dedicado à engenharia reversa, dissecação de binários, auditoria de segurança e análise de malware.

## Skill Padrão: reverse-engineer-anything (REA)
Sempre que atuar nesta pasta ou repositório, utilize como padrão e siga rigorosamente os princípios e o fluxo da skill:
`.agents/skills/reverse-engineer-anything/SKILL.md`

### Princípios de Análise:
1. **Evidência Concreta sobre Suposição**: Sempre separar observações de fatos (hashes, strings, imports, metadados PE, P/Invoke, decompilação IL) de deduções e incógnitas.
2. **Dissecação Estática e Dinâmica Segura**:
   - Extrair e desempacotar instaladores (Inno, NSIS, .NET, MSI, Electron ASAR, etc.).
   - Analisar cabeçalhos PE, chamadas de sistema, assinaturas digitais e dependências.
   - Auditar strings por C2, endpoints remotos, payloads base64 ou comandos suspeitos.
   - Se for open-source, contrastar o binário distribuído byte-a-byte contra o código-fonte e compilações oficiais.
3. **Documentação Estruturada**: Registrar os relatórios de engenharia reversa e auditoria de binários na pasta `reports/`.

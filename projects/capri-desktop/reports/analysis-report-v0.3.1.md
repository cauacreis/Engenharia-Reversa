# Relatório de Auditoria e Engenharia Reversa: Capri Desktop v0.3.1

- **Alvo:** `Capri-Setup.exe` e `Capri.exe` (v0.3.1)
- **Repositório:** [lachydotmcg/capri-desktop](https://github.com/lachydotmcg/capri-desktop)
- **Data de Lançamento:** 25/10/2026 (02:53 UTC)
- **Data da Auditoria:** 25/10/2026 (08:08 BRT)
- **Veredito:** **SEGURO / LIVRE DE MALWARE (ATUALIZAÇÃO CONCLUÍDA)**

---

## 1. Identificação Criptográfica

| Arquivo | Tamanho | SHA-256 |
| :--- | :--- | :--- |
| **`Capri-Setup.exe`** | 7.790.080 bytes | `BB843A672FEA9E3DB3178737ED48A846DC90AD2683917461D6AF90531C5CDA43` |
| **`Capri.exe`** | 7.621.632 bytes | `6B271251221CD51AA670A43DAC3804CB47DE77D1D1CCD05FD4F08F97756AEC62` |

> [!NOTE]
> Os hashes conferem 100% bit-for-bit com o arquivo oficial `SHA256SUMS.txt` da release `v0.3.1`. O payload `Capri.App.exe` embutido no instalador é rigorosamente idêntico ao `Capri.exe` autônomo.

---

## 2. O que mudou na v0.3.1?

- **Commit:** `a856367f - she frowns when you pick her up`
- **Código C#:** A única alteração em `app/Capri.cs` foi o ajuste da string de versão no menu de contexto (`CAPRI / 0.3.0` -> `CAPRI / 0.3.1`).
- **Recursos Gráficos:** A folha de sprites `assets/sprites/dangle.png` foi refinada para que ela faça uma expressão de descontentamento/bico (*frown*) enquanto é erguida e arrastada pelo cursor do mouse.
- **Segurança:** Nenhuma dependência externa, P/Invoke ou endpoint novo foi introduzido.

---

## 3. Status da Instalação Local

- Processo anterior encerrado com segurança.
- Binários atualizados em: `%LOCALAPPDATA%\Capri\Capri.exe`.
- Processo `Capri.exe` (PID 3296) relançado com a versão `0.3.1.0`.

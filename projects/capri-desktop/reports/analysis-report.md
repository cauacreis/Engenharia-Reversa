# Relatório de Análise e Engenharia Reversa: Capri Desktop Companion

- **Alvo:** `Capri-Setup.exe`
- **Origem Declarada:** [Capri Desktop](https://lachydotmcg.github.io/capri-desktop/) / [Repositório GitHub](https://github.com/lachydotmcg/capri-desktop)
- **Versão:** 0.2.0.0
- **Data da Análise:** 24/10/2026
- **Veredito:** **SEGURO / LIVRE DE VÍRUS (BENIGNO)**

---

## 1. Identificação Criptográfica e Assinatura

| Propriedade | Valor |
| :--- | :--- |
| **Nome do Arquivo** | `Capri-Setup.exe` |
| **Tamanho** | 880.640 bytes (~860 KB) |
| **MD5** | `C3B097B51F68603082B213DC99B4B847` |
| **SHA-256** | `575B2801667D1AF94790F6C7E860FADFF02452164B58B3AF7A2D6B3DFCFD8B31` |
| **Assinatura Digital** | Não assinada (`NotSigned`) |
| **Privilégios Solicitados** | `asInvoker` (Executa como usuário comum, sem elevação de administrador) |

> [!NOTE]
> O arquivo local na pasta de downloads corresponde **exatamente bit a bit** ao arquivo oficial publicado na release `v0.2.0` do repositório oficial do desenvolvedor (`SHA256SUMS.txt`: `575b2801667d1af94790f6c7e860fadff02452164b58b3af7a2d6b3dfcfd8b31`).

---

## 2. Arquitetura do Binário e Desempacotamento

A análise dos cabeçalhos PE revelou que `Capri-Setup.exe` é um binário gerenciado **.NET Framework (CLR)** de 32 bits (Subsystem Windows GUI) desenvolvido em C#.

### Recursos Embutidos no Instalador:
- `Capri.App.exe` (Payload principal executável de 712.192 bytes)
- `Capri.Chip.ico` (Ícone de exibição da bandeja/janela)
- `Capri.Chip.png` (Arte do personagem)

O instalador aceita flags de diagnóstico seguras. A execução com `--verify` desempacotou o payload `Capri.exe` sem executar alterações no sistema.

### Comparação Binária do Payload Extraído:
O binário extraído do instalador foi comparado byte-a-byte contra o binário autônomo `Capri.exe` distribuído pelo autor no GitHub:
- Tamanho idêntico: 712.192 bytes.
- Apenas 18 bytes diferem em todo o binário:
  - 2 bytes no cabeçalho PE (TimeDateStamp de compilação).
  - 16 bytes no heap `#GUID` do .NET (o **MVID** - *Module Version ID*, gerado randomicamente pelo compilador C# `csc` em cada compilação).
- **Conclusão:** O código IL, tabelas de métodos e recursos são 100% idênticos.

---

## 3. Auditoria de Segurança e Comportamento

### A. Comunicação de Rede (C2 / Telemetria / Downloaders)
- **Zero chamadas de rede.**
- Nenhuma dependência das bibliotecas `System.Net`, `System.Net.Sockets` ou `System.Net.Http`.
- A varredura de strings não identificou URLs remotas, webhooks do Discord, bots do Telegram, endereços IP de comando & controle (C2) ou rotinas de download de estágio secundário.
- A única URL presente em todo o binário é o namespace padrão da Microsoft para DPI awareness (`urn:schemas-microsoft-com:asm.v3`).

### B. Chamadas Nativas (P/Invoke)
As únicas APIs do Windows importadas diretamente são voltadas exclusivamente à renderização gráfica transparente na área de trabalho e atalhos de teclado:
- `user32.dll`: `UpdateLayeredWindow`, `SetWindowLong`, `GetWindowLong`, `GetDC`, `ReleaseDC`, `RegisterHotKey`, `UnregisterHotKey`, `SetProcessDpiAwarenessContext`.
- `gdi32.dll`: `CreateCompatibleDC`, `DeleteDC`, `SelectObject`, `DeleteObject`.

Nenhuma chamada de injeção de processos (`VirtualAlloc`, `WriteProcessMemory`, `CreateRemoteThread`), captura de teclado arbitrária (hook global) ou persistência velada foi identificada.

### C. Persistência e Instalação
- Instala-se em: `%LOCALAPPDATA%\Capri\Capri.exe`.
- Cria atalho opcional no Menu Iniciar e Desktop.
- Registra chave de desinstalação limpa em:  
  `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\Capri.Desktop`  
  (permitindo desinstalar normalmente pelo painel "Adicionar ou Remover Programas" do Windows).

### D. Verificação Antivírus Local
- **Windows Defender (Custom Scan):** Nenhuma ameaça detectada (`Clean`).

---

## 4. Por que o Windows ou navegadores podem soar alarmes?

1. **Ausência de Assinatura Digital de Código:** O desenvolvedor não adquiriu um certificado de assinatura comercial (Code Signing Certificate), que custa centenas de dólares anuais. Binários não assinados disparam o aviso padrão do **Windows SmartScreen** ("O Windows protegeu o seu computador").
2. **Novidade do Arquivo:** Sendo uma release recente (v0.2.0), o hash ainda não possui reputação acumulada na telemetria global da Microsoft.
3. **Descrição Lúdica no README:** O repositório contém uma brincadeira na descrição (*"Beware that Capri may try to take over your human CPU. We take no responsibility for her actions"* e features futuras como *"mischief mode"*), mas o código atual não contém nenhuma rotina maliciosa.

---

## 5. Veredito Final

O arquivo `Capri-Setup.exe` é **autêntico, seguro e benigno**. Trata-se unicamente de um companheiro interativo de desktop (pet de tela) em .NET/C# sem acesso à internet ou permissões de administrador.

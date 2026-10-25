# Relatório de Auditoria e Engenharia Reversa: Capri Desktop v0.3.0

- **Alvo:** `Capri-Setup.exe` (v0.3.0)
- **Repositório:** [lachydotmcg/capri-desktop](https://github.com/lachydotmcg/capri-desktop)
- **Data de Lançamento:** 25/10/2026 (02:30 UTC)
- **Data da Auditoria:** 24/10/2026 (23:45 BRT)
- **Veredito:** **SEGURO / LIVRE DE MALWARE (AUTORIZADO PARA ATUALIZAÇÃO)**

---

## 1. Identificação Criptográfica

| Propriedade | Valor |
| :--- | :--- |
| **Arquivo** | `Capri-Setup.exe` |
| **Versão** | 0.3.0.0 |
| **Tamanho** | 7.789.568 bytes (~7.42 MB) |
| **SHA-256** | `03A1AF59254903286EDCA0E5603410EA25EF68CD27770BF2D13256881224447E` |
| **Validação com Release** | **100% idêntico** ao `SHA256SUMS.txt` oficial do repositório GitHub. |
| **Payload Extraído** | `Capri.App.exe` (`9A63013C63D5355CAF47DD55090B76BFD374BAF410DB29112F8D7DA928241F01`) |

---

## 2. Por que o arquivo cresceu de 880 KB para 7.7 MB?

A dissecação dos recursos gerenciados do executável revelou que **7.16 MB** do binário correspondem unicamente a novas folhas de sprites PNG de alta definição embutidas no assembly:
- `Capri.Sprite.idle.png` (Animação padrão)
- `Capri.Sprite.sleep.png` (1.37 MB - animação dormindo quando o usuário fica inativo)
- `Capri.Sprite.wake.png` (890 KB - animação acordando)
- `Capri.Sprite.dangle.png` (804 KB - animação flail/debatendo-se ao ser arrastada pelo cursor)
- `Capri.Sprite.perch.png` (813 KB - pés e pose empoleirada em cima das janelas ativas)
- `Capri.Sprite.glitch.png` e variantes de piscada com glitch

---

## 3. Análise da Nova Funcionalidade ("Check for Updates")

O código adicionado em `app/Capri.cs` implementa uma rotina leve de verificação de atualizações:
1. Faz requisição somente para a API oficial do GitHub:  
   `https://api.github.com/repos/lachydotmcg/capri-desktop/releases/latest`
2. Se houver versão mais recente que a atual, dispara um balão informativo na bandeja do Windows (`tray.ShowBalloonTip`):  
   *"Capri 0.3.0 is out. Click here to download the update."* (motivo da sua notificação).
3. Ao clicar na notificação, ele **NÃO** faz download nem executa arquivos em segundo plano: apenas abre a página de releases oficial no navegador padrão (`https://github.com/lachydotmcg/capri-desktop/releases/...`).

---

## 4. Análise de Segurança & P/Invoke

- **Rede / C2:** Apenas chamadas de leitura da API pública do GitHub. Zero tráfego oculto, telemetria, bots de Discord/Telegram ou downloaders secundários.
- **APIs Nativas (P/Invoke):**
  - `GetLastInputInfo`: Utilizado para medir o tempo ocioso do teclado/mouse para que a Capri saiba a hora de dormir.
  - `GetForegroundWindow` / `SetWindowPos`: Utilizado para mantê-la empoleirada ou visível acima de janelas comuns.
  - `UpdateLayeredWindow` / GDI: Renderização transparente padrão.
- **Windows Defender:** Varredura local executada com 0 ameaças (`Clean`).

---

## 5. Conclusão

A nova versão `v0.3.0` é **100% legítima, inofensiva e segura**. Pode atualizar com tranquilidade.

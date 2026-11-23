# Saneago Quest — Revisão Intensiva (Edital nº 001/2026)

Aplicação web gamificada estilo Duolingo focada na preparação para a prova de estágio da **SANEAGO** (Banca **Universidade Patativa do Assaré**, prova online em **06/12/2026**).

---

## Pesquisa de Base (GitHub)

Antes de estruturar o código, foram analisados repositórios open-source de clones do Duolingo e apps de quiz gamificado em React/Next.js + Tailwind CSS para adotar padrões consolidados:

| Repositório de Referência | Padrão Arquitetural Aproveitado |
| --- | --- |
| `sanidhyy/duolingo-clone` | Trilha sinuosa calculada com `Math.sin(...)` para os nós de lição, tooltip flutuante `"Começar"`, barra superior fixa (sair + barra de progresso + corações) e dock inferior de feedback. |
| `NirajDN/Duolingo-Clone` | Cálculo determinístico de ofensiva diária por data local (`YYYY-MM-DD`) evitando quebra por fuso UTC, além de recuperação de vidas via prática. |
| `toprak1919/pathlearn` | Persistência versionada no navegador (`localStorage`), multiplicador de combos e múltiplos formatos de questão em uma mesma engine. |
| `TheDigitalVirus/next-duolingo-tailwind` | Estética tátil 3D nos botões (`border-b-[4px]` / `active:translate-y`) com feedback físico de clique e alto contraste em dark mode. |

---

## Stack & Novidades da Versão 2.0

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS v3.4 + Framer Motion + Lucide React (sem Three.js, responsivo e mobile-first).
- **80 Questões Estáticas Comentadas (`src/data/questions.ts`):** 4 unidades × 4 lições × 5 questões (16 lições no total), incluindo módulos avançados de Porquês/Próclise/Parônimos/Vozes, Combinatória/Juros/Quantificadores, Extensões/Protocolos/Pharming/Backups, e Etapas da ETA/Bacias Hidrográficas de Goiás.
- **Tutor Diagnóstico & Gerador Infinito com Groq API (`src/services/groqTutorService.ts`):**
  - Integração direta via `https://api.groq.com/openai/v1/chat/completions` (`llama-3.3-70b-versatile` com fallback rápido `llama-3.1-8b-instant` e `response_format: { type: "json_object" }`).
  - Ancoragem estrita no Edital nº 001/2026 ([`src/data/editalContext.ts`](src/data/editalContext.ts)), respeitando os pesos de desempate (1º Português 35%, 2º Matemática/Lógica 25%, Informática 20%, Saneago 20%).
  - Suporta `VITE_GROQ_API_KEY` via `.env` ou configuração direta no navegador pelo botão de engrenagem (**Configurações → Chave API Groq**).
  - Validador runtime antes da sessão + cache local para reutilizar pacotes gerados sem gastar tokens.
  - Fallback offline gracioso: se estiver sem chave ou sem internet, gera diagnóstico e treinos usando as 80 questões estáticas.
- **Central de Relatório de Erros & Analytics (`src/components/extra/ErrorAnalyticsView.tsx`):** projeção de nota ponderada em SVG, taxa de acerto por disciplina, tempo médio por questão, tópicos críticos (`< 70%`), histórico detalhado (`Você marcou` vs. `Correta`) e plano cirúrgico em 3 blocos com treino corretivo imediato.
- **Mascote Interativo "Pingo" (`src/components/Mascot.tsx`):** SVG vetorial animado com Framer Motion nos estados `idle`, `happy`, `combo`, `sad` e `thinking`.
- **Pronto para Supabase:** [`src/services/progressRepository.ts`](src/services/progressRepository.ts) + [`supabase/schema.sql`](supabase/schema.sql).

---

## Como Executar Localmente

```bash
cd projects/saneago-quest
npm install
npm run dev
```

*(Opcional)* Crie um arquivo `.env` local (nunca commitado) para preencher a chave automaticamente:

```env
VITE_GROQ_API_KEY=gsk_sua_chave_aqui
```

Para validar o banco de 80 questões e gerar o build de produção:

```bash
npm run validate:questions
npx tsc --noEmit
npm run build
```

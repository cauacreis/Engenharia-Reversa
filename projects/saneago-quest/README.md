# Saneago Quest — Revisão Intensiva (Edital nº 001/2026)

Aplicação web gamificada estilo Duolingo focada na preparação para a prova de estágio da **SANEAGO** (Banca **Universidade Patativa do Assaré**, prova online em **06/12/2026**).

---

## Passo 1 — Pesquisa de Base (GitHub)

Antes de estruturar o código, foram analisados repositórios open-source de clones do Duolingo e apps de quiz gamificado em React/Next.js + Tailwind CSS para adotar padrões consolidados:

| Repositório de Referência | Padrão Arquitetural Aproveitado |
| --- | --- |
| `sanidhyy/duolingo-clone` | Trilha sinuosa calculada com `Math.sin(...)` para os nós de lição, tooltip flutuante `"Começar"`, barra superior fixa (sair + barra de progresso + corações) e dock inferior de feedback. |
| `NirajDN/Duolingo-Clone` | Cálculo determinístico de ofensiva diária por data local (`YYYY-MM-DD`) evitando quebra por fuso UTC, além de recuperação de vidas via prática. |
| `toprak1919/pathlearn` | Persistência versionada no navegador (`localStorage`), multiplicador de combos e múltiplos formatos de questão em uma mesma engine. |
| `TheDigitalVirus/next-duolingo-tailwind` | Estética tátil 3D nos botões (`border-b-[4px]` / `active:translate-y`) com feedback físico de clique e alto contraste em dark mode. |

---

## Stack & Arquitetura

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS v3.4 + Framer Motion + Lucide React (sem Three.js, mantendo o carregamento rápido e mobile-first).
- **Persistência:** `LocalStorageProgressRepository` (`src/services/progressRepository.ts`) salvando XP, meta diária, 5 corações, ofensiva (streak), lições concluídas, banco de erros, histórico de simulados e checklist da prova.
- **Pronto para Supabase:** Interface `ProgressRepository` com adaptador `SupabaseProgressRepository` e DDL completo com RLS em [`supabase/schema.sql`](supabase/schema.sql).

---

## Estrutura Pedagógica (60 Questões Comentadas)

O arquivo [`src/data/questions.ts`](src/data/questions.ts) contém **60 questões estruturadas** (15 por unidade, divididas em 3 lições de 5 questões cada) cobrindo todas as seções e tabelas do guia de estudos:

1. **Unidade 1 — Língua Portuguesa (Maior Peso & Desempate):** Crase (`à` vs `a`, proibições, nomes de lugares), Concordância Verbal (`haver` vs `existir`, sujeito posposto, partícula `se`, porcentagem), Regência (`assistir`, `visar`, `preferir`), Vírgula, Novo Acordo Ortográfico (ditongos abertos e hífen) e Conjunções.
2. **Unidade 2 — Matemática & Raciocínio Lógico:** Tabela-Verdade completa (`∧`, `∨`, `→`, `↔`), Leis de De Morgan, Negação MA-NÉ, Equivalências (Contrapositiva e NE-OU), Regra de Três Direta/Inversa, Porcentagens Sucessivas, Conjuntos (Venn) e Probabilidade.
3. **Unidade 3 — Informática & Pegadinhas Office BR:** Atalhos Windows 10/11 (`Win + E/D/L`, `Ctrl + Shift + Esc`, `Shift + Delete`), Pegadinhas Word PT-BR (`Ctrl + B` salvar, `Ctrl + S` sublinhado, `Ctrl + T`, `Ctrl + A`, `Ctrl + L`), Fórmulas Excel PT-BR (`:` vs `;`, `SOMA`, `MÉDIA`, `MÁXIMO`, `MÍNIMO`, `CONT.NÚM`, `CONT.VALORES`, `SE`) e Segurança (HTTP vs HTTPS, Vírus, Worm, Trojan, Ransomware, Spyware Keylogger/Screenlogger, Phishing, Backup vs Firewall).
4. **Unidade 4 — Saneago, Marco Legal & Goiás:** Natureza jurídica (Sociedade de Economia Mista da Administração Indireta), cobertura (>220 municípios), Metas do Novo Marco Legal até 31/12/2033 (99% água potável e 90% esgoto), os 4 Eixos da Lei nº 11.445/2007, bioma Cerrado (chuvoso out–abr / estiagem mai–set), saúde pública e regras da prova online de 06/12/2026.

---

## Como Executar Localmente

```bash
cd projects/saneago-quest
npm install
npm run dev
```

Para validar o banco de questões e o build de produção:

```bash
npm run validate:questions
npm run build
```

---

## Como Adicionar Novas Questões

Basta acrescentar objetos no array `QUESTIONS` em [`src/data/questions.ts`](src/data/questions.ts) seguindo qualquer um dos 4 formatos da discriminated union `Question`:

```ts
// 1) Múltipla Escolha
{
  id: 'pt-q99',
  unitId: 'portugues',
  lessonId: 'pt-1',
  type: 'multiple-choice',
  topic: 'Crase',
  sourceSection: '1.1',
  difficulty: 'medio',
  prompt: 'Enunciado da questão...',
  options: ['Opção A', 'Opção B', 'Opção C', 'Opção D', 'Opção E'],
  correctIndex: 0,
  tip: 'Micro-macete exibido na barra inferior após responder.',
}

// 2) Completar Lacuna
{
  id: 'pt-q98',
  unitId: 'portugues',
  lessonId: 'pt-1',
  type: 'fill-blank',
  topic: 'Verbo Haver',
  sourceSection: '1.2',
  difficulty: 'facil',
  prompt: 'Complete corretamente:',
  sentenceBefore: 'Ainda',
  sentenceAfter: 'dúvidas sobre o edital.',
  options: ['há', 'hão', 'existem', 'existe'],
  correctAnswer: 'há',
  tip: 'Haver impessoal fica sempre no singular.',
}

// 3) Verdadeiro ou Falso
{
  id: 'mat-q99',
  unitId: 'matematica',
  lessonId: 'mat-2',
  type: 'true-false',
  topic: 'MA-NÉ',
  sourceSection: '2.1',
  difficulty: 'facil',
  prompt: 'Julgue a afirmação:',
  statement: 'A negação de P → Q é P ∧ ¬Q.',
  correctAnswer: true,
  tip: 'Regra do MA-NÉ: mantém a 1ª e nega a 2ª com conectivo E.',
}

// 4) Associação de Pares
{
  id: 'inf-q99',
  unitId: 'informatica',
  lessonId: 'inf-1',
  type: 'match-pairs',
  topic: 'Office PT-BR',
  sourceSection: '3.2',
  difficulty: 'facil',
  prompt: 'Associe atalho e função:',
  pairs: [
    { id: 'p1', left: 'Ctrl + B', right: 'Salvar' },
    { id: 'p2', left: 'Ctrl + S', right: 'Sublinhado' },
    { id: 'p3', left: 'Ctrl + T', right: 'Selecionar Tudo' },
    { id: 'p4', left: 'Ctrl + A', right: 'Abrir' },
  ],
  tip: 'No Office em português, B = Backup (Salvar) e S = Sublinhado.',
}
```

Execute `npm run validate:questions` após editar para garantir que todas as regras de integridade continuam válidas.

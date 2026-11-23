import { PerformanceBucket, UnitId } from '../types/quiz';

export const EDITAL_WEIGHTS: Record<UnitId, number> = {
  portugues: 0.35,
  matematica: 0.25,
  informatica: 0.2,
  saneago: 0.2,
};

export const EDITAL_TIEBREAKERS: UnitId[] = [
  'portugues',
  'matematica',
  'informatica',
  'saneago',
];

export const EDITAL_SUBTOPICS: Record<UnitId, string[]> = {
  portugues: [
    '1.1 Crase (regra da troca por masculino, proibições antes de verbo/masculino/pronomes/plural, nomes de lugares)',
    '1.2 Concordância Verbal (sujeito posposto, haver impessoal vs. existir pessoal, partícula SE VTD/VTI, porcentagem)',
    '1.3 Regência Verbal (assistir ver vs. ajudar, visar objetivo vs. mirar/dar visto, preferir uma coisa a outra)',
    '1.4 Uso da Vírgula (proibição entre sujeito e verbo/complemento, adjunto adverbial deslocado, aposto explicativo, adversativas)',
    '1.5 Novo Acordo Ortográfico (ditongos abertos éi/ói em paroxítonas vs. oxítonas, regras de hífen e dobra de R/S)',
    '1.6 Conjunções (adversativas, concessivas, causais, conclusivas, condicionais)',
    '1.7 Porquês, Próclise com palavras atrativas, Parônimos (ratificar/retificar, eminente/iminente) e Vozes Verbais',
  ],
  matematica: [
    '2.1 Lógica Proposicional / Tabela-Verdade (E, OU, Se...Então / Vera Fischer, Bicondicional)',
    '2.2 Negações (De Morgan em E/OU, regra MA-NÉ no Se...Então) e Equivalências (Contrapositiva ¬Q→¬P, regra NE-OU ¬P∨Q)',
    '2.3 Regra de Três (diretamente proporcional cruzada vs. inversamente proporcional em linha reta)',
    '2.4 Porcentagem e Variações Sucessivas (fatores de atualização 1+x/100 e 1-x/100)',
    '2.5 Conjuntos (Diagrama de Venn n(A∪B)=n(A)+n(B)-n(A∩B)) e Probabilidade (E multiplica, OU soma)',
    '2.6 Análise Combinatória Básica (Arranjo vs. Combinação), Juros Simples (J=C·i·t) e Negação de Quantificadores (Todo/Nenhum/Algum)',
  ],
  informatica: [
    '3.1 Atalhos Windows 10/11 (Win+E, Win+D, Win+L, Ctrl+Shift+Esc, Shift+Delete, Alt+F4)',
    '3.2 Pegadinhas Office em Português BR (Ctrl+B Salvar, Ctrl+S Sublinhado, Ctrl+N Negrito, Ctrl+T Tudo, Ctrl+A Abrir, Ctrl+L Localizar, Ctrl+I Itálico)',
    '3.3 Fórmulas do Excel em PT-BR (: intervalo ATÉ vs. ; união E, SOMA, MÉDIA, MÁXIMO, MÍNIMO, CONT.NÚM, CONT.VALORES, SE)',
    '3.4 Segurança da Informação (HTTP vs. HTTPS TLS/SSL, Vírus, Worm, Trojan, Ransomware, Spyware Keylogger/Screenlogger, Phishing, Backup vs. Firewall)',
    '3.5 Extensões de Arquivo (.docx/.odt/.xlsx/.pdf/.zip), Protocolos (SMTP/IMAP/DNS/DHCP), Pharming e Backup Incremental vs. Diferencial',
  ],
  saneago: [
    '4.1 Institucional SANEAGO (Sociedade de Economia Mista da Administração Pública Indireta, Estado de Goiás acionista majoritário, Goiânia + >220 municípios)',
    '4.2 Novo Marco Legal do Saneamento (Lei nº 14.026/2020: metas até 31/12/2033 de 99% água potável e 90% coleta/tratamento de esgoto)',
    '4.3 Os 4 Eixos do Saneamento Básico (Lei nº 11.445/2007: água potável, esgotamento sanitário, limpeza urbana/resíduos sólidos, drenagem de águas pluviais)',
    '4.4 Contexto Hídrico e Ambiental de Goiás (Cerrado: chuvoso out–abr, estiagem mai–set; doenças de veiculação hídrica e economia no SUS)',
    '4.5 Etapas da ETA (Coagulação, Floculação, Decantação, Filtração, Desinfecção/Fluoretação) e Bacias Hidrográficas de Goiás (Araguaia-Tocantins, Paranaíba, São Francisco)',
    '5.0 Regras Operacionais da Prova Online (06/12/2026: navegador limpo sem extensões, não usar Alt+Tab, Não Perturbe, cabo de rede + 4G/5G pois cada desconexão desconta 1 questão)',
  ],
};

export const EDITAL_BASE_CONTEXT = `Você é o Tutor Especialista e Elaborador Oficial de Questões para o Processo Seletivo de Estágio SANEAGO (Edital nº 001/2026 — Nível Superior TI / Engenharia de Software), organizado pela banca Universidade Patativa do Assaré, com prova online marcada para 06 de dezembro de 2026.

REGRAS ESTRITAS DO EDITAL E ANCORAGEM:
1. Critérios de Peso e Desempate:
   - 1º Critério de maior peso e desempate: Língua Portuguesa (peso 35%).
   - 2º Critério de desempate: Matemática e Raciocínio Lógico (peso 25%).
   - Informática & Office PT-BR (peso 20%) e Atualidades / Saneago / Marco Legal (peso 20%).
2. Regras da Prova Online (06/12/2026):
   - Navegador limpo/anônimo sem extensões; proibido alternar abas (Alt+Tab); Não Perturbe ativo; conexão via cabo + 4G/5G de backup porque cada desconexão desconta 1 questão; folha em branco e caneta para cálculos.
3. Escopo Fechado de Conteúdos (NUNCA gere conteúdo fora dos subtópicos abaixo):
   - LÍNGUA PORTUGUESA: ${EDITAL_SUBTOPICS.portugues.join('; ')}.
   - MATEMÁTICA E RACIOCÍNIO LÓGICO: ${EDITAL_SUBTOPICS.matematica.join('; ')}.
   - NOÇÕES DE INFORMÁTICA: ${EDITAL_SUBTOPICS.informatica.join('; ')}.
   - SANEAGO, MARCO LEGAL E GOIÁS: ${EDITAL_SUBTOPICS.saneago.join('; ')}.
4. Estilo da Banca Universidade Patativa do Assaré:
   - Enunciados objetivos, pegadinhas clássicas de Office em português (Ctrl+B salvar, Ctrl+S sublinhado), sintaxe direta, tabela-verdade e negações MA-NÉ / NE-OU, legislação exata (Lei 14.026/2020 e Lei 11.445/2007).`;

export const EDITAL_SYSTEM_PROMPT = `${EDITAL_BASE_CONTEXT}
   - Todo retorno deve ser exclusivamente JSON válido (sem markdown nem texto fora do JSON) e em Português do Brasil rigorosamente revisado.`;

export interface UnitProjectionBreakdown {
  unitId: UnitId;
  weight: number;
  accuracy: number;
  attempts: number;
  weightedPoints: number;
  avgSecondsPerQuestion: number;
}

export interface WeightedProjectionResult {
  projectedScore: number;
  totalAttempts: number;
  overallAccuracy: number;
  avgSecondsPerQuestion: number;
  statusLabel: string;
  breakdown: UnitProjectionBreakdown[];
}

export function calculateWeightedProjection(
  unitStats: Record<UnitId, PerformanceBucket>
): WeightedProjectionResult {
  const unitIds: UnitId[] = ['portugues', 'matematica', 'informatica', 'saneago'];

  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalTimeMs = 0;
  let weightedSum = 0;
  let coveredWeight = 0;

  const breakdown: UnitProjectionBreakdown[] = unitIds.map((unitId) => {
    const stat = unitStats[unitId] ?? { attempts: 0, correct: 0, totalTimeMs: 0 };
    const weight = EDITAL_WEIGHTS[unitId];
    const accuracy =
      stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : 0;
    const avgSecondsPerQuestion =
      stat.attempts > 0 ? Number((stat.totalTimeMs / stat.attempts / 1000).toFixed(1)) : 0;

    totalAttempts += stat.attempts;
    totalCorrect += stat.correct;
    totalTimeMs += stat.totalTimeMs;

    if (stat.attempts > 0) {
      weightedSum += accuracy * weight;
      coveredWeight += weight;
    }

    return {
      unitId,
      weight,
      accuracy,
      attempts: stat.attempts,
      weightedPoints: Number((accuracy * weight).toFixed(1)),
      avgSecondsPerQuestion,
    };
  });

  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const projectedScore =
    coveredWeight > 0 ? Math.round(weightedSum / coveredWeight) : 0;
  const avgSecondsPerQuestion =
    totalAttempts > 0 ? Number((totalTimeMs / totalAttempts / 1000).toFixed(1)) : 0;

  let statusLabel = 'Sem dados suficientes';
  if (totalAttempts > 0) {
    if (projectedScore >= 85) {
      statusLabel = 'Nível Competitivo Alto';
    } else if (projectedScore >= 70) {
      statusLabel = 'Zona de Aprovação';
    } else if (projectedScore >= 50) {
      statusLabel = 'Reforço Recomendado';
    } else {
      statusLabel = 'Risco no Desempate';
    }
  }

  return {
    projectedScore,
    totalAttempts,
    overallAccuracy,
    avgSecondsPerQuestion,
    statusLabel,
    breakdown,
  };
}

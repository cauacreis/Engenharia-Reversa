import {
  EDITAL_SUBTOPICS,
  EDITAL_SYSTEM_PROMPT,
  EDITAL_WEIGHTS,
} from '../data/editalContext';
import { getQuestionsByUnit, getUnitMeta, QUESTIONS, UNITS } from '../data/questions';
import {
  FillBlankQuestion,
  GroqDiagnosisReport,
  MistakeRecord,
  MultipleChoiceQuestion,
  PerformanceBucket,
  Question,
  QuestionDifficulty,
  SavedAIQuestionPack,
  TopicStatBucket,
  TrueFalseQuestion,
  UnitId,
} from '../types/quiz';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_PRIMARY_MODEL = 'openai/gpt-oss-120b';
export const GROQ_FALLBACK_MODEL = 'openai/gpt-oss-20b';

export const GROQ_DEFAULT_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
] as const;

const GROQ_KEY_STORAGE_KEY = 'saneago_quest_groq_key_v1';
const GROQ_MODEL_STORAGE_KEY = 'saneago_quest_groq_model_v1';
const AI_PACKS_STORAGE_KEY = 'saneago_quest_ai_bank_v1';

export class GroqServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'MISSING_KEY' | 'AUTH_ERROR' | 'RATE_LIMIT' | 'NETWORK' | 'INVALID_RESPONSE'
  ) {
    super(message);
    this.name = 'GroqServiceError';
  }
}

export function hasEnvGroqKey(): boolean {
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  return typeof envKey === 'string' && envKey.trim().length > 0;
}

export function hasStoredGroqKey(): boolean {
  try {
    const k = window.localStorage.getItem(GROQ_KEY_STORAGE_KEY);
    return typeof k === 'string' && k.trim().length > 0;
  } catch {
    return false;
  }
}

export function getGroqApiKey(): string | null {
  try {
    const stored = window.localStorage.getItem(GROQ_KEY_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {
    // Sem acesso a armazenamento local
  }
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  if (typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return null;
}

export function saveGroqApiKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (!trimmed) {
      window.localStorage.removeItem(GROQ_KEY_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(GROQ_KEY_STORAGE_KEY, trimmed);
  } catch {
    // Ignorar caso modo privado bloqueie
  }
}

export function clearGroqApiKey(): void {
  try {
    window.localStorage.removeItem(GROQ_KEY_STORAGE_KEY);
  } catch {
    // Ignorar
  }
}

export function getSelectedGroqModel(): string {
  try {
    const stored = window.localStorage.getItem(GROQ_MODEL_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {
    // Ignorar
  }
  return GROQ_PRIMARY_MODEL;
}

export function saveSelectedGroqModel(model: string): void {
  try {
    const trimmed = model.trim();
    if (!trimmed) {
      window.localStorage.removeItem(GROQ_MODEL_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(GROQ_MODEL_STORAGE_KEY, trimmed);
  } catch {
    // Ignorar
  }
}

function extractJsonBlock(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

export function loadSavedAIPacks(): SavedAIQuestionPack[] {
  try {
    const raw = window.localStorage.getItem(AI_PACKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (pack): pack is SavedAIQuestionPack =>
        Boolean(pack && typeof pack === 'object' && Array.isArray(pack.questions))
    );
  } catch {
    return [];
  }
}

export function saveAIPack(pack: SavedAIQuestionPack): SavedAIQuestionPack[] {
  const existing = loadSavedAIPacks().filter((p) => p.id !== pack.id);
  const next = [pack, ...existing].slice(0, 20);
  try {
    window.localStorage.setItem(AI_PACKS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignorar limite de cota
  }
  return next;
}

export function deleteAIPack(packId: string): SavedAIQuestionPack[] {
  const next = loadSavedAIPacks().filter((p) => p.id !== packId);
  try {
    window.localStorage.setItem(AI_PACKS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignorar
  }
  return next;
}

export function findAIQuestionById(questionId: string): Question | undefined {
  for (const pack of loadSavedAIPacks()) {
    const found = pack.questions.find((q) => q.id === questionId);
    if (found) return found;
  }
  return undefined;
}

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CallGroqOptions {
  apiKeyOverride?: string;
  modelOverride?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

async function callGroqWithFallback<T>(
  messages: GroqChatMessage[],
  options: CallGroqOptions,
  parseResponse: (rawContent: string) => T
): Promise<{ data: T; modelUsed: string }> {
  const apiKey = options.apiKeyOverride?.trim() || getGroqApiKey();
  if (!apiKey) {
    throw new GroqServiceError(
      'Nenhuma chave API da Groq foi configurada neste dispositivo.',
      'MISSING_KEY'
    );
  }

  const preferredModel = options.modelOverride?.trim() || getSelectedGroqModel();
  const models = Array.from(
    new Set([preferredModel, ...GROQ_DEFAULT_MODELS])
  );
  let lastError: Error | null = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        temperature: options.temperature ?? 0.35,
        max_tokens: options.maxTokens ?? 3200,
      };
      if (options.jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      const response = await fetch(GROQ_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401 || response.status === 403) {
        throw new GroqServiceError(
          'Chave API da Groq inválida ou sem permissão. Verifique sua chave no console.groq.com/keys.',
          'AUTH_ERROR'
        );
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const code = response.status === 429 ? 'RATE_LIMIT' : 'NETWORK';
        lastError = new GroqServiceError(
          `Groq retornou status ${response.status} (${model}): ${text.slice(0, 180)}`,
          code
        );
        continue;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content || !content.trim()) {
        lastError = new GroqServiceError(`Resposta vazia da Groq (${model}).`, 'INVALID_RESPONSE');
        continue;
      }

      const parsed = parseResponse(content);
      return { data: parsed, modelUsed: model };
    } catch (err) {
      if (err instanceof GroqServiceError && err.code === 'AUTH_ERROR') {
        throw err;
      }
      lastError =
        err instanceof Error
          ? err
          : new GroqServiceError(`Falha de rede ao consultar Groq (${model}).`, 'NETWORK');
    }
  }

  throw (
    lastError ??
    new GroqServiceError('Não foi possível obter resposta da Groq.', 'NETWORK')
  );
}

async function callGroqJson<T>(
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  options: Omit<CallGroqOptions, 'jsonMode'> = {}
): Promise<{ data: T; modelUsed: string }> {
  return callGroqWithFallback<T>(
    messages,
    { ...options, jsonMode: true },
    (content) => JSON.parse(extractJsonBlock(content)) as T
  );
}

async function callGroqText(
  messages: GroqChatMessage[],
  options: Omit<CallGroqOptions, 'jsonMode'> = {}
): Promise<{ text: string; modelUsed: string }> {
  const { data, modelUsed } = await callGroqWithFallback<string>(
    messages,
    { ...options, jsonMode: false },
    (content) => content.trim()
  );
  return { text: data, modelUsed };
}

export async function testGroqConnection(
  apiKeyOverride?: string,
  modelOverride?: string
): Promise<string> {
  const result = await callGroqJson<{ ok?: boolean; status?: string }>(
    [
      {
        role: 'system',
        content: 'Você é um validador de API em JSON. Responda estritamente com o JSON {"ok": true, "status": "conectado"}.',
      },
      {
        role: 'user',
        content: 'Responda com o JSON {"ok": true, "status": "conectado"}.',
      },
    ],
    { apiKeyOverride, modelOverride, temperature: 0.1, maxTokens: 80 }
  );
  return result.modelUsed;
}

const VALID_UNIT_IDS: UnitId[] = ['portugues', 'matematica', 'informatica', 'saneago'];

function normalizeUnitId(raw: unknown, fallback: UnitId): UnitId {
  if (typeof raw === 'string' && VALID_UNIT_IDS.includes(raw as UnitId)) {
    return raw as UnitId;
  }
  return fallback;
}

function normalizeDifficulty(raw: unknown): QuestionDifficulty {
  if (raw === 'facil' || raw === 'medio' || raw === 'dificil') return raw;
  return 'medio';
}

export function validateAndNormalizeAIQuestions(
  rawItems: unknown,
  fallbackUnitId: UnitId = 'portugues',
  lessonTag: string = 'ai-custom'
): Question[] {
  if (!Array.isArray(rawItems)) return [];

  const valid: Question[] = [];
  const seenPrompts = new Set<string>();

  rawItems.forEach((raw, idx) => {
    if (!raw || typeof raw !== 'object') return;
    const item = raw as Record<string, unknown>;

    const rawType = typeof item.type === 'string' ? item.type.trim().toLowerCase() : '';
    const prompt = typeof item.prompt === 'string' ? item.prompt.trim() : '';
    const tip = typeof item.tip === 'string' ? item.tip.trim() : '';
    const topic = typeof item.topic === 'string' && item.topic.trim() ? item.topic.trim() : 'Revisão Edital 001/2026';
    const unitId = normalizeUnitId(item.unitId, fallbackUnitId);
    const difficulty = normalizeDifficulty(item.difficulty);
    const sourceSection =
      typeof item.sourceSection === 'string' && item.sourceSection.trim()
        ? item.sourceSection.trim()
        : 'IA-Edital';

    if (prompt.length < 10 || tip.length < 10) return;
    const promptKey = prompt.toLowerCase();
    if (seenPrompts.has(promptKey)) return;

    const baseId = `ai-${unitId}-${Date.now()}-${idx}`;

    if (rawType === 'multiple-choice' || rawType === 'multiple_choice') {
      const options = Array.isArray(item.options)
        ? item.options.filter((o): o is string => typeof o === 'string' && o.trim().length > 0).map((o) => o.trim())
        : [];
      const correctIndex =
        typeof item.correctIndex === 'number' ? Math.round(item.correctIndex) : -1;

      if (options.length < 4 || options.length > 5) return;
      if (correctIndex < 0 || correctIndex >= options.length) return;

      const q: MultipleChoiceQuestion = {
        id: baseId,
        unitId,
        lessonId: lessonTag,
        type: 'multiple-choice',
        topic,
        sourceSection,
        difficulty,
        prompt,
        options,
        correctIndex,
        tip,
        isAIGenerated: true,
      };
      seenPrompts.add(promptKey);
      valid.push(q);
      return;
    }

    if (rawType === 'fill-blank' || rawType === 'fill_blank') {
      const sentenceBefore =
        typeof item.sentenceBefore === 'string' ? item.sentenceBefore.trim() : '';
      const sentenceAfter =
        typeof item.sentenceAfter === 'string' ? item.sentenceAfter.trim() : '';
      const options = Array.isArray(item.options)
        ? item.options.filter((o): o is string => typeof o === 'string' && o.trim().length > 0).map((o) => o.trim())
        : [];
      const correctAnswer =
        typeof item.correctAnswer === 'string' ? item.correctAnswer.trim() : '';

      if (!sentenceBefore && !sentenceAfter) return;
      if (options.length < 3 || !correctAnswer || !options.includes(correctAnswer)) return;

      const q: FillBlankQuestion = {
        id: baseId,
        unitId,
        lessonId: lessonTag,
        type: 'fill-blank',
        topic,
        sourceSection,
        difficulty,
        prompt,
        sentenceBefore,
        sentenceAfter,
        options,
        correctAnswer,
        tip,
        isAIGenerated: true,
      };
      seenPrompts.add(promptKey);
      valid.push(q);
      return;
    }

    if (rawType === 'true-false' || rawType === 'true_false') {
      const statement = typeof item.statement === 'string' ? item.statement.trim() : '';
      if (statement.length < 10 || typeof item.correctAnswer !== 'boolean') return;

      const q: TrueFalseQuestion = {
        id: baseId,
        unitId,
        lessonId: lessonTag,
        type: 'true-false',
        topic,
        sourceSection,
        difficulty,
        prompt,
        statement,
        correctAnswer: item.correctAnswer,
        tip,
        isAIGenerated: true,
      };
      seenPrompts.add(promptKey);
      valid.push(q);
    }
  });

  return valid;
}

export interface WeaknessAnalysisInput {
  mistakes: Record<string, MistakeRecord>;
  unitStats: Record<UnitId, PerformanceBucket>;
  topicStats: Record<string, TopicStatBucket>;
}

export function buildOfflineDiagnosisFallback(input: WeaknessAnalysisInput): GroqDiagnosisReport {
  const unitEntries = UNITS.map((u) => {
    const stat = input.unitStats[u.id] ?? { attempts: 0, correct: 0, totalTimeMs: 0 };
    const accuracy = stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : 100;
    return { unit: u, stat, accuracy, weight: EDITAL_WEIGHTS[u.id] };
  });

  const sortedByWeakness = [...unitEntries].sort((a, b) => {
    if (a.stat.attempts === 0 && b.stat.attempts > 0) return 1;
    if (b.stat.attempts === 0 && a.stat.attempts > 0) return -1;
    return a.accuracy - b.accuracy || b.weight - a.weight;
  });

  const weakestUnit = sortedByWeakness[0]?.unit ?? UNITS[0];

  const criticalTopics = Object.values(input.topicStats)
    .filter((t) => t.attempts > 0 && (t.correct / t.attempts) * 100 < 70)
    .sort((a, b) => a.correct / a.attempts - b.correct / b.attempts)
    .slice(0, 3)
    .map((t) => t.topic);

  const mistakeList = Object.values(input.mistakes);
  const topMistakeTopics = mistakeList
    .map((m) => m.topic)
    .filter((t): t is string => Boolean(t));

  const priorityTopics = Array.from(
    new Set([...criticalTopics, ...topMistakeTopics])
  ).slice(0, 3);

  const finalTopics =
    priorityTopics.length > 0
      ? priorityTopics
      : EDITAL_SUBTOPICS[weakestUnit.id].slice(0, 2);

  const hasData = Object.values(input.unitStats).some((u) => u.attempts > 0) || mistakeList.length > 0;

  return {
    detectedPattern: hasData
      ? `Seu maior ponto de atenção atual está em ${weakestUnit.title} (${sortedByWeakness[0].accuracy}% de acerto${
          finalTopics.length ? `, com foco em ${finalTopics.join(' e ')}` : ''
        }).`
      : 'Você ainda tem poucas respostas registradas. Comece priorizando Língua Portuguesa (peso máximo e 1º critério de desempate) seguida por Lógica Booleana.',
    keyRuleSummary:
      weakestUnit.id === 'portugues'
        ? 'No desempate da Patativa, Português decide a vaga: valide crase trocando por "ao", lembre que "haver" existencial não vai ao plural e nunca separe sujeito do verbo com vírgula.'
        : weakestUnit.id === 'matematica'
        ? 'Domine os dois pilares booleanos: negação do Se...Então é MA-NÉ (P ∧ ¬Q) e equivalências são Contrapositiva (¬Q → ¬P) ou NE-OU (¬P ∨ Q).'
        : weakestUnit.id === 'informatica'
        ? 'Cuidado com o Office em Português: Ctrl+B salva (Backup) e Ctrl+S sublinha; no Excel, ":" significa ATÉ e ";" significa E.'
        : 'Decore os marcos da Saneago: Sociedade de Economia Mista (Adm. Indireta), metas 99% água / 90% esgoto até 2033 e estiagem crítica de maio a setembro no Cerrado.',
    priorityTopics: finalTopics,
    focusUnitId: weakestUnit.id,
    actionPlanSteps: [
      `Executar o treino corretivo de 5 questões focado em ${finalTopics[0] ?? weakestUnit.shortTitle}.`,
      'Revisar os micro-macetes das questões erradas antes de avançar para o simulado cronometrado.',
      'Manter Língua Portuguesa e Lógica acima de 80% para garantir vantagem nos critérios de desempate.',
    ],
    generatedAt: new Date().toISOString(),
    source: 'offline-fallback',
  };
}

export async function analyzeWeaknessesWithGroq(
  input: WeaknessAnalysisInput
): Promise<GroqDiagnosisReport> {
  const compactMistakes = Object.values(input.mistakes)
    .slice(0, 20)
    .map((m) => ({
      questionId: m.questionId,
      unitId: m.unitId,
      topic: m.topic,
      wrongCount: m.wrongCount,
      userMarked: m.lastUserAnswer,
      correctAnswer: m.correctAnswer,
    }));

  const criticalTopics = Object.values(input.topicStats)
    .filter((t) => t.attempts > 0)
    .map((t) => ({
      unitId: t.unitId,
      topic: t.topic,
      attempts: t.attempts,
      accuracy: Math.round((t.correct / t.attempts) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 12);

  const userPayload = {
    unitStats: input.unitStats,
    topicStats: criticalTopics,
    mistakes: compactMistakes,
  };

  const { data, modelUsed } = await callGroqJson<{
    detectedPattern?: string;
    keyRuleSummary?: string;
    priorityTopics?: string[];
    focusUnitId?: UnitId;
    actionPlanSteps?: string[];
  }>([
    { role: 'system', content: EDITAL_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Analise o JSON de desempenho e erros do candidato abaixo e gere um diagnóstico cirúrgico para a prova da Saneago (06/12/2026).

DADOS DO CANDIDATO:
${JSON.stringify(userPayload)}

Retorne EXCLUSIVAMENTE um objeto JSON neste formato exato:
{
  "detectedPattern": "Frase direta e específica sobre o padrão de erro detectado (ex: 'Você está confundindo regência do verbo assistir com crase e trocando Ctrl+B por Ctrl+S')",
  "keyRuleSummary": "Explicação objetiva da regra-chave que resolve o erro mais crítico + impacto nos pesos/desempate do Edital 001/2026",
  "priorityTopics": ["Tópico crítico 1", "Tópico crítico 2", "Tópico crítico 3"],
  "focusUnitId": "portugues | matematica | informatica | saneago",
  "actionPlanSteps": ["Passo prático 1", "Passo prático 2", "Passo prático 3"]
}`,
    },
  ]);

  if (!data.detectedPattern || !data.keyRuleSummary) {
    throw new GroqServiceError(
      'Resposta de diagnóstico incompleta recebida da Groq.',
      'INVALID_RESPONSE'
    );
  }

  return {
    detectedPattern: data.detectedPattern.trim(),
    keyRuleSummary: data.keyRuleSummary.trim(),
    priorityTopics: Array.isArray(data.priorityTopics)
      ? data.priorityTopics.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).slice(0, 4)
      : [],
    focusUnitId: normalizeUnitId(data.focusUnitId, 'portugues'),
    actionPlanSteps: Array.isArray(data.actionPlanSteps)
      ? data.actionPlanSteps.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).slice(0, 4)
      : [],
    generatedAt: new Date().toISOString(),
    source: 'groq',
    modelUsed,
  };
}

export interface GenerateQuestionsInput {
  scope: UnitId | 'geral' | 'corretivo';
  count: number;
  focusTopics?: string[];
  focusUnitId?: UnitId;
}

function buildScopeDistribution(
  scope: UnitId | 'geral' | 'corretivo',
  count: number,
  focusUnitId?: UnitId
): Array<{ unitId: UnitId; qty: number }> {
  if (scope === 'geral') {
    if (count === 20) {
      return [
        { unitId: 'portugues', qty: 7 },
        { unitId: 'matematica', qty: 5 },
        { unitId: 'informatica', qty: 4 },
        { unitId: 'saneago', qty: 4 },
      ];
    }
    const pt = Math.max(1, Math.round(count * 0.35));
    const mat = Math.max(1, Math.round(count * 0.25));
    const inf = Math.max(1, Math.floor((count - pt - mat) / 2));
    const san = Math.max(1, count - pt - mat - inf);
    return [
      { unitId: 'portugues', qty: pt },
      { unitId: 'matematica', qty: mat },
      { unitId: 'informatica', qty: inf },
      { unitId: 'saneago', qty: san },
    ];
  }

  if (scope === 'corretivo') {
    return [{ unitId: focusUnitId ?? 'portugues', qty: count }];
  }

  return [{ unitId: scope, qty: count }];
}

async function generateBatchWithGroq(params: {
  unitId: UnitId;
  qty: number;
  focusTopics?: string[];
  lessonTag: string;
}): Promise<{ questions: Question[]; modelUsed: string }> {
  const topicsList =
    params.focusTopics && params.focusTopics.length > 0
      ? params.focusTopics.join('; ')
      : EDITAL_SUBTOPICS[params.unitId].join('; ');

  const { data, modelUsed } = await callGroqJson<{ questions?: unknown[] }>(
    [
      { role: 'system', content: EDITAL_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Gere EXATAMENTE ${params.qty} questões INÉDITAS no estilo da banca Universidade Patativa do Assaré para a unidade "${params.unitId}".
Tópicos permitidos: ${topicsList}.

Use uma mistura dos 3 formatos compatíveis abaixo (em JSON estrito):

1) Múltipla escolha (5 alternativas estilo banca):
{
  "type": "multiple_choice",
  "unitId": "${params.unitId}",
  "topic": "Nome do tópico",
  "sourceSection": "Edital 001/2026",
  "difficulty": "facil | medio | dificil",
  "prompt": "Enunciado completo...",
  "options": ["Alt A", "Alt B", "Alt C", "Alt D", "Alt E"],
  "correctIndex": 0,
  "tip": "Micro-macete explicativo objetivo (mínimo 25 caracteres)"
}

2) Completar lacuna:
{
  "type": "fill_blank",
  "unitId": "${params.unitId}",
  "topic": "Nome do tópico",
  "sourceSection": "Edital 001/2026",
  "difficulty": "medio",
  "prompt": "Complete a lacuna corretamente:",
  "sentenceBefore": "Texto antes da lacuna",
  "sentenceAfter": "texto depois da lacuna.",
  "options": ["correta", "distrator 1", "distrator 2", "distrator 3"],
  "correctAnswer": "correta",
  "tip": "Micro-macete explicativo objetivo"
}

3) Verdadeiro ou Falso:
{
  "type": "true_false",
  "unitId": "${params.unitId}",
  "topic": "Nome do tópico",
  "sourceSection": "Edital 001/2026",
  "difficulty": "facil",
  "prompt": "Julgue a afirmação:",
  "statement": "Afirmação clara para julgar como verdadeira ou falsa.",
  "correctAnswer": true,
  "tip": "Micro-macete explicativo objetivo"
}

REGRAS OBRIGATÓRIAS:
- Em "fill_blank", o valor de "correctAnswer" DEVE estar idêntico dentro do array "options".
- Em "multiple_choice", "correctIndex" deve ser inteiro de 0 a 4 apontando para a opção correta.
- Toda questão deve ter "tip" claro com o macete exato.
- Retorne apenas {"questions": [ ... ]}.`,
      },
    ],
    { temperature: 0.45, maxTokens: 3800 }
  );

  const normalized = validateAndNormalizeAIQuestions(
    data.questions,
    params.unitId,
    params.lessonTag
  );
  return { questions: normalized, modelUsed };
}

export async function generateQuestionsWithGroq(
  input: GenerateQuestionsInput
): Promise<{ questions: Question[]; modelUsed: string }> {
  const distribution = buildScopeDistribution(
    input.scope,
    input.count,
    input.focusUnitId
  );

  const allQuestions: Question[] = [];
  let lastModel = GROQ_PRIMARY_MODEL;

  for (const slice of distribution) {
    // Limita cada chamada a no máximo 10 questões para manter JSON estável
    let remaining = slice.qty;
    while (remaining > 0) {
      const batchQty = Math.min(10, remaining);
      const { questions, modelUsed } = await generateBatchWithGroq({
        unitId: slice.unitId,
        qty: batchQty,
        focusTopics: input.focusTopics,
        lessonTag: `ai-${input.scope}`,
      });
      allQuestions.push(...questions);
      lastModel = modelUsed;
      remaining -= batchQty;
    }
  }

  if (allQuestions.length === 0) {
    throw new GroqServiceError(
      'Nenhuma questão válida retornada pela Groq.',
      'INVALID_RESPONSE'
    );
  }

  return {
    questions: allQuestions.slice(0, input.count),
    modelUsed: lastModel,
  };
}

function shuffleLocal<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildOfflineQuestionsFallback(input: GenerateQuestionsInput): Question[] {
  if (input.scope === 'geral') {
    const dist = buildScopeDistribution('geral', input.count);
    return dist.flatMap((slice) =>
      shuffleLocal(getQuestionsByUnit(slice.unitId)).slice(0, slice.qty)
    );
  }

  if (input.scope === 'corretivo') {
    const focusTopicsLower = (input.focusTopics ?? []).map((t) => t.toLowerCase());
    const prioritized = QUESTIONS.filter((q) => {
      if (focusTopicsLower.length === 0) {
        return q.unitId === (input.focusUnitId ?? 'portugues');
      }
      const qTopic = q.topic.toLowerCase();
      return focusTopicsLower.some((ft) => qTopic.includes(ft) || ft.includes(qTopic));
    });

    const pool =
      prioritized.length >= input.count
        ? prioritized
        : [
            ...prioritized,
            ...getQuestionsByUnit(input.focusUnitId ?? 'portugues').filter(
              (q) => !prioritized.some((p) => p.id === q.id)
            ),
          ];

    return shuffleLocal(pool).slice(0, input.count);
  }

  return shuffleLocal(getQuestionsByUnit(input.scope)).slice(0, input.count);
}

export interface PingoChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskPingoAboutQuestionParams {
  question: Question;
  selectedOption: string;
  history: PingoChatMessage[];
  userPrompt: string;
}

export interface AskPingoResponse {
  answer: string;
  modelUsed: string;
}

function formatQuestionContextForPingo(
  question: Question,
  selectedOption: string
): string {
  const unitTitle = getUnitMeta(question.unitId).title;
  const lines: string[] = [
    `Unidade: ${unitTitle}`,
    `Tópico: ${question.topic}`,
    `Enunciado: ${question.prompt}`,
  ];

  if (question.type === 'multiple-choice') {
    lines.push('Alternativas:');
    question.options.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      lines.push(`  ${letter}) ${opt}`);
    });
    const correctLetter = String.fromCharCode(65 + question.correctIndex);
    lines.push(
      `Gabarito oficial: ${correctLetter}) ${question.options[question.correctIndex]}`
    );
  } else if (question.type === 'fill-blank') {
    const sentence = `${question.sentenceBefore ? `${question.sentenceBefore} ` : ''}___ ${question.sentenceAfter}`.trim();
    lines.push(`Frase com lacuna: "${sentence}"`);
    lines.push(`Opções: ${question.options.join(' | ')}`);
    lines.push(`Gabarito oficial: ${question.correctAnswer}`);
  } else if (question.type === 'true-false') {
    lines.push(`Afirmação: ${question.statement}`);
    lines.push(
      `Gabarito oficial: ${question.correctAnswer ? 'Verdadeiro' : 'Falso'}`
    );
  } else if (question.type === 'match-pairs') {
    lines.push('Pares corretos:');
    question.pairs.forEach((p) => {
      lines.push(`  - ${p.left} ↔ ${p.right}`);
    });
  }

  lines.push(`Resposta marcada pelo aluno: ${selectedOption || 'Não informada'}`);
  lines.push(`Explicação / Micro-macete base: ${question.tip}`);

  return lines.join('\n');
}

export async function askPingoAboutQuestion(
  params: AskPingoAboutQuestionParams
): Promise<AskPingoResponse> {
  const questionContext = formatQuestionContextForPingo(
    params.question,
    params.selectedOption
  );

  const systemPrompt = `${EDITAL_SYSTEM_PROMPT}

PAPEL NESTA CONVERSA:
Você é o **Pingo**, a gota d'água engenheira da SANEAGO e tutor do aplicativo Saneago Quest.
O candidato acabou de responder uma questão e abriu o chat com você para tirar dúvidas.

ESTILO E REGRAS DE RESPOSTA:
1. Seja direto, didático e bem-humorado, sempre focado nas pegadinhas da banca Universidade Patativa do Assaré (Edital SANEAGO 001/2026).
2. Você JÁ conhece o enunciado, todas as alternativas, o gabarito e o que o aluno marcou (abaixo). Não peça para ele repetir a questão.
3. Responda de forma curta: **no máximo 3 a 4 parágrafos curtos ou bullet points** diretos ao ponto.
4. Use analogias simples e linguagem do dia a dia — evite "gramatiquês" ou "juridiquês" pesado.
5. Destaque palavras-chave, regras mnemônicas e letras das alternativas em **negrito** (ex: **alternativa B**, **regra do MA-NÉ**).
6. Nunca invente alternativas ou afirmações que não existam na questão abaixo.

DADOS COMPLETOS DA QUESTÃO ATUAL:
${questionContext}`;

  const cleanHistory = params.history
    .filter((m) => m.content.trim().length > 0)
    .slice(-10)
    .map((m) => ({
      role: m.role,
      content: m.content.trim(),
    }));

  const messages: GroqChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...cleanHistory,
    { role: 'user', content: params.userPrompt.trim() },
  ];

  const { text, modelUsed } = await callGroqText(messages, {
    temperature: 0.45,
    maxTokens: 700,
  });

  return {
    answer: text,
    modelUsed,
  };
}

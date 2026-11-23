import {
  getLessonGuide,
  LESSON_GUIDES,
  UNIT_GUIDE_OVERVIEWS,
} from '../src/data/lessonGuides';
import { LESSONS, QUESTIONS, UNITS } from '../src/data/questions';
import { QuestionDifficulty } from '../src/types/quiz';

const errors: string[] = [];
const VALID_DIFFICULTIES = new Set<QuestionDifficulty>(['medium', 'hard', 'legendary']);

if (UNITS.length !== 4) {
  errors.push(`Esperado 4 unidades, encontrado ${UNITS.length}`);
}

if (LESSONS.length !== 16) {
  errors.push(`Esperado 16 lições, encontrado ${LESSONS.length}`);
}

if (QUESTIONS.length !== 160) {
  errors.push(`Esperado exatamente 160 questões estáticas, encontrado ${QUESTIONS.length}`);
}

const unitIds = new Set(UNITS.map((u) => u.id));
const lessonIds = new Set(LESSONS.map((l) => l.id));
const questionIds = new Set<string>();

for (const unit of UNITS) {
  const unitQuestions = QUESTIONS.filter((q) => q.unitId === unit.id);
  if (unitQuestions.length !== 40) {
    errors.push(`Unidade ${unit.id} possui ${unitQuestions.length} questões (esperado 40).`);
  }
  const types = new Set(unitQuestions.map((q) => q.type));
  for (const requiredType of ['multiple-choice', 'fill-blank', 'true-false', 'match-pairs'] as const) {
    if (!types.has(requiredType)) {
      errors.push(`Unidade ${unit.id} está sem questão do tipo ${requiredType}.`);
    }
  }
}

for (const lesson of LESSONS) {
  const lessonQuestions = QUESTIONS.filter((q) => q.lessonId === lesson.id);
  if (lessonQuestions.length !== 10) {
    errors.push(`Lição ${lesson.id} possui ${lessonQuestions.length} questões (esperado 10).`);
  }
  const mediumCount = lessonQuestions.filter((q) => q.difficulty === 'medium').length;
  const advancedCount = lessonQuestions.filter(
    (q) => q.difficulty === 'hard' || q.difficulty === 'legendary'
  ).length;
  const legendaryCount = lessonQuestions.filter((q) => q.difficulty === 'legendary').length;

  if (mediumCount !== 5) {
    errors.push(`Lição ${lesson.id} possui ${mediumCount} questões medium (esperado 5).`);
  }
  if (advancedCount !== 5) {
    errors.push(
      `Lição ${lesson.id} possui ${advancedCount} questões hard/legendary (esperado 5).`
    );
  }
  if (legendaryCount < 2) {
    errors.push(
      `Lição ${lesson.id} possui ${legendaryCount} questões legendary (esperado >= 2).`
    );
  }
}

const mcDistribution = [0, 0, 0, 0, 0];
let fiveOptionMcCount = 0;

for (const q of QUESTIONS) {
  if (questionIds.has(q.id)) {
    errors.push(`ID duplicado: ${q.id}`);
  }
  questionIds.add(q.id);

  if (!unitIds.has(q.unitId)) {
    errors.push(`Questão ${q.id} referencia unidade inválida: ${q.unitId}`);
  }
  if (!lessonIds.has(q.lessonId)) {
    errors.push(`Questão ${q.id} referencia lição inválida: ${q.lessonId}`);
  }
  if (!VALID_DIFFICULTIES.has(q.difficulty)) {
    errors.push(`Questão ${q.id} possui difficulty inválido: ${String(q.difficulty)}`);
  }
  if (!q.sourceTag || !q.sourceTag.trim()) {
    errors.push(`Questão ${q.id} está sem sourceTag preenchida.`);
  }
  if (!q.tip || q.tip.trim().length < 15) {
    errors.push(`Questão ${q.id} possui micro-macete (tip) vazio ou muito curto (< 15 chars).`);
  }

  if (q.type === 'multiple-choice') {
    if (q.options.length < 4 || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      errors.push(`Questão ${q.id} (multiple-choice) possui opções ou correctIndex inválidos.`);
    }
    const uniqueOpts = new Set(q.options.map((o) => o.trim().toLowerCase()));
    if (uniqueOpts.size !== q.options.length) {
      errors.push(`Questão ${q.id} possui alternativas duplicadas.`);
    }
    if (q.options.length === 5 && q.correctIndex >= 0 && q.correctIndex < 5) {
      mcDistribution[q.correctIndex]++;
      fiveOptionMcCount++;
    }
  } else if (q.type === 'fill-blank') {
    if (!q.options.includes(q.correctAnswer)) {
      errors.push(`Questão ${q.id} (fill-blank) não contém correctAnswer em options.`);
    }
    const uniqueOpts = new Set(q.options.map((o) => o.trim().toLowerCase()));
    if (uniqueOpts.size !== q.options.length) {
      errors.push(`Questão ${q.id} (fill-blank) possui opções duplicadas.`);
    }
  } else if (q.type === 'match-pairs') {
    if (q.pairs.length < 3) {
      errors.push(`Questão ${q.id} (match-pairs) possui menos de 3 pares.`);
    }
    const pairIds = new Set(q.pairs.map((p) => p.id));
    if (pairIds.size !== q.pairs.length) {
      errors.push(`Questão ${q.id} (match-pairs) possui IDs de pares duplicados.`);
    }
  }
}

if (fiveOptionMcCount === 0) {
  errors.push('Nenhuma questão de múltipla escolha com 5 alternativas encontrada.');
} else {
  mcDistribution.forEach((count, idx) => {
    const pct = (count / fiveOptionMcCount) * 100;
    const letter = String.fromCharCode(65 + idx);
    if (pct < 14 || pct > 26) {
      errors.push(
        `Distribuição desequilibrada na alternativa ${letter}: ${count}/${fiveOptionMcCount} (${pct.toFixed(1)}%, esperado entre 14% e 26%).`
      );
    }
  });
}

// Validação dos Guias Teóricos por Unidade (UNIT_GUIDE_OVERVIEWS)
for (const unit of UNITS) {
  const overview = UNIT_GUIDE_OVERVIEWS[unit.id];
  if (!overview) {
    errors.push(`Unidade ${unit.id} não possui entrada em UNIT_GUIDE_OVERVIEWS.`);
    continue;
  }
  if (!overview.title.trim() || !overview.intro.trim() || !overview.examTip.trim() || !overview.mascotSpeech.trim()) {
    errors.push(`UNIT_GUIDE_OVERVIEWS[${unit.id}] possui campos obrigatórios vazios.`);
  }
}

// Validação de duplicidade e órfãos em LESSON_GUIDES
const seenGuideLessonIds = new Set<string>();
for (const guide of LESSON_GUIDES) {
  if (seenGuideLessonIds.has(guide.lessonId)) {
    errors.push(`Guia teórico duplicado para lessonId: ${guide.lessonId}`);
  }
  seenGuideLessonIds.add(guide.lessonId);

  if (!lessonIds.has(guide.lessonId)) {
    errors.push(`Guia teórico órfão referencia lessonId inexistente: ${guide.lessonId}`);
  }
}

// Garante que 100% dos lessonId de LESSONS e de QUESTIONS possuem guia completo
const allRequiredLessonIds = new Set<string>([
  ...LESSONS.map((l) => l.id),
  ...QUESTIONS.map((q) => q.lessonId),
]);

for (const lessonId of allRequiredLessonIds) {
  const guide = getLessonGuide(lessonId);
  if (!guide) {
    errors.push(`Lição ${lessonId} não possui guia teórico correspondente em lessonGuides.ts.`);
    continue;
  }

  const lessonMeta = LESSONS.find((l) => l.id === lessonId);
  if (lessonMeta && guide.unitId !== lessonMeta.unitId) {
    errors.push(`Guia da lição ${lessonId} aponta para unitId ${guide.unitId} (esperado ${lessonMeta.unitId}).`);
  }

  if (!guide.title.trim()) {
    errors.push(`Guia da lição ${lessonId} possui title vazio.`);
  }
  if (guide.summary.trim().length < 20) {
    errors.push(`Guia da lição ${lessonId} possui summary muito curto (< 20 chars).`);
  }
  if (guide.mascotWelcome.trim().length < 10) {
    errors.push(`Guia da lição ${lessonId} possui mascotWelcome muito curto (< 10 chars).`);
  }

  if (guide.keyRules.length < 2 || guide.keyRules.length > 4) {
    errors.push(`Guia da lição ${lessonId} possui ${guide.keyRules.length} keyRules (esperado 2 a 4).`);
  }
  guide.keyRules.forEach((rule, idx) => {
    if (!rule.title.trim() || !rule.mnemonic.trim() || !rule.explanation.trim()) {
      errors.push(`Guia ${lessonId} -> keyRules[${idx}] possui campo obrigatório vazio.`);
    }
  });

  if (guide.examples.length < 1) {
    errors.push(`Guia da lição ${lessonId} precisa de pelo menos 1 exemplo Certo vs Errado.`);
  }
  guide.examples.forEach((ex, idx) => {
    if (!ex.correct.trim() || !ex.wrong.trim() || !ex.explanation.trim()) {
      errors.push(`Guia ${lessonId} -> examples[${idx}] possui campo obrigatório vazio.`);
    }
  });

  if (guide.cheatSheetTable) {
    const tbl = guide.cheatSheetTable;
    if (tbl.headers.length < 2 || tbl.rows.length < 2) {
      errors.push(`Guia ${lessonId} -> cheatSheetTable deve ter >= 2 colunas e >= 2 linhas.`);
    }
    tbl.rows.forEach((row, rIdx) => {
      if (row.length !== tbl.headers.length) {
        errors.push(
          `Guia ${lessonId} -> cheatSheetTable.rows[${rIdx}] tem ${row.length} colunas (esperado ${tbl.headers.length}).`
        );
      }
    });
  }
}

if (errors.length > 0) {
  throw new Error('FALHA NA VALIDAÇÃO DE QUESTÕES:\n' + errors.map((e) => `- ${e}`).join('\n'));
}

const difficultyTotals = {
  medium: QUESTIONS.filter((q) => q.difficulty === 'medium').length,
  hard: QUESTIONS.filter((q) => q.difficulty === 'hard').length,
  legendary: QUESTIONS.filter((q) => q.difficulty === 'legendary').length,
};

const distReport = mcDistribution
  .map((c, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const pct = ((c / fiveOptionMcCount) * 100).toFixed(1);
    return `${letter}=${c} (${pct}%)`;
  })
  .join(' | ');

console.log(
  `OK: ${UNITS.length} unidades, ${LESSONS.length} lições, ${QUESTIONS.length} questões e ${LESSON_GUIDES.length} guias teóricos validados com sucesso.`
);
console.log(
  `Dificuldades: medium=${difficultyTotals.medium}, hard=${difficultyTotals.hard}, legendary=${difficultyTotals.legendary}`
);
console.log(`Gabaritos (5 alternativas, n=${fiveOptionMcCount}): ${distReport}`);
for (const unit of UNITS) {
  const count = QUESTIONS.filter((q) => q.unitId === unit.id).length;
  console.log(`  - ${unit.title}: ${count} questões`);
}

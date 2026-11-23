import {
  getLessonGuide,
  LESSON_GUIDES,
  UNIT_GUIDE_OVERVIEWS,
} from '../src/data/lessonGuides';
import { LESSONS, QUESTIONS, UNITS } from '../src/data/questions';

const errors: string[] = [];

if (UNITS.length !== 4) {
  errors.push(`Esperado 4 unidades, encontrado ${UNITS.length}`);
}

if (LESSONS.length !== 16) {
  errors.push(`Esperado 16 lições, encontrado ${LESSONS.length}`);
}

if (QUESTIONS.length !== 80) {
  errors.push(`Esperado exatamente 80 questões estáticas, encontrado ${QUESTIONS.length}`);
}

const unitIds = new Set(UNITS.map((u) => u.id));
const lessonIds = new Set(LESSONS.map((l) => l.id));
const questionIds = new Set<string>();

for (const unit of UNITS) {
  const unitQuestions = QUESTIONS.filter((q) => q.unitId === unit.id);
  if (unitQuestions.length !== 20) {
    errors.push(`Unidade ${unit.id} possui ${unitQuestions.length} questões (esperado 20).`);
  }
  const types = new Set(unitQuestions.map((q) => q.type));
  for (const requiredType of ['multiple-choice', 'fill-blank', 'true-false', 'match-pairs'] as const) {
    if (!types.has(requiredType)) {
      errors.push(`Unidade ${unit.id} está sem questão do tipo ${requiredType}.`);
    }
  }
}

for (const lesson of LESSONS) {
  const count = QUESTIONS.filter((q) => q.lessonId === lesson.id).length;
  if (count !== 5) {
    errors.push(`Lição ${lesson.id} possui ${count} questões (esperado 5).`);
  }
}

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
  if (!q.tip || q.tip.trim().length < 10) {
    errors.push(`Questão ${q.id} possui micro-macete (tip) vazio ou muito curto.`);
  }

  if (q.type === 'multiple-choice') {
    if (q.options.length < 4 || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      errors.push(`Questão ${q.id} (multiple-choice) possui opções ou correctIndex inválidos.`);
    }
  } else if (q.type === 'fill-blank') {
    if (!q.options.includes(q.correctAnswer)) {
      errors.push(`Questão ${q.id} (fill-blank) não contém correctAnswer em options.`);
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

console.log(
  `OK: ${UNITS.length} unidades, ${LESSONS.length} lições, ${QUESTIONS.length} questões e ${LESSON_GUIDES.length} guias teóricos validados com sucesso.`
);
for (const unit of UNITS) {
  const count = QUESTIONS.filter((q) => q.unitId === unit.id).length;
  console.log(`  - ${unit.title}: ${count} questões`);
}

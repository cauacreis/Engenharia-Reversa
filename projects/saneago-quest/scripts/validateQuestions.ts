import { LESSONS, QUESTIONS, UNITS } from '../src/data/questions';

const errors: string[] = [];

if (UNITS.length !== 4) {
  errors.push(`Esperado 4 unidades, encontrado ${UNITS.length}`);
}

if (LESSONS.length !== 12) {
  errors.push(`Esperado 12 lições, encontrado ${LESSONS.length}`);
}

if (QUESTIONS.length < 40) {
  errors.push(`Esperado pelo menos 40 questões, encontrado ${QUESTIONS.length}`);
}

const unitIds = new Set(UNITS.map((u) => u.id));
const lessonIds = new Set(LESSONS.map((l) => l.id));
const questionIds = new Set<string>();

for (const unit of UNITS) {
  const unitQuestions = QUESTIONS.filter((q) => q.unitId === unit.id);
  if (unitQuestions.length < 10) {
    errors.push(`Unidade ${unit.id} possui apenas ${unitQuestions.length} questões (mínimo 10).`);
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
  if (count === 0) {
    errors.push(`Lição ${lesson.id} não possui questões.`);
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

if (errors.length > 0) {
  throw new Error('FALHA NA VALIDAÇÃO DE QUESTÕES:\n' + errors.map((e) => `- ${e}`).join('\n'));
}

console.log(
  `OK: ${UNITS.length} unidades, ${LESSONS.length} lições e ${QUESTIONS.length} questões validadas com sucesso.`
);
for (const unit of UNITS) {
  const count = QUESTIONS.filter((q) => q.unitId === unit.id).length;
  console.log(`  - ${unit.title}: ${count} questões`);
}

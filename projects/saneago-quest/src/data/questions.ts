import { LessonMeta, Question, UnitId, UnitMeta } from '../types/quiz';
import { INFORMATICA_QUESTIONS } from './questionBank/informatica';
import { MATEMATICA_QUESTIONS } from './questionBank/matematica';
import { PORTUGUES_QUESTIONS } from './questionBank/portugues';
import { SANEAGO_QUESTIONS } from './questionBank/saneago';

export const UNITS: UnitMeta[] = [
  {
    id: 'portugues',
    number: 1,
    title: 'Língua Portuguesa',
    shortTitle: 'Português',
    subtitle: 'Crase, Concordância, Regência, Vírgula, Novo Acordo, Porquês e Vozes',
    badgeText: 'Maior Peso & Desempate',
    accentColor: '#58CC02',
    shadeColor: '#46A302',
    softBg: 'rgba(88, 204, 2, 0.14)',
    lessonCount: 4,
    simuladoDurationMinutes: 10,
    simuladoQuestionCount: 10,
  },
  {
    id: 'matematica',
    number: 2,
    title: 'Matemática & Lógica',
    shortTitle: 'Matemática',
    subtitle: 'Tabela-Verdade, MA-NÉ, Regra de Três, %, Combinatória e Quantificadores',
    badgeText: 'Lógica Booleana',
    accentColor: '#FF9600',
    shadeColor: '#CC7800',
    softBg: 'rgba(255, 150, 0, 0.14)',
    lessonCount: 4,
    simuladoDurationMinutes: 12,
    simuladoQuestionCount: 10,
  },
  {
    id: 'informatica',
    number: 3,
    title: 'Informática & Office BR',
    shortTitle: 'Informática',
    subtitle: 'Windows, Atalhos Office PT-BR, Excel, Protocolos, Pharming e Backups',
    badgeText: 'Pegadinhas Office PT-BR',
    accentColor: '#00B8FF',
    shadeColor: '#0088C2',
    softBg: 'rgba(0, 184, 255, 0.14)',
    lessonCount: 4,
    simuladoDurationMinutes: 10,
    simuladoQuestionCount: 10,
  },
  {
    id: 'saneago',
    number: 4,
    title: 'Saneago & Marco Legal',
    shortTitle: 'Saneago',
    subtitle: 'Natureza Jurídica, Metas 99%/90%, 4 Eixos, Etapas da ETA e Bacias de GO',
    badgeText: 'Edital & Atualidades',
    accentColor: '#14B8A6',
    shadeColor: '#0D8A7B',
    softBg: 'rgba(20, 184, 166, 0.14)',
    lessonCount: 4,
    simuladoDurationMinutes: 10,
    simuladoQuestionCount: 10,
  },
];

export const LESSONS: LessonMeta[] = [
  // Unidade 1 — Língua Portuguesa
  {
    id: 'pt-1',
    unitId: 'portugues',
    order: 1,
    title: 'Crase & Concordância',
    subtitle: 'Regra da troca, haver vs. existir, partícula SE e porcentagem',
    xpReward: 25,
  },
  {
    id: 'pt-2',
    unitId: 'portugues',
    order: 2,
    title: 'Regência & Vírgula',
    subtitle: 'Assistir, visar, preferir e proibições absolutas de pontuação',
    xpReward: 25,
  },
  {
    id: 'pt-3',
    unitId: 'portugues',
    order: 3,
    title: 'Novo Acordo & Conjunções',
    subtitle: 'Ditongos abertos, regras do hífen e valor semântico das conjunções',
    xpReward: 30,
  },
  {
    id: 'pt-4',
    unitId: 'portugues',
    order: 4,
    title: 'Porquês, Próclise & Vozes',
    subtitle: 'Uso dos porquês, próclise com atrativos, parônimos e vozes verbais',
    xpReward: 35,
  },

  // Unidade 2 — Matemática & Lógica
  {
    id: 'mat-1',
    unitId: 'matematica',
    order: 1,
    title: 'Tabela-Verdade & De Morgan',
    subtitle: 'Conectivos E, OU, Se...Então, Bicondicional e negações básicas',
    xpReward: 25,
  },
  {
    id: 'mat-2',
    unitId: 'matematica',
    order: 2,
    title: 'Negação MA-NÉ & Equivalências',
    subtitle: 'Negação da condicional, contrapositiva e regra do NE-OU',
    xpReward: 30,
  },
  {
    id: 'mat-3',
    unitId: 'matematica',
    order: 3,
    title: 'Regra de Três, % & Conjuntos',
    subtitle: 'Proporção inversa, variações sucessivas, Venn e probabilidade',
    xpReward: 30,
  },
  {
    id: 'mat-4',
    unitId: 'matematica',
    order: 4,
    title: 'Combinatória, Juros & Quantificadores',
    subtitle: 'Arranjo vs. combinação, juros simples e negação de Todo/Nenhum/Algum',
    xpReward: 35,
  },

  // Unidade 3 — Informática & Office BR
  {
    id: 'inf-1',
    unitId: 'informatica',
    order: 1,
    title: 'Windows & Atalhos Office PT-BR',
    subtitle: 'Ctrl+B, Ctrl+S, Ctrl+T, Win+E/D/L e exclusão permanente',
    xpReward: 25,
  },
  {
    id: 'inf-2',
    unitId: 'informatica',
    order: 2,
    title: 'Fórmulas do Excel em Português',
    subtitle: 'Intervalo (:), união (;), SOMA, MÉDIA, CONT.NÚM, CONT.VALORES e SE',
    xpReward: 30,
  },
  {
    id: 'inf-3',
    unitId: 'informatica',
    order: 3,
    title: 'Segurança, Redes & Malwares',
    subtitle: 'HTTPS, Vírus, Worm, Trojan, Ransomware, Spyware, Phishing e Firewall',
    xpReward: 30,
  },
  {
    id: 'inf-4',
    unitId: 'informatica',
    order: 4,
    title: 'Extensões, Protocolos & Backups',
    subtitle: 'SMTP/IMAP/DNS/DHCP, pharming e backup incremental vs. diferencial',
    xpReward: 35,
  },

  // Unidade 4 — Saneago & Marco Legal
  {
    id: 'san-1',
    unitId: 'saneago',
    order: 1,
    title: 'Institucional SANEAGO',
    subtitle: 'Sociedade de Economia Mista, controle estadual e cobertura em Goiás',
    xpReward: 25,
  },
  {
    id: 'san-2',
    unitId: 'saneago',
    order: 2,
    title: 'Marco Legal & 4 Eixos',
    subtitle: 'Lei 14.026/2020 (99% e 90% até 2033) e Lei 11.445/2007',
    xpReward: 30,
  },
  {
    id: 'san-3',
    unitId: 'saneago',
    order: 3,
    title: 'Cerrado, Saúde & Prova Online',
    subtitle: 'Regime de chuvas em Goiás, doenças hídricas e regras de 06/12/2026',
    xpReward: 30,
  },
  {
    id: 'san-4',
    unitId: 'saneago',
    order: 4,
    title: 'Etapas da ETA & Bacias de GO',
    subtitle: 'Coagulação, floculação, decantação, filtração e bacias hidrográficas',
    xpReward: 35,
  },
];

export const QUESTIONS: Question[] = [
  ...PORTUGUES_QUESTIONS,
  ...MATEMATICA_QUESTIONS,
  ...INFORMATICA_QUESTIONS,
  ...SANEAGO_QUESTIONS,
];

export function getUnitMeta(unitId: UnitId): UnitMeta {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) {
    throw new Error(`Unidade desconhecida: ${unitId}`);
  }
  return unit;
}

export function getLessonsByUnit(unitId: UnitId): LessonMeta[] {
  return LESSONS.filter((l) => l.unitId === unitId).sort((a, b) => a.order - b.order);
}

export function getQuestionsByLesson(lessonId: string): Question[] {
  return QUESTIONS.filter((q) => q.lessonId === lessonId);
}

export function getQuestionsByUnit(unitId: UnitId): Question[] {
  return QUESTIONS.filter((q) => q.unitId === unitId);
}

export function getQuestionById(questionId: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === questionId);
}

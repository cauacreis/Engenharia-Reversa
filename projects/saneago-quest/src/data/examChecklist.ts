export interface ExamChecklistItem {
  id: string;
  title: string;
  detail: string;
  criticalNote: string;
}

export interface QuickCheatSheetCard {
  id: string;
  title: string;
  badge: string;
  accentColor: string;
  rows: Array<{ label: string; value: string }>;
}

export const EXAM_DATE_ISO = '2026-12-06T09:00:00-03:00';
export const EXAM_DATE_DISPLAY = '06 de dezembro de 2026';

export const EXAM_CHECKLIST_ITEMS: ExamChecklistItem[] = [
  {
    id: 'clean-browser',
    title: '1. Navegador Limpo',
    detail: 'Abra a prova em janela anônima ou em um perfil novo sem extensões instaladas.',
    criticalNote: 'Evita conflitos de script com o sistema de monitoramento da banca.',
  },
  {
    id: 'window-focus',
    title: '2. Foco da Janela e Modo Não Perturbe',
    detail: 'Feche programas em segundo plano, não pressione Alt + Tab e ative o Não Perturbe do Windows.',
    criticalNote: 'Notificações pop-up podem roubar o foco da janela da prova.',
  },
  {
    id: 'stable-network',
    title: '3. Conexão Estável (Cabo + 4G/5G Backup)',
    detail: 'Conecte o computador via cabo de rede e deixe os dados móveis do celular prontos para rotear.',
    criticalNote: 'Atenção: cada desconexão durante a prova desconta 1 questão!',
  },
  {
    id: 'paper-pen',
    title: '4. Material de Apoio na Mesa',
    detail: 'Deixe folha em branco e caneta separadas antes de iniciar a avaliação.',
    criticalNote: 'Essencial para montar tabelas-verdade, regra de três e diagramas de Venn.',
  },
];

export const QUICK_CHEATSHEET_CARDS: QuickCheatSheetCard[] = [
  {
    id: 'cheat-pt',
    title: 'Português — Regras de Ouro',
    badge: 'Peso Máximo',
    accentColor: '#58CC02',
    rows: [
      { label: 'Crase', value: 'Troque por masculino: se der "ao(s)", usa "à(s)"' },
      { label: 'Haver vs. Existir', value: 'Haver (existir) = sempre singular | Existir = concorda' },
      { label: 'Partícula SE', value: 'Com preposição (Precisa-se de) = singular obrigatório' },
      { label: 'Vírgula', value: 'PROIBIDO separar sujeito do verbo ou verbo do objeto' },
    ],
  },
  {
    id: 'cheat-mat',
    title: 'Lógica & Matemática — Fórmulas',
    badge: 'Booleana',
    accentColor: '#FF9600',
    rows: [
      { label: 'Negação P → Q (MA-NÉ)', value: 'P ∧ ¬Q (MAntém a 1ª E NEga a 2ª)' },
      { label: 'Equivalência 1', value: 'Contrapositiva: ¬Q → ¬P (inverte e nega ambas)' },
      { label: 'Equivalência 2 (NE-OU)', value: '¬P ∨ Q (NEga a 1ª OU mantém a 2ª)' },
      { label: 'Sucessivas +20% e -20%', value: '1,20 × 0,80 = 0,96 → queda líquida de 4%' },
    ],
  },
  {
    id: 'cheat-inf',
    title: 'Office PT-BR & Excel',
    badge: 'Pegadinhas',
    accentColor: '#00B8FF',
    rows: [
      { label: 'Salvar / Sublinhado', value: 'Ctrl + B (Salvar) | Ctrl + S (Sublinhado)' },
      { label: 'Tudo / Abrir / Localizar', value: 'Ctrl + T (Tudo) | Ctrl + A (Abrir) | Ctrl + L (Localizar)' },
      { label: 'Excel ":" vs ";"', value: '":" significa ATÉ (A1:A4) | ";" significa E (A1;A4)' },
      { label: 'CONT.NÚM vs CONT.VALORES', value: 'NÚM conta apenas números | VALORES conta não vazias' },
    ],
  },
  {
    id: 'cheat-san',
    title: 'Saneago & Marco Legal',
    badge: 'Edital 001/2026',
    accentColor: '#14B8A6',
    rows: [
      { label: 'Natureza Jurídica', value: 'Sociedade de Economia Mista (Adm. Indireta / GO majoritário)' },
      { label: 'Metas até 31/12/2033', value: '99% água potável e 90% coleta/tratamento de esgoto' },
      { label: '4 Eixos (Lei 11.445/07)', value: 'Água, Esgoto, Resíduos Sólidos e Drenagem Pluvial' },
      { label: 'Estações Cerrado (GO)', value: 'Chuvoso: Out–Abr | Estiagem crítica: Mai–Set' },
    ],
  },
];

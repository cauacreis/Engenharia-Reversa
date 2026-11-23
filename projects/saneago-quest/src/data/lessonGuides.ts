import { LessonGuide, UnitGuideOverview, UnitId } from '../types/quiz';

export const UNIT_GUIDE_OVERVIEWS: Record<UnitId, UnitGuideOverview> = {
  portugues: {
    unitId: 'portugues',
    title: 'Língua Portuguesa — Guia do Zero',
    intro:
      'Português tem o maior peso da prova e é o 1º critério de desempate da Banca Patativa. Aqui você aprende exatamente os testes práticos para não cair em pegadinhas de crase, concordância, vírgula e ortografia.',
    examTip:
      'Estratégia de prova: nunca confie no "som bonito" da frase. Aplique sempre a troca mecânica (masculino no lugar do feminino, "eles existem" no lugar de "haver", sujeito + verbo sem vírgula).',
    mascotSpeech:
      'Dominar Português garante a vantagem no desempate! Leia os macetes diretos e parta para o treino.',
  },
  matematica: {
    unitId: 'matematica',
    title: 'Matemática & Lógica — Guia do Zero',
    intro:
      'Raciocínio Lógico é o 2º critério de desempate e segue fórmulas exatas. Se você decorar os 4 conectivos, a regra do MA-NÉ, a proporcionalidade e os quantificadores, resolve qualquer questão em menos de 1 minuto.',
    examTip:
      'Tenha papel e caneta na mesa no dia 06/12/2026 para montar a Tabela-Verdade e fazer as contas de regra de três, porcentagem sucessiva e análise combinatória sem pressa.',
    mascotSpeech:
      'Lógica não é adivinhação: é receita pronta! Memorize MA-NÉ, NE-OU e Vera Fischer antes de começar.',
  },
  informatica: {
    unitId: 'informatica',
    title: 'Informática & Office BR — Guia do Zero',
    intro:
      'A banca cobra o ambiente Microsoft Office configurado em Português (BR) — onde os atalhos mudam completamente em relação ao inglês — além de operadores do Excel, protocolos de rede, golpes digitais e tipos de backup.',
    examTip:
      'A pegadinha nº 1 da Patativa é trocar Ctrl+B por Ctrl+S no Word e confundir ":" (ATÉ) com ";" (E) nas planilhas do Excel. Revise as tabelas antes de responder.',
    mascotSpeech:
      'Cuidado com o automático do inglês! No Word BR, quem salva é Ctrl+B de Backup.',
  },
  saneago: {
    unitId: 'saneago',
    title: 'Saneago & Marco Legal — Guia do Zero',
    intro:
      'Aqui estão os dados objetivos que sempre aparecem sobre a SANEAGO, as metas de universalização da Lei 14.026/2020, os 4 eixos da Lei 11.445/2007, o tratamento de água na ETA e o clima/hidrografia de Goiás.',
    examTip:
      'Fique atento a dois pares de números que a banca adora inverter: metas até 2033 (99% água / 90% esgoto) e estações no Cerrado goiano (Chuva: Out–Abr / Seca: Mai–Set).',
    mascotSpeech:
      'Conheça a empresa onde você vai estagiar! Decore 99%/90% até 2033 e a ordem da ETA.',
  },
};

export const LESSON_GUIDES: LessonGuide[] = [
  // =========================================================================
  // UNIDADE 1: LÍNGUA PORTUGUESA
  // =========================================================================
  {
    lessonId: 'pt-1',
    unitId: 'portugues',
    title: 'Crase & Concordância',
    summary:
      'Aprenda o teste prático para saber quando usar crase ("à") sem decorar centenas de regras e entenda por que "houveram" quase sempre está errado na prova.',
    mascotWelcome:
      'Começando pelo tópico campeão de prova! Teste a troca pelo masculino e lembre que "haver" não vai para o plural.',
    keyRules: [
      {
        title: 'Regra da Troca pelo Masculino',
        mnemonic: 'Apareceu "AO"? Crase NO!',
        explanation:
          'Troque a palavra feminina por uma masculina parecida. Se antes dela aparecer "ao", use crase ("à"). Se aparecer apenas "o" ou "a", não use.',
        formula: 'Entregou à diretora ↔ Entregou AO diretor',
      },
      {
        title: 'Proibições Absolutas + Macete dos Lugares',
        mnemonic: 'Volto DA = crase HÁ | Volto DE = crase pra quê?',
        explanation:
          'Nunca use crase antes de verbo, palavra masculina, pronomes (todos, esta, você) nem com "a" no singular antes de plural. Para cidades/estados, teste a volta: "volto da Bahia" (à Bahia), "volto de Anápolis" (a Anápolis).',
        formula: 'Antes de verbo / masculino / "a" + plural = SEM crase',
      },
      {
        title: 'Verbo Haver vs. Verbo Existir',
        mnemonic: 'Haver = Singular Eterno | Existir = Normal',
        explanation:
          'Quando "haver" significa existir ou acontecer, ele não tem sujeito e fica SEMPRE no singular (inclusive em "deve haver"). Já "existir" concorda normalmente no plural.',
        formula: 'Houve problemas = Existiram problemas',
      },
      {
        title: 'Partícula "SE" e Porcentagem',
        mnemonic: 'Sem preposição concorda | Com preposição (DE/EM) trava no singular',
        explanation:
          'Em "alugam-se casas" (casas são alugadas), o verbo vai ao plural. Se houver preposição ("precisa-se DE técnicos"), trava no singular. Porcentagem concorda com o número ou com o termo seguinte.',
        formula: 'Alugam-se casas ≠ Precisa-se DE técnicos',
      },
    ],
    examples: [
      {
        correct: 'Entregou o relatório técnico à diretora e viajou à Bahia.',
        wrong: 'Começou à analisar os dados e viajou à Anápolis.',
        explanation: 'Não vai crase antes de verbo ("analisar") nem quando voltamos DE um lugar ("de Anápolis").',
      },
      {
        correct: 'Houve vários problemas na rede, mas ainda existem soluções.',
        wrong: 'Houveram vários problemas na rede, mas deve existir soluções.',
        explanation: '"Haver" existencial não tem plural e contamina o auxiliar ("deve haver soluções").',
      },
      {
        correct: 'Precisa-se de novos técnicos em saneamento.',
        wrong: 'Precisam-se de novos técnicos em saneamento.',
        explanation: 'Verbo com preposição ("precisar DE") + "se" fica obrigatoriamente no singular.',
      },
    ],
    cheatSheetTable: {
      title: 'Cola Rápida — Crase & Concordância',
      headers: ['Caso', 'Aplicação Correta', 'Por quê?'],
      monoColumns: [1],
      rows: [
        ['Lugar (volto DE)', 'Vou a Anápolis', 'Sem artigo → sem crase'],
        ['Lugar (volto DA)', 'Vou à Bahia', 'Pede artigo "a" → com crase'],
        ['"a" singular + plural', 'Referiu-se a situações', 'Falta o "s" do artigo ("às")'],
        ['Verbo Haver', 'Houve falhas / Deve haver', 'Impessoal → sempre singular'],
        ['Verbo + preposição + SE', 'Precisa-se de técnicos', 'Sujeito indeterminado → singular'],
      ],
    },
  },
  {
    lessonId: 'pt-2',
    unitId: 'portugues',
    title: 'Regência & Vírgula',
    summary:
      'Descubra quais verbos mudam de preposição conforme o sentido ("assistir", "visar", "preferir") e aprenda onde a vírgula é estritamente proibida pela gramática.',
    mascotWelcome:
      'Atenção ao sujeito longo! A Banca Patativa adora colocar uma vírgula escondida antes do verbo para derrubar quem lê rápido.',
    keyRules: [
      {
        title: 'Verbo Assistir (Ver vs. Ajudar)',
        mnemonic: 'Assistir = Ver pede "A" | Ajudar dispensa',
        explanation:
          'No sentido de presenciar/ver (palestra, debate, filme), exige preposição "a" ("assistir ao debate", "à palestra"). No sentido de prestar assistência/ajudar, vai direto sem preposição ("assistiu o usuário").',
        formula: 'Ver = Assistir AO/À | Ajudar = Assistir O/A',
      },
      {
        title: 'Verbo Visar e Verbo Preferir',
        mnemonic: 'Visar (objetivo) = AO | Preferir X A Y (zero "do que")',
        explanation:
          '"Visar" como ter por objetivo pede "a" ("visa ao desenvolvimento"). Já quem "prefere", sempre prefere uma coisa A outra — jamais use "do que" ou "muito mais".',
        formula: 'Prefiro A a B (NUNCA "do que")',
      },
      {
        title: 'Proibição Absoluta da Vírgula',
        mnemonic: 'Sujeito ❤️ Verbo ❤️ Complemento (inseparáveis)',
        explanation:
          'Nunca separe por vírgula o sujeito do seu verbo, nem o verbo do seu complemento, mesmo que o sujeito seja enorme! Só use vírgula para isolar aposto, adjunto deslocado no começo ou antes de "mas/porém/contudo".',
        formula: 'Sujeito [NÃO PONHA VÍRGULA] Verbo',
      },
    ],
    examples: [
      {
        correct: 'Os candidatos assistiram à palestra e o técnico assistiu o usuário.',
        wrong: 'Os candidatos assistiram a palestra (sem crase) e assistiu ao usuário (ajudar).',
        explanation: 'Ver palestra pede preposição "a" + artigo "a" = crase ("à"); ajudar alguém não usa preposição.',
      },
      {
        correct: 'Prefiro revisar lógica de manhã a revisar de madrugada.',
        wrong: 'Prefiro muito mais revisar de manhã do que de madrugada.',
        explanation: 'O verbo preferir rejeita "do que" e reforços como "muito mais".',
      },
      {
        correct: 'Os candidatos inscritos na prova farão o exame online.',
        wrong: 'Os candidatos inscritos na prova, farão o exame online.',
        explanation: 'É proibido separar o sujeito ("Os candidatos inscritos na prova") do verbo ("farão").',
      },
    ],
    cheatSheetTable: {
      title: 'Tabela-Resumo de Regência & Vírgula',
      headers: ['Estrutura', 'Regra Prática', 'Exemplo Certo'],
      monoColumns: [0],
      rows: [
        ['Assistir (ver)', 'Exige preposição "a"', 'Assistimos ao debate / à palestra'],
        ['Assistir (ajudar)', 'Sem preposição', 'Assistiu o usuário com falha'],
        ['Visar (objetivo)', 'Exige preposição "a"', 'Visa ao desenvolvimento'],
        ['Preferir', 'Usa apenas preposição "a"', 'Prefiro café a chá'],
        ['Aposto / Adverbial', 'Isolar com vírgulas', 'No domingo, a Saneago, estatal de GO, aplica a prova.'],
      ],
    },
  },
  {
    lessonId: 'pt-3',
    unitId: 'portugues',
    title: 'Novo Acordo & Conjunções',
    summary:
      'Domine de forma visual onde caiu o acento dos ditongos abertos, a lógica simples dos prefixos com hífen e o sentido das conjunções que conectam as ideias do texto.',
    mascotWelcome:
      'Memorize uma regra de ouro do hífen: os iguais se separam e os diferentes se atraem!',
    keyRules: [
      {
        title: 'Ditongos Abertos "éi" e "ói"',
        mnemonic: 'Paroxítona PERDEU | Oxítona MANTEVE',
        explanation:
          'Palavras com sílaba forte na penúltima (paroxítonas) perderam o acento em "éi" e "ói": ideia, assembleia, jiboia, heroico, paranoia. Quando a última sílaba é forte (oxítonas), o acento continua: herói, papéis, anéis.',
        formula: 'ideia / jiboia (sem) ≠ herói / papéis (com)',
      },
      {
        title: 'As 4 Regras Práticas do Hífen',
        mnemonic: 'Iguais separam | H exige hífen | Diferentes juntam',
        explanation:
          '1) Vogais iguais → separa com hífen (micro-ondas, anti-inflamatório). 2) Antes de H → hífen (super-homem, anti-higiênico). 3) Vogais diferentes → junta tudo (autoestima, infraestrutura). 4) Vogal + R ou S → junta e dobra a letra (antissocial, autorretrato).',
        formula: 'anti-inflamatório | infraestrutura | antissocial',
      },
      {
        title: 'Conjunções Mais Cobradas',
        mnemonic: 'Conquanto = Embora (Concessão) | Contudo = Mas (Oposição)',
        explanation:
          'Não confunda palavras parecidas: "contudo" e "todavia" trazem oposição (como "mas"). Já "embora", "conquanto" e "posto que" são concessivas (fato contrário que não impede a ação). "Visto que/já que" = causa; "portanto/logo" = conclusão.',
      },
    ],
    examples: [
      {
        correct: 'Tive uma boa ideia sobre infraestrutura e saúde antissocial.',
        wrong: 'Tive uma boa idéia sobre infra-estrutura e saúde anti-social.',
        explanation: '"Ideia" perdeu acento, vogais diferentes juntam ("infraestrutura") e S dobra após vogal ("antissocial").',
      },
      {
        correct: 'Embora tenha dominado o edital, revisou na véspera; passará, contanto que foque.',
        wrong: 'Portanto tenha dominado o edital, revisou; passará, todavia foque.',
        explanation: '"Embora" marca concessão e "contanto que" estabelece uma condição clara.',
      },
    ],
    cheatSheetTable: {
      title: 'Mapa Rápido — Hífen & Conjunções',
      headers: ['Categoria / Regra', 'Palavras-Chave / Fórmula', 'Exemplos'],
      monoColumns: [0, 1],
      rows: [
        ['Vogais iguais / antes de H', 'Separa com hífen (-)', 'micro-ondas, contra-ataque, super-homem'],
        ['Vogais diferentes', 'Junta direto', 'autoestima, infraestrutura, agroindustrial'],
        ['Vogal + R ou S', 'Junta e dobra RR / SS', 'antissocial, autorretrato, ultrassom'],
        ['Adversativa (Oposição)', 'mas, porém, contudo, todavia', 'Estudou, todavia ficou nervoso.'],
        ['Concessiva', 'embora, conquanto, ainda que', 'Embora cansado, continuou.'],
        ['Causal / Conclusiva', 'visto que, já que / logo, portanto', 'Passou, visto que revisou bem.'],
      ],
    },
  },
  {
    lessonId: 'pt-4',
    unitId: 'portugues',
    title: 'Porquês, Próclise & Vozes',
    summary:
      'Feche o módulo avançado de Português eliminando dúvidas sobre os 4 porquês, quando puxar o pronome para antes do verbo (próclise), parônimos parecidos e voz passiva.',
    mascotWelcome:
      'Última lição de Português! Lembre: rEtificar = rEparar (erro) e rAtificar = cOnfirmar (assinando).',
    keyRules: [
      {
        title: 'Os 4 Porquês Sem Mistério',
        mnemonic: 'Pergunta = separado | Resposta = junto | Fim = acento',
        explanation:
          '"Por que" (separado sem acento) faz pergunta ou equivale a "pelo qual". "Porque" (junto sem acento) explica/responde ("pois"). "Por quê" (separado com acento) vai antes de ponto/interrogação. "O porquê" (junto com acento) é substantivo acompanhado de "o".',
        formula: 'Por que veio? — Porque sim! — Não foi por quê? — Explique o porquê.',
      },
      {
        title: 'Próclise (Ímãs de Pronome)',
        mnemonic: 'Negativa + Relativo + Subordinativa = Puxa antes!',
        explanation:
          'Palavras como "não", "nunca", "que", "embora" e advérbios sem vírgula ("aqui") funcionam como ímãs e obrigam o pronome ("se", "me", "te", "o") a ficar ANTES do verbo.',
        formula: 'Não me enviaram | Aqui se trabalha | Que se inscreveram',
      },
      {
        title: 'Parônimos & Voz Passiva Analítica',
        mnemonic: 'rEtificar = rEparar | rAtificar = validar',
        explanation:
          'Retificar = corrigir; Ratificar = confirmar. Eminente = ilustre/elevado; Iminente = prestes a ocorrer. Na voz passiva ("Os relatórios foram analisados pela equipe"), o auxiliar ("foram") herda o mesmo tempo do verbo original ("analisou").',
      },
    ],
    examples: [
      {
        correct: 'Você saiu por quê? Quero saber o porquê disso.',
        wrong: 'Você saiu porque? Quero saber o porque disso.',
        explanation: 'Antes de pontuação usa-se "por quê"; após artigo ("o") usa-se o substantivo "porquê".',
      },
      {
        correct: 'Não me enviaram o comprovante; aqui se trabalha com foco.',
        wrong: 'Não enviaram-me o comprovante; aqui trabalha-se com foco.',
        explanation: '"Não" e "aqui" (sem vírgula) são palavras atrativas que exigem o pronome antes do verbo.',
      },
      {
        correct: 'Precisamos retificar (corrigir) o erro diante do risco iminente (imediato).',
        wrong: 'Precisamos ratificar (corrigir) o erro diante do risco eminente (imediato).',
        explanation: 'Ratificar é confirmar, não corrigir; eminente é elevado/ilustre.',
      },
    ],
    cheatSheetTable: {
      title: 'Guia Expresso — Porquês & Parônimos',
      headers: ['Termo', 'Quando Usar / Significado', 'Exemplo Rápido'],
      monoColumns: [0],
      rows: [
        ['Por que', 'Perguntas ou "= pelo qual"', 'Por que o sistema desconectou?'],
        ['Porque', 'Respostas e explicações ("= pois")', 'Caiu porque oscilou a rede.'],
        ['Por quê', 'Final de frase (antes de . ou ?)', 'Você desligou por quê?'],
        ['O porquê', 'Substantivo (vem após o/um)', 'Não sei o porquê da escolha.'],
        ['Ratificar / Retificar', 'Confirmar / Corrigir', 'Retificar um erro; ratificar o edital.'],
        ['Eminente / Iminente', 'Ilustre / Prestes a ocorrer', 'Juiz eminente; risco iminente.'],
      ],
    },
  },

  // =========================================================================
  // UNIDADE 2: MATEMÁTICA & RACIOCÍNIO LÓGICO
  // =========================================================================
  {
    lessonId: 'mat-1',
    unitId: 'matematica',
    title: 'Tabela-Verdade & De Morgan',
    summary:
      'Entenda do zero como a lógica avalia frases ligadas por E, OU, SE...ENTÃO e SE E SOMENTE SE como se fossem combinações de Verdadeiro (V) e Falso (F).',
    mascotWelcome:
      'Na condicional (Se... Então), só existe UM jeito de dar Falso: é a famosa Vera Fischer (V → F = F)!',
    keyRules: [
      {
        title: 'Regra do E (∧) e do OU (∨)',
        mnemonic: 'No E precisa de tudo V | No OU basta um V',
        explanation:
          'A conjunção "P e Q" só é Verdadeira quando P e Q forem verdadeiras ao mesmo tempo. Já a disjunção "P ou Q" só dá Falso se TODAS as partes forem falsas.',
        formula: 'V ∧ F = F   |   V ∨ F = V',
      },
      {
        title: 'Condicional (P → Q) — Caso Vera Fischer',
        mnemonic: 'Vera Fischer é Falsa (V → F = F)',
        explanation:
          'O "Se P, então Q" só é FALSO quando a primeira parte é Verdadeira e a segunda é Falsa (V → F). Atenção à pegadinha: F → F dá VERDADEIRO!',
        formula: 'V → F = F   |   F → F = V',
      },
      {
        title: 'Bicondicional (P ↔ Q) & Leis de De Morgan',
        mnemonic: 'Iguais = V no ↔ | Para negar E/OU, troque o sinal e negue tudo',
        explanation:
          'No "Se e somente se", valores iguais (V↔V ou F↔F) dão Verdadeiro. Para negar (P ∧ Q), negue as duas e troque E por OU: ¬P ∨ ¬Q. Para negar (P ∨ Q), faça ¬P ∧ ¬Q.',
        formula: '¬(P ∧ Q) = ¬P ∨ ¬Q   |   ¬(P ∨ Q) = ¬P ∧ ¬Q',
      },
    ],
    examples: [
      {
        correct: 'Na condicional (P → Q), se P = Falso e Q = Falso, o resultado é VERDADEIRO.',
        wrong: 'Na condicional (P → Q), Falso → Falso dá Falso.',
        explanation: 'Apenas V → F (Vera Fischer) produz Falso na condicional; todos os outros casos são V.',
      },
      {
        correct: 'Negação de "Bomba ligada E tanque cheio": Bomba NÃO ligada OU tanque NÃO cheio.',
        wrong: 'Negação de "Bomba ligada E tanque cheio": Bomba NÃO ligada E tanque NÃO cheio.',
        explanation: 'Pela Lei de De Morgan, além de negar as partes, é obrigatório trocar E por OU.',
      },
    ],
    cheatSheetTable: {
      title: 'Tabela-Verdade Completa (P e Q)',
      headers: ['Conectivo', 'Símbolo', 'Quando é V?', 'Quando é F?'],
      monoColumns: [1],
      rows: [
        ['E (Conjunção)', 'P ∧ Q', 'Só quando ambas são V', 'Se pelo menos uma for F'],
        ['OU (Disjunção)', 'P ∨ Q', 'Se pelo menos uma for V', 'Só quando ambas são F'],
        ['SE... ENTÃO', 'P → Q', 'Em V→V, F→V e F→F', 'Só na Vera Fischer (V → F)'],
        ['SE E SOMENTE SE', 'P ↔ Q', 'Valores iguais (V↔V / F↔F)', 'Valores diferentes (V↔F)'],
      ],
    },
  },
  {
    lessonId: 'mat-2',
    unitId: 'matematica',
    title: 'Negação MA-NÉ & Equivalências',
    summary:
      'Nunca mais confunda NEGAÇÃO (mudar o sentido de V para F) com EQUIVALÊNCIA (reescrever a mesma ideia com outras palavras) nas questões de "Se... Então".',
    mascotWelcome:
      'Se a questão pedir NEGAÇÃO do Se...Então, use o MA-NÉ. Se pedir EQUIVALÊNCIA, escolha Contrapositiva ou NE-OU!',
    keyRules: [
      {
        title: 'Negação do "Se... Então" — Regra do MA-NÉ',
        mnemonic: 'MAntém a 1ª E NEga a 2ª',
        explanation:
          'Para negar "Se P, então Q", você NÃO usa "Se... então" na resposta! Mantém P igualzinha, troca a seta pelo conectivo E (∧) e nega Q.',
        formula: '¬(P → Q) ≡ P ∧ ¬Q',
      },
      {
        title: 'Equivalência 1 — Contrapositiva',
        mnemonic: 'Volta de trás pra frente NEGANDO as duas',
        explanation:
          'Para manter o MESMO valor lógico usando outro "Se... então", inverta a ordem das frases e negue as duas ao mesmo tempo.',
        formula: 'P → Q ≡ ¬Q → ¬P',
      },
      {
        title: 'Equivalência 2 — Regra do NE-OU',
        mnemonic: 'NEga a 1ª OU mantém a 2ª',
        explanation:
          'A outra forma equivalente de escrever "Se P, então Q" sem usar "Se... então" é negar a primeira frase, colocar um OU (∨) no meio e repetir a segunda como estava.',
        formula: 'P → Q ≡ ¬P ∨ Q',
      },
    ],
    examples: [
      {
        correct: 'Negação de "Se chover, então não vou": "Choveu E eu fui" (MA-NÉ).',
        wrong: 'Negação de "Se chover, então não vou": "Se eu fui, então não choveu".',
        explanation: '"Se eu fui, então não choveu" é a EQUIVALÊNCIA contrapositiva, não a negação.',
      },
      {
        correct: 'Equivalência NE-OU de "Se chover, então não vou": "Não choveu OU não vou".',
        wrong: 'Equivalência NE-OU de "Se chover, então não vou": "Não choveu OU eu fui".',
        explanation: 'No NE-OU você nega apenas a primeira e MANTÉM a segunda intacta ("não vou").',
      },
    ],
    cheatSheetTable: {
      title: 'Transformações da Condicional (P → Q)',
      headers: ['O que a banca pediu?', 'Fórmula', 'Macete', 'Exemplo com "Se chover, não vou"'],
      monoColumns: [1],
      rows: [
        ['Negação', 'P ∧ ¬Q', 'MA-NÉ (Mantém E Nega)', 'Choveu e eu fui'],
        ['Equivalência 1', '¬Q → ¬P', 'Contrapositiva (Inverte e Nega)', 'Se fui, então não choveu'],
        ['Equivalência 2', '¬P ∨ Q', 'NE-OU (Nega OU Mantém)', 'Não choveu ou não vou'],
      ],
    },
  },
  {
    lessonId: 'mat-3',
    unitId: 'matematica',
    title: 'Regra de Três, % & Conjuntos',
    summary:
      'Aprenda a identificar quando multiplicar em linha reta na regra de três inversa, o truque decimal das porcentagens sucessivas e o atalho do Diagrama de Venn.',
    mascotWelcome:
      'Mais bombas ligadas = menos tempo! Se uma grandeza sobe e a outra cai, multiplique em linha reta.',
    keyRules: [
      {
        title: 'Regra de Três: Direta vs. Inversa',
        mnemonic: 'Mesmo lado = X | Lados opostos = Linha Reta',
        explanation:
          'Se aumentar uma grandeza aumenta a outra (direta), multiplique cruzado (em X). Se aumentar uma faz a outra diminuir — como mais bombas e menos tempo, ou mais operários e menos dias — multiplique EM LINHA RETA.',
        formula: 'Inversa: 4 bombas × 6h = 6 bombas × x → x = 4h',
      },
      {
        title: 'Porcentagens Sucessivas (Fatores)',
        mnemonic: 'Multiplique os decimais — nunca some ou subtraia direto',
        explanation:
          'Aumento de x% multiplica por (1 + x/100); desconto de x% multiplica por (1 − x/100). Subir 20% e depois cair 20% NÃO volta a zero: 1,20 × 0,80 = 0,96 (queda líquida de 4%).',
        formula: '+20% e −20% → 1,20 × 0,80 = 0,96 (96% → −4%)',
      },
      {
        title: 'Conjuntos (Venn) & Probabilidade',
        mnemonic: 'O que sobra do total é a Interseção | E multiplica, OU soma',
        explanation:
          'Em pesquisa de dois grupos: some A + B + nenhum. O excesso acima do total de pessoas é exatamente quem gosta dos DOIS (interseção). Em probabilidade: eventos com E multiplicam; com OU somam.',
        formula: 'n(A∩B) = n(A) + n(B) + n(Nenhum) − Total',
      },
    ],
    examples: [
      {
        correct: '4 bombas enchem em 6h; com 6 bombas: 4×6 = 6×x → 4 horas.',
        wrong: '4 bombas enchem em 6h; com 6 bombas: 4×x = 6×6 → 9 horas.',
        explanation: 'Mais bombas reduzem o tempo (inversa): nunca pode dar mais horas do que antes.',
      },
      {
        correct: '100 pessoas (65 PT, 50 INF, 10 nenhum): (65+50+10) − 100 = 25 em ambos.',
        wrong: '100 pessoas (65 PT, 50 INF, 10 nenhum): 65 − 50 = 15 em ambos.',
        explanation: 'Somando tudo incluindo os de fora, o valor que passa de 100 é a interseção.',
      },
    ],
    cheatSheetTable: {
      title: 'Fórmulas Essenciais de Cálculo Rápido',
      headers: ['Assunto', 'Fórmula / Procedimento', 'Quando Aplicar'],
      monoColumns: [1],
      rows: [
        ['Regra de 3 Direta', 'Multiplica cruzado (em X)', 'Grandezas crescem juntas'],
        ['Regra de 3 Inversa', 'Multiplica em linha reta', 'Mais bombas/pessoas = menos tempo'],
        ['Variação Sucessiva', '(1 ± i1) × (1 ± i2)', 'Aumentos e descontos em sequência'],
        ['Diagrama de Venn', '(A + B + Nenhum) − Total', 'Achar quantos fazem parte dos dois'],
        ['Probabilidade', 'P(E) = Favoráveis / Total', 'E = multiplica | OU = soma'],
      ],
    },
  },
  {
    lessonId: 'mat-4',
    unitId: 'matematica',
    title: 'Combinatória, Juros & Quantificadores',
    summary:
      'Diferencie facilmente Arranjo de Combinação, calcule Juros Simples direto na fórmula J = C·i·t e evite o erro clássico na negação de "Todo" e "Nenhum".',
    mascotWelcome:
      'Regra salvadora: NUNCA negue "Todo" usando "Nenhum"! Basta existir um caso contrário para derrubar o Todo.',
    keyRules: [
      {
        title: 'Análise Combinatória: Ordem Importa?',
        mnemonic: 'Cargos diferentes = Arranjo (multiplica) | Comissão = Combinação (divide)',
        explanation:
          'Se trocar as pessoas de lugar cria um resultado diferente (Presidente e Secretário), a ordem IMPORTA → Arranjo. Se é um grupo/comissão sem cargo fixo, a ordem NÃO importa → Combinação (divide pelo fatorial do grupo).',
        formula: 'C(n,p) = n! / (p! · (n−p)!)   |   A(n,p) = n × (n−1) × ...',
      },
      {
        title: 'Juros Simples',
        mnemonic: 'J = C · i · t  (Juros = Capital × taxa × tempo)',
        explanation:
          'Multiplique o capital pela taxa em decimal (ex: 3% = 0,03) e pelo tempo na mesma unidade (meses com meses). O montante final é a soma do capital com os juros (M = C + J).',
        formula: 'J = 2000 × 0,03 × 5 = 300  →  M = 2300',
      },
      {
        title: 'Negação de Quantificadores',
        mnemonic: 'TODO ↔ ALGUM NÃO  |  NENHUM ↔ ALGUM',
        explanation:
          'Para negar "Todo A é B", basta mostrar que "Algum / Pelo menos um / Existe A que NÃO é B". Para negar "Nenhum A é B", basta "Algum / Existe A que é B".',
        formula: '¬(Todo A é B) ≡ Algum A não é B',
      },
    ],
    examples: [
      {
        correct: 'Negação de "Todo estagiário domina lógica": "Algum estagiário NÃO domina lógica".',
        wrong: 'Negação de "Todo estagiário domina lógica": "Nenhum estagiário domina lógica".',
        explanation: 'Se 1 estagiário não dominar, "Todo" já fica falso; não precisa que nenhum domine.',
      },
      {
        correct: 'Comissão de 3 entre 6 pessoas: C(6,3) = (6×5×4)/(3×2×1) = 20 comissões.',
        wrong: 'Comissão de 3 entre 6 pessoas: 6×5×4 = 120 comissões.',
        explanation: 'Comissão não tem cargos definidos; a ordem não muda o grupo, então divide por 3! = 6.',
      },
    ],
    cheatSheetTable: {
      title: 'Tabela de Quantificadores & Combinatória',
      headers: ['Proposição / Problema', 'Negação ou Fórmula', 'Dica de Prova'],
      monoColumns: [0, 1],
      rows: [
        ['Todo A é B', 'Algum A não é B', 'Pode usar "Pelo menos um" / "Existe"'],
        ['Nenhum A é B', 'Algum A é B', 'Basta 1 caso para quebrar o "Nenhum"'],
        ['Algum A é B', 'Nenhum A é B', 'Equivale a "Todo A não é B"'],
        ['Comissão / Grupo', 'Combinação: C(n,p)', 'Ordem NÃO importa (divide por p!)'],
        ['Cargos / Pódio', 'Arranjo: n × (n−1)...', 'Ordem IMPORTA (sem dividir)'],
        ['Juros Simples', 'J = C · i · t  |  M = C + J', 'Taxa e tempo na mesma unidade'],
      ],
    },
  },

  // =========================================================================
  // UNIDADE 3: INFORMÁTICA & OFFICE BR
  // =========================================================================
  {
    lessonId: 'inf-1',
    unitId: 'informatica',
    title: 'Windows & Atalhos Office PT-BR',
    summary:
      'Domine os atalhos que o Windows usa pelas iniciais em inglês e fuja da armadilha número 1 das bancas: o Pacote Office em Português usa teclas diferentes do inglês.',
    mascotWelcome:
      'Atenção máxima aqui! No Word em Português, Ctrl+S NÃO salva — ele Sublinha! Para salvar use Ctrl+B.',
    keyRules: [
      {
        title: 'Atalhos do Windows 10/11 (Iniciais em Inglês)',
        mnemonic: 'E = Explorer | D = Desktop | L = Lock',
        explanation:
          'Win+E abre o Explorador de Arquivos; Win+D minimiza tudo e mostra o Desktop; Win+L bloqueia a tela. Para abrir o Gerenciador de Tarefas direto, pressione Ctrl+Shift+Esc.',
        formula: 'Win+E | Win+D | Win+L | Ctrl+Shift+Esc',
      },
      {
        title: 'Exclusão Definitiva & Fechamento',
        mnemonic: 'Shift + Delete = Pula a Lixeira!',
        explanation:
          'Delete comum envia para a Lixeira. Já Shift + Delete apaga o arquivo PERMANENTEMENTE sem passar pela Lixeira. Alt + F4 fecha o programa ativo.',
        formula: 'Shift + Delete → exclusão permanente',
      },
      {
        title: 'Pegadinha Clássica: Word/Office em Português',
        mnemonic: 'B = Backup (Salvar) | S = Sublinhado | T = Tudo',
        explanation:
          'Em Português: Ctrl+B salva (Backup), Ctrl+N põe Negrito, Ctrl+S Sublinha, Ctrl+I aplica Itálico, Ctrl+T seleciona Tudo, Ctrl+A Abre arquivo e Ctrl+L Localiza texto.',
        formula: 'Ctrl+B (Salvar) | Ctrl+A (Abrir) | Ctrl+L (Localizar)',
      },
    ],
    examples: [
      {
        correct: 'No Word em Português (BR), Ctrl + B salva o documento atual.',
        wrong: 'No Word em Português (BR), Ctrl + S salva o documento atual.',
        explanation: 'Em Português, Ctrl+S aplica Sublinhado e Ctrl+B (Backup) salva o documento.',
      },
      {
        correct: 'Shift + Delete apaga o item permanentemente sem passar pela Lixeira.',
        wrong: 'Shift + Delete move o arquivo para a Lixeira antes de excluir.',
        explanation: 'A tecla Shift força a exclusão direta, ignorando a Lixeira do Windows.',
      },
    ],
    cheatSheetTable: {
      title: 'Tabela Comparativa — Office PT-BR vs. Armadilha',
      headers: ['Atalho', 'Função no Office PT-BR', 'Armadilha Comum (Inglês/Navegador)'],
      monoColumns: [0, 2],
      rows: [
        ['Ctrl + B', 'Salvar documento (Backup)', 'Não é Ctrl+S (que sublinha)'],
        ['Ctrl + S', 'Sublinhado', 'Em inglês Save = S, aqui é Sublinhado'],
        ['Ctrl + N', 'Negrito', 'Não abre novo arquivo (Novo é Ctrl+O)'],
        ['Ctrl + T', 'Selecionar Tudo', 'Não abre nova aba como no Chrome'],
        ['Ctrl + A', 'Abrir arquivo', 'Não seleciona tudo ("All")'],
        ['Ctrl + L', 'Localizar texto', 'Não usa Ctrl+F como navegadores'],
        ['Win + E / D / L', 'Explorer / Desktop / Lock', 'Ctrl+Shift+Esc = Gerenciador de Tarefas'],
      ],
    },
  },
  {
    lessonId: 'inf-2',
    unitId: 'informatica',
    title: 'Fórmulas do Excel em Português',
    summary:
      'Aprenda a ler qualquer fórmula do Excel em segundos distinguindo intervalo contínuo (:) de células isoladas (;), além das funções de contagem e decisão SE.',
    mascotWelcome:
      'Dois pontos (:) significa ATÉ; ponto e vírgula (;) significa E. Só essa troca derruba metade dos candidatos!',
    keyRules: [
      {
        title: 'Dois Pontos (:) vs. Ponto e Vírgula (;)',
        mnemonic: '":" = ATÉ (tudo no meio) | ";" = E (só as citadas)',
        explanation:
          'Em =SOMA(A1:A4), os dois pontos somam A1, A2, A3 e A4. Já =SOMA(A1;A4) soma SOMENTE A1 e A4, ignorando A2 e A3.',
        formula: 'A1:A4 = A1 até A4  |  A1;A4 = apenas A1 e A4',
      },
      {
        title: 'CONT.NÚM vs. CONT.VALORES',
        mnemonic: 'NÚM = Só Números | VALORES = Tudo Não Vazio',
        explanation:
          '=CONT.NÚM conta apenas células que possuem NÚMEROS. Já =CONT.VALORES conta qualquer célula preenchida (seja número ou texto), deixando de fora apenas células realmente vazias.',
        formula: '10, "Saneago", (vazia), 20 → CONT.NÚM=2 | CONT.VALORES=3',
      },
      {
        title: 'Função SE e Acentuação Obrigatória',
        mnemonic: 'SE(teste; se_verdadeiro; se_falso)',
        explanation:
          'Resolva funções de dentro para fora (ex: calcule MÉDIA antes do teste do SE). Lembre que no Excel em PT-BR as funções levam acento: MÉDIA, MÁXIMO, MÍNIMO e CONT.NÚM.',
        formula: '=SE(MÉDIA(A1:A2)>=7;"Aprovado";"Revisar")',
      },
    ],
    examples: [
      {
        correct: 'Se A1=10, A2=20, A3=30, A4=40: =SOMA(A1:A4) dá 100 e =SOMA(A1;A4) dá 50.',
        wrong: 'Se A1=10, A2=20, A3=30, A4=40: =SOMA(A1;A4) soma tudo e dá 100.',
        explanation: 'Ponto e vírgula (;) é operador de união ("E"): soma apenas A1 e A4 (10 + 40 = 50).',
      },
      {
        correct: 'Com 10, "Saneago", vazia e 20: CONT.NÚM retorna 2 e CONT.VALORES retorna 3.',
        wrong: 'Com 10, "Saneago", vazia e 20: CONT.NÚM retorna 3 contando o texto.',
        explanation: 'CONT.NÚM ignora texto e células vazias; só conta células numéricas.',
      },
    ],
    cheatSheetTable: {
      title: 'Fórmulas & Operadores do Excel PT-BR',
      headers: ['Fórmula / Símbolo', 'O que faz exatamente'],
      monoColumns: [0],
      rows: [
        [':', 'Operador de intervalo ("ATÉ"): A1:A4 inclui A1, A2, A3 e A4'],
        [';', 'Operador de união ("E"): A1;A4 inclui apenas A1 e A4'],
        ['=SOMA(A1:A4)', 'Soma todos os valores numéricos de A1 até A4'],
        ['=MÉDIA(A1:A4)', 'Calcula a média aritmética do intervalo'],
        ['=MÁXIMO / =MÍNIMO', 'Retorna o maior e o menor valor do intervalo (com acento!)'],
        ['=CONT.NÚM(A1:A4)', 'Conta apenas células que contêm números'],
        ['=CONT.VALORES(A1:A4)', 'Conta células não vazias (números e textos)'],
        ['=SE(teste; V; F)', 'Se teste for verdadeiro retorna V, senão retorna F'],
      ],
    },
  },
  {
    lessonId: 'inf-3',
    unitId: 'informatica',
    title: 'Segurança, Redes & Malwares',
    summary:
      'Saiba diferenciar os cinco tipos clássicos de vírus/pragas digitais, entenda o que protege o HTTPS e não confunda barreira de rede (Firewall) com cópia (Backup).',
    mascotWelcome:
      'Vírus precisa de hospedeiro e clique; Worm anda sozinho pela rede! Essa é a distinção mais cobrada em provas.',
    keyRules: [
      {
        title: 'Vírus vs. Worm vs. Trojan',
        mnemonic: 'Vírus = Hospedeiro | Worm = Rede sozinho | Trojan = Presente falso',
        explanation:
          'Vírus infecta um arquivo hospedeiro e depende da ação do usuário. Worm (verme) se espalha sozinho pela rede explorando falhas. Trojan (Cavalo de Troia) parece um programa útil, mas abre porta escondida (backdoor).',
      },
      {
        title: 'Ransomware, Spyware e Phishing',
        mnemonic: 'Ransom = Resgate | Spy = Espião (Key/Screen) | Phishing = Pesca senha',
        explanation:
          'Ransomware criptografa seus arquivos e cobra resgate. Spyware espiona sem você ver (Keylogger grava teclas; Screenlogger captura tela/cliques). Phishing usa e-mail/link falso (engenharia social) para roubar senhas.',
      },
      {
        title: 'HTTPS, Firewall e Backup',
        mnemonic: 'HTTPS = Criptografia TLS/SSL | Firewall = Filtro | Backup = Cópia',
        explanation:
          'HTTP envia texto aberto; HTTPS criptografa os dados com TLS/SSL. Firewall atua como barreira filtrando portas e pacotes de rede. Backup é apenas cópia de segurança para restaurar arquivos perdidos.',
        formula: 'HTTP (aberto) ≠ HTTPS (TLS/SSL)',
      },
    ],
    examples: [
      {
        correct: 'O Worm propaga-se automaticamente pela rede sem precisar de hospedeiro.',
        wrong: 'O Vírus propaga-se sozinho pela rede sem depender de arquivo hospedeiro.',
        explanation: 'Quem se auto-propaga de forma autônoma pela rede é o Worm; o Vírus precisa de hospedeiro.',
      },
      {
        correct: 'Keylogger grava teclas digitadas; Screenlogger registra cliques e imagens da tela.',
        wrong: 'Keylogger funciona como firewall bloqueando portas de entrada.',
        explanation: 'Ambos são subtipos de Spyware voltados a espionagem silenciosa do usuário.',
      },
    ],
    cheatSheetTable: {
      title: 'Dicionário de Segurança & Malwares',
      headers: ['Ameaça / Defesa', 'Comportamento Principal'],
      monoColumns: [0],
      rows: [
        ['Vírus', 'Precisa de arquivo hospedeiro e execução pelo usuário'],
        ['Worm (Verme)', 'Propaga-se automaticamente pela rede sem hospedeiro'],
        ['Trojan (Cavalo de Troia)', 'Disfarça-se de app legítimo e abre backdoor oculto'],
        ['Ransomware', 'Criptografa dados da vítima e exige pagamento de resgate'],
        ['Spyware (Key / Screen)', 'Espiona teclas digitadas (Key) ou capturas de tela (Screen)'],
        ['Phishing', 'Engenharia social com e-mail/site falso para roubar dados'],
        ['HTTPS / Firewall / Backup', 'Criptografia TLS/SSL / Filtro de pacotes / Cópia de segurança'],
      ],
    },
  },
  {
    lessonId: 'inf-4',
    unitId: 'informatica',
    title: 'Extensões, Protocolos & Backups',
    summary:
      'Entenda o papel dos protocolos de rede e e-mail (SMTP, IMAP, DNS, DHCP), saiba o que é Pharming e domine a diferença entre Backup Incremental e Diferencial.',
    mascotWelcome:
      'Macete infalível de e-mail: SMTP = Sua Mensagem Tá Partindo (envia); IMAP sincroniza no servidor!',
    keyRules: [
      {
        title: 'Extensões de Arquivo & Padrão Aberto (ODF)',
        mnemonic: '.odt / .ods / .odp = Texto / Planilha / Apresentação',
        explanation:
          'Além do Microsoft Office (.docx, .xlsx, .pptx), as bancas cobram o padrão OpenDocument do LibreOffice: .odt (texto), .ods (planilha) e .odp (apresentação), junto de .pdf (leitura) e .zip/.rar (compactados).',
      },
      {
        title: 'Protocolos de E-mail e Rede',
        mnemonic: 'SMTP = Envia | IMAP = Sincroniza | DNS = Nome→IP | DHCP = Dá IP',
        explanation:
          'SMTP envia e-mails; IMAP lê mantendo cópia sincronizada no servidor; DNS funciona como agenda traduzindo nomes (URL) em endereços IP; DHCP entrega IPs automaticamente para quem entra na rede.',
        formula: 'URL → IP (DNS)  |  IP automático (DHCP)',
      },
      {
        title: 'Phishing vs. Pharming',
        mnemonic: 'Phishing = Isca no link | Pharming = Envenena o DNS/hosts',
        explanation:
          'No Phishing a vítima clica num link enganoso. No Pharming, o invasor altera o DNS ou arquivo hosts: mesmo se o usuário digitar o endereço correto no navegador, é desviado para um site falso.',
      },
      {
        title: 'Backup Incremental vs. Diferencial',
        mnemonic: 'Incremental = desde o ÚLTIMO backup | Diferencial = desde o último FULL',
        explanation:
          'Após o Backup Completo (Full): o Incremental copia só o que mudou desde o último backup (qualquer tipo) — grava mais rápido, mas precisa de toda a cadeia para restaurar. O Diferencial copia tudo alterado desde o último Full — restaura com apenas 2 partes (Full + último Diferencial).',
        formula: 'Incremental: gravação rápida / restaura cadeia  |  Diferencial: restaura Full + 1',
      },
    ],
    examples: [
      {
        correct: 'Notebook recebe IP via DHCP e converte a URL do portal em IP via DNS.',
        wrong: 'Notebook recebe IP via DNS e envia e-mails via IMAP.',
        explanation: 'DHCP distribui IP automático; DNS traduz nomes em IP; e envio de e-mail usa SMTP.',
      },
      {
        correct: 'O Incremental copia só o alterado desde o dia anterior (último backup).',
        wrong: 'O Diferencial é o que precisa de toda a cadeia desde domingo para restaurar.',
        explanation: 'Quem depende da cadeia completa de backups diários para restaurar é o Incremental.',
      },
    ],
    cheatSheetTable: {
      title: 'Protocolos, Extensões & Backups',
      headers: ['Item', 'Função / Característica'],
      monoColumns: [0],
      rows: [
        ['SMTP / IMAP', 'SMTP envia e-mails (saída) / IMAP recebe e sincroniza no servidor'],
        ['DNS / DHCP', 'DNS traduz domínio em IP / DHCP atribui IP automático na rede'],
        ['.docx / .odt', 'Documentos de texto (Word / Writer)'],
        ['.xlsx / .ods', 'Planilhas eletrônicas (Excel / Calc)'],
        ['Pharming', 'Envenena DNS/hosts; redireciona mesmo digitando URL correta'],
        ['Backup Incremental', 'Copia desde o último backup (menor/rápido; restaura cadeia toda)'],
        ['Backup Diferencial', 'Copia tudo desde o último Full (maior; restaura Full + último)'],
      ],
    },
  },

  // =========================================================================
  // UNIDADE 4: SANEAGO, MARCO LEGAL & GOIÁS
  // =========================================================================
  {
    lessonId: 'san-1',
    unitId: 'saneago',
    title: 'Institucional SANEAGO',
    summary:
      'Conheça a estrutura jurídica oficial da Saneamento de Goiás S/A, quem detém o poder de decisão mesmo tendo ações negociadas e quantos municípios ela atende.',
    mascotWelcome:
      'Essa cai em quase toda seleção da empresa: Saneago é Sociedade de Economia Mista da Administração Indireta!',
    keyRules: [
      {
        title: 'Natureza Jurídica Oficial',
        mnemonic: 'Administração INDIRETA + Sociedade de Economia Mista',
        explanation:
          'A Saneago (Saneamento de Goiás S/A) não é autarquia nem órgão da Administração Direta. Ela integra a Administração Pública Indireta do Estado de Goiás na forma de Sociedade de Economia Mista.',
        formula: 'Adm. Indireta (GO) → Sociedade de Economia Mista (S/A)',
      },
      {
        title: 'Controle Acionário do Estado',
        mnemonic: 'Capital aberto SIM, controle privado NÃO!',
        explanation:
          'Por ser Sociedade de Economia Mista, ela tem capital aberto com ações negociadas, mas o Estado de Goiás permanece obrigatoriamente como acionista majoritário e detém o controle.',
      },
      {
        title: 'Atuação e Abrangência Territorial',
        mnemonic: 'Água tratada + Esgoto em Goiânia e +220 municípios',
        explanation:
          'A Saneago é responsável pelo abastecimento de água tratada e pelo esgotamento sanitário na capital (Goiânia) e em mais de 220 municípios goianos.',
      },
    ],
    examples: [
      {
        correct: 'Saneago é Sociedade de Economia Mista (Adm. Indireta) controlada pelo Estado de GO.',
        wrong: 'Saneago é autarquia federal ou empresa 100% controlada por investidores privados.',
        explanation: 'Mesmo com capital aberto, o poder público estadual mantém a maioria das ações.',
      },
      {
        correct: 'Atua com água tratada e esgotamento sanitário em Goiânia e +220 municípios de Goiás.',
        wrong: 'Atua apenas na capital ou administrando usinas hidrelétricas e coleta de lixo.',
        explanation: 'Seu foco central é abastecimento de água e esgotamento sanitário em todo o estado.',
      },
    ],
    cheatSheetTable: {
      title: 'Raio-X Institucional da SANEAGO',
      headers: ['Atributo', 'Definição Oficial (Edital 001/2026)'],
      monoColumns: [0],
      rows: [
        ['Razão Social', 'Saneamento de Goiás S/A (SANEAGO)'],
        ['Administração', 'Administração Pública Indireta do Estado de Goiás'],
        ['Natureza Jurídica', 'Sociedade de Economia Mista'],
        ['Acionista Controlador', 'Estado de Goiás (acionista majoritário)'],
        ['Serviços Centrais', 'Abastecimento de água tratada e esgotamento sanitário'],
        ['Cobertura', 'Goiânia e mais de 220 municípios goianos'],
      ],
    },
  },
  {
    lessonId: 'san-2',
    unitId: 'saneago',
    title: 'Marco Legal & 4 Eixos',
    summary:
      'Memorize os números exatos e a data limite do Novo Marco Legal do Saneamento Básico (Lei 14.026/2020) e os quatro serviços que formam o saneamento pela Lei 11.445/2007.',
    mascotWelcome:
      'Cuidado para não trocar 99% com 90%! Água potável sempre vem na frente com a maior meta (99%) até 2033.',
    keyRules: [
      {
        title: 'Metas de Universalização (Lei nº 14.026/2020)',
        mnemonic: '99% Água | 90% Esgoto | Prazo: 31/12/2033',
        explanation:
          'O Novo Marco Legal fixa como meta atender 99% da população brasileira com água potável e 90% com coleta e tratamento de esgoto até 31 de dezembro de 2033.',
        formula: 'Até 31/12/2033 → 99% Água Potável + 90% Esgoto',
      },
      {
        title: 'Os 4 Eixos do Saneamento (Lei nº 11.445/2007)',
        mnemonic: 'Água que entra + Esgoto que sai + Lixo + Chuva',
        explanation:
          'Saneamento básico no Brasil vai além de água e esgoto. Compreende 4 pilares: (1) Abastecimento de água potável, (2) Esgotamento sanitário, (3) Limpeza urbana e resíduos sólidos (lixo) e (4) Drenagem de águas pluviais urbanas (chuva).',
      },
    ],
    examples: [
      {
        correct: 'Até 31/12/2033: 99% de água potável e 90% de coleta e tratamento de esgoto.',
        wrong: 'Até 31/12/2033: 90% de água potável e 99% de tratamento de esgoto.',
        explanation: 'A água potável tem a meta maior (99%) e o esgotamento sanitário tem meta de 90%.',
      },
      {
        correct: 'Limpeza urbana (lixo) e drenagem de água da chuva fazem parte dos 4 eixos legais.',
        wrong: 'Iluminação pública e transporte coletivo fazem parte do saneamento básico.',
        explanation: 'Os 4 eixos são apenas água, esgoto, resíduos sólidos e drenagem pluvial urbana.',
      },
    ],
    cheatSheetTable: {
      title: 'Resumo do Marco Legal & Os 4 Eixos',
      headers: ['Referência Legal', 'Regra / Eixo', 'Escopo Exato'],
      monoColumns: [0, 1],
      rows: [
        ['Lei 14.026/2020', '99% até 31/12/2033', 'População com acesso à água potável'],
        ['Lei 14.026/2020', '90% até 31/12/2033', 'População com coleta e tratamento de esgoto'],
        ['Lei 11.445/2007', 'Eixo 1 — Água', 'Abastecimento de água potável'],
        ['Lei 11.445/2007', 'Eixo 2 — Esgoto', 'Coleta e tratamento de esgotamento sanitário'],
        ['Lei 11.445/2007', 'Eixo 3 — Lixo', 'Limpeza urbana e manejo de resíduos sólidos'],
        ['Lei 11.445/2007', 'Eixo 4 — Chuva', 'Drenagem e manejo de águas pluviais urbanas'],
      ],
    },
  },
  {
    lessonId: 'san-3',
    unitId: 'saneago',
    title: 'Cerrado, Saúde & Prova Online',
    summary:
      'Entenda as duas estações marcantes do Cerrado goiano, como o saneamento economiza recursos do SUS e os cuidados técnicos críticos para não perder pontos na prova online de 06/12/2026.',
    mascotWelcome:
      'No Cerrado, a estiagem vai de maio a setembro! E na prova online: use cabo de rede porque queda desconta 1 questão!',
    keyRules: [
      {
        title: 'Clima do Cerrado Goiano (2 Estações)',
        mnemonic: 'Chuva: Outubro a Abril (7 meses) | Seca: Maio a Setembro (5 meses)',
        explanation:
          'Goiás tem período chuvoso de outubro a abril e período crítico de estiagem (seca) de maio a setembro, quando o nível dos mananciais cai e exige controle operacional e uso consciente da água.',
        formula: 'Out–Abr = Chuvoso  |  Mai–Set = Estiagem crítica',
      },
      {
        title: 'Impacto Direto na Saúde Pública',
        mnemonic: 'Mais Saneamento = Menos Doenças Hídricas = Economia no SUS',
        explanation:
          'Investir em água tratada, esgoto e drenagem reduz drasticamente doenças de veiculação hídrica (diarreias, hepatite A, leptospirose e arboviroses ligadas a água parada/lixo), gerando economia no SUS.',
      },
      {
        title: 'Regras Críticas da Prova Online (06/12/2026)',
        mnemonic: 'Cada desconexão desconta 1 questão!',
        explanation:
          'Use janela anônima/perfil sem extensões, ative "Não Perturbe", NÃO troque de aba (Alt+Tab), use internet cabeada com 4G/5G pronto de backup e deixe folha em branco e caneta na mesa.',
        formula: 'Cabo de rede + 4G backup + Navegador limpo + Zero Alt+Tab',
      },
    ],
    examples: [
      {
        correct: 'Estiagem crítica em Goiás ocorre de maio a setembro; chuvas de outubro a abril.',
        wrong: 'Chove de maio a setembro e faz seca de outubro a abril.',
        explanation: 'O inverno goiano (maio a setembro) é o período seco que exige atenção nos mananciais.',
      },
      {
        correct: 'Desconexões descontam 1 questão cada; alternar abas (Alt+Tab) pode gerar penalidade.',
        wrong: 'Quedas rápidas de internet ou trocas de aba na prova online não geram penalidade.',
        explanation: 'O sistema monitora foco de janela e penaliza cada desconexão com perda de 1 questão.',
      },
    ],
    cheatSheetTable: {
      title: 'Clima de Goiás & Regras do Dia 06/12/2026',
      headers: ['Tema', 'Regra / Dado de Prova'],
      monoColumns: [0],
      rows: [
        ['Bioma predominante', 'Cerrado (duas estações bem definidas)'],
        ['Período chuvoso', 'Outubro a Abril'],
        ['Período de estiagem (seca)', 'Maio a Setembro (crítico para mananciais)'],
        ['Doenças hídricas evitadas', 'Diarreias, hepatite A, leptospirose e arboviroses'],
        ['Conexão na prova online', 'Cabo de rede + 4G/5G pronto (desconexão = −1 questão)'],
        ['Ambiente do computador', 'Janela anônima sem extensões, Não Perturbe, sem Alt+Tab'],
      ],
    },
  },
  {
    lessonId: 'san-4',
    unitId: 'saneago',
    title: 'Etapas da ETA & Bacias de GO',
    summary:
      'Decore na ordem exata como a água bruta vira água potável em uma Estação de Tratamento de Água (ETA) e conheça as três grandes bacias hidrográficas alimentadas por Goiás.',
    mascotWelcome:
      'Mnemônico infalível da ETA: Co-Flo-De-Fi-Des! Coagulação, Floculação, Decantação, Filtração e Desinfecção!',
    keyRules: [
      {
        title: 'Sequência da ETA Convencional',
        mnemonic: 'Co-Flo-De-Fi-Des (ordem imutável)',
        explanation:
          '1) Coagulação (produto químico junta sujeira fina); 2) Floculação (agitação lenta forma flocos pesados); 3) Decantação (flocos afundam pela gravidade); 4) Filtração (camadas de carvão antracito, areia e cascalho); 5) Desinfecção (cloro mata microrganismos) e Fluoretação (flúor contra cáries).',
        formula: 'Coagulação → Floculação → Decantação → Filtração → Desinfecção/Fluoretação',
      },
      {
        title: 'Goiás, o "Berço das Águas"',
        mnemonic: 'Araguaia-Tocantins + Paranaíba + São Francisco',
        explanation:
          'Os planaltos e chapadas do Cerrado goiano atuam como divisor de águas para 3 grandes bacias hidrográficas nacionais: Araguaia-Tocantins (centro-norte), Paranaíba/Bacia do Paraná (centro-sul) e São Francisco (leste goiano).',
        formula: 'GO = Araguaia-Tocantins + Paranaíba (Paraná) + São Francisco',
      },
    ],
    examples: [
      {
        correct: 'Ordem na ETA: Coagulação → Floculação → Decantação → Filtração → Desinfecção/Fluoretação.',
        wrong: 'Ordem na ETA: Filtração → Decantação → Coagulação → Floculação → Desinfecção.',
        explanation: 'A filtração com areia, cascalho e carvão acontece DEPOIS de os flocos decantarem.',
      },
      {
        correct: 'As nascentes de Goiás alimentam Araguaia-Tocantins, Paranaíba e São Francisco.',
        wrong: 'Goiás alimenta as bacias Amazônica, Uruguai e Atlântico Sul.',
        explanation: 'O divisor de águas goiano abastece exclusivamente essas três grandes bacias brasileiras.',
      },
    ],
    cheatSheetTable: {
      title: 'Fluxo da ETA & Hidrografia de Goiás',
      headers: ['Etapa / Bacia', 'Função ou Região'],
      monoColumns: [0],
      rows: [
        ['1. Coagulação', 'Adição de coagulante para desestabilizar impurezas finas'],
        ['2. Floculação', 'Agitação lenta agrupa partículas em flocos maiores e pesados'],
        ['3. Decantação', 'Flocos descem para o fundo do tanque pela ação da gravidade'],
        ['4. Filtração', 'Água atravessa camadas de carvão antracito, areia e cascalho'],
        ['5. Desinfecção / Flúor', 'Cloro elimina microrganismos; flúor ajuda a prevenir cáries'],
        ['Bacias de Goiás', 'Araguaia-Tocantins, Paranaíba (Paraná) e São Francisco'],
      ],
    },
  },
];

export function getUnitGuideOverview(unitId: UnitId): UnitGuideOverview {
  return UNIT_GUIDE_OVERVIEWS[unitId];
}

export function getLessonGuide(lessonId: string | undefined): LessonGuide | undefined {
  if (!lessonId) return undefined;
  return LESSON_GUIDES.find((guide) => guide.lessonId === lessonId);
}

export function getGuidesByUnit(unitId: UnitId): LessonGuide[] {
  return LESSON_GUIDES.filter((guide) => guide.unitId === unitId);
}

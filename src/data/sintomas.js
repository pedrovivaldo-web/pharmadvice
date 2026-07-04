// Catálogo de sintomas atendidos ao balcão, com sinais de alarme (triagem) e as
// substâncias (DCI) clinicamente indicadas para cada um.
//
// ⚠️ AVISO: conteúdo clínico ILUSTRATIVO para desenvolvimento. Ver aviso em
// substancias.js. Os sinais de alarme aqui são um subconjunto didático; a
// triagem real segue protocolos validados (ex.: WWHAM/ASMETHOD, guias Infarmed).
//
// Cada sinal de alarme:
//   id, descricao (para o farmacêutico), pergunta (a fazer ao doente),
//   avaliar(consulta) => bool  →  true significa "sinal presente → referenciar".
//
// A resposta a cada pergunta chega em `consulta.respostas[id]`.

const resp = (c, id) => c?.respostas?.[id] === true;
const duracaoDias = (c) => c?.duracaoDias ?? 0;

// Sinais de alarme comuns a quadros infeciosos/gerais.
const alarmesGerais = () => [
  {
    id: 'rigidez-nucal',
    descricao: 'Rigidez da nuca / fotofobia (suspeita de meningite)',
    pergunta: 'Sente o pescoço rígido ou incómodo com a luz?',
    avaliar: (c) => resp(c, 'rigidez-nucal'),
  },
  {
    id: 'dispneia',
    descricao: 'Dificuldade respiratória',
    pergunta: 'Tem falta de ar?',
    avaliar: (c) => resp(c, 'dispneia'),
  },
];

export const SINTOMAS = {
  cefaleia: {
    id: 'cefaleia',
    nome: 'Dor de cabeça',
    substanciasIndicadas: ['paracetamol', 'ibuprofeno', 'aas'],
    sinaisAlarme: [
      {
        id: 'cefaleia-subita',
        descricao: 'Cefaleia súbita e intensa ("a pior da vida") — suspeita de HSA',
        pergunta: 'Começou de repente e é a pior dor de cabeça de sempre?',
        avaliar: (c) => resp(c, 'cefaleia-subita'),
      },
      {
        id: 'defice-neuro',
        descricao: 'Défice neurológico (alteração da fala, força, visão, confusão)',
        pergunta: 'Notou alterações na fala, força, visão ou confusão?',
        avaliar: (c) => resp(c, 'defice-neuro'),
      },
      {
        id: 'trauma-cranio',
        descricao: 'Traumatismo craniano recente',
        pergunta: 'Bateu com a cabeça recentemente?',
        avaliar: (c) => resp(c, 'trauma-cranio'),
      },
      ...alarmesGerais(),
      {
        id: 'cefaleia-persistente',
        descricao: 'Dor persistente > 3 dias sem melhoria com analgésico',
        pergunta: null, // derivado da duração (campo próprio) — não se pergunta
        avaliar: (c) => duracaoDias(c) > 3,
      },
    ],
  },

  febre: {
    id: 'febre',
    nome: 'Febre',
    substanciasIndicadas: ['paracetamol', 'ibuprofeno'],
    sinaisAlarme: [
      {
        id: 'febre-lactente',
        descricao: 'Febre em criança < 3 meses',
        pergunta: null,
        avaliar: (c) => (c?.doente?.idade ?? 99) < 0.25,
      },
      {
        id: 'febre-alta',
        descricao: 'Febre > 39,5 °C ou > 3 dias',
        pergunta: 'A febre passou dos 39,5 °C ou já dura mais de 3 dias?',
        avaliar: (c) => resp(c, 'febre-alta') || duracaoDias(c) > 3,
      },
      {
        id: 'exantema',
        descricao: 'Erupção cutânea que não desaparece à pressão',
        pergunta: 'Tem manchas na pele que não desaparecem quando carrega?',
        avaliar: (c) => resp(c, 'exantema'),
      },
      ...alarmesGerais(),
    ],
  },

  'congestao-nasal': {
    id: 'congestao-nasal',
    nome: 'Congestão nasal / constipação',
    substanciasIndicadas: ['pseudoefedrina', 'xilometazolina', 'paracetamol'],
    sinaisAlarme: [
      {
        id: 'sinusite-prolongada',
        descricao: 'Sintomas > 10 dias ou agravamento (suspeita de sinusite bacteriana)',
        pergunta: 'Piorou depois de ter começado a melhorar?',
        avaliar: (c) => duracaoDias(c) > 10 || resp(c, 'sinusite-prolongada'),
      },
      {
        id: 'dor-facial-febre',
        descricao: 'Dor facial intensa com febre alta',
        pergunta: 'Tem dor na cara com febre alta?',
        avaliar: (c) => resp(c, 'dor-facial-febre'),
      },
    ],
  },

  'tosse-seca': {
    id: 'tosse-seca',
    nome: 'Tosse seca / irritativa',
    substanciasIndicadas: ['dextrometorfano'],
    sinaisAlarme: [
      {
        id: 'tosse-cronica',
        descricao: 'Tosse > 3 semanas',
        pergunta: 'A tosse já dura mais de 3 semanas?',
        avaliar: (c) => duracaoDias(c) > 21,
      },
      {
        id: 'hemoptise',
        descricao: 'Sangue na expetoração',
        pergunta: 'Notou sangue ao tossir?',
        avaliar: (c) => resp(c, 'hemoptise'),
      },
      ...alarmesGerais(),
    ],
  },

  'tosse-produtiva': {
    id: 'tosse-produtiva',
    nome: 'Tosse produtiva / com expetoração',
    substanciasIndicadas: ['acetilcisteina'],
    sinaisAlarme: [
      {
        id: 'tosse-cronica-p',
        descricao: 'Tosse > 3 semanas',
        pergunta: 'A tosse já dura mais de 3 semanas?',
        avaliar: (c) => duracaoDias(c) > 21,
      },
      {
        id: 'expetoracao-purulenta',
        descricao: 'Expetoração purulenta/esverdeada com febre',
        pergunta: 'A expetoração é esverdeada/amarelada com febre?',
        avaliar: (c) => resp(c, 'expetoracao-purulenta'),
      },
      ...alarmesGerais(),
    ],
  },

  pirose: {
    id: 'pirose',
    nome: 'Azia / pirose',
    substanciasIndicadas: ['antiacido', 'famotidina', 'omeprazol'],
    sinaisAlarme: [
      {
        id: 'disfagia',
        descricao: 'Dificuldade ou dor a engolir',
        pergunta: 'Tem dificuldade ou dor a engolir?',
        avaliar: (c) => resp(c, 'disfagia'),
      },
      {
        id: 'perda-peso',
        descricao: 'Perda de peso não intencional',
        pergunta: 'Tem perdido peso sem querer?',
        avaliar: (c) => resp(c, 'perda-peso'),
      },
      {
        id: 'hemorragia-dig',
        descricao: 'Vómito com sangue ou fezes escuras (melenas)',
        pergunta: 'Vomitou sangue ou teve fezes muito escuras?',
        avaliar: (c) => resp(c, 'hemorragia-dig'),
      },
      {
        id: 'pirose-idade',
        descricao: 'Sintomas de novo em pessoa > 55 anos',
        pergunta: null,
        avaliar: (c) => (c?.doente?.idade ?? 0) > 55 && duracaoDias(c) < 30,
      },
    ],
  },
};

export function getSintoma(id) {
  return SINTOMAS[id] ?? null;
}

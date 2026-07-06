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
    // Papéis para cross-selling: um produto por papel, seguros em conjunto.
    papeis: [
      { id: 'descongestionante', nome: 'Descongestionante', dcis: ['pseudoefedrina', 'xilometazolina'], principal: true },
      { id: 'analgesico', nome: 'Analgésico/antipirético (dores e febre associadas)', dcis: ['paracetamol', 'ibuprofeno', 'aas'], principal: false },
    ],
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

  // ===================================================================
  // Sintomas acrescentados (PROPOSTA — validar) a partir do inventário
  // ===================================================================

  'dor-garganta': {
    id: 'dor-garganta',
    nome: 'Dor de garganta',
    substanciasIndicadas: ['flurbiprofeno', 'benzidamina', 'pastilha-garganta', 'paracetamol', 'ibuprofeno'],
    papeis: [
      { id: 'alivio-local', nome: 'Alívio local da garganta', dcis: ['flurbiprofeno', 'benzidamina', 'pastilha-garganta'], principal: true },
      { id: 'analgesico', nome: 'Analgésico/antipirético', dcis: ['paracetamol', 'ibuprofeno'], principal: false },
    ],
    sinaisAlarme: [
      { id: 'garganta-respirar', descricao: 'Dificuldade em respirar ou em engolir a própria saliva (emergência)', pergunta: 'Tem dificuldade em respirar ou em engolir a própria saliva?', avaliar: (c) => resp(c, 'garganta-respirar') },
      { id: 'garganta-unilateral', descricao: 'Inchaço só de um lado / voz abafada (abcesso periamigdalino)', pergunta: 'O inchaço é só de um lado ou tem a voz abafada?', avaliar: (c) => resp(c, 'garganta-unilateral') },
      { id: 'garganta-placas-febre', descricao: 'Placas com febre alta e sem tosse (possível estreptococo)', pergunta: 'Tem placas na garganta, com febre alta e sem tosse?', avaliar: (c) => resp(c, 'garganta-placas-febre') },
      { id: 'garganta-prolongada', descricao: 'Duração > 7 dias sem melhoria', pergunta: null, avaliar: (c) => duracaoDias(c) > 7 },
    ],
  },

  'rinite-alergica': {
    id: 'rinite-alergica',
    nome: 'Rinite alérgica / alergia',
    substanciasIndicadas: ['loratadina', 'cetirizina', 'fexofenadina'],
    papeis: [
      { id: 'anti-histaminico', nome: 'Anti-histamínico oral', dcis: ['loratadina', 'cetirizina', 'fexofenadina'], principal: true },
    ],
    sinaisAlarme: [
      { id: 'rinite-dispneia', descricao: 'Falta de ar ou pieira (possível componente asmático)', pergunta: 'Tem falta de ar ou pieira?', avaliar: (c) => resp(c, 'rinite-dispneia') },
      { id: 'rinite-unilateral', descricao: 'Sintomas só de um lado ou com sangue (atípico de alergia)', pergunta: 'Os sintomas são só de um lado ou com sangue no nariz?', avaliar: (c) => resp(c, 'rinite-unilateral') },
      { id: 'rinite-dor-facial', descricao: 'Dor/pressão facial com febre (sinusite)', pergunta: 'Tem dor ou pressão na cara com febre?', avaliar: (c) => resp(c, 'rinite-dor-facial') },
    ],
  },

  obstipacao: {
    id: 'obstipacao',
    nome: 'Obstipação',
    substanciasIndicadas: ['macrogol', 'lactulose', 'bisacodilo'],
    papeis: [
      { id: 'laxante', nome: 'Laxante', dcis: ['macrogol', 'lactulose', 'bisacodilo'], principal: true },
    ],
    sinaisAlarme: [
      { id: 'obst-dor-vomito', descricao: 'Dor abdominal intensa ou vómitos (suspeita de obstrução)', pergunta: 'Tem dor abdominal intensa ou vómitos?', avaliar: (c) => resp(c, 'obst-dor-vomito') },
      { id: 'obst-sangue', descricao: 'Sangue nas fezes', pergunta: 'Tem sangue nas fezes?', avaliar: (c) => resp(c, 'obst-sangue') },
      { id: 'obst-peso', descricao: 'Perda de peso não intencional', pergunta: 'Perdeu peso sem querer?', avaliar: (c) => resp(c, 'obst-peso') },
      { id: 'obst-habito', descricao: 'Mudança recente e persistente do hábito intestinal (> 50 anos)', pergunta: 'Houve mudança recente e persistente do hábito intestinal?', avaliar: (c) => resp(c, 'obst-habito') && (c?.doente?.idade ?? 0) > 50 },
    ],
  },

  diarreia: {
    id: 'diarreia',
    nome: 'Diarreia',
    substanciasIndicadas: ['reidratacao-oral', 'loperamida'],
    papeis: [
      { id: 'reidratacao', nome: 'Reidratação oral', dcis: ['reidratacao-oral'], principal: true },
      { id: 'antidiarreico', nome: 'Antidiarreico', dcis: ['loperamida'], principal: false },
    ],
    sinaisAlarme: [
      { id: 'diar-sangue', descricao: 'Sangue ou muco nas fezes', pergunta: 'Tem sangue ou muco nas fezes?', avaliar: (c) => resp(c, 'diar-sangue') },
      { id: 'diar-febre', descricao: 'Febre alta', pergunta: 'Tem febre alta?', avaliar: (c) => resp(c, 'diar-febre') },
      { id: 'diar-desidratacao', descricao: 'Sinais de desidratação (boca seca, pouca urina, prostração)', pergunta: 'Tem sinais de desidratação (boca seca, pouca urina, prostração)?', avaliar: (c) => resp(c, 'diar-desidratacao') },
      { id: 'diar-prolongada', descricao: 'Diarreia > 3 dias', pergunta: null, avaliar: (c) => duracaoDias(c) > 3 },
      { id: 'diar-lactente', descricao: 'Lactente < 1 ano — risco de desidratação', pergunta: null, avaliar: (c) => (c?.doente?.idade ?? 99) < 1 },
    ],
  },

  nauseas: {
    id: 'nauseas',
    nome: 'Náuseas / enjoo',
    substanciasIndicadas: ['dimenidrinato'],
    papeis: [
      { id: 'anti-emetico', nome: 'Anti-emético', dcis: ['dimenidrinato'], principal: true },
    ],
    sinaisAlarme: [
      { id: 'naus-sangue', descricao: 'Vómito com sangue ou aspeto de "borra de café"', pergunta: 'O vómito tem sangue ou aspeto de borra de café?', avaliar: (c) => resp(c, 'naus-sangue') },
      { id: 'naus-dor', descricao: 'Dor abdominal ou torácica intensa', pergunta: 'Tem dor abdominal ou no peito intensa?', avaliar: (c) => resp(c, 'naus-dor') },
      { id: 'naus-neuro', descricao: 'Dor de cabeça intensa, rigidez da nuca ou confusão', pergunta: 'Tem dor de cabeça intensa, pescoço rígido ou confusão?', avaliar: (c) => resp(c, 'naus-neuro') },
      { id: 'naus-gravidez', descricao: 'Náuseas na gravidez — aconselhamento específico', pergunta: null, avaliar: (c) => c?.doente?.gravidez === true },
    ],
  },

  'dores-musculares': {
    id: 'dores-musculares',
    nome: 'Dores musculares / contusão',
    substanciasIndicadas: ['diclofenac-topico', 'ibuprofeno-topico', 'paracetamol', 'ibuprofeno'],
    papeis: [
      { id: 'topico', nome: 'Anti-inflamatório tópico', dcis: ['diclofenac-topico', 'ibuprofeno-topico'], principal: true },
      { id: 'analgesico', nome: 'Analgésico oral', dcis: ['paracetamol', 'ibuprofeno'], principal: false },
    ],
    sinaisAlarme: [
      { id: 'musc-trauma', descricao: 'Trauma forte, deformidade ou incapacidade de mexer/apoiar', pergunta: 'Houve trauma forte, deformidade ou não consegue mexer/apoiar?', avaliar: (c) => resp(c, 'musc-trauma') },
      { id: 'musc-neuro', descricao: 'Dormência, formigueiro ou fraqueza no membro', pergunta: 'Tem dormência, formigueiro ou fraqueza no membro?', avaliar: (c) => resp(c, 'musc-neuro') },
      { id: 'musc-lombar-esfincter', descricao: 'Dor lombar com dificuldade a urinar / perda de controlo (cauda equina)', pergunta: 'Dor lombar com dificuldade a urinar ou a controlar os esfíncteres?', avaliar: (c) => resp(c, 'musc-lombar-esfincter') },
      { id: 'musc-febre', descricao: 'Zona quente, vermelha e com febre (infeção)', pergunta: 'A zona está quente e vermelha, com febre?', avaliar: (c) => resp(c, 'musc-febre') },
    ],
  },
};

export function getSintoma(id) {
  return SINTOMAS[id] ?? null;
}

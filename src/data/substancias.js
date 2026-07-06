// Catálogo de substâncias (DCI) com regras de contraindicação e interação.
//
// ⚠️ AVISO: o conteúdo clínico deste ficheiro é ILUSTRATIVO, para desenvolver e
// testar o motor. NÃO é uma fonte clínica. Antes de qualquer uso real tem de ser
// validado por um farmacêutico contra fontes oficiais (Infarmed/RCM, folhetos
// informativos, Prontuário Terapêutico). O motor decide com base nestes dados —
// dados errados = conselhos errados.
//
// Cada regra de contraindicação é uma função `avaliar(doente, consulta) => bool`.
// `gravidade`:
//   'absoluta' → exclui o produto (nunca recomendar)
//   'relativa' → não exclui, mas gera um aviso para o farmacêutico ponderar.

/**
 * @typedef {Object} Doente
 * @property {number} idade
 * @property {'F'|'M'} [sexo]
 * @property {boolean} [gravidez]
 * @property {number} [semanasGestacao]
 * @property {boolean} [amamentacao]
 * @property {string[]} [patologias]  ids: 'hipertensao','doenca-cardiaca','ulcera-peptica','doenca-renal','doenca-hepatica','asma','hipertiroidismo','glaucoma'
 * @property {string[]} [medicacao]   ids DCI: 'varfarina','lisinopril','imao', ...
 * @property {string[]} [alergias]    ids substância/classe: 'aine','paracetamol','aas', ...
 */

const tem = (lista, id) => Array.isArray(lista) && lista.includes(id);

// AINEs partilham quase todas as contraindicações — fábrica para não repetir.
function contraindicacoesAINE() {
  return [
    {
      id: 'aine-ulcera',
      descricao: 'Úlcera péptica ativa ou história de hemorragia digestiva',
      gravidade: 'absoluta',
      avaliar: (d) => tem(d.patologias, 'ulcera-peptica'),
    },
    {
      id: 'aine-renal',
      descricao: 'Doença renal (AINEs reduzem a perfusão renal)',
      gravidade: 'relativa',
      avaliar: (d) => tem(d.patologias, 'doenca-renal'),
    },
    {
      id: 'aine-gravidez-3t',
      descricao: 'Gravidez no 3.º trimestre (encerramento do canal arterial)',
      gravidade: 'absoluta',
      avaliar: (d) => d.gravidez && (d.semanasGestacao ?? 0) >= 28,
    },
    {
      id: 'aine-gravidez',
      descricao: 'Gravidez (1.º/2.º trimestre — evitar; preferir paracetamol)',
      gravidade: 'relativa',
      avaliar: (d) => d.gravidez && (d.semanasGestacao ?? 0) < 28,
    },
    {
      id: 'aine-asma',
      descricao: 'Asma (risco de broncospasmo por AINE)',
      gravidade: 'relativa',
      avaliar: (d) => tem(d.patologias, 'asma'),
    },
    {
      id: 'aine-htan',
      descricao: 'Hipertensão / doença cardíaca (AINEs sobem a tensão, retêm sódio)',
      gravidade: 'relativa',
      avaliar: (d) => tem(d.patologias, 'hipertensao') || tem(d.patologias, 'doenca-cardiaca'),
    },
    {
      id: 'aine-alergia',
      descricao: 'Alergia conhecida a AINEs',
      gravidade: 'absoluta',
      avaliar: (d) => tem(d.alergias, 'aine'),
    },
  ];
}

function interacoesAINE() {
  return [
    { comDci: 'varfarina', descricao: 'AINE + anticoagulante: risco hemorrágico aumentado', gravidade: 'grave' },
    { comDci: 'lisinopril', descricao: 'AINE + IECA: risco renal e menor efeito anti-hipertensor', gravidade: 'moderada' },
    { comDci: 'metotrexato', descricao: 'AINE aumenta toxicidade do metotrexato', gravidade: 'grave' },
  ];
}

/** @type {Record<string, any>} */
export const SUBSTANCIAS = {
  paracetamol: {
    dci: 'paracetamol',
    nome: 'Paracetamol',
    classe: 'analgesico-antipiretico',
    posologiaAdulto: '500–1000 mg até 3–4x/dia, máx. 3 g/dia (MNSRM); intervalo mín. 6 h',
    contraindicacoes: [
      {
        id: 'para-hepatica',
        descricao: 'Doença hepática grave (hepatotoxicidade)',
        gravidade: 'relativa',
        avaliar: (d) => tem(d.patologias, 'doenca-hepatica'),
      },
      {
        id: 'para-alergia',
        descricao: 'Alergia a paracetamol',
        gravidade: 'absoluta',
        avaliar: (d) => tem(d.alergias, 'paracetamol'),
      },
    ],
    interacoes: [
      { comDci: 'varfarina', descricao: 'Uso prolongado pode potenciar a varfarina', gravidade: 'leve' },
    ],
  },

  ibuprofeno: {
    dci: 'ibuprofeno',
    nome: 'Ibuprofeno',
    classe: 'aine',
    posologiaAdulto: '200–400 mg até 3x/dia, máx. 1200 mg/dia (MNSRM); tomar com alimentos',
    contraindicacoes: contraindicacoesAINE(),
    interacoes: interacoesAINE(),
  },

  aas: {
    dci: 'aas',
    nome: 'Ácido acetilsalicílico',
    classe: 'aine',
    posologiaAdulto: '500–1000 mg até 3x/dia, máx. 3 g/dia; tomar com alimentos',
    contraindicacoes: [
      ...contraindicacoesAINE(),
      {
        id: 'aas-reye',
        descricao: 'Menores de 16 anos (risco de síndrome de Reye)',
        gravidade: 'absoluta',
        avaliar: (d) => d.idade < 16,
      },
    ],
    interacoes: interacoesAINE(),
  },

  pseudoefedrina: {
    dci: 'pseudoefedrina',
    nome: 'Pseudoefedrina',
    classe: 'descongestionante-oral',
    posologiaAdulto: '60 mg até 4x/dia, máx. 240 mg/dia; não usar > 5 dias',
    contraindicacoes: [
      {
        id: 'pse-cardio',
        descricao: 'Hipertensão ou doença cardíaca (vasoconstritor simpaticomimético)',
        gravidade: 'absoluta',
        avaliar: (d) => tem(d.patologias, 'hipertensao') || tem(d.patologias, 'doenca-cardiaca'),
      },
      {
        id: 'pse-tiroide',
        descricao: 'Hipertiroidismo',
        gravidade: 'absoluta',
        avaliar: (d) => tem(d.patologias, 'hipertiroidismo'),
      },
      {
        id: 'pse-glaucoma',
        descricao: 'Glaucoma de ângulo fechado',
        gravidade: 'relativa',
        avaliar: (d) => tem(d.patologias, 'glaucoma'),
      },
      {
        id: 'pse-idade',
        descricao: 'Não recomendado abaixo dos 12 anos',
        gravidade: 'absoluta',
        avaliar: (d) => d.idade < 12,
      },
    ],
    interacoes: [
      { comDci: 'imao', descricao: 'Com IMAO: crise hipertensiva (contraindicado)', gravidade: 'grave' },
    ],
  },

  xilometazolina: {
    dci: 'xilometazolina',
    nome: 'Xilometazolina (spray nasal)',
    classe: 'descongestionante-topico',
    posologiaAdulto: '1 aplicação por narina 2–3x/dia; NÃO usar > 5 dias (rinite medicamentosa)',
    contraindicacoes: [
      {
        id: 'xilo-idade',
        descricao: 'Não usar a formulação adulto abaixo dos 12 anos',
        gravidade: 'absoluta',
        avaliar: (d) => d.idade < 12,
      },
    ],
    interacoes: [],
  },

  dextrometorfano: {
    dci: 'dextrometorfano',
    nome: 'Dextrometorfano',
    classe: 'antitussico',
    posologiaAdulto: '15 mg até 4x/dia; apenas para tosse SECA e irritativa',
    contraindicacoes: [
      {
        id: 'dxm-produtiva',
        descricao: 'Tosse produtiva (não suprimir tosse com expetoração)',
        gravidade: 'absoluta',
        avaliar: (_d, c) => c?.sintoma === 'tosse-produtiva',
      },
      {
        id: 'dxm-idade',
        descricao: 'Não recomendado abaixo dos 12 anos sem indicação médica',
        gravidade: 'absoluta',
        avaliar: (d) => d.idade < 12,
      },
    ],
    interacoes: [
      { comDci: 'imao', descricao: 'Com IMAO: risco de síndrome serotoninérgica', gravidade: 'grave' },
      { comDci: 'ssri', descricao: 'Com ISRS: risco de síndrome serotoninérgica', gravidade: 'moderada' },
    ],
  },

  acetilcisteina: {
    dci: 'acetilcisteina',
    nome: 'Acetilcisteína',
    classe: 'mucolitico',
    posologiaAdulto: '600 mg 1x/dia; para tosse PRODUTIVA; não tomar ao deitar',
    contraindicacoes: [
      {
        id: 'ac-ulcera',
        descricao: 'Úlcera péptica ativa (precaução)',
        gravidade: 'relativa',
        avaliar: (d) => tem(d.patologias, 'ulcera-peptica'),
      },
      {
        id: 'ac-idade',
        descricao: 'Não recomendado abaixo dos 2 anos',
        gravidade: 'absoluta',
        avaliar: (d) => d.idade < 2,
      },
    ],
    interacoes: [],
  },

  loratadina: {
    dci: 'loratadina',
    nome: 'Loratadina',
    classe: 'anti-histaminico',
    posologiaAdulto: '10 mg 1x/dia (não sedativo)',
    contraindicacoes: [
      {
        id: 'lor-idade',
        descricao: 'Ajustar dose/forma abaixo dos 2 anos',
        gravidade: 'relativa',
        avaliar: (d) => d.idade < 2,
      },
    ],
    interacoes: [],
  },

  antiacido: {
    dci: 'antiacido',
    nome: 'Antiácido (hidróxido de alumínio/magnésio)',
    classe: 'antiacido',
    posologiaAdulto: '1 toma após as refeições e ao deitar, em SOS',
    contraindicacoes: [
      {
        id: 'anti-renal',
        descricao: 'Doença renal grave (acumulação de alumínio/magnésio)',
        gravidade: 'relativa',
        avaliar: (d) => tem(d.patologias, 'doenca-renal'),
      },
    ],
    // Antiácidos reduzem a absorção de muitos fármacos se tomados em simultâneo.
    interacoes: [
      { comDci: 'levotiroxina', descricao: 'Reduz absorção da levotiroxina (espaçar 4 h)', gravidade: 'moderada' },
    ],
  },

  famotidina: {
    dci: 'famotidina',
    nome: 'Famotidina',
    classe: 'anti-h2',
    posologiaAdulto: '10–20 mg até 2x/dia',
    contraindicacoes: [
      {
        id: 'fam-renal',
        descricao: 'Doença renal (ajuste de dose)',
        gravidade: 'relativa',
        avaliar: (d) => tem(d.patologias, 'doenca-renal'),
      },
    ],
    interacoes: [],
  },

  omeprazol: {
    dci: 'omeprazol',
    nome: 'Omeprazol',
    classe: 'ibp',
    posologiaAdulto: '20 mg 1x/dia, de manhã, em jejum; MNSRM até 14 dias',
    contraindicacoes: [],
    interacoes: [
      { comDci: 'clopidogrel', descricao: 'Reduz o efeito antiagregante do clopidogrel', gravidade: 'moderada' },
    ],
  },

  // ===================================================================
  // Substâncias acrescentadas (PROPOSTA — validar) para novos sintomas
  // ===================================================================

  // --- Dor de garganta ---
  'pastilha-garganta': {
    dci: 'pastilha-garganta',
    nome: 'Pastilha antisséptica para a garganta',
    classe: 'garganta-local',
    posologiaAdulto: 'Chupar 1 pastilha a cada 2–3 h (ver rótulo); cuidado com açúcar em diabéticos',
    contraindicacoes: [],
    interacoes: [],
  },
  benzidamina: {
    dci: 'benzidamina',
    nome: 'Benzidamina (colutório/spray)',
    classe: 'garganta-aine',
    posologiaAdulto: 'Gargarejo/pulverização a cada 1,5–3 h; não engolir',
    contraindicacoes: [
      { id: 'benz-alergia-aine', descricao: 'Alergia a AINEs', gravidade: 'relativa', avaliar: (d) => tem(d.alergias, 'aine') },
    ],
    interacoes: [],
  },
  flurbiprofeno: {
    dci: 'flurbiprofeno',
    nome: 'Flurbiprofeno (pastilhas)',
    classe: 'aine',
    posologiaAdulto: 'Chupar 1 pastilha a cada 3–6 h, máx. 5/dia, até 3 dias',
    contraindicacoes: contraindicacoesAINE(),
    interacoes: interacoesAINE(),
  },

  // --- Rinite alérgica ---
  cetirizina: {
    dci: 'cetirizina',
    nome: 'Cetirizina',
    classe: 'anti-histaminico',
    posologiaAdulto: '10 mg 1x/dia (pode causar alguma sonolência)',
    contraindicacoes: [
      { id: 'cet-renal', descricao: 'Doença renal (ajuste de dose)', gravidade: 'relativa', avaliar: (d) => tem(d.patologias, 'doenca-renal') },
    ],
    interacoes: [],
  },
  fexofenadina: {
    dci: 'fexofenadina',
    nome: 'Fexofenadina',
    classe: 'anti-histaminico',
    posologiaAdulto: '120–180 mg 1x/dia (não sedativo)',
    contraindicacoes: [],
    interacoes: [
      { comDci: 'antiacido', descricao: 'Antiácidos com Al/Mg reduzem a absorção (espaçar 2 h)', gravidade: 'leve' },
    ],
  },

  // --- Obstipação ---
  macrogol: {
    dci: 'macrogol',
    nome: 'Macrogol (PEG)',
    classe: 'laxante-osmotico',
    posologiaAdulto: '1 saqueta 1–3x/dia com água; efeito em 1–2 dias',
    contraindicacoes: [],
    interacoes: [],
  },
  lactulose: {
    dci: 'lactulose',
    nome: 'Lactulose',
    classe: 'laxante-osmotico',
    posologiaAdulto: '15 mL 1–2x/dia; pode dar flatulência inicial',
    contraindicacoes: [],
    interacoes: [],
  },
  bisacodilo: {
    dci: 'bisacodilo',
    nome: 'Bisacodilo',
    classe: 'laxante-estimulante',
    posologiaAdulto: '5–10 mg à noite; uso pontual (não prolongar)',
    contraindicacoes: [
      { id: 'bisa-idade', descricao: 'Não recomendado abaixo dos 10 anos sem indicação', gravidade: 'relativa', avaliar: (d) => d.idade < 10 },
    ],
    interacoes: [],
  },

  // --- Diarreia ---
  loperamida: {
    dci: 'loperamida',
    nome: 'Loperamida',
    classe: 'antidiarreico',
    posologiaAdulto: '2 mg após cada dejeção, máx. 6/dia (MNSRM), até 2 dias',
    contraindicacoes: [
      { id: 'lop-idade', descricao: 'Não usar abaixo dos 12 anos sem indicação médica', gravidade: 'absoluta', avaliar: (d) => d.idade < 12 },
    ],
    interacoes: [],
  },
  'reidratacao-oral': {
    dci: 'reidratacao-oral',
    nome: 'Sais de reidratação oral',
    classe: 'reidratacao',
    posologiaAdulto: 'Reconstituir e beber após cada dejeção; repor líquidos',
    contraindicacoes: [],
    interacoes: [],
  },

  // --- Náuseas / enjoo ---
  dimenidrinato: {
    dci: 'dimenidrinato',
    nome: 'Dimenidrinato',
    classe: 'anti-emetico',
    posologiaAdulto: '50 mg até 3x/dia; pode causar sonolência (cuidado a conduzir)',
    contraindicacoes: [
      { id: 'dim-glaucoma', descricao: 'Glaucoma de ângulo fechado', gravidade: 'relativa', avaliar: (d) => tem(d.patologias, 'glaucoma') },
      { id: 'dim-prostata', descricao: 'Hiperplasia da próstata / retenção urinária', gravidade: 'relativa', avaliar: (d) => tem(d.patologias, 'hiperplasia-prostatica') },
      { id: 'dim-idade', descricao: 'Não recomendado abaixo dos 2 anos', gravidade: 'absoluta', avaliar: (d) => d.idade < 2 },
    ],
    interacoes: [
      { comDci: 'imao', descricao: 'Com IMAO: potenciação anticolinérgica', gravidade: 'moderada' },
    ],
  },

  // --- Dores musculares (tópicos) ---
  'diclofenac-topico': {
    dci: 'diclofenac-topico',
    nome: 'Diclofenac gel (tópico)',
    classe: 'aine-topico',
    posologiaAdulto: 'Aplicar na zona 3–4x/dia; não em pele lesada/mucosas',
    contraindicacoes: [
      { id: 'dtop-alergia', descricao: 'Alergia a AINEs', gravidade: 'absoluta', avaliar: (d) => tem(d.alergias, 'aine') },
      { id: 'dtop-gravidez-3t', descricao: 'Gravidez no 3.º trimestre', gravidade: 'absoluta', avaliar: (d) => d.gravidez && (d.semanasGestacao ?? 0) >= 28 },
    ],
    interacoes: [],
  },
  'ibuprofeno-topico': {
    dci: 'ibuprofeno-topico',
    nome: 'Ibuprofeno gel (tópico)',
    classe: 'aine-topico',
    posologiaAdulto: 'Aplicar na zona 3–4x/dia; não em pele lesada/mucosas',
    contraindicacoes: [
      { id: 'itop-alergia', descricao: 'Alergia a AINEs', gravidade: 'absoluta', avaliar: (d) => tem(d.alergias, 'aine') },
      { id: 'itop-gravidez-3t', descricao: 'Gravidez no 3.º trimestre', gravidade: 'absoluta', avaliar: (d) => d.gravidez && (d.semanasGestacao ?? 0) >= 28 },
    ],
    interacoes: [],
  },

  // ===================================================================
  // Lote 2 (PROPOSTA — validar): herpes, micoses, hemorroidas, aftas, prurido
  // ===================================================================

  // Herpes labial
  'aciclovir-topico': {
    dci: 'aciclovir-topico', nome: 'Aciclovir creme (lábio)', classe: 'antiviral-topico',
    posologiaAdulto: 'Aplicar 5x/dia durante 4–5 dias, aos primeiros sinais (formigueiro)',
    contraindicacoes: [], interacoes: [],
  },

  // Micoses cutâneas
  'clotrimazol-topico': { dci: 'clotrimazol-topico', nome: 'Clotrimazol creme', classe: 'antifungico-topico', posologiaAdulto: '2–3x/dia, 2–4 semanas (continuar após melhoria)', contraindicacoes: [], interacoes: [] },
  'econazol-topico': { dci: 'econazol-topico', nome: 'Econazol creme/pó', classe: 'antifungico-topico', posologiaAdulto: '1–2x/dia, 2–4 semanas', contraindicacoes: [], interacoes: [] },
  'tioconazol-topico': { dci: 'tioconazol-topico', nome: 'Tioconazol creme', classe: 'antifungico-topico', posologiaAdulto: '1–2x/dia, 2–4 semanas', contraindicacoes: [], interacoes: [] },
  'terbinafina-topico': { dci: 'terbinafina-topico', nome: 'Terbinafina creme', classe: 'antifungico-topico', posologiaAdulto: '1–2x/dia, 1–2 semanas', contraindicacoes: [], interacoes: [] },

  // Candidíase vaginal
  'clotrimazol-vaginal': {
    dci: 'clotrimazol-vaginal', nome: 'Clotrimazol (óvulo/creme vaginal)', classe: 'antifungico-vaginal',
    posologiaAdulto: 'Óvulo à noite (esquema 1–3 dias) ± creme na zona externa',
    contraindicacoes: [
      { id: 'cv-idade', descricao: 'Fora dos 16–60 anos — referenciar', gravidade: 'absoluta', avaliar: (d) => d.idade < 16 || d.idade > 60 },
    ],
    interacoes: [],
  },

  // Hemorroidas
  'antihemorroidario-topico': {
    dci: 'antihemorroidario-topico', nome: 'Antihemorroidário tópico (com anestésico local)', classe: 'hemorroidas-topico',
    posologiaAdulto: 'Aplicar após higiene, 1–2x/dia e após a dejeção, poucos dias',
    contraindicacoes: [], interacoes: [],
  },

  // Aftas
  'afta-local': {
    dci: 'afta-local', nome: 'Tratamento local de aftas', classe: 'afta-local',
    posologiaAdulto: 'Aplicar na lesão 2–3x/dia, após as refeições',
    contraindicacoes: [], interacoes: [],
  },

  // Picadas / prurido / dermatite ligeira
  'dimetindeno-topico': {
    dci: 'dimetindeno-topico', nome: 'Dimetindeno gel (anti-histamínico tópico)', classe: 'anti-histaminico-topico',
    posologiaAdulto: 'Aplicar 2–4x/dia; não em áreas extensas nem pele lesada',
    contraindicacoes: [], interacoes: [],
  },
  'hidrocortisona-topico': {
    dci: 'hidrocortisona-topico', nome: 'Hidrocortisona 1% creme', classe: 'corticoide-topico',
    posologiaAdulto: '1–2x/dia, máx. 7 dias; NÃO na face/olhos nem em pele infetada',
    contraindicacoes: [
      { id: 'hc-idade', descricao: 'Não usar abaixo dos 10 anos sem indicação', gravidade: 'absoluta', avaliar: (d) => d.idade < 10 },
    ],
    interacoes: [],
  },
};

export function getSubstancia(dci) {
  return SUBSTANCIAS[dci] ?? null;
}

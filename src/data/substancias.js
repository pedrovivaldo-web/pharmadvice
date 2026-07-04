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
};

export function getSubstancia(dci) {
  return SUBSTANCIAS[dci] ?? null;
}

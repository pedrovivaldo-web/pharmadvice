// Mapa CNP → substância (DCI), para ligar os produtos do inventário da farmácia
// às substâncias que o motor conhece. Usado pelo importador quando o export NÃO
// traz coluna de substância.
//
// ⚠️ PROPOSTA por inferência a partir do NOME comercial (conhecimento geral),
// para o farmacêutico VALIDAR antes de uso. Regras que segui:
//   • só produtos de SUBSTÂNCIA ÚNICA e inequívoca;
//   • só formas ORAIS sistémicas para os papéis de analgésico/antipirético
//     (géis/cremes tópicos ficam de fora — não servem para dor de cabeça/febre);
//   • combinados (2+ substâncias activas) e descongestionantes nasais ficam em
//     A_REVER, porque o nome não garante a substância.
//
// Substâncias cobertas pelo motor: paracetamol, ibuprofeno, aas, pseudoefedrina,
// xilometazolina, dextrometorfano, acetilcisteina, loratadina, antiacido,
// famotidina, omeprazol.

/** @type {Record<string, string>} CNP (string) → dci */
export const MAPA_CNP_DCI = {
  // --- paracetamol ---
  '2707297': 'paracetamol', // Paracetamol Generis MG 500 mg comp
  '3854585': 'paracetamol', // ben-u-ron 500 mg comp
  '5397435': 'paracetamol', // ben-u-ron 500 mg caps
  '5552252': 'paracetamol', // Paracetamol Generis 40 mg/ml xar (pediátrico)
  '5664032': 'paracetamol', // Ben-u-ron direct 500 mg granulado
  '5689823': 'paracetamol', // Paracetamol ben-u-ron 40 mg/mL xar

  // --- ibuprofeno (oral) ---
  '5087218': 'ibuprofeno', // Ibuprofeno Bluepharma MG 400 mg comp
  '4283883': 'ibuprofeno', // Nurofen 400 mg comp
  '5437355': 'ibuprofeno', // Nurofen Xpress 400 mg caps
  '5731773': 'ibuprofeno', // Nurofen Migrxpress 400 mg comp
  '5550587': 'ibuprofeno', // Brufen 400 mg comp
  '5082680': 'ibuprofeno', // Brufen 200 mg granulado eferv
  '5746342': 'ibuprofeno', // Brufen sem açúcar 20 mg/ml susp oral
  '5824206': 'ibuprofeno', // Brufen Liq 200 mg saqueta
  '5824214': 'ibuprofeno', // Brufen Liq 400 mg saqueta
  '5684873': 'ibuprofeno', // Ibuprofeno Farmoz 20 mg/ml susp oral
  '5450838': 'ibuprofeno', // Ib-u-ron 400 mg comp
  '5558440': 'ibuprofeno', // Trifene 400 mg comp
  '5647177': 'ibuprofeno', // Spidifen EF 400 mg comp
  '5912787': 'ibuprofeno', // Spidifen EF 400 mg granulado

  // --- ácido acetilsalicílico (oral) ---
  '5273289': 'aas', // Aspirina Direkt 500 mg granulado
  '5588207': 'aas', // Aspirina Xpress 500 mg comp
  '5817960': 'aas', // Aspirina Xpress 1000 mg comp
  '3638681': 'aas', // Migraspirina 500 mg eferv
  '8520825': 'aas', // Aspegic 1000 pó sol oral

  // --- acetilcisteína (mucolítico) ---
  '2195782': 'acetilcisteina', // Fluimucil 600 mg eferv
  '3311180': 'acetilcisteina', // Fluimucil 2% 20 mg/ml sol oral
  '5269287': 'acetilcisteina', // Fluimucil 4% 40 mg/ml sol oral
  '5723135': 'acetilcisteina', // Fluprox MG 600 mg eferv
  '5878772': 'acetilcisteina', // UL-500 500 mg pó susp oral
  '8912410': 'acetilcisteina', // UL-250 250 mg caps

  // --- dextrometorfano (antitússico, tosse seca) ---
  '5702907': 'dextrometorfano', // Benflux Tosse Seca 2 mg/mL sol oral

  // --- antiácidos (azia) ---
  '8089920': 'antiacido', // Kompensan 340 mg x20 mast
  '8089938': 'antiacido', // Kompensan 340 mg x60 mast
  '5490578': 'antiacido', // Maalox Plus comp mast
  '5490925': 'antiacido', // Gaviscon Duefet susp oral saq
  '5630355': 'antiacido', // Gaviscon Morango comp mast
  '8259606': 'antiacido', // Rennie Digestif comp mast
  '8635318': 'antiacido', // Riopan gel oral saq

  // --- loratadina (anti-histamínico; ainda sem sintoma associado no motor) ---
  '5816400': 'loratadina', // Claritine 10 mg x10 comp
  '9702407': 'loratadina', // Claritine 10 mg x20 comp
};

/**
 * Produtos NÃO mapeados de propósito — precisam de confirmação do farmacêutico.
 * `motivo` explica porquê.
 */
export const A_REVER = [
  { cnp: '5631767', nome: 'Ben-u-ron Caff 500/65 mg', motivo: 'combinado paracetamol + cafeína' },
  { cnp: '5696737', nome: 'Panadol Extra 500+65 mg', motivo: 'combinado paracetamol + cafeína' },
  { cnp: '9754119', nome: 'Sinutab II 500/30 mg', motivo: 'combinado paracetamol + pseudoefedrina' },
  { cnp: '5054168', nome: 'Cêgripe', motivo: 'combinado gripe (várias substâncias)' },
  { cnp: '5472949', nome: 'Griponal', motivo: 'combinado gripe (clorfenamina + paracetamol)' },
  { cnp: '5771225', nome: 'Grippostad', motivo: 'combinado gripe' },
  { cnp: '5894605', nome: 'Ben-u-gripe', motivo: 'combinado gripe' },
  { cnp: '8665604', nome: 'Ilvico', motivo: 'combinado gripe (várias substâncias)' },
  { cnp: '5818711', nome: 'Antigrippine Trieffect Tosse', motivo: 'combinado gripe' },
  { cnp: '8559013', nome: 'Actifed 60/2,5 mg', motivo: 'combinado triprolidina + pseudoefedrina' },
  { cnp: '4031381', nome: 'Momendol 200 mg', motivo: 'é NAPROXENO (AINE não modelado), não ibuprofeno' },
  { cnp: '5572458', nome: 'Ilgesin 200 mg', motivo: 'confirmar substância (ibuprofeno?)' },
  { cnp: '5588025', nome: 'Milid 300 mg', motivo: 'é carbocisteína, não acetilcisteína' },
  // Descongestionantes nasais — substância varia (xilometazolina/oximetazolina/
  // nafazolina/fenilefrina/tramazolina); confirmar antes de mapear a xilometazolina:
  { cnp: '5851548', nome: 'Vibrocil Actilong 1 mg/ml', motivo: 'confirmar xilometazolina' },
  { cnp: '3474285', nome: 'Vibrocil Actilong Mentol', motivo: 'confirmar xilometazolina (+ mentol)' },
  { cnp: '3632783', nome: 'Vicks Sinex Aloé', motivo: 'oximetazolina, não xilometazolina' },
  { cnp: '8116707', nome: 'Rhinospray', motivo: 'tramazolina, não xilometazolina' },
  { cnp: '9908731', nome: 'Neo-Sinefrina', motivo: 'fenilefrina, não xilometazolina' },
];

/** Devolve a dci proposta para um CNP, ou null. */
export function dciDeCnp(cnp) {
  return MAPA_CNP_DCI[String(cnp).trim()] ?? null;
}

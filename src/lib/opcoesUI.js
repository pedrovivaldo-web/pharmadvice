// Opções para a UI — dá ao frontend (Lovable) as listas para construir os ecrãs,
// com os MESMOS ids que o motor usa nas regras. Assim o que o utilizador escolhe
// no ecrã liga diretamente às contraindicações/interações, sem "traduções"
// frágeis pelo meio.

import { SINTOMAS } from '../data/sintomas.js';

/** Lista de sintomas para o seletor: [{ id, nome }]. */
export function sintomasParaUI() {
  return Object.values(SINTOMAS).map((s) => ({ id: s.id, nome: s.nome }));
}

/**
 * Perguntas de triagem a mostrar ao doente para um sintoma.
 * Só devolve os sinais de alarme que TÊM pergunta (os que são avaliados
 * automaticamente por idade/duração não geram pergunta).
 * @returns {Array<{ id, pergunta, descricao }>}
 */
export function perguntasTriagem(sintomaId) {
  const s = SINTOMAS[sintomaId];
  if (!s) return [];
  return s.sinaisAlarme
    .filter((a) => a.pergunta)
    .map((a) => ({ id: a.id, pergunta: a.pergunta, descricao: a.descricao }));
}

// Catálogos do perfil do doente — labels legíveis + os ids que o motor conhece.
// (Manter alinhados com as regras em substancias.js.)

export const PATOLOGIAS = [
  { id: 'hipertensao', label: 'Hipertensão arterial' },
  { id: 'doenca-cardiaca', label: 'Doença cardíaca' },
  { id: 'ulcera-peptica', label: 'Úlcera péptica / hemorragia digestiva' },
  { id: 'doenca-renal', label: 'Doença renal' },
  { id: 'doenca-hepatica', label: 'Doença hepática' },
  { id: 'asma', label: 'Asma' },
  { id: 'hipertiroidismo', label: 'Hipertiroidismo' },
  { id: 'glaucoma', label: 'Glaucoma' },
  { id: 'hiperplasia-prostatica', label: 'Hiperplasia da próstata' },
  { id: 'diabetes', label: 'Diabetes' },
];

export const MEDICACAO_COMUM = [
  { id: 'varfarina', label: 'Varfarina (anticoagulante)' },
  { id: 'lisinopril', label: 'IECA (ex.: lisinopril)' },
  { id: 'metotrexato', label: 'Metotrexato' },
  { id: 'imao', label: 'IMAO (antidepressivo)' },
  { id: 'ssri', label: 'ISRS (antidepressivo)' },
  { id: 'levotiroxina', label: 'Levotiroxina' },
  { id: 'clopidogrel', label: 'Clopidogrel' },
];

export const ALERGIAS = [
  { id: 'aine', label: 'AINEs (ibuprofeno, AAS, ...)' },
  { id: 'paracetamol', label: 'Paracetamol' },
];

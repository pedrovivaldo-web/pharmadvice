// Triagem — a PRIMEIRA porta. Avalia os sinais de alarme do sintoma, agora em
// DOIS níveis (validação do farmacêutico):
//   • 'referir' (padrão) → segurança dura: referenciar ao médico, NÃO recomendar.
//   • 'vigiar'           → recomendar na mesma, mas com aviso de vigilância
//                          ("aconselhar e, se não melhorar/se X, ir ao médico").
// A segurança do doente vem sempre antes da recomendação comercial.

import { getSintoma } from '../data/sintomas.js';

/**
 * @returns {{
 *   referenciar: boolean,
 *   sinais: Array<{id,descricao}>,       // nível 'referir' presentes
 *   vigilancia: Array<{id,descricao}>,   // nível 'vigiar' presentes
 *   sintomaDesconhecido?: boolean
 * }}
 */
export function triar(consulta) {
  const sintoma = getSintoma(consulta?.sintoma);
  if (!sintoma) {
    // Sintoma fora do âmbito da app → por prudência, referenciar.
    return { referenciar: true, sinais: [], vigilancia: [], sintomaDesconhecido: true };
  }

  const presentes = sintoma.sinaisAlarme.filter((s) => {
    try {
      return s.avaliar(consulta) === true;
    } catch {
      return false;
    }
  });

  const map = (arr) => arr.map((s) => ({ id: s.id, descricao: s.descricao }));
  const hard = presentes.filter((s) => s.nivel !== 'vigiar');
  const soft = presentes.filter((s) => s.nivel === 'vigiar');

  return { referenciar: hard.length > 0, sinais: map(hard), vigilancia: map(soft) };
}

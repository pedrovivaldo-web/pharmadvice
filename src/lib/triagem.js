// Triagem — a PRIMEIRA porta. Avalia os sinais de alarme do sintoma. Se algum
// estiver presente, o resultado é "referenciar ao médico" e NÃO se recomenda
// qualquer MNSRM. A segurança do doente vem sempre antes da recomendação
// comercial.

import { getSintoma } from '../data/sintomas.js';

/**
 * @param {object} consulta  { sintoma, duracaoDias, doente, respostas }
 * @returns {{ referenciar: boolean, sinais: Array<{id,descricao}>, sintomaDesconhecido?: boolean }}
 */
export function triar(consulta) {
  const sintoma = getSintoma(consulta?.sintoma);
  if (!sintoma) {
    // Sintoma fora do âmbito da app → por prudência, referenciar.
    return { referenciar: true, sinais: [], sintomaDesconhecido: true };
  }

  const sinais = sintoma.sinaisAlarme
    .filter((s) => {
      try {
        return s.avaliar(consulta) === true;
      } catch {
        return false;
      }
    })
    .map((s) => ({ id: s.id, descricao: s.descricao }));

  return { referenciar: sinais.length > 0, sinais };
}

// Orquestrador — o ponto de entrada do motor. Junta as três fases pela ordem
// que garante segurança primeiro, comércio depois:
//
//   1. triar()            → sinais de alarme? então referenciar, e PARA.
//   2. filtrarCatalogo()  → gate clínico (contraindicações/interações).
//   3. ordenarComercial() → ranking por margem/stock entre os que passaram.
//
// Devolve uma estrutura pensada para ser defensável: além da recomendação,
// explica o que foi excluído e porquê.

import { getSintoma } from '../data/sintomas.js';
import { getSubstancia } from '../data/substancias.js';
import { triar } from './triagem.js';
import { filtrarCatalogo } from './gateClinico.js';
import { ordenarComercial } from './rankingComercial.js';

/**
 * @param {object} consulta   { sintoma, duracaoDias, intensidade, doente, respostas }
 * @param {Array}  catalogo   produtos com stock/margem (ex.: import CSV)
 * @param {object} [config]   { pesos } para o ranking comercial
 * @returns {object} resultado do aconselhamento
 */
export function aconselhar(consulta, catalogo, config = {}) {
  // Fase 1 — triagem
  const triagem = triar(consulta);
  if (triagem.referenciar) {
    return {
      referenciar: true,
      motivo: triagem.sintomaDesconhecido ? 'sintoma-fora-de-ambito' : 'sinais-de-alarme',
      sinaisAlarme: triagem.sinais,
      recomendacoes: [],
      semStock: [],
      excluidos: [],
      sintoma: consulta?.sintoma ?? null,
    };
  }

  const sintoma = getSintoma(consulta.sintoma);
  const indicadas = sintoma.substanciasIndicadas;

  // Fase 2 — gate clínico
  const { aptos, excluidos } = filtrarCatalogo(catalogo, consulta, indicadas);

  // Fase 3 — ranking comercial
  const { ranking, semStock } = ordenarComercial(aptos, config);

  return {
    referenciar: false,
    motivo: null,
    sinaisAlarme: [],
    sintoma: sintoma.id,
    // Recomendações ordenadas: 1.ª é a sugestão principal.
    recomendacoes: ranking.map((r, idx) => ({
      ordem: idx + 1,
      produto: r.produto,
      score: Number(r.score.toFixed(4)),
      componentes: r.componentes,
      avisos: r.avisos,
      posologia: getSubstancia(r.produto.dci)?.posologiaAdulto ?? null,
    })),
    // Adequados clinicamente mas sem stock → candidatos a encomenda.
    semStock: semStock.map((s) => ({ produto: s.produto, avisos: s.avisos })),
    // Excluídos pelo gate clínico, com motivo (transparência/defensabilidade).
    excluidos: excluidos.map((e) => ({ produto: e.produto, motivo: e.motivo, avisos: e.avisos })),
  };
}

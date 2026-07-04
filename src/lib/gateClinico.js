// Gate clínico — a SEGUNDA porta. Para um produto (ligado à sua DCI), avalia:
//   1. contraindicações absolutas  → exclui o produto
//   2. contraindicações relativas   → mantém, mas com avisos
//   3. interações com a medicação atual do doente → avisos (graves podem excluir)
//
// Só os produtos que passam esta porta chegam ao ranking comercial.

import { getSubstancia } from '../data/substancias.js';

/**
 * Avalia um único produto contra o perfil do doente.
 * @returns {{
 *   apto: boolean,
 *   motivoExclusao: string|null,
 *   avisos: Array<{tipo:'contraindicacao'|'interacao', gravidade:string, descricao:string}>
 * }}
 */
export function avaliarProduto(produto, consulta) {
  const doente = consulta?.doente ?? {};
  const substancia = getSubstancia(produto.dci);

  if (!substancia) {
    // Sem dados clínicos da substância não conseguimos garantir segurança.
    return { apto: false, motivoExclusao: 'substancia-desconhecida', avisos: [] };
  }

  const avisos = [];
  let motivoExclusao = null;

  // 1 + 2. Contraindicações
  for (const c of substancia.contraindicacoes ?? []) {
    let presente = false;
    try {
      presente = c.avaliar(doente, consulta) === true;
    } catch {
      presente = false;
    }
    if (!presente) continue;

    if (c.gravidade === 'absoluta') {
      motivoExclusao = motivoExclusao ?? `contraindicacao:${c.id}`;
    }
    avisos.push({ tipo: 'contraindicacao', gravidade: c.gravidade, descricao: c.descricao });
  }

  // 3. Interações com a medicação atual
  const medicacao = doente.medicacao ?? [];
  for (const i of substancia.interacoes ?? []) {
    if (!medicacao.includes(i.comDci)) continue;
    avisos.push({ tipo: 'interacao', gravidade: i.gravidade, descricao: i.descricao });
    if (i.gravidade === 'grave') {
      motivoExclusao = motivoExclusao ?? `interacao:${i.comDci}`;
    }
  }

  return { apto: motivoExclusao === null, motivoExclusao, avisos };
}

/**
 * Filtra um catálogo, devolvendo os produtos aptos e os excluídos (com motivo),
 * já restrito às substâncias indicadas para o sintoma da consulta.
 *
 * @param {Array} produtos       catálogo (com stock/margem)
 * @param {object} consulta
 * @param {string[]} indicadas   DCIs clinicamente indicadas para o sintoma
 */
export function filtrarCatalogo(produtos, consulta, indicadas) {
  const aptos = [];
  const excluidos = [];

  for (const produto of produtos) {
    // fora da indicação clínica do sintoma → nem entra
    if (indicadas && !indicadas.includes(produto.dci)) continue;

    const r = avaliarProduto(produto, consulta);
    if (r.apto) {
      aptos.push({ produto, avisos: r.avisos });
    } else {
      excluidos.push({ produto, motivo: r.motivoExclusao, avisos: r.avisos });
    }
  }

  return { aptos, excluidos };
}

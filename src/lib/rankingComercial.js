// Ranking comercial — a TERCEIRA fase. Corre APENAS sobre os produtos que já
// passaram a triagem e o gate clínico. Ordena as opções clinicamente adequadas
// por interesse comercial da farmácia, segundo os critérios pedidos:
//   • rentabilidade (margem)  • stock
// com rotação e validade como desempates opcionais.
//
// Regra de ouro: isto NUNCA decide entre "seguro" e "inseguro" — a esse ponto
// já todos os candidatos são seguros. Só decide entre alternativas equivalentes.

export const PESOS_PADRAO = Object.freeze({
  margem: 0.45, // rentabilidade — critério principal
  stock: 0.25, // escoar o que há em stock
  rotacao: 0.15, // preferir sellers comprovados
  validade: 0.15, // dar prioridade a lotes perto da validade
});

// Normaliza um array de números para 0..1 (min-max). Se forem todos iguais,
// devolve 0.5 para todos (componente neutra, não enviesa o ranking).
function normalizar(valores) {
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  if (max === min) return valores.map(() => 0.5);
  return valores.map((v) => (v - min) / (max - min));
}

/**
 * @param {Array<{produto:object, avisos:Array}>} aptos  saída do gate clínico
 * @param {object} [config]  { pesos }
 * @returns {{
 *   ranking: Array<{produto, avisos, score, componentes}>,
 *   semStock: Array<{produto, avisos}>
 * }}
 */
export function ordenarComercial(aptos, config = {}) {
  const pesos = { ...PESOS_PADRAO, ...(config.pesos ?? {}) };

  // Produtos sem stock não são recomendáveis no momento (mas são adequados —
  // o orquestrador pode sugerir encomenda).
  const comStock = aptos.filter((a) => (a.produto.stock ?? 0) > 0);
  const semStock = aptos.filter((a) => (a.produto.stock ?? 0) <= 0);

  if (comStock.length === 0) return { ranking: [], semStock };

  const margens = normalizar(comStock.map((a) => a.produto.margemPct ?? 0));
  const stocks = normalizar(comStock.map((a) => a.produto.stock ?? 0));
  const rotacoes = normalizar(comStock.map((a) => a.produto.rotacaoMensal ?? 0));
  // Validade: menos meses até expirar → prioridade maior. Invertemos.
  const validades = normalizar(comStock.map((a) => -(a.produto.validadeMeses ?? 0)));

  const ranking = comStock
    .map((a, i) => {
      const componentes = {
        margem: margens[i],
        stock: stocks[i],
        rotacao: rotacoes[i],
        validade: validades[i],
      };
      const score =
        componentes.margem * pesos.margem +
        componentes.stock * pesos.stock +
        componentes.rotacao * pesos.rotacao +
        componentes.validade * pesos.validade;
      return { ...a, componentes, score };
    })
    .sort((x, y) => y.score - x.score);

  return { ranking, semStock };
}

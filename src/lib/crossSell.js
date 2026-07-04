// Cross-selling (co-recomendação) — sugere um CONJUNTO de produtos para usar em
// simultâneo, um por "papel" clínico do sintoma (ex.: constipação →
// descongestionante + analgésico). Reutiliza o gate clínico e o ranking
// comercial, por isso cada produto do conjunto já passou a segurança individual.
//
// Guarda de combinação (a parte crítica): produtos sugeridos em conjunto NÃO
// podem partilhar a mesma substância (risco de dose dupla) nem ser ambos AINEs.
// Sem esta guarda, o cross-selling seria perigoso.

import { getSintoma } from '../data/sintomas.js';
import { getSubstancia } from '../data/substancias.js';
import { filtrarCatalogo } from './gateClinico.js';
import { ordenarComercial } from './rankingComercial.js';

/**
 * Verifica se `produto` pode juntar-se aos `escolhidos` sem combinação perigosa.
 * @returns {string|null} motivo do conflito, ou null se for seguro combinar.
 */
export function conflitoCombinacao(produto, escolhidos) {
  const sub = getSubstancia(produto.dci);
  for (const e of escolhidos) {
    if (e.produto.dci === produto.dci) return 'mesma-substancia';
    const subE = getSubstancia(e.produto.dci);
    if (sub?.classe === 'aine' && subE?.classe === 'aine') return 'dois-aine';
  }
  return null;
}

/**
 * Constrói o conjunto de co-recomendação para a consulta.
 * Assume que a triagem já foi feita (não referenciar) — normalmente é chamado
 * a partir de aconselhar().
 *
 * @returns {{
 *   conjunto: Array<{papel, papelNome, principal, produto, avisos, posologia, alternativas}>,
 *   conflitos: Array<{papel, produto, motivo}>
 * }}
 */
export function recomendarConjunto(consulta, catalogo, config = {}) {
  const sintoma = getSintoma(consulta?.sintoma);
  if (!sintoma) return { conjunto: [], conflitos: [] };

  // Se o sintoma não define papéis, trata tudo como um único papel principal.
  const papeis = sintoma.papeis ?? [
    { id: 'principal', nome: 'Tratamento', dcis: sintoma.substanciasIndicadas, principal: true },
  ];

  const conjunto = [];
  const conflitos = [];
  const escolhidos = []; // itens já colocados no conjunto (para a guarda)

  for (const papel of papeis) {
    const { aptos } = filtrarCatalogo(catalogo, consulta, papel.dcis);
    const { ranking } = ordenarComercial(aptos, config);

    // O 1.º do ranking que não conflitue com o que já está no conjunto.
    let escolhido = null;
    for (const r of ranking) {
      const motivo = conflitoCombinacao(r.produto, escolhidos);
      if (motivo) {
        conflitos.push({ papel: papel.id, produto: r.produto, motivo });
        continue;
      }
      escolhido = r;
      break;
    }
    if (!escolhido) continue;

    escolhidos.push(escolhido);
    conjunto.push({
      papel: papel.id,
      papelNome: papel.nome,
      principal: papel.principal === true,
      produto: escolhido.produto,
      avisos: escolhido.avisos,
      posologia: getSubstancia(escolhido.produto.dci)?.posologiaAdulto ?? null,
      // Alternativas para trocar dentro do mesmo papel (não entram no conjunto).
      alternativas: ranking
        .filter((r) => r.produto.id !== escolhido.produto.id)
        .slice(0, 2)
        .map((r) => r.produto),
    });
  }

  return { conjunto, conflitos };
}

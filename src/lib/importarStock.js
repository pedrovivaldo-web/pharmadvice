// Importador de stock — lê o CSV exportado da farmácia (Sifarma) e normaliza-o
// para o formato que o motor usa. Feito para o export "Inventário com Margem de
// MNSRM", mas robusto a colunas extra (substância/existências) se aparecerem.
//
// Formato de referência (cabeçalhos):
//   Código, Produto, Margem (€), % Margem, PVP Unitário, Margem Unitária
// Opcionais reconhecidos se existirem: "Substância"/"DCI", "Existências"/"Stock".
//
// Notas do formato português: número com vírgula decimal, símbolos € e %,
// separador de milhares por espaço (ex.: "4 582,40€"). A última linha costuma
// ser um total (sem código) e é ignorada.

/** Converte "8,25 €", "31%", "4 582,40€", "-1,37€" → number (ou null). */
export function parseNumeroPT(valor) {
  if (valor == null) return null;
  let s = String(valor).trim();
  // remove moeda, percentagem e espaços (incl. NBSP / thin space)
  s = s.replace(/[€%]/g, '').replace(/[\s  ]/g, '');
  // remove separador de milhares '.' e converte vírgula decimal em ponto
  s = s.replace(/\./g, '').replace(',', '.');
  if (s === '' || s === '-') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Tokeniza uma linha CSV respeitando aspas (nomes têm vírgulas). */
export function parseLinhaCSV(linha) {
  const campos = [];
  let atual = '';
  let dentroAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (dentroAspas) {
      if (c === '"') {
        if (linha[i + 1] === '"') { atual += '"'; i++; } // aspas escapadas
        else dentroAspas = false;
      } else atual += c;
    } else if (c === '"') {
      dentroAspas = true;
    } else if (c === ',') {
      campos.push(atual);
      atual = '';
    } else atual += c;
  }
  campos.push(atual);
  return campos;
}

function acharColuna(cabecalho, regex) {
  return cabecalho.findIndex((h) => regex.test(h));
}

/**
 * @param {string} texto  conteúdo do CSV
 * @returns {{ produtos: Array, duplicados: number, ignorados: number }}
 *   produto: { cnp, nome, pvp, margemUnit, margemPct, custo, stockAprox, dci, stock }
 */
export function parseInventarioCSV(texto) {
  const linhas = String(texto).split(/\r?\n/).filter((l) => l.trim() !== '');
  if (linhas.length === 0) return { produtos: [], duplicados: 0, ignorados: 0 };

  const cab = parseLinhaCSV(linhas[0]).map((h) => h.trim());
  const idx = {
    cnp: acharColuna(cab, /c[oó]digo|cnp/i),
    nome: acharColuna(cab, /produto|nome|designa/i),
    margemPct: acharColuna(cab, /%\s*margem|margem\s*%/i),
    pvp: acharColuna(cab, /pvp/i),
    margemUnit: acharColuna(cab, /margem\s*unit/i),
    margemEur: acharColuna(cab, /^\s*margem\s*\(/i),
    dci: acharColuna(cab, /subst[aâ]ncia|dci|princ[ií]pio/i),
    stock: acharColuna(cab, /exist[eê]ncias|stock|quantidade/i),
  };

  const porCnp = new Map();
  let duplicados = 0;
  let ignorados = 0;

  for (let i = 1; i < linhas.length; i++) {
    const c = parseLinhaCSV(linhas[i]);
    const cnp = (c[idx.cnp] ?? '').trim();
    if (!cnp) { ignorados++; continue; } // linha de total / vazia

    const pvp = parseNumeroPT(c[idx.pvp]);
    const margemUnit = parseNumeroPT(c[idx.margemUnit]);
    const margemPct = parseNumeroPT(c[idx.margemPct]);
    const margemEur = idx.margemEur >= 0 ? parseNumeroPT(c[idx.margemEur]) : null;
    const custo = pvp != null && margemUnit != null ? Number((pvp - margemUnit).toFixed(2)) : null;
    // Estimativa grosseira de unidades (só se não houver coluna de existências).
    const stockAprox = margemEur != null && margemUnit ? Math.round(margemEur / margemUnit) : null;
    const stock = idx.stock >= 0 ? parseNumeroPT(c[idx.stock]) : null;

    const produto = {
      cnp,
      nome: (c[idx.nome] ?? '').trim(),
      pvp,
      margemUnit,
      margemPct,
      custo,
      stockAprox,
      dci: idx.dci >= 0 ? (c[idx.dci] ?? '').trim() || null : null,
      stock, // null se o export não trouxer existências
    };

    if (porCnp.has(cnp)) duplicados++;
    porCnp.set(cnp, produto); // último vence (semântica de upsert)
  }

  return { produtos: [...porCnp.values()], duplicados, ignorados };
}

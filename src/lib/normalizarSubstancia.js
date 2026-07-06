// Normalizador de substância — converte o texto livre da coluna "Princípio
// Activo" do export para o id de substância (DCI) que o motor conhece.
// Usa também o nome do produto para distinguir a forma (oral / tópico / nasal /
// garganta / vaginal), porque a mesma substância muda de papel conforme a forma
// (ex.: ibuprofeno comprimido ≠ ibuprofeno gel).
//
// Devolve { dci, nota } — dci = id do motor ou null (não coberto / combinado).
// Só mapeia para substâncias que o motor JÁ modela (18 sintomas). Combinados
// ficam por mapear, exceto alguns whitelisted (pastilha antisséptica, SRO).

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function detetarForma(nomeProduto) {
  const n = norm(nomeProduto);
  if (/vagin|ovulo|\bvag\b/.test(n)) return 'vaginal';
  if (/colirio|sol col|oftal/.test(n)) return 'ocular';
  if (/nasal|inal neb/.test(n)) return 'nasal';
  if (/gel|creme|\bcr\b|\bcrm\b|pomada|\bpda\b|pasta|cutan|emulgel|penso|emplast|unguent|loca|verniz|champ/.test(n)) return 'topico';
  if (/\bpast\b|\bpst\b|pastilha|chupar|colutorio|gargar|bucal|comp chupar/.test(n)) return 'garganta';
  return 'oral';
}

// Regras de substância única. Cada uma: teste no nome normalizado da substância
// → dci (string) ou função (forma) => dci|null.
const REGRAS = [
  [/paracetamol/, 'paracetamol'],
  [/acetilsalicil/, 'aas'],
  [/\bibuprofeno\b|dexibuprofeno/, (f) => (f === 'topico' ? 'ibuprofeno-topico' : 'ibuprofeno')],
  [/pseudoefedrina/, 'pseudoefedrina'],
  [/xilometazolina/, 'xilometazolina'],
  [/dextrometorfano/, 'dextrometorfano'],
  [/acetilcisteina/, 'acetilcisteina'],
  [/loratadina/, 'loratadina'],
  [/cetirizina/, 'cetirizina'],
  [/fexofenadina/, 'fexofenadina'],
  [/benzidamina/, 'benzidamina'],
  [/flurbiprofeno/, (f) => (f === 'topico' ? null : 'flurbiprofeno')],
  [/diclofenac/, (f) => (f === 'topico' ? 'diclofenac-topico' : null)],
  [/macrogol/, 'macrogol'],
  [/lactulose/, 'lactulose'],
  [/bisacodilo/, 'bisacodilo'],
  [/loperamida/, 'loperamida'],
  [/dimenidrinato/, 'dimenidrinato'],
  [/aciclovir/, 'aciclovir-topico'],
  [/clotrimazol/, (f) => (f === 'vaginal' ? 'clotrimazol-vaginal' : 'clotrimazol-topico')],
  [/econazol/, 'econazol-topico'],
  [/tioconazol/, 'tioconazol-topico'],
  [/terbinafina/, 'terbinafina-topico'],
  [/hidrocortisona/, 'hidrocortisona-topico'],
  [/dimetindeno/, 'dimetindeno-topico'],
  [/famotidina/, 'famotidina'],
  [/\bomeprazol\b/, 'omeprazol'],
];

export function substanciaParaDci(principioActivo, nomeProduto = '') {
  const s = norm(principioActivo);
  if (!s) return { dci: null, nota: 'sem-substancia' };
  const forma = detetarForma(nomeProduto);
  const combo = s.includes('+');

  // Combinados whitelisted (uma substância "efetiva" para o motor)
  if (/diclorobenzilico/.test(s) && /amilmetacresol/.test(s)) return { dci: 'pastilha-garganta', nota: null };
  if (/reidratacao/.test(s)) return { dci: 'reidratacao-oral', nota: null };
  // Antihemorroidários vêm em associação (anestésico + protetor); efeito único.
  if (/tribenosido|policresuleno/.test(s)) return { dci: 'antihemorroidario-topico', nota: null };
  // Antiácidos são frequentemente associações, mas o efeito é único (neutralizar
  // o ácido) → mapear mesmo sendo combinado.
  if (/algeldrato|magaldrato|hidrotalcite|almagato|di-hidroxialumin|hidroxido de alumin|hidroxido de magnes|carbonato de calcio|alginato/.test(s)) return { dci: 'antiacido', nota: null };

  // Combinados não whitelisted → não mapear (segurança: várias substâncias)
  if (combo) return { dci: null, nota: 'combinado' };

  for (const [teste, alvo] of REGRAS) {
    if (!teste.test(s)) continue;
    const dci = typeof alvo === 'function' ? alvo(forma) : alvo;
    if (dci) return { dci, nota: null };
    return { dci: null, nota: `forma-nao-modelada:${forma}` };
  }
  return { dci: null, nota: 'fora-de-ambito' };
}

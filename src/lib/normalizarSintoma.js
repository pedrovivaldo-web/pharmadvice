// Normalizador de sintomas — converte o texto livre da coluna "Sintoma" da
// tabela PSBE para um id de sintoma canónico. Agrupa sinónimos (ex.: "Insónia"
// e "Dificuldade em adormecer" → 'insonia').
//
// `novo: false` = já é um dos sintomas do motor (o PSBE complementa-o).
// `novo: true`  = área nova (candidata a novo sintoma), a validar pelo Pedro.
//
// ⚠️ PROPOSTA de agrupamento — o Pedro valida antes de qualquer uso.

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Ordem IMPORTA: regras específicas antes das genéricas.
// [id, nome, novo, regex]
const CANONICOS = [
  // --- veterinário / fora de âmbito humano (filtrar cedo) ---
  ['veterinario', 'Veterinário (fora de âmbito)', true, /\bgato\b|\bcao\b|\bcaes\b|pulgas e carraca|articulacoes \(cao/],

  // --- pele / dermocosmética ---
  ['pele-atopica', 'Pele atópica / eczema', true, /atopic|eczema/],
  ['rosacea', 'Rosácea / vermelhidão facial', true, /rosacea|vermelhidao facial/],
  ['acne', 'Acne / pele oleosa', true, /\bacne\b|borbulha|pele oleosa/],
  ['labios-gretados', 'Lábios gretados / secos', true, /labios (gretados|secos)|protecao solar labial|mamilos gretados/],
  ['assaduras-fraldas', 'Assaduras / eritema das fraldas', true, /assadura|eritema das fraldas/],
  ['solar', 'Pós-sol / pele fotoexposta', true, /apos sol|fotoexposta|avermelhada pelo sol|proteccao solar de cicatriz/],
  ['estrias', 'Estrias', true, /estria/],
  ['manchas', 'Manchas / hiperpigmentação / queratoses', true, /manchas cutanea|hiperpigment|queratos/],
  ['pes-calosidades', 'Pés (secos, calos, gretas, suor)', true, /\bpes\b (secos|cansados)|gretas nos calcanhar|\bcalos\b|calosidade|suor dos pes|odor dos pes|pes secos/],
  ['hiperidrose', 'Suor excessivo (hiperidrose)', true, /\bsuor\b|transpirac|hiperidrose/],
  ['cicatrizacao', 'Cicatrização / feridas superficiais', true, /cicatriz|feridas superficia|escoriac|\bferida(s)?\b(?! na boca)|pele exsudativa/],
  ['desinfecao', 'Desinfeção / lavagem de feridas', true, /desinfec|lavagem de feridas|lavagem/],
  ['irritacao-cutanea', 'Irritação / vermelhidão cutânea', true, /irritac(ao|oes) cutanea|pele irritada|pele avermelhada|vermelhidao|pele sensivel/],
  ['pele-seca', 'Pele seca', true, /pele (muito )?seca|secura cutanea|pele aspera|pele seca das maos/],
  ['tatuagem', 'Cuidado de tatuagens', true, /tatuag/],
  ['molusco', 'Molusco contagioso (referir)', true, /molusco/],

  // --- olhos ---
  ['olho-seco', 'Olho seco / irritação ocular', true, /olho seco|olhos cansados|olhos vermelhos|irritacao ocular|saude ocular|higiene.*ocular/],
  ['visao', 'Saúde da visão (DMI, moscas volantes)', true, /moscas volantes|degeneres|macular|\bdmi\b/],

  // --- boca / dentes ---
  ['gengivas', 'Gengivas (gengivite, sangramento)', true, /gengiv|sangramento gengival/],
  ['protese-dentaria', 'Prótese dentária', true, /protese dentaria/],
  ['higiene-oral', 'Higiene oral / cáries / boca seca', true, /higiene oral|prevencao de caries|boca seca|xerostomia|sensibilidade dentaria|erupcao dentaria/],
  ['aftas', 'Aftas / feridas na boca', false, /\bafta|feridas na boca|inflamacao oral|irritacao por aparelho|pos-cirurgia oral/],

  // --- nariz / vias respiratórias / garganta ---
  ['congestao-nasal', 'Congestão nasal / higiene nasal', false, /congestao nasal|nariz entupido|constipacao|higiene nasal|nariz (irritado|seco)|secura nasal/],
  ['epistaxe', 'Epistaxe (sangramento nasal)', true, /epistaxe|sangramento nasal/],
  ['dor-garganta', 'Dor de garganta / rouquidão', false, /dor de garganta|irritacao da garganta|rouquidao/],
  ['tosse-produtiva', 'Tosse produtiva', false, /tosse.*(exp|secre|produt)/],
  ['tosse-seca', 'Tosse (seca / geral)', false, /\btosse\b/],

  // --- digestivo ---
  ['pirose', 'Azia / refluxo', false, /\bazia\b|refluxo|esofagite|pirose|acidez/],
  ['gases-digestao', 'Gases / má digestão / cólicas', true, /\bgases\b|colica|inchaco abdominal|intestino irritavel|enfartamento|ma digestao|digestao dificil|regurgitac/],
  ['obstipacao', 'Obstipação', false, /obstipa|prisao de ventre|transito intestinal/],
  ['diarreia', 'Diarreia / desidratação', false, /diarreia|desidratac/],
  ['flora-intestinal', 'Flora intestinal / pós-antibiótico', true, /flora intestinal|apos antibiotico/],
  ['nauseas', 'Náuseas / vómitos / enjoo', false, /nausea|vomito|enjoo/],
  ['disfagia', 'Dificuldade em engolir (referir)', true, /disfagia|dificuldade em engolir/],

  // --- músculo-esquelético ---
  ['dores-musculares', 'Dores musculares / articulares / traumatismos', false, /dor muscular|caibra|dor articular|entorse|contus|traumatismo|osteoartrose|dor no punho|lesao articular|hematoma|nodoas negras|articula|\bdor\b/],
  ['insuficiencia-venosa', 'Insuficiência venosa / pernas cansadas', true, /pernas cansadas|insuficiencia venosa|retencao de liquidos|\bedema\b/],

  // --- pele infeciosa / anexos ---
  ['herpes-labial', 'Herpes labial', false, /herpes/],
  ['micose-cutanea', 'Micose (pele / unhas)', false, /micose|unhas (danificad|fragei)/],
  ['picadas-prurido', 'Picadas / comichão / prurido', false, /picada|prurido|comichao|urticaria/],
  ['piolhos', 'Piolhos / lêndeas', true, /piolho|lendea/],
  ['cabelo', 'Queda de cabelo / cabelo e unhas', true, /queda de cabelo|cabelo e unhas/],

  // --- íntimo / urinário ---
  ['candidiase-vaginal', 'Candidíase vaginal', false, /candidiase vagin/],
  ['higiene-intima', 'Higiene / irritação / secura íntima', true, /higiene intima|irritacao intima|secura (intima|vaginal)|intima/],
  ['infecao-urinaria', 'Infeção urinária / cistite', true, /infecao urinaria|cistite/],
  ['incontinencia', 'Incontinência urinária', true, /incontinencia/],
  ['hemorroidas', 'Hemorroidas', false, /hemorroid/],

  // --- bem-estar / suplementação ---
  ['cansaco-fadiga', 'Cansaço / fadiga / falta de apetite', true, /cansaco|fadiga|astenia|falta de (concentracao|memoria|apetite)|desnutric|reforco proteico|jet lag/],
  ['stress-ansiedade', 'Stress / ansiedade / nervosismo', true, /stress|ansiedade|nervosismo/],
  ['insonia', 'Insónia / sono', true, /insonia|dificuldade em adormecer|\bsono\b|ressonar/],
  ['ferro-anemia', 'Falta de ferro / anemia', true, /\bferro\b|anemia/],
  ['imunidade-vitaminas', 'Vitaminas / reforço imunitário', true, /falta de vitamina|reforco de vitamina|defice de vitamina|reforco imunitario|vitamina/],
  ['saude-ossea', 'Saúde óssea', true, /saude ossea/],
  ['colesterol-cardio', 'Colesterol / cardiovascular / ómega-3', true, /colesterol|cardiovascular|omega/],
  ['menopausa', 'Menopausa / afrontamentos', true, /menopausa|afrontamento/],
  ['gravidez', 'Preconceção e gravidez', true, /preconcecao|acido folico|\bgravidez\b/],

  // --- ouvido / diversos ---
  ['cerumen', 'Higiene auricular / cerúmen', true, /cerumen|higiene auricular|tampao de cera/],
  ['protecao-hepatica', 'Proteção hepática', true, /protecao hepatica/],
  ['alergia-alimentar', 'Alergia alimentar (referir)', true, /proteina do leite/],
];

export function normalizarSintoma(frase) {
  const n = norm(frase);
  if (!n) return null;
  for (const [id, nome, novo, rgx] of CANONICOS) {
    if (rgx.test(n)) return { id, nome, novo };
  }
  return null;
}

export { CANONICOS };

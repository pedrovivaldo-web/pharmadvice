// Catálogo de produtos de exemplo — representa o que, na app real, virá do
// import CSV/Excel do sistema da farmácia (Sifarma, etc.).
//
// Campos por produto:
//   id            identificador interno
//   nome          designação comercial
//   dci           substância (liga a substancias.js — é o que dá a lógica clínica)
//   marca         marca comercial
//   preco         PVP (€)
//   margemPct     margem bruta da farmácia (fração 0..1)  → RENTABILIDADE
//   stock         unidades disponíveis                     → STOCK
//   rotacaoMensal unidades vendidas/mês (histórico)        → rotação
//   validadeMeses meses até à validade do lote em stock    → prioridade de escoamento
//   mnsrm         true = não sujeito a receita
//
// margemPct/stock são os critérios comerciais pedidos; rotação e validade são
// desempates opcionais (ver rankingComercial.js).

export const CATALOGO_EXEMPLO = [
  // --- Analgésicos / antipiréticos ---
  { id: 'benuron-500', nome: 'Ben-u-ron 500 mg 20 comp', dci: 'paracetamol', marca: 'Ben-u-ron', preco: 3.2, margemPct: 0.2, stock: 60, rotacaoMensal: 90, validadeMeses: 20, mnsrm: true },
  { id: 'paracetamol-gen', nome: 'Paracetamol Generis 500 mg 20 comp', dci: 'paracetamol', marca: 'Generis', preco: 1.8, margemPct: 0.34, stock: 25, rotacaoMensal: 20, validadeMeses: 10, mnsrm: true },
  { id: 'brufen-400', nome: 'Brufen 400 mg 20 comp', dci: 'ibuprofeno', marca: 'Brufen', preco: 4.5, margemPct: 0.22, stock: 40, rotacaoMensal: 50, validadeMeses: 18, mnsrm: true },
  { id: 'ibuprofeno-gen', nome: 'Ibuprofeno Generis 400 mg 20 comp', dci: 'ibuprofeno', marca: 'Generis', preco: 2.6, margemPct: 0.38, stock: 8, rotacaoMensal: 30, validadeMeses: 6, mnsrm: true },
  { id: 'aspirina-c', nome: 'Aspirina C 400+240 mg 20 comp eferv', dci: 'aas', marca: 'Bayer', preco: 6.9, margemPct: 0.25, stock: 15, rotacaoMensal: 12, validadeMeses: 24, mnsrm: true },

  // --- Descongestionantes ---
  { id: 'sudafed', nome: 'Sudafed 60 mg 20 comp', dci: 'pseudoefedrina', marca: 'Sudafed', preco: 7.2, margemPct: 0.28, stock: 18, rotacaoMensal: 15, validadeMeses: 16, mnsrm: true },
  { id: 'vibrocil-spray', nome: 'Nasal spray xilometazolina 0,1%', dci: 'xilometazolina', marca: 'Rino', preco: 4.9, margemPct: 0.4, stock: 30, rotacaoMensal: 25, validadeMeses: 14, mnsrm: true },

  // --- Tosse ---
  { id: 'bisolvon-seca', nome: 'Antitússico dextrometorfano xarope', dci: 'dextrometorfano', marca: 'BexatUSS', preco: 6.1, margemPct: 0.3, stock: 22, rotacaoMensal: 18, validadeMeses: 12, mnsrm: true },
  { id: 'fluimucil-600', nome: 'Fluimucil 600 mg 20 comp eferv', dci: 'acetilcisteina', marca: 'Fluimucil', preco: 8.4, margemPct: 0.26, stock: 35, rotacaoMensal: 40, validadeMeses: 15, mnsrm: true },
  { id: 'acetilcisteina-gen', nome: 'Acetilcisteína Generis 600 mg 20 comp', dci: 'acetilcisteina', marca: 'Generis', preco: 5.2, margemPct: 0.42, stock: 4, rotacaoMensal: 10, validadeMeses: 5, mnsrm: true },

  // --- Alergia ---
  { id: 'claritine', nome: 'Claritine 10 mg 20 comp', dci: 'loratadina', marca: 'Claritine', preco: 6.5, margemPct: 0.24, stock: 20, rotacaoMensal: 22, validadeMeses: 20, mnsrm: true },

  // --- Azia ---
  { id: 'kompensan', nome: 'Antiácido comp mastigáveis', dci: 'antiacido', marca: 'Kompensan', preco: 4.1, margemPct: 0.36, stock: 26, rotacaoMensal: 20, validadeMeses: 18, mnsrm: true },
  { id: 'famotidina-otc', nome: 'Famotidina 20 mg 10 comp', dci: 'famotidina', marca: 'Generis', preco: 5.8, margemPct: 0.33, stock: 12, rotacaoMensal: 9, validadeMeses: 22, mnsrm: true },
  { id: 'omeprazol-otc', nome: 'Omeprazol 20 mg 14 comp', dci: 'omeprazol', marca: 'Generis', preco: 4.7, margemPct: 0.3, stock: 50, rotacaoMensal: 60, validadeMeses: 19, mnsrm: true },
];

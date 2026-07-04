import { describe, it, expect } from 'vitest';
import { recomendarConjunto, conflitoCombinacao } from './crossSell.js';

const p = (id, dci, over = {}) => ({ id, dci, nome: id, stock: 10, margemPct: 0.3, rotacaoMensal: 10, validadeMeses: 12, ...over });

describe('conflitoCombinacao (guarda)', () => {
  it('deteta mesma substância', () => {
    const escolhidos = [{ produto: p('a', 'ibuprofeno') }];
    expect(conflitoCombinacao(p('b', 'ibuprofeno'), escolhidos)).toBe('mesma-substancia');
  });

  it('deteta dois AINEs juntos', () => {
    const escolhidos = [{ produto: p('a', 'ibuprofeno') }];
    expect(conflitoCombinacao(p('b', 'aas'), escolhidos)).toBe('dois-aine');
  });

  it('combinação segura devolve null', () => {
    const escolhidos = [{ produto: p('a', 'pseudoefedrina') }];
    expect(conflitoCombinacao(p('b', 'paracetamol'), escolhidos)).toBeNull();
  });
});

describe('recomendarConjunto', () => {
  const consultaBase = { sintoma: 'congestao-nasal', duracaoDias: 2, doente: { idade: 40 }, respostas: {} };
  const catalogo = [
    p('sud', 'pseudoefedrina'),
    p('ben', 'paracetamol', { margemPct: 0.2 }),
    p('bru', 'ibuprofeno', { margemPct: 0.5 }),
  ];

  it('sugere um produto por papel (descongestionante + analgésico)', () => {
    const { conjunto } = recomendarConjunto(consultaBase, catalogo);
    expect(conjunto).toHaveLength(2);
    const papeis = conjunto.map((c) => c.papel);
    expect(papeis).toEqual(['descongestionante', 'analgesico']);
    // descongestionante → pseudoefedrina; analgésico → ibuprofeno (maior margem)
    expect(conjunto[0].produto.dci).toBe('pseudoefedrina');
    expect(conjunto[1].produto.dci).toBe('ibuprofeno');
  });

  it('marca o papel principal', () => {
    const { conjunto } = recomendarConjunto(consultaBase, catalogo);
    expect(conjunto.find((c) => c.papel === 'descongestionante').principal).toBe(true);
    expect(conjunto.find((c) => c.papel === 'analgesico').principal).toBe(false);
  });

  it('a segurança aplica-se dentro do cross-sell: hipertenso não recebe pseudoefedrina', () => {
    const consulta = { ...consultaBase, doente: { idade: 40, patologias: ['hipertensao'] } };
    const { conjunto } = recomendarConjunto(consulta, catalogo);
    const dcis = conjunto.map((c) => c.produto.dci);
    expect(dcis).not.toContain('pseudoefedrina');
    // só sobra o papel analgésico (não há xilometazolina em stock)
    expect(conjunto.map((c) => c.papel)).toEqual(['analgesico']);
  });

  it('traz alternativas dentro do papel', () => {
    const { conjunto } = recomendarConjunto(consultaBase, catalogo);
    const analgesico = conjunto.find((c) => c.papel === 'analgesico');
    // ibuprofeno escolhido; paracetamol fica como alternativa
    expect(analgesico.alternativas.map((a) => a.dci)).toContain('paracetamol');
  });
});

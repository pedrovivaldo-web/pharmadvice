import { describe, it, expect } from 'vitest';
import { aconselhar } from './aconselhar.js';
import { CATALOGO_EXEMPLO } from '../data/catalogoExemplo.js';

describe('aconselhar (fluxo completo)', () => {
  it('cefaleia simples: recomenda e ordena por critério comercial', () => {
    const consulta = { sintoma: 'cefaleia', duracaoDias: 1, doente: { idade: 30 }, respostas: {} };
    const r = aconselhar(consulta, CATALOGO_EXEMPLO);

    expect(r.referenciar).toBe(false);
    expect(r.recomendacoes.length).toBeGreaterThan(0);
    // só substâncias indicadas para cefaleia
    for (const rec of r.recomendacoes) {
      expect(['paracetamol', 'ibuprofeno', 'aas']).toContain(rec.produto.dci);
    }
    // ordenado por score decrescente
    const scores = r.recomendacoes.map((x) => x.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    // a 1.ª tem ordem 1
    expect(r.recomendacoes[0].ordem).toBe(1);
    // traz posologia
    expect(r.recomendacoes[0].posologia).toBeTruthy();
  });

  it('sinal de alarme → referencia e NÃO recomenda nada', () => {
    const consulta = {
      sintoma: 'cefaleia',
      duracaoDias: 1,
      doente: { idade: 30 },
      respostas: { 'cefaleia-subita': true },
    };
    const r = aconselhar(consulta, CATALOGO_EXEMPLO);
    expect(r.referenciar).toBe(true);
    expect(r.motivo).toBe('sinais-de-alarme');
    expect(r.recomendacoes).toHaveLength(0);
  });

  it('a segurança vem antes da margem: doente hipertenso não recebe pseudoefedrina', () => {
    const consulta = {
      sintoma: 'congestao-nasal',
      duracaoDias: 2,
      doente: { idade: 50, patologias: ['hipertensao'] },
      respostas: {},
    };
    const r = aconselhar(consulta, CATALOGO_EXEMPLO);
    const dcisRecomendadas = r.recomendacoes.map((x) => x.produto.dci);
    expect(dcisRecomendadas).not.toContain('pseudoefedrina');
    // pseudoefedrina deve aparecer nos excluídos com motivo
    expect(r.excluidos.some((e) => e.produto.dci === 'pseudoefedrina')).toBe(true);
  });

  it('produto adequado mas sem stock vai para semStock (encomenda), não para recomendações', () => {
    // catálogo mínimo: um paracetamol sem stock
    const catalogo = [
      { id: 'só', nome: 'Paracetamol', dci: 'paracetamol', margemPct: 0.3, stock: 0, rotacaoMensal: 5, validadeMeses: 10, mnsrm: true },
    ];
    const consulta = { sintoma: 'cefaleia', duracaoDias: 1, doente: { idade: 30 }, respostas: {} };
    const r = aconselhar(consulta, catalogo);
    expect(r.recomendacoes).toHaveLength(0);
    expect(r.semStock.map((s) => s.produto.id)).toContain('só');
  });

  it('tosse produtiva não recebe antitússico (dextrometorfano)', () => {
    const consulta = { sintoma: 'tosse-produtiva', duracaoDias: 3, doente: { idade: 40 }, respostas: {} };
    const r = aconselhar(consulta, CATALOGO_EXEMPLO);
    const dcis = r.recomendacoes.map((x) => x.produto.dci);
    expect(dcis).toContain('acetilcisteina');
    expect(dcis).not.toContain('dextrometorfano');
  });
});

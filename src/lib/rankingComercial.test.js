import { describe, it, expect } from 'vitest';
import { ordenarComercial, PESOS_PADRAO } from './rankingComercial.js';

const prod = (over) => ({
  produto: { id: 'p', dci: 'paracetamol', margemPct: 0.2, stock: 10, rotacaoMensal: 10, validadeMeses: 12, ...over },
  avisos: [],
});

describe('ordenarComercial', () => {
  it('a maior margem ganha quando o resto é igual', () => {
    const { ranking } = ordenarComercial([
      prod({ id: 'baixa', margemPct: 0.1 }),
      prod({ id: 'alta', margemPct: 0.5 }),
    ]);
    expect(ranking[0].produto.id).toBe('alta');
  });

  it('separa produtos sem stock', () => {
    const { ranking, semStock } = ordenarComercial([
      prod({ id: 'com', stock: 5 }),
      prod({ id: 'sem', stock: 0 }),
    ]);
    expect(ranking.map((r) => r.produto.id)).toEqual(['com']);
    expect(semStock.map((s) => s.produto.id)).toEqual(['sem']);
  });

  it('validade mais curta tem prioridade (escoamento)', () => {
    const { ranking } = ordenarComercial(
      [
        prod({ id: 'longa', validadeMeses: 24 }),
        prod({ id: 'curta', validadeMeses: 3 }),
      ],
      { pesos: { margem: 0, stock: 0, rotacao: 0, validade: 1 } },
    );
    expect(ranking[0].produto.id).toBe('curta');
  });

  it('pesos configuráveis: só stock manda', () => {
    const { ranking } = ordenarComercial(
      [
        prod({ id: 'pouco', stock: 2, margemPct: 0.9 }),
        prod({ id: 'muito', stock: 99, margemPct: 0.1 }),
      ],
      { pesos: { margem: 0, stock: 1, rotacao: 0, validade: 0 } },
    );
    expect(ranking[0].produto.id).toBe('muito');
  });

  it('todos iguais → componente neutra 0.5, sem crashes', () => {
    const { ranking } = ordenarComercial([prod({ id: 'a' }), prod({ id: 'b' })]);
    expect(ranking).toHaveLength(2);
    expect(ranking[0].componentes.margem).toBe(0.5);
  });

  it('pesos padrão somam 1', () => {
    const soma = Object.values(PESOS_PADRAO).reduce((a, b) => a + b, 0);
    expect(soma).toBeCloseTo(1);
  });
});

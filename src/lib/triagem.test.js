import { describe, it, expect } from 'vitest';
import { triar } from './triagem.js';

const doente = { idade: 35 };

describe('triar', () => {
  it('não referencia quando não há sinais de alarme', () => {
    const r = triar({ sintoma: 'cefaleia', duracaoDias: 1, doente, respostas: {} });
    expect(r.referenciar).toBe(false);
    expect(r.sinais).toHaveLength(0);
  });

  it('referencia perante um sinal de alarme respondido', () => {
    const r = triar({
      sintoma: 'cefaleia',
      duracaoDias: 1,
      doente,
      respostas: { 'cefaleia-subita': true },
    });
    expect(r.referenciar).toBe(true);
    expect(r.sinais.map((s) => s.id)).toContain('cefaleia-subita');
  });

  it('referencia por duração (regra sem pergunta)', () => {
    const r = triar({ sintoma: 'cefaleia', duracaoDias: 5, doente, respostas: {} });
    expect(r.referenciar).toBe(true);
    expect(r.sinais.map((s) => s.id)).toContain('cefaleia-persistente');
  });

  it('referencia azia de novo em > 55 anos', () => {
    const r = triar({
      sintoma: 'pirose',
      duracaoDias: 3,
      doente: { idade: 60 },
      respostas: {},
    });
    expect(r.referenciar).toBe(true);
    expect(r.sinais.map((s) => s.id)).toContain('pirose-idade');
  });

  it('sintoma fora de âmbito → referencia por prudência', () => {
    const r = triar({ sintoma: 'dor-toracica', doente, respostas: {} });
    expect(r.referenciar).toBe(true);
    expect(r.sintomaDesconhecido).toBe(true);
  });
});

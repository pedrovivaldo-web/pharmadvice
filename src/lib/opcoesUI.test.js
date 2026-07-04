import { describe, it, expect } from 'vitest';
import { sintomasParaUI, perguntasTriagem, PATOLOGIAS } from './opcoesUI.js';

describe('opcoesUI', () => {
  it('lista sintomas com id e nome', () => {
    const lista = sintomasParaUI();
    expect(lista.length).toBeGreaterThan(0);
    expect(lista[0]).toHaveProperty('id');
    expect(lista[0]).toHaveProperty('nome');
    expect(lista.map((s) => s.id)).toContain('cefaleia');
  });

  it('perguntas de triagem só incluem sinais com pergunta', () => {
    const perguntas = perguntasTriagem('cefaleia');
    expect(perguntas.every((p) => typeof p.pergunta === 'string' && p.pergunta.length > 0)).toBe(true);
    // cefaleia-persistente é avaliada por duração (pergunta null) → não aparece
    expect(perguntas.map((p) => p.id)).not.toContain('cefaleia-persistente');
    expect(perguntas.map((p) => p.id)).toContain('cefaleia-subita');
  });

  it('sintoma desconhecido → sem perguntas', () => {
    expect(perguntasTriagem('inexistente')).toEqual([]);
  });

  it('os ids das patologias são únicos', () => {
    const ids = PATOLOGIAS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

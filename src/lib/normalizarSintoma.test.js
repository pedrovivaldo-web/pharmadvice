import { describe, it, expect } from 'vitest';
import { normalizarSintoma } from './normalizarSintoma.js';

const id = (f) => normalizarSintoma(f)?.id ?? null;

describe('normalizarSintoma', () => {
  it('agrupa sinónimos', () => {
    expect(id('Insónia')).toBe('insonia');
    expect(id('Dificuldade em adormecer')).toBe('insonia');
    expect(id('Cansaço')).toBe('cansaco-fadiga');
    expect(id('Fadiga')).toBe('cansaco-fadiga');
    expect(id('Cansaço mental')).toBe('cansaco-fadiga');
  });

  it('liga aos sintomas existentes do motor (novo=false)', () => {
    expect(normalizarSintoma('Congestão nasal')).toMatchObject({ id: 'congestao-nasal', novo: false });
    expect(normalizarSintoma('Feridas na boca')).toMatchObject({ id: 'aftas', novo: false });
    expect(normalizarSintoma('Cãibras musculares')).toMatchObject({ id: 'dores-musculares', novo: false });
  });

  it('marca áreas novas (novo=true)', () => {
    expect(normalizarSintoma('Pele seca')).toMatchObject({ id: 'pele-seca', novo: true });
    expect(normalizarSintoma('Olho seco')).toMatchObject({ id: 'olho-seco', novo: true });
  });

  it('filtra veterinário', () => {
    expect(id('Pulgas e carraças (gato)')).toBe('veterinario');
  });

  it('frases vagas ficam sem grupo', () => {
    expect(id('Recuperação')).toBeNull();
    expect(id('')).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { aconselhar } from './aconselhar.js';

const p = (id, dci, margemPct = 0.3) => ({ id, nome: id, dci, stock: 10, margemPct, rotacaoMensal: 10, validadeMeses: 12 });
const CAT = [
  p('para', 'paracetamol'),
  p('clarit', 'loratadina'),
  p('cet', 'cetirizina', 0.5),
  p('aciclo', 'aciclovir-topico'),
  p('canes', 'clotrimazol-topico'),
  p('lamisil', 'terbinafina-topico', 0.6),
  p('ginocanes', 'clotrimazol-vaginal'),
  p('faktu', 'antihemorroidario-topico'),
  p('pyralvex', 'afta-local'),
  p('fenistil', 'dimetindeno-topico'),
  p('hidrocort', 'hidrocortisona-topico', 0.5),
];
const cfg = { pesos: { margem: 1, stock: 0, rotacao: 0, validade: 0 } };

describe('herpes labial', () => {
  it('recomenda aciclovir tópico', () => {
    const r = aconselhar({ sintoma: 'herpes-labial', duracaoDias: 1, doente: { idade: 30 }, respostas: {} }, CAT, cfg);
    expect(r.referenciar).toBe(false);
    expect(r.conjunto[0].produto.dci).toBe('aciclovir-topico');
  });
  it('imunossuprimido → NÃO refere; recomenda e vigia', () => {
    const r = aconselhar({ sintoma: 'herpes-labial', duracaoDias: 1, doente: { idade: 30 }, respostas: { 'herpes-imuno': true } }, CAT, cfg);
    expect(r.referenciar).toBe(false);
    expect(r.vigilancia.map((v) => v.id)).toContain('herpes-imuno');
    expect(r.conjunto[0].produto.dci).toBe('aciclovir-topico');
  });
});

describe('micose cutânea', () => {
  it('unhas afetadas → vigilância (recomenda + vigiar), não refere', () => {
    const r = aconselhar({ sintoma: 'micose-cutanea', duracaoDias: 5, doente: { idade: 40 }, respostas: { 'mic-unhas': true } }, CAT, cfg);
    expect(r.referenciar).toBe(false);
    expect(r.vigilancia.map((v) => v.id)).toContain('mic-unhas');
    expect(r.conjunto.length).toBeGreaterThan(0);
  });
  it('diabético SEM ferida → não refere (recomenda)', () => {
    const r = aconselhar({ sintoma: 'micose-cutanea', duracaoDias: 5, doente: { idade: 40, patologias: ['diabetes'] }, respostas: {} }, CAT, cfg);
    expect(r.referenciar).toBe(false);
  });
  it('ferida na zona → referenciar', () => {
    const r = aconselhar({ sintoma: 'micose-cutanea', duracaoDias: 5, doente: { idade: 40, patologias: ['diabetes'] }, respostas: { 'mic-ferida': true } }, CAT, cfg);
    expect(r.referenciar).toBe(true);
  });
});

describe('candidíase vaginal', () => {
  it('primeiro episódio → vigilância (aconselhar e vigiar), não refere', () => {
    const r = aconselhar({ sintoma: 'candidiase-vaginal', duracaoDias: 2, doente: { idade: 30 }, respostas: { 'cv-primeiro': true } }, CAT, cfg);
    expect(r.referenciar).toBe(false);
    expect(r.vigilancia.map((v) => v.id)).toContain('cv-primeiro');
    expect(r.conjunto[0].produto.dci).toBe('clotrimazol-vaginal');
  });
  it('grávida → referenciar', () => {
    const r = aconselhar({ sintoma: 'candidiase-vaginal', duracaoDias: 2, doente: { idade: 30, gravidez: true }, respostas: {} }, CAT, cfg);
    expect(r.referenciar).toBe(true);
  });
  it('caso simples → recomenda clotrimazol vaginal', () => {
    const r = aconselhar({ sintoma: 'candidiase-vaginal', duracaoDias: 2, doente: { idade: 30 }, respostas: {} }, CAT, cfg);
    expect(r.referenciar).toBe(false);
    expect(r.conjunto[0].produto.dci).toBe('clotrimazol-vaginal');
  });
});

describe('hemorroidas e aftas', () => {
  it('hemorroidas com sangue abundante → referenciar', () => {
    const r = aconselhar({ sintoma: 'hemorroidas', duracaoDias: 3, doente: { idade: 45 }, respostas: { 'hem-sangue': true } }, CAT, cfg);
    expect(r.referenciar).toBe(true);
  });
  it('afta > 3 semanas → referenciar', () => {
    const r = aconselhar({ sintoma: 'aftas', duracaoDias: 25, doente: { idade: 40 }, respostas: {} }, CAT, cfg);
    expect(r.referenciar).toBe(true);
  });
});

describe('picadas / prurido', () => {
  it('cross-sell: alívio tópico + anti-histamínico oral', () => {
    const r = aconselhar({ sintoma: 'picadas-prurido', duracaoDias: 1, doente: { idade: 30 }, respostas: {} }, CAT, cfg);
    expect(r.referenciar).toBe(false);
    expect(r.conjunto.map((c) => c.papel)).toEqual(['topico', 'anti-histaminico']);
    expect(r.conjunto[0].produto.dci).toBe('hidrocortisona-topico'); // maior margem no papel tópico
    expect(r.conjunto[1].produto.dci).toBe('cetirizina'); // maior margem no oral
  });
  it('sinais de anafilaxia → referenciar (emergência)', () => {
    const r = aconselhar({ sintoma: 'picadas-prurido', duracaoDias: 1, doente: { idade: 30 }, respostas: { 'pic-anafilaxia': true } }, CAT, cfg);
    expect(r.referenciar).toBe(true);
    expect(r.conjunto).toHaveLength(0);
  });
});

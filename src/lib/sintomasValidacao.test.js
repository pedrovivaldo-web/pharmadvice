import { describe, it, expect } from 'vitest';
import { aconselhar } from './aconselhar.js';
import { SUBSTANCIAS } from '../data/substancias.js';

const p = (id, dci, margemPct = 0.3) => ({ id, nome: id, dci, stock: 10, margemPct, rotacaoMensal: 10, validadeMeses: 12 });
const CAT = [
  p('para', 'paracetamol'), p('ibu', 'ibuprofeno'),
  p('fluimucil', 'acetilcisteina', 0.3), p('ambrox', 'ambroxol', 0.6),
  p('clarit', 'loratadina'), p('deslor', 'desloratadina', 0.7),
  p('dextro', 'dextrometorfano'),
  p('canes', 'clotrimazol-topico'), p('cetoc', 'cetoconazol-topico', 0.6),
];
const cfg = { pesos: { margem: 1, stock: 0, rotacao: 0, validade: 0 } };

describe('novas substâncias existem e são recomendáveis', () => {
  it('ambroxol, desloratadina e cetoconazol no motor', () => {
    for (const dci of ['ambroxol', 'desloratadina', 'cetoconazol-topico']) {
      expect(SUBSTANCIAS[dci]).toBeTruthy();
    }
  });
  it('tosse produtiva: ambroxol é opção (maior margem ganha)', () => {
    const r = aconselhar({ sintoma: 'tosse-produtiva', duracaoDias: 3, doente: { idade: 40 }, respostas: {} }, CAT, cfg);
    expect(r.conjunto[0].produto.dci).toBe('ambroxol');
  });
  it('rinite: desloratadina é opção (maior margem ganha)', () => {
    const r = aconselhar({ sintoma: 'rinite-alergica', duracaoDias: 5, doente: { idade: 30 }, respostas: {} }, CAT, cfg);
    expect(r.conjunto[0].produto.dci).toBe('desloratadina');
  });
});

describe('novos sinais de alarme (referir)', () => {
  it('febre que não cede a antipiréticos → referenciar', () => {
    const r = aconselhar({ sintoma: 'febre', duracaoDias: 1, doente: { idade: 30 }, respostas: { 'febre-refrataria': true } }, CAT, cfg);
    expect(r.referenciar).toBe(true);
    expect(r.sinaisAlarme.map((s) => s.id)).toContain('febre-refrataria');
  });
  it('tosse seca em quem toma IECA → referenciar (automático)', () => {
    const r = aconselhar({ sintoma: 'tosse-seca', duracaoDias: 5, doente: { idade: 55, medicacao: ['lisinopril'] }, respostas: {} }, CAT, cfg);
    expect(r.referenciar).toBe(true);
    expect(r.sinaisAlarme.map((s) => s.id)).toContain('tosse-ieca');
  });
});

describe('nível de vigilância', () => {
  it('sinal "vigiar" NÃO refere, recomenda e devolve a vigilância', () => {
    const r = aconselhar({ sintoma: 'micose-cutanea', duracaoDias: 5, doente: { idade: 40 }, respostas: { 'mic-extenso': true } }, CAT, cfg);
    expect(r.referenciar).toBe(false);
    expect(r.vigilancia.length).toBeGreaterThan(0);
    expect(r.conjunto.length).toBeGreaterThan(0);
  });
  it('sinal "referir" continua a cortar tudo', () => {
    const r = aconselhar({ sintoma: 'micose-cutanea', duracaoDias: 5, doente: { idade: 40 }, respostas: { 'mic-infecao': true } }, CAT, cfg);
    expect(r.referenciar).toBe(true);
    expect(r.conjunto).toHaveLength(0);
  });
});

describe('notas de aconselhamento', () => {
  it('obstipação e diarreia trazem nota', () => {
    const cat = [p('movi', 'macrogol'), p('sro', 'reidratacao-oral')];
    const ro = aconselhar({ sintoma: 'obstipacao', duracaoDias: 2, doente: { idade: 30 }, respostas: {} }, cat, cfg);
    expect(ro.notaAconselhamento).toMatch(/osm[óo]tico/i);
    const rd = aconselhar({ sintoma: 'diarreia', duracaoDias: 1, doente: { idade: 30 }, respostas: {} }, cat, cfg);
    expect(rd.notaAconselhamento).toMatch(/hidrata/i);
  });
});

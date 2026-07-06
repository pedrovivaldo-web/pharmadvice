import { describe, it, expect } from 'vitest';
import { aconselhar } from './aconselhar.js';
import { SINTOMAS } from '../data/sintomas.js';
import { SUBSTANCIAS } from '../data/substancias.js';

// Catálogo mínimo com um produto por cada substância nova (+ base), tudo com stock.
const p = (id, dci, margemPct) => ({ id, nome: id, dci, stock: 10, margemPct, rotacaoMensal: 10, validadeMeses: 12 });
const CAT = [
  p('para', 'paracetamol', 0.3),
  p('ibu', 'ibuprofeno', 0.3),
  p('flurb', 'flurbiprofeno', 0.5),
  p('benz', 'benzidamina', 0.4),
  p('past', 'pastilha-garganta', 0.2),
  p('clarit', 'loratadina', 0.3),
  p('cet', 'cetirizina', 0.5),
  p('fexo', 'fexofenadina', 0.2),
  p('movi', 'macrogol', 0.4),
  p('dulco', 'bisacodilo', 0.3),
  p('imodium', 'loperamida', 0.5),
  p('sro', 'reidratacao-oral', 0.2),
  p('vomi', 'dimenidrinato', 0.4),
  p('volt', 'diclofenac-topico', 0.5),
];

describe('integridade dos novos sintomas', () => {
  it('toda a dci indicada existe em SUBSTANCIAS', () => {
    const validas = Object.keys(SUBSTANCIAS);
    for (const s of Object.values(SINTOMAS)) {
      for (const dci of s.substanciasIndicadas) {
        expect(validas, `sintoma ${s.id}: dci "${dci}"`).toContain(dci);
      }
      for (const papel of s.papeis ?? []) {
        for (const dci of papel.dcis) {
          expect(validas, `papel ${papel.id}: dci "${dci}"`).toContain(dci);
        }
      }
    }
  });
});

describe('dor de garganta', () => {
  const consulta = { sintoma: 'dor-garganta', duracaoDias: 2, doente: { idade: 30 }, respostas: {} };
  it('cross-sell: alívio local + analgésico', () => {
    const r = aconselhar(consulta, CAT, { pesos: { margem: 1, stock: 0, rotacao: 0, validade: 0 } });
    expect(r.referenciar).toBe(false);
    expect(r.conjunto.map((c) => c.papel)).toEqual(['alivio-local', 'analgesico']);
    // flurbiprofeno (AINE) é o alívio local de maior margem
    expect(r.conjunto[0].produto.dci).toBe('flurbiprofeno');
  });
  it('não junta dois AINEs: se o local for flurbiprofeno, o oral não é ibuprofeno', () => {
    const r = aconselhar(consulta, CAT, { pesos: { margem: 1, stock: 0, rotacao: 0, validade: 0 } });
    const dcis = r.conjunto.map((c) => c.produto.dci);
    expect(dcis).toContain('flurbiprofeno');
    expect(dcis).not.toContain('ibuprofeno'); // seria dois AINEs → escolhe paracetamol
    expect(dcis).toContain('paracetamol');
  });
  it('dificuldade em engolir a saliva → referenciar', () => {
    const r = aconselhar({ ...consulta, respostas: { 'garganta-respirar': true } }, CAT);
    expect(r.referenciar).toBe(true);
  });
});

describe('diarreia', () => {
  it('cross-sell: reidratação + antidiarreico', () => {
    const r = aconselhar({ sintoma: 'diarreia', duracaoDias: 1, doente: { idade: 30 }, respostas: {} }, CAT);
    expect(r.conjunto.map((c) => c.produto.dci)).toEqual(['reidratacao-oral', 'loperamida']);
  });
  it('sangue nas fezes → referenciar', () => {
    const r = aconselhar({ sintoma: 'diarreia', duracaoDias: 1, doente: { idade: 30 }, respostas: { 'diar-sangue': true } }, CAT);
    expect(r.referenciar).toBe(true);
  });
  it('loperamida excluída em criança < 12 anos', () => {
    const r = aconselhar({ sintoma: 'diarreia', duracaoDias: 1, doente: { idade: 8 }, respostas: {} }, CAT);
    const dcis = r.conjunto.map((c) => c.produto.dci);
    expect(dcis).toContain('reidratacao-oral');
    expect(dcis).not.toContain('loperamida');
  });
});

describe('dores musculares', () => {
  it('tópico + analgésico oral; alérgico a AINE não recebe tópico AINE', () => {
    const alergico = { sintoma: 'dores-musculares', duracaoDias: 2, doente: { idade: 40, alergias: ['aine'] }, respostas: {} };
    const r = aconselhar(alergico, CAT, { pesos: { margem: 1, stock: 0, rotacao: 0, validade: 0 } });
    const dcis = r.conjunto.map((c) => c.produto.dci);
    expect(dcis).not.toContain('diclofenac-topico');
    // topico AINE excluído → só sobra o papel analgésico com paracetamol
    expect(dcis).toContain('paracetamol');
  });
});

describe('rinite e náuseas', () => {
  it('rinite: anti-histamínico de maior margem (cetirizina)', () => {
    const r = aconselhar({ sintoma: 'rinite-alergica', duracaoDias: 5, doente: { idade: 30 }, respostas: {} }, CAT, { pesos: { margem: 1, stock: 0, rotacao: 0, validade: 0 } });
    expect(r.conjunto[0].produto.dci).toBe('cetirizina');
  });
  it('náuseas na gravidez → referenciar', () => {
    const r = aconselhar({ sintoma: 'nauseas', duracaoDias: 1, doente: { idade: 30, gravidez: true }, respostas: {} }, CAT);
    expect(r.referenciar).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { substanciaParaDci, detetarForma } from './normalizarSubstancia.js';

const dci = (sub, nome) => substanciaParaDci(sub, nome).dci;

describe('detetarForma', () => {
  it('distingue formas pelo nome', () => {
    expect(detetarForma('Brufen 400 mg comp')).toBe('oral');
    expect(detetarForma('Voltaren Emulgel gel bisnaga')).toBe('topico');
    expect(detetarForma('Vibrocil sol pulv nasal')).toBe('nasal');
    expect(detetarForma('Strepsils Blister 24 Past')).toBe('garganta');
    expect(detetarForma('Gino-Canesten óvulo')).toBe('vaginal');
  });
});

describe('substanciaParaDci', () => {
  it('mapeia orais simples', () => {
    expect(dci('Paracetamol', 'ben-u-ron 500 mg comp')).toBe('paracetamol');
    expect(dci('Ibuprofeno', 'Brufen 400 mg comp')).toBe('ibuprofeno');
    expect(dci('Ácido acetilsalicílico', 'Aspirina 500 mg')).toBe('aas');
    expect(dci('Loperamida', 'Imodium Rapid 2 mg')).toBe('loperamida');
    expect(dci('Acetilcisteína', 'Fluimucil 600 mg eferv')).toBe('acetilcisteina');
  });

  it('distingue oral vs tópico', () => {
    expect(dci('Ibuprofeno', 'Ib-u-ron Gel Mentol 100 g')).toBe('ibuprofeno-topico');
    expect(dci('Diclofenac', 'Voltaren Emulgel gel')).toBe('diclofenac-topico');
    expect(dci('Diclofenac', 'Voltaren 25 comp')).toBeNull(); // oral não modelado
  });

  it('distingue clotrimazol tópico vs vaginal', () => {
    expect(dci('Clotrimazol', 'Canesten creme')).toBe('clotrimazol-topico');
    expect(dci('Clotrimazol', 'Gino-Canesten óvulo vaginal')).toBe('clotrimazol-vaginal');
  });

  it('flurbiprofeno: garganta sim, tópico não', () => {
    expect(dci('Flurbiprofeno', 'Strepfen Mel e limão Past')).toBe('flurbiprofeno');
    expect(dci('Flurbiprofeno', 'Transact Lat penso impreg')).toBeNull();
  });

  it('combinados whitelisted', () => {
    expect(dci('Álcool 2,4-diclorobenzílico + amilmetacresol', 'Strepsils Past')).toBe('pastilha-garganta');
    expect(dci('Sais de reidratação oral (associação)', 'Dioralyte saq')).toBe('reidratacao-oral');
  });

  it('outros combinados não mapeiam', () => {
    expect(dci('Paracetamol + cafeína', 'Panadol Extra')).toBeNull();
    expect(dci('Clorfenamina + paracetamol', 'Griponal')).toBeNull();
  });

  it('candidíase vaginal com forma abreviada "vag"', () => {
    expect(dci('Clotrimazol', 'Gino-Canesten Bisnaga 50 g Cr vag')).toBe('clotrimazol-vaginal');
    expect(dci('Clotrimazol', 'Gino-Canesten 100 mg Comp vag')).toBe('clotrimazol-vaginal');
  });

  it('antihemorroidários (associações) mapeiam', () => {
    expect(dci('Tribenósido + lidocaína', 'Procto-Glyvenol creme rect')).toBe('antihemorroidario-topico');
    expect(dci('Policresuleno + cinchocaína', 'Faktu pda rect')).toBe('antihemorroidario-topico');
  });

  it('antiácidos por várias designações', () => {
    expect(dci('Algeldrato', 'Antiácido')).toBe('antiacido');
    expect(dci('Alginato de sódio + bicarbonato de sódio + carbonato de cálcio', 'Gaviscon')).toBe('antiacido');
  });

  it('fora de âmbito devolve null', () => {
    expect(dci('Cetoconazol', 'Tedol champô')).toBeNull();
    expect(dci('Simeticone', 'Aero-OM')).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { parseNumeroPT, parseLinhaCSV, parseInventarioCSV } from './importarStock.js';

describe('parseNumeroPT', () => {
  it('lê preços em euros', () => {
    expect(parseNumeroPT('8,25 €')).toBe(8.25);
    expect(parseNumeroPT('3,09 €')).toBe(3.09);
  });
  it('lê percentagens', () => {
    expect(parseNumeroPT('31%')).toBe(31);
    expect(parseNumeroPT('-24%')).toBe(-24);
  });
  it('lê negativos e milhares com espaço', () => {
    expect(parseNumeroPT('-1,37€')).toBe(-1.37);
    expect(parseNumeroPT('4 582,40€')).toBe(4582.4);
  });
  it('devolve null para vazio', () => {
    expect(parseNumeroPT('')).toBeNull();
    expect(parseNumeroPT(null)).toBeNull();
  });
});

describe('parseLinhaCSV', () => {
  it('respeita vírgulas dentro de aspas', () => {
    const campos = parseLinhaCSV('2003093,"Bebegel, 3830 mg/4,5 g x 6 gel rect bisnaga","7,23€",31%,"8,25 €","2,41 €"');
    expect(campos[0]).toBe('2003093');
    expect(campos[1]).toBe('Bebegel, 3830 mg/4,5 g x 6 gel rect bisnaga');
    expect(campos[4]).toBe('8,25 €');
  });
});

const CSV = `Código,Produto,Margem (€),% Margem,PVP Unitário,Margem Unitária
3854585,"ben-u-ron , 500 mg Blister 20 Unidade(s) Comp","13,23€",45%,"3,09 €","1,32 €"
8900019,"Algesal, 10/100mg/g-100g x 1 creme bisnaga","-1,37€",-24%,"6,05 €","-1,37 €"
2137297,"Pandermil, 10 mg/g-30 g x 1 creme bisnaga","2,92€",41%,"7,57 €","2,92 €"
2137297,"Pandermil , 10 mg/g Bisnaga 30 g Cr","23,84€",42%,"7,49 €","2,98 €"
,,"4 582,40€",38%,"10,46 €","3,77 €"`;

describe('parseInventarioCSV', () => {
  it('normaliza produtos e calcula o custo', () => {
    const { produtos } = parseInventarioCSV(CSV);
    const benu = produtos.find((p) => p.cnp === '3854585');
    expect(benu.nome).toContain('ben-u-ron');
    expect(benu.pvp).toBe(3.09);
    expect(benu.margemUnit).toBe(1.32);
    expect(benu.margemPct).toBe(45);
    expect(benu.custo).toBe(1.77); // 3.09 - 1.32
    expect(benu.stockAprox).toBe(10); // round(13.23/1.32)
  });

  it('ignora a linha de total (sem código)', () => {
    const { produtos, ignorados } = parseInventarioCSV(CSV);
    expect(produtos.some((p) => p.cnp === '')).toBe(false);
    expect(ignorados).toBe(1);
  });

  it('deduplica por CNP (último vence) e conta duplicados', () => {
    const { produtos, duplicados } = parseInventarioCSV(CSV);
    const pandermil = produtos.filter((p) => p.cnp === '2137297');
    expect(pandermil).toHaveLength(1);
    expect(pandermil[0].pvp).toBe(7.49); // a 2.ª linha venceu
    expect(duplicados).toBe(1);
  });

  it('lida com margem negativa', () => {
    const { produtos } = parseInventarioCSV(CSV);
    const algesal = produtos.find((p) => p.cnp === '8900019');
    expect(algesal.margemPct).toBe(-24);
    expect(algesal.custo).toBe(7.42); // 6.05 - (-1.37)
  });

  it('dci e stock ficam null quando o export não os traz', () => {
    const { produtos } = parseInventarioCSV(CSV);
    expect(produtos[0].dci).toBeNull();
    expect(produtos[0].stock).toBeNull();
  });
});

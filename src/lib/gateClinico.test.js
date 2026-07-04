import { describe, it, expect } from 'vitest';
import { avaliarProduto, filtrarCatalogo } from './gateClinico.js';
import { getSintoma } from '../data/sintomas.js';

const ibuprofeno = { id: 'x', nome: 'Ibuprofeno', dci: 'ibuprofeno', stock: 10, margemPct: 0.3, rotacaoMensal: 10, validadeMeses: 12 };
const paracetamol = { id: 'y', nome: 'Paracetamol', dci: 'paracetamol', stock: 10, margemPct: 0.2, rotacaoMensal: 10, validadeMeses: 12 };
const aas = { id: 'z', nome: 'AAS', dci: 'aas', stock: 10, margemPct: 0.25, rotacaoMensal: 10, validadeMeses: 12 };

describe('avaliarProduto', () => {
  it('aprova produto sem contraindicações', () => {
    const r = avaliarProduto(paracetamol, { doente: { idade: 30 } });
    expect(r.apto).toBe(true);
    expect(r.motivoExclusao).toBeNull();
  });

  it('exclui ibuprofeno com úlcera (contraindicação absoluta)', () => {
    const r = avaliarProduto(ibuprofeno, { doente: { idade: 40, patologias: ['ulcera-peptica'] } });
    expect(r.apto).toBe(false);
    expect(r.motivoExclusao).toContain('aine-ulcera');
  });

  it('exclui AAS em menor de 16 (Reye)', () => {
    const r = avaliarProduto(aas, { doente: { idade: 12 } });
    expect(r.apto).toBe(false);
    expect(r.motivoExclusao).toContain('aas-reye');
  });

  it('mantém produto com contraindicação relativa mas gera aviso', () => {
    const r = avaliarProduto(ibuprofeno, { doente: { idade: 50, patologias: ['asma'] } });
    expect(r.apto).toBe(true);
    expect(r.avisos.some((a) => a.gravidade === 'relativa')).toBe(true);
  });

  it('sinaliza interação grave e exclui (AINE + varfarina)', () => {
    const r = avaliarProduto(ibuprofeno, { doente: { idade: 50, medicacao: ['varfarina'] } });
    expect(r.apto).toBe(false);
    expect(r.motivoExclusao).toContain('interacao:varfarina');
    expect(r.avisos.some((a) => a.tipo === 'interacao')).toBe(true);
  });

  it('exclui produto de substância desconhecida', () => {
    const r = avaliarProduto({ dci: 'inexistente' }, { doente: { idade: 30 } });
    expect(r.apto).toBe(false);
    expect(r.motivoExclusao).toBe('substancia-desconhecida');
  });
});

describe('filtrarCatalogo', () => {
  const catalogo = [ibuprofeno, paracetamol, aas, { id: 'w', dci: 'omeprazol', stock: 5, margemPct: 0.3, rotacaoMensal: 5, validadeMeses: 12 }];
  const indicadas = getSintoma('cefaleia').substanciasIndicadas; // paracetamol, ibuprofeno, aas

  it('restringe às substâncias indicadas para o sintoma', () => {
    const { aptos } = filtrarCatalogo(catalogo, { doente: { idade: 30 } }, indicadas);
    // omeprazol não é indicado para cefaleia → não aparece
    expect(aptos.map((a) => a.produto.dci)).not.toContain('omeprazol');
    expect(aptos).toHaveLength(3);
  });

  it('separa excluídos com motivo', () => {
    const { aptos, excluidos } = filtrarCatalogo(catalogo, { doente: { idade: 12 } }, indicadas);
    // idade 12 exclui AAS (Reye); paracetamol e ibuprofeno passam
    expect(excluidos.map((e) => e.produto.dci)).toContain('aas');
    expect(aptos.map((a) => a.produto.dci).sort()).toEqual(['ibuprofeno', 'paracetamol']);
  });
});

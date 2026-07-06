import { describe, it, expect } from 'vitest';
import { MAPA_CNP_DCI, A_REVER, dciDeCnp } from './mapaCnpDci.js';
import { SUBSTANCIAS } from './substancias.js';

describe('mapaCnpDci', () => {
  it('todas as dci do mapa existem no motor', () => {
    const validas = Object.keys(SUBSTANCIAS);
    for (const [cnp, dci] of Object.entries(MAPA_CNP_DCI)) {
      expect(validas, `CNP ${cnp} → dci desconhecida "${dci}"`).toContain(dci);
    }
  });

  it('dciDeCnp resolve e devolve null para desconhecidos', () => {
    expect(dciDeCnp('3854585')).toBe('paracetamol');
    expect(dciDeCnp(' 3854585 ')).toBe('paracetamol'); // tolera espaços
    expect(dciDeCnp('0000000')).toBeNull();
  });

  it('um CNP não está mapeado e em A_REVER ao mesmo tempo', () => {
    const mapeados = new Set(Object.keys(MAPA_CNP_DCI));
    const conflito = A_REVER.filter((r) => mapeados.has(r.cnp));
    expect(conflito, 'CNPs em A_REVER que também estão mapeados').toEqual([]);
  });
});

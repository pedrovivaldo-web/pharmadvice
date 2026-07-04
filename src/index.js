// Ponto de entrada do motor pharmadvice. O frontend (Lovable) importa daqui.
//
// Uso típico no ecrã do balcão:
//
//   import { aconselhar, sintomasParaUI, perguntasTriagem,
//            PATOLOGIAS, MEDICACAO_COMUM, ALERGIAS } from '@/lib/pharmadvice';
//
//   const resultado = aconselhar(consulta, catalogo);
//   if (resultado.referenciar) { /* ecrã "referenciar ao médico" */ }
//   else { /* mostrar resultado.recomendacoes[] */ }

export { aconselhar } from './lib/aconselhar.js';
export { triar } from './lib/triagem.js';
export { avaliarProduto, filtrarCatalogo } from './lib/gateClinico.js';
export { ordenarComercial, PESOS_PADRAO } from './lib/rankingComercial.js';
export { recomendarConjunto, conflitoCombinacao } from './lib/crossSell.js';
export {
  sintomasParaUI,
  perguntasTriagem,
  PATOLOGIAS,
  MEDICACAO_COMUM,
  ALERGIAS,
} from './lib/opcoesUI.js';

// Dados (na app real, o catálogo virá do import CSV; este é o de exemplo).
export { CATALOGO_EXEMPLO } from './data/catalogoExemplo.js';
export { SINTOMAS } from './data/sintomas.js';
export { SUBSTANCIAS } from './data/substancias.js';

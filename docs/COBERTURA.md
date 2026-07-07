# Cobertura e roadmap — pharmadvice

Estado atual: **18 sintomas, ~34 substâncias**. Do inventário MNSRM do Pedro
(`Inventario_MNSRM_PrincipioActivo_Sintomas.csv`, 286 produtos), **111 mapeiam**
para o motor; **175 ficam fora**. Este documento organiza esses 175 em dois
grupos, derivados da coluna "Sintomas Tratados" do próprio inventário.

> Conteúdo a validar clinicamente pelo Pedro. Números = nº de produtos do stock.

## A) Aprofundar os 18 sintomas atuais (mais substâncias, sem novos sintomas)

Maior ganho rápido — faz o stock real ser mais recomendado, dentro dos sintomas
que já existem. Compatível com a decisão de "ficar nos 18".

| Sintoma existente | Produtos fora | Substâncias a acrescentar |
|---|---:|---|
| Congestão nasal | 25 | oximetazolina, fenilefrina, nafazolina, tramazolina (descongestionantes nasais) |
| Obstipação | 14 | sene, picossulfato de sódio, docusato, glicerol/sorbitol (supositório/enema) |
| Dor muscular | 8 | etofenamato, picetoprofeno, cânfora+mentol; heparinoides (hematomas) |
| Tosse produtiva | 6 | guaifenesina, bromexina, ambroxol |
| Dor de garganta | 6 | hexetidina e outros antissépticos/anestésicos locais |

## B) Sintomas novos — o "lote 3"

| Sintoma novo | Produtos | Substâncias típicas |
|---|---:|---|
| Cólicas abdominais / espasmos | 8 | butilescopolamina, trimebutina |
| Gases / flatulência | 5 | simeticona |
| Assaduras / dermatite da fralda | 5 | óxido de zinco, dexpantenol |
| Hematomas / nódoas negras | 5 | heparinoides tópicos |
| Desinfeção de feridas / feridas superficiais | 9 | iodopovidona, clorexidina |
| Alergia ocular / comichão ocular | 4 | azelastina, cetotifeno (colírios) |
| Pernas cansadas / insuficiência venosa | 3 | diosmina+hesperidina (Daflon), rusco |
| Caspa | 2 | cetoconazol, piritionato de zinco (champô) |
| Acne ligeira | 2 | peróxido de benzoílo |

**Nota:** alguns (ex.: "infeções cutâneas bacterianas" = ácido fusídico,
mupirocina) são **MSRM/sujeitos a receita** → não entram em aconselhamento MNSRM.

## Caso Daflon (diosmina + hesperidina)

Não está catalogado (substância não modelada). O inventário liga-o a:
- **Insuficiência venosa / pernas cansadas** → seria o principal num sintoma novo (grupo B).
- **Crise hemorroidária** → liga-se às **hemorroidas** existentes, como opção **oral**
  (hoje só temos o antihemorroidário tópico).

## Decisões em aberto

1. Aprofundar os 18 (grupo A) — maior cobertura do stock, sem novos sintomas.
2. Abrir o lote 3 (grupo B) — novos sintomas, validação clínica adicional.
3. Usar a coluna "Sintomas Tratados" como sinal de mapeamento (apanha casos que o
   nome da substância falha, ex.: Daflon).

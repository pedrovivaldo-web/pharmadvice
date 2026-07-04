# pharmadvice

Ferramenta de apoio à decisão para o **farmacêutico ao balcão**: dado o sintoma e o perfil do cliente, sugere **MNSRM e produtos de saúde**, ordenados por **rentabilidade e stock** da farmácia — mas **só** entre opções clinicamente adequadas e seguras.

> ⚠️ **Aviso.** O conteúdo clínico do repositório (`src/data/`) é **ilustrativo**, para desenvolver e testar o motor. **Não é uma fonte clínica.** Antes de qualquer uso real, todas as regras têm de ser validadas por um farmacêutico contra fontes oficiais (Infarmed/RCM, folhetos informativos, Prontuário Terapêutico). A app apoia a decisão — não a substitui.

## Princípio de desenho: segurança primeiro, comércio depois

O motor corre em três fases, por esta ordem inegociável:

1. **Triagem** (`src/lib/triagem.js`) — avalia sinais de alarme do sintoma. Se algum estiver presente → **referenciar ao médico** e não recomendar nada.
2. **Gate clínico** (`src/lib/gateClinico.js`) — filtra por contraindicações (idade, gravidez, patologias, alergias) e interações com a medicação atual. Contraindicação/interação grave → produto excluído.
3. **Ranking comercial** (`src/lib/rankingComercial.js`) — só sobre os produtos que passaram as duas portas: ordena por margem, stock, rotação e validade (pesos configuráveis).

O orquestrador (`src/lib/aconselhar.js`) junta tudo e devolve, além da recomendação, os produtos **sem stock** (candidatos a encomenda) e os **excluídos com motivo** — para transparência e defensabilidade.

## Estrutura

```
src/
  data/
    substancias.js      # DCIs: contraindicações e interações (regras)
    sintomas.js         # sintomas: sinais de alarme + substâncias indicadas
    catalogoExemplo.js  # produtos de exemplo (na app real: import CSV do Sifarma)
  lib/
    triagem.js          # fase 1
    gateClinico.js      # fase 2
    rankingComercial.js # fase 3
    aconselhar.js       # orquestrador
    *.test.js           # testes (vitest)
```

## Comandos

```bash
npm install       # ou bun install
npm test          # vitest run (uma vez)
npm run test:watch
```

## Frontend

O frontend é desenvolvido no **Lovable** (projeto/repo separado). O motor deste
repo é copiado para lá como `src/motor/` e a UI apenas o chama — ver
[`LOVABLE_BRIEF.md`](./LOVABLE_BRIEF.md) para o brief a colar no Lovable e o
contrato de dados. Regra: a UI **não** reimplementa lógica clínica; importa tudo
do barrel `src/index.js` (`aconselhar`, `sintomasParaUI`, `perguntasTriagem`, …).

## Estado

- [x] Motor de aconselhamento (lógica pura + testes)
- [x] Opções para a UI (`opcoesUI.js`) + barrel (`index.js`)
- [x] Brief para o Lovable (`LOVABLE_BRIEF.md`)
- [ ] UI do balcão no Lovable (fluxo triagem → recomendação)
- [ ] Import CSV/Excel de stock e margem
- [ ] Persistência / Supabase

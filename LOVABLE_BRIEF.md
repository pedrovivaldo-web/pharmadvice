# Brief para o Lovable — Frontend do pharmadvice

Este documento serve para colar (todo ou por secções) no Lovable, para gerar a UI do balcão. **A lógica clínica já existe** e não deve ser reimplementada — a UI apenas a chama.

---

## Regra nº 1 (não negociável)

**Não reimplementes nenhuma lógica clínica, de triagem ou de ranking.** Toda a decisão vem do motor já existente em `src/motor/`. A UI só:
1. recolhe os dados do ecrã,
2. monta o objeto `consulta`,
3. chama `aconselhar(consulta, catalogo)`,
4. mostra o resultado.

Se precisares de listas para construir ecrãs (sintomas, perguntas, patologias…), importa-as do motor — nunca as escrevas à mão no componente.

## Onde está o motor

Copiar a pasta `src/` deste repo para o projeto Lovable como `src/motor/` (mantendo `index.js`, `lib/`, `data/`). Importar sempre pelo barrel:

```js
import {
  aconselhar,
  sintomasParaUI, perguntasTriagem,
  PATOLOGIAS, MEDICACAO_COMUM, ALERGIAS,
  CATALOGO_EXEMPLO,
} from '@/motor';
```

(Enquanto não há import CSV nem Supabase, usar `CATALOGO_EXEMPLO` como catálogo.)

## Contexto do produto

Ferramenta **para o farmacêutico ao balcão** (não para o doente). Português de Portugal, **mobile-first**, visual limpo e clínico (base slate, Tailwind). Fluxo rápido: o farmacêutico tem o cliente à frente e quer uma sugestão em segundos.

Princípio que a UI deve transmitir: **primeiro segurança, depois recomendação**. Quando o motor manda referenciar, isso ocupa o ecrã todo e não se mostram produtos.

---

## Fluxo / ecrãs

### Ecrã 1 — Nova consulta
- Seletor de **sintoma** — opções de `sintomasParaUI()` → `[{ id, nome }]`.
- **Duração** dos sintomas em dias (número).
- **Intensidade** (opcional): ligeira / moderada / intensa.

### Ecrã 2 — Perfil do doente + triagem
- **Idade** em anos (aceitar decimais para bebés: 3 meses = `0.25`).
- **Grávida?** sim/não → se sim, **semanas de gestação**.
- **A amamentar?** sim/não.
- **Patologias** — checkboxes de `PATOLOGIAS` → `[{ id, label }]`.
- **Medicação atual** — checkboxes de `MEDICACAO_COMUM`.
- **Alergias** — checkboxes de `ALERGIAS`.
- **Perguntas de triagem** — de `perguntasTriagem(sintomaId)` → `[{ id, pergunta, descricao }]`. Cada uma é sim/não; a resposta alimenta `respostas[id] = true/false`.

### Ecrã 3 — Resultado
Chamar `aconselhar(consulta, CATALOGO_EXEMPLO)` e ramificar:

**Se `resultado.referenciar === true`** → ecrã de alerta (vermelho), ocupa tudo:
- Título "Referenciar ao médico".
- Se `motivo === 'sinais-de-alarme'`: listar `resultado.sinaisAlarme[].descricao`.
- Se `motivo === 'sintoma-fora-de-ambito'`: "Sintoma fora do âmbito de aconselhamento."
- **Não mostrar produtos.**

**Caso contrário** → lista de recomendações:
- `resultado.recomendacoes[]` (já ordenado; `ordem: 1` é a sugestão principal — destacar o 1.º cartão).
  Por cartão: `produto.nome`, `produto.marca`, `produto.preco €`, badges de **margem** (`produto.margemPct`) e **stock** (`produto.stock`), a **posologia** (`rec.posologia`), e `rec.avisos[]` (contraindicações relativas / interações) num bloco de aviso amarelo.
- Secção **"Adequados mas sem stock — encomendar"**: `resultado.semStock[]`.
- Secção colapsável **"Excluídos e porquê"**: `resultado.excluidos[]` (`produto.nome` + `motivo`) — para transparência/defensabilidade.
- Rodapé fixo com o disclaimer (ver abaixo).

---

## Contrato do motor (shapes)

**Input** — objeto `consulta`:
```js
{
  sintoma: 'cefaleia',        // id de sintomasParaUI()
  duracaoDias: 2,
  intensidade: 'moderada',    // opcional
  doente: {
    idade: 34,                // anos (0.25 = 3 meses)
    gravidez: false,
    semanasGestacao: null,    // número se grávida
    amamentacao: false,
    patologias: ['hipertensao'],  // ids de PATOLOGIAS
    medicacao: [],                // ids de MEDICACAO_COMUM
    alergias: [],                 // ids de ALERGIAS
  },
  respostas: { 'cefaleia-subita': false },  // ids de perguntasTriagem()
}
```

**Output** — `aconselhar(consulta, catalogo)`:
```js
{
  referenciar: false,
  motivo: null,                 // 'sinais-de-alarme' | 'sintoma-fora-de-ambito' | null
  sinaisAlarme: [{ id, descricao }],
  sintoma: 'cefaleia',
  recomendacoes: [
    {
      ordem: 1,
      produto: { id, nome, marca, preco, margemPct, stock, dci, ... },
      score: 0.87,
      componentes: { margem, stock, rotacao, validade },  // 0..1 cada
      avisos: [{ tipo, gravidade, descricao }],
      posologia: '500–1000 mg até 3–4x/dia...',
    },
  ],
  semStock: [{ produto, avisos }],
  excluidos: [{ produto, motivo, avisos }],
}
```

## Disclaimer (mostrar sempre no resultado)

> Ferramenta de apoio à decisão. Não substitui o julgamento clínico do farmacêutico nem a informação oficial (Infarmed/RCM, folheto informativo). Confirmar contraindicações, interações e posologia antes de dispensar.

## O que NÃO fazer nesta fase
- Não construir login/Supabase ainda (a menos que peças).
- Não implementar o import CSV ainda — usar `CATALOGO_EXEMPLO`.
- Não inventar regras clínicas, doses ou interações no componente.

# 🐛 Navbar trava em estado intermediário na transição grande → pequena (regressão)

**Status:** `done`
**Data:** 2026-07-11
**Prioridade:** `alta`
**Tags:** `frontend`, `animação`, `ui-ux`
**Resumo:** Corrige o travamento e distorção de escala da navbar na transição grande para pequena via engine de layout.

---

## Descrição
Após a primeira tentativa de correção (mudando o controle do NavBody para a engine de `layout` em vez de `animate` explícito), a navbar parou de "travar" com o erro de medição do Framer Motion, **porém**, a fluidez ficou terrível. Durante a transição do estado grande pro pequeno (e vice-versa), os elementos filhos (textos, botões, logo) ficam todos esmagados, esticados e visualmente bugados até que a animação termine. Além disso, o pause/travadinha retornou sob novas condições.

## Como Reproduzir
1. Acessar a página com a navbar no estado não-scrollado.
2. Rolar a página para baixo e para cima.
3. Observar a distorção (estiramento/esmagamento) do texto do logo e dos botões direitos durante a escala do fundo da navbar.

## Contexto Técnico
- Camada afetada: frontend (`src/components/ui/resizable-navbar.tsx` e `src/components/main/Navbar.tsx`)

## Hipótese de Causa e Investigação Incremental

**Rodada 1 (refutada):**
Adicionado `layout`/`layout="position"` simultaneamente nos 3 filhos do `NavBody` (`NavbarLogo`, `NavItems` e container de ações). Resultado: distorção piorou.

**Rodada 2 (refutada):**
Removida a classe `flex-1` do `NavItems`. Resultado: a distorção no scroll continuou ocorrendo.

**Rodada 3 — Isolação dos Filhos (Resultado B):**
Revertemos `NavbarLogo` (voltou a ser `<a>` simples) e a `div` de ações da direita (voltou a ser `div` HTML simples), mantendo apenas o `NavItems` com `layout`. Mesmo com um único filho animando `layout`, o estouro e distorção visual continuaram acontecendo.

**Rodada 4 — Substituição do Mecanismo de Largura (Abordagem A):**
Eliminamos a dependência da prop `layout`/FLIP no `NavBody`. A largura do conteúdo interno passou a ser animada numericamente (`width: visible ? ${contentWidth + 32}px : '100%'`) com spring a partir de medição via `ResizeObserver`, eliminando a distorção por escala `scaleX`.

**Rodada 5 (refutada/insuficiente):**
A alternância condicional da classe (`visible ? 'w-max' : 'w-full'`) no mesmo wrapper de exibição fazia com que a medição do `ResizeObserver` chegasse com atraso assíncrono em relação à troca de estado, fazendo a barra deslocar para a esquerda durante a animação e causando cortes ocasionais de botões.

**Rodada 6 — Clone de Medição Dedicado (SOLUÇÃO DEFINITIVA):**
Separamos totalmente a medição da exibição no `NavBody`:
1. **Elemento Visível Real:** Renderiza os filhos com `<div className="flex w-full items-center justify-between gap-4">` (sempre `w-full`, preservando o alinhamento balanceado de ponta a ponta no estado expandido).
2. **Clone Invisível de Medição:** Renderiza uma cópia dos filhos com `aria-hidden="true"`, `opacity-0`, `pointer-events-none` e `absolute -z-10 inline-flex w-max`, dedicado exclusivamente a alimentar o `ResizeObserver` com a largura natural real dos elementos sem interferir no fluxo do layout visual.

## Plano de Correção (Executado)

1. **Remoção da prop `layout` e FLIP:** Removidas as props `layout` e `layout="position"` do `NavBody`, `NavbarLogo`, `NavItems` e container de ações da direita.
2. **Separação Exibição x Medição:** O conteúdo real fica em um container fixo `w-full`, e um clone invisível `w-max` absoluto fornece a largura precisa ao `ResizeObserver`.
3. **Animação Numérica de Largura:** O `NavBody` interpola sua largura numericamente entre `100%` e `${contentWidth + 32}px` via Framer Motion `animate` e `sharedTransition` spring, com aceleração no texto dos itens para evitar atrasos no fechamento.

---

## Review

## Feedback
> Testado no browser e aprovado pelo usuário.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [x] Sem distorção no logo e botões (largura animada numericamente sem FLIP scale).
- [x] Sem pausa intermediária ou dependência de hover (ResizeObserver reage à largura real do clone).
- [x] Sem desalinhamento à esquerda no estado expandido (conteúdo visível sempre `w-full` com `justify-between`).
- [x] Sem corte de botões ou sobra de espaço no estado colapsado (testado em 5 ciclos seguidos de scroll).
- [x] Clone invisível com `pointer-events-none` e `aria-hidden="true"` isolado fora do fluxo visual.
- [x] **Pasta renomeada para `[done]-navbar-travando-intermediario` e movida para `archive/bugs/`**



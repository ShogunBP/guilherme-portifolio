# 🔧 Acessibilidade dos botões da navbar

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `média`
**Tags:** `frontend`, `ui-ux`
**Resumo:** Corrigir foco, teclado e nomes acessíveis dos controles da navbar conforme a PR 1.

---

## Contexto
A PR #1 (`ux-a11y-navbar-improvements-13606226299156377748`) identificou controles da navbar com semântica e nomes acessíveis insuficientes.

## Problema Atual
A análise da branch confirmou que `MobileNavToggle` usa SVG cru com `onClick`, sem foco e teclado adequados, e que botões somente com ícone em `src/components/ui/resizable-navbar.tsx` e `src/components/main/Navbar.tsx` podem não ter nome acessível. A PR analisada não contém a correção: `gh pr diff 1 --name-only` listou somente `.Jules/palette.md` e `pnpm-lock.yaml`.

O lockfile adicionado também não corresponde ao fluxo principal observado no repositório, que usa npm, criando risco de tooling duplicado e diff sem benefício funcional.

## Melhoria Proposta
Recriar a correção diretamente nos componentes da navbar, usando elementos `button` semânticos, `aria-label`, `aria-expanded`, texto quando necessário e estados `focus-visible`, sem adicionar um segundo gerenciador de dependências.

## Impacto Esperado
- Controles utilizáveis por teclado e tecnologias assistivas.
- Nome acessível para botões somente com ícone.
- Alvo de toque e indicação de foco preservados em desktop e móvel.
- Nenhuma alteração de dependências ou lockfile não utilizado.

## Plano de Implementação
1. Inspecionar `src/components/ui/resizable-navbar.tsx` e `src/components/main/Navbar.tsx`.
2. Substituir o `onClick` em SVG cru por botão semântico e adicionar estados ARIA.
3. Nomear os botões de contato e preservar o layout responsivo.
4. Testar teclado, foco visível, leitores de tela por atributos DOM e viewports desktop/móvel.

## Critérios de Conclusão
- [x] Toggle móvel é um `button` focável, acionável por teclado e possui nome acessível.
- [x] `aria-expanded` representa o estado do menu.
- [x] Botões somente com ícone possuem nome acessível e foco visível.
- [x] Fluxos desktop e móvel não apresentam regressão visual ou funcional.
- [x] Nenhum lockfile ou dependência não necessária é introduzido.

---

## Review

## Feedback
A análise somente leitura da PR #1 confirmou o problema nos componentes atuais, mas também confirmou que o diff da PR não contém a alteração de código descrita. Não foram executados testes nem houve alteração no checkout.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: todas as nove PRs foram aprovadas para implementação.

---

## Validação

> Evidências: Playwright local confirmou nomes acessíveis após scroll, abertura/fechamento mobile por teclado, `aria-expanded` correto e 0 erros de console; TypeScript, ESLint e `git diff --check` passaram. O clone invisível de medição ainda pode receber foco por Tab.

- [x] Melhoria perceptível e funcional
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-a11y-botoes-navbar` e movida para `archive/enhancements/`**

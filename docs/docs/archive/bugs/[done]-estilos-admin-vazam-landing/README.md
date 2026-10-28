# 🐛 Estilos do admin vazam para a landing

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `média`
**Tags:** `frontend`, `ui-ux`
**Resumo:** Isolar fundo e scrollbar do painel administrativo para impedir vazamento visual na landing page.

---

## Descrição
Estilos globais usados pelo painel administrativo estão vazando para a landing page. O fundo do admin aparece na landing e o scrollbar global usa o roxo do painel também na página pública.

## Como Reproduzir
1. Iniciar o servidor local.
2. Abrir o painel administrativo e depois navegar para a landing page, ou abrir a landing diretamente após carregar o admin.
3. Observar o fundo da página e as cores do scrollbar.

## Comportamento Esperado
A landing deve manter seu próprio fundo e identidade visual. O scrollbar pode continuar estilizado, mas deve usar as cores adequadas à landing page. Os estilos do painel não devem afetar páginas públicas.

## Comportamento Atual
O fundo do painel aparece na landing e o scrollbar fica roxo, com a aparência do admin, em vez de usar as cores da página pública.

## Contexto Técnico
- Camada afetada: frontend e estilos globais.
- Arquivos alterados: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/admin/(dashboard)/layout.tsx`, `src/app/admin/login/LoginForm.tsx`, `src/app/admin/verify-2fa/page.tsx`, `src/app/admin/setup-2fa/page.tsx`, `src/app/admin/security/page.tsx`.
- Evidência pré-correção: Playwright observou `body` com `rgb(3,0,20)` em `http://localhost:3000/`, correspondente ao fundo cósmico do admin.
- Testes reportados: `npx tsc --noEmit` exit 0; `npx eslint` nos arquivos alterados exit 0, com dois avisos preexistentes; `npm run lint` exit 1 porque o script usa `next lint`, indisponível no Next 16. O último resultado não é regressão deste card.

## Hipótese de Causa
Confirmada pela leitura do código e pela evidência pré-correção: `src/app/layout.tsx` aplicava `className="dark"`, `colorScheme: 'dark'`, fundo `#030014` e texto branco no layout raiz; `src/app/globals.css` aplicava scrollbar cósmico roxo globalmente. Os oito roots administrativos já possuíam wrappers próprios com `min-h-screen bg-[#030014] text-white`; a landing não possuía wrapper equivalente, portanto os estilos raiz vazavam para as páginas públicas.

## Plano de Correção
1. Identificar os seletores globais responsáveis pelo fundo e scrollbar.
2. Escopar estilos exclusivos do admin ao layout ou a uma classe raiz do painel.
3. Definir as cores da landing separadamente, mantendo scrollbar funcional e visualmente coerente.
4. Testar navegação landing → admin → landing em desktop e móvel, verificando ausência de vazamento visual.

---

## Review

## Feedback
O humano autorizou os dois cards em paralelo. O escopo visual é isolar fundo e scrollbar do admin na landing, mantendo o scrollbar público com cores próprias. O agente deve preservar o visual administrativo e não alterar o bug de `/admin`.

O humano informou que o bug visual foi corrigido e autorizou marcar o card como done após detalhamento factual. A validação visual humana foi registrada como confirmação externa; o QA pós-correção por navegador não foi executado pelo agente.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: “Esta aprovado e autorizado a implementação”.

Autorização humana registrada em 2026-10-28: “Esta aprovado e autorizado a implementação”. Escopo: corrigir somente o vazamento visual entre admin e landing, sem alterar o bug de rota, Kanban, diário ou Git.

---

## Validação

A correção foi aplicada nos sete arquivos listados em Contexto Técnico. `src/app/layout.tsx` voltou à neutralidade de tema; o scrollbar global foi neutralizado em `src/app/globals.css`; o scrollbar cósmico foi escopado por `html:has(.admin-shell)`, `.admin-shell` e `.admin-shell *`; e o marcador `admin-shell` foi adicionado aos oito roots administrativos em cinco arquivos. O humano informou validação visual positiva. QA pós-correção por navegador, screenshots antes/depois e navegação automatizada landing → admin → landing não foram executados pelo agente e permanecem não verificados.

- [x] Causa do vazamento identificada no escopo global
- [x] Correção de escopo aplicada e arquivos registrados
- [x] TypeScript termina sem erro (`npx tsc --noEmit`, exit 0)
- [x] ESLint termina sem erro (`npx eslint`, exit 0; dois avisos preexistentes registrados)
- [x] Validação visual humana informada
- [x] Limitação de QA pós-correção registrada como não verificada
- [x] **Pasta renomeada para `[done]-estilos-admin-vazam-landing` e movida para `archive/bugs/`**

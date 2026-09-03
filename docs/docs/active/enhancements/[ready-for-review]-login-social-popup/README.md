# 🔧 Login Social via Janela Popup com Loading Visual

**Status:** `ready-for-review`
**Data:** 2026-09-03
**Prioridade:** `média`
**Tags:** `frontend`, `ui-ux`, `segurança`
**Resumo:** Login social via janela popup sem redirecionar a tela principal, com feedback visual de carregamento contínuo.

---

## Contexto
O login social via Google e GitHub foi implementado e validado. Atualmente, ao clicar nos botões sociais, o navegador executa um redirecionamento de página inteira (`window.location.href`) para o provedor OAuth (Google/GitHub) e retorna para o painel administrativo.

## Problema Atual
O redirecionamento de página inteira remove o usuário do contexto da tela de login (`/admin/login`), provocando recarregamento de página e quebrando a fluidez da experiência administrativa. Além disso, caso o usuário demore ou queira cancelar, a página anterior precisa ser recarregada.

## Melhoria Proposta
1. Implementar fluxo de autenticação OAuth em janela popup dedicada (`window.open` centralizado).
2. Criar uma rota de apoio `/auth/popup` que dispara o `signIn(provider, { callbackUrl: '/auth/popup?status=success' })` dentro do popup.
3. Ao concluir a autenticação com sucesso:
   - A página do popup transmite uma mensagem segura (`postMessage`) para a janela mãe (`window.opener`): `{ type: 'AUTH_POPUP_SUCCESS' }` e se fecha automaticamente (`window.close()`).
   - A janela mãe detecta o sucesso, busca o destino de deep-linking (`/api/admin/redirect-target`) e redireciona suavemente para `/admin` ou para a rota previamente acessada.
4. Ao ocorrer erro de autorização (`AccessDenied`, etc.):
   - O popup transmite `{ type: 'AUTH_POPUP_ERROR', error }` e se fecha automaticamente.
   - A janela mãe exibe o banner de erro correspondente.
5. Feedback visual de carregamento:
   - Enquanto o popup estiver aberto, o botão social clicado exibe um estado de carregamento contínuo (`Loader2` animado) e os botões permanecem desabilitados para evitar múltiplos cliques.
   - Caso o usuário feche o popup manualmente antes de completar o login, a janela mãe detecta o fechamento (`popup.closed`), encerra o estado de carregamento e restaura os botões ao estado normal.

## Impacto Esperado
- Melhoria direta na experiência do usuário (UX): o administrador nunca sai da tela principal do portfólio.
- Feedback visual claro durante todo o ciclo de autenticação externa.

## Plano de Implementação
1. Criar a rota de apoio `/auth/popup/page.tsx` (isenta do middleware de proteção do admin).
2. Atualizar `src/app/admin/login/LoginForm.tsx` com o utilitário de abertura de popup centralizado, monitoramento de fechamento (`popup.closed`), escuta de mensagens `postMessage` e estado de loading ininterrupto.
3. Garantir compatibilidade com o redirecionamento de deep-linking via cookie já existente.
4. Adicionar `/auth/popup` ao matcher do `src/middleware.ts` para garantir injeção de `authConfig` e `secret` no Edge Runtime, passando direto pelo middleware sem bloqueio (`isOnAdmin = false`).
5. Validar funcionamento em desenvolvimento e build de produção (`npm run build`).

## Critérios de Conclusão
- [x] Clicar em "Entrar com Google" abre popup centralizado sem sair da tela de login
- [x] Clicar em "Entrar com GitHub" abre popup centralizado sem sair da tela de login
- [x] Botão clicado permanece em estado de carregamento (`Loader2`) enquanto o popup estiver aberto
- [x] Se o popup for fechado pelo usuário, o loading é cancelado automaticamente
- [x] Ao concluir o login no popup, o popup se fecha e a página mãe redireciona para o admin
- [x] Se a conta for rejeitada (não autorizada), o popup fecha e o banner de erro é exibido na tela mãe
- [x] `npm run build` executa sem erros

---

## Review

## Feedback
> _(preencher durante o review)_

## Decisão
- [ ] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [ ] Melhoria perceptível e funcional
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-login-social-popup` e movida para `archive/enhancements/`**

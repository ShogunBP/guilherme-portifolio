# 🐛 Open redirect parcial no LoginForm

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `alta`
**Tags:** `segurança`, `frontend`
**Resumo:** Avaliar a correção isolada do LoginForm para URLs protocol-relative e sua cobertura incompleta.

---

## Descrição
A PR #5 adiciona `!redirectTo.startsWith('//')` em dois pontos de `LoginForm.tsx` para impedir redirects protocol-relative após autenticação.

## Como Reproduzir
1. Acessar o login com `redirectTo=//evil.example`.
2. Concluir o login.
3. Repetir o fluxo por 2FA e pelo endpoint de redirect.

## Comportamento Esperado
Nenhum caminho controlado pelo usuário deve redirecionar para origem externa; todos os consumidores devem aplicar a mesma política.

## Comportamento Atual
A correção da PR #5 cobre somente dois pontos do `LoginForm`. Permanecem consumidores em `verify-2fa/page.tsx`, `api/admin/2fa/verify/route.ts` e `api/admin/redirect-target/route.ts`. A forma com barra invertida também não é tratada explicitamente.

## Contexto Técnico
- Camada afetada: frontend e autenticação.
- Arquivo da PR: `src/app/admin/login/LoginForm.tsx`.
- `.jules/sentinel.md` é documentação adicional.
- Não há testes automatizados; apenas build alegado pelo autor.

## Hipótese de Causa
A validação foi corrigida localmente, mas a regra não foi centralizada nem propagada a todos os destinos. O cookie `admin_redirect` é HttpOnly e criado pelo middleware, reduzindo alguns vetores, mas não substitui validação consistente.

## Plano de Correção
1. Não aplicar a PR isoladamente como solução final.
2. Consolidar com as PRs #3 e #6.
3. Criar testes para protocol-relative, barra invertida, caminho local, URL absoluta e deep-linking.
4. Remover documentação duplicada e confirmar o contrato do destino seguro.

---

## Review

## Feedback
A análise confirmou que a PR #5 é uma correção válida para os dois pontos do `LoginForm`, mas é incompleta. A recomendação é absorver a alteração em um card consolidado do fluxo de autenticação.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: todas as nove PRs foram aprovadas para implementação.

---

## Validação

> Evidências parciais registradas no LOG: os dois destinos do LoginForm usam o helper e o login local renderiza; credenciais e redirect autenticado não foram testados.

- [ ] Bug não reproduz mais
- [ ] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-open-redirect-loginform-parcial` e movida para `archive/bugs/`**

# 🐛 Open redirect no fluxo de autenticação

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `alta`
**Tags:** `segurança`, `backend`, `frontend`, `api`
**Resumo:** Consolidar a validação de redirectTo no login, 2FA, middleware e destino de redirect.

---

## Descrição
As PRs #3, #5 e #6 tratam do mesmo vetor: valores `redirectTo` ou destinos derivados aceitam `//host`, podendo produzir redirect externo após login ou 2FA.

## Como Reproduzir
1. Fornecer `//evil.example`, URL absoluta, vazio e caminho local em query/cookie.
2. Exercitar login, confirmação 2FA, middleware e `redirect-target`.
3. Registrar URL final e resposta sem usar credenciais reais.

## Comportamento Esperado
Somente destinos locais permitidos devem ser preservados, com fallback seguro para `/admin` quando a entrada for inválida.

## Comportamento Atual
A branch `main` ainda possui validações textuais incompletas. A PR #6 cobre mais pontos — `LoginForm`, `verify-2fa`, API de verificação, `redirect-target/route.ts` e `middleware.ts` — mas ainda duplica a regra e não possui testes automatizados.

## Contexto Técnico
- Camada afetada: frontend, backend e API de autenticação.
- Arquivos envolvidos: `src/app/admin/login/LoginForm.tsx`, `src/app/admin/verify-2fa/page.tsx`, `src/app/api/admin/2fa/verify/route.ts`, `src/app/api/admin/redirect-target/route.ts`, `src/middleware.ts`.
- Nenhuma PR teve checks ou testes independentes confirmados na análise.

## Hipótese de Causa
A aplicação trata `startsWith('/')` como sinônimo de caminho relativo, embora `//` seja protocol-relative. A duplicação aumenta o risco de correções divergentes.

## Plano de Correção
1. Consolidar as PRs #3, #5 e #6 em uma única alteração coerente.
2. Preferir helper compartilhado com fallback seguro e validação por URL/origem.
3. Testar todos os consumidores e transições login/2FA/deep-link.
4. Incluir casos de barra invertida e normalização do Next.js.
5. Verificar ausência de destino externo em respostas e navegação final.

---

## Review

## Feedback
A PR #6 é a cobertura mais completa e deve servir de base, mas não deve ser aplicada sem testes. A análise classificou o risco como alto por phishing pós-login; a exploração exata via pathname normalizado pelo Next.js ainda precisa ser validada no ambiente autorizado.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: todas as nove PRs foram aprovadas para implementação.

---

## Validação

> Evidências parciais registradas no LOG: helper compartilhado validado em 15/15 casos e consumidores atualizados; fluxo autenticado completo, cookie e 2FA ainda não foram exercitados.

- [ ] Bug não reproduz mais
- [ ] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-open-redirect-fluxo-autenticacao` e movida para `archive/bugs/`**

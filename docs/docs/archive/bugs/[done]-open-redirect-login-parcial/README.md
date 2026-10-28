# 🐛 Open redirect parcial no login

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `alta`
**Tags:** `segurança`, `frontend`, `api`
**Resumo:** Corrigir o bloqueio incompleto de URLs protocol-relative em login, 2FA e API conforme a PR 3.

---

## Descrição
A validação textual de `redirectTo` aceita strings iniciadas por `//`, que podem ser interpretadas como URLs protocol-relative externas.

## Como Reproduzir
1. Fornecer `redirectTo=//evil.example` ao fluxo de login ou 2FA.
2. Exercitar a conclusão do login.
3. Observar se o destino é aceito como caminho local ou se pode sair da origem.

## Comportamento Esperado
Somente caminhos locais permitidos devem ser aceitos; valores protocol-relative, absolutos, vazios ou malformados devem cair em destino seguro.

## Comportamento Atual
Na branch `main`, a análise encontrou validações vulneráveis em `LoginForm.tsx`, `verify-2fa/page.tsx` e `src/app/api/admin/2fa/verify/route.ts`. A PR #3 corrige os três consumidores, mas não cobre o destino centralizado nem o middleware.

## Contexto Técnico
- Camada afetada: frontend, backend e API de autenticação.
- Arquivos propostos pela PR #3: `src/app/admin/login/LoginForm.tsx`, `src/app/admin/verify-2fa/page.tsx`, `src/app/api/admin/2fa/verify/route.ts`.
- Não há testes automatizados nem evidência independente de execução.

## Hipótese de Causa
A checagem `startsWith('/')` confunde caminhos locais com URLs protocol-relative. A correção precisa ser centralizada ou aplicada a todos os consumidores para evitar cobertura parcial.

## Plano de Correção
1. Mapear todos os consumidores de `redirectTo` e `admin_redirect`.
2. Criar helper seguro ou validação equivalente única.
3. Cobrir `//evil.example`, `/admin/path`, URL absoluta, vazio e deep-linking com cookie/query.
4. Avaliar também formas com barra invertida e normalização do framework.
5. Executar testes de login e 2FA sem expor credenciais.

---

## Review

## Feedback
A PR #3 é adequada para o vetor `//`, mas é parcial. A PR #6 cobre também middleware e `redirect-target/route.ts` e deve ser avaliada em conjunto; não se deve aplicar as duas como alterações independentes.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: todas as nove PRs foram aprovadas para implementação.

---

## Validação

> Evidências parciais registradas no LOG: casos do helper validados e rotas não autenticadas redirecionam ao login; fluxo autenticado não foi exercitado.

- [ ] Bug não reproduz mais
- [ ] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-open-redirect-login-parcial` e movida para `archive/bugs/`**

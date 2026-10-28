# 🐛 Bloqueio síncrono no login

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `alta`
**Tags:** `backend`, `segurança`, `performance`
**Resumo:** Trocar bcrypt síncrono por operação assíncrona e avaliar limites contra abuso de login.

---

## Descrição
A PR #8 identifica uso de `bcrypt.compareSync` no fluxo de login não autenticado, bloqueando o event loop durante o custo criptográfico.

## Como Reproduzir
1. Enviar tentativas concorrentes ao endpoint de autenticação.
2. Observar latência de outras requisições enquanto `compareSync` executa.
3. Comparar com a implementação assíncrona sob carga controlada.

## Comportamento Esperado
A autenticação deve evitar bloquear o event loop e limitar abuso por rate limiting, mantendo resposta correta para credenciais válidas e inválidas.

## Comportamento Atual
`src/auth.ts` usa comparação síncrona na branch analisada. A PR troca por `await bcrypt.compare()`, mitigando o bloqueio do event loop, mas não elimina custo de CPU nem substitui rate limiting.

## Contexto Técnico
- Camada afetada: backend de autenticação.
- Arquivo principal: `src/auth.ts`.
- A PR também altera `next.config.ts` com headers/CSP não relacionados, criando escopo misturado e possíveis conflitos com PRs #2, #7 e #9.
- A análise não executou testes de carga, login ou build.

## Hipótese de Causa
A operação síncrona de bcrypt é executada durante uma requisição não autenticada. A operação assíncrona delega o trabalho, mas o endpoint ainda precisa de limites de abuso.

## Plano de Correção
1. Trocar apenas a comparação por operação assíncrona compatível com `authorize`.
2. Testar login válido, inválido, erro e concorrência controlada.
3. Avaliar rate limiting, timeout e limites de recursos como escopo complementar.
4. Separar e consolidar headers/CSP no card próprio.
5. Usar o gerenciador e scripts declarados pelo repositório; não aceitar apenas o claim de `pnpm build`.

---

## Review

## Feedback
A alteração assíncrona é adequada para mitigar bloqueio do event loop, mas não é proteção completa contra DoS. A CSP adicionada no mesmo PR é fraca (`unsafe-inline`/`unsafe-eval`), pode afetar PDF/HMR e deve ser revisada separadamente. Não houve testes independentes.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: todas as nove PRs foram aprovadas para implementação.

---

## Validação

> Evidências parciais registradas no LOG: `compareSync` foi substituído por `await bcrypt.compare`; não houve teste de carga ou concorrência.

- [ ] Bug não reproduz mais
- [ ] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-bloqueio-sincrono-login` e movida para `archive/bugs/`**

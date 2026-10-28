# 🐛 Headers de segurança duplicados

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `média`
**Tags:** `segurança`, `infra`, `frontend`
**Resumo:** Consolidar a proposta de headers da PR 9 e evitar conflito com as PRs 2 e 7.

---

## Descrição
As PRs #2, #7 e #9 adicionam políticas sobrepostas em `next.config.ts`. A PR #9 propõe o conjunto mais amplo entre as três, incluindo `Permissions-Policy` e HSTS com `preload`.

## Como Reproduzir
1. Comparar os diffs das PRs #2, #7 e #9 contra `main`.
2. Tentar aplicar mais de uma alteração ao mesmo `next.config.ts`.
3. Observar conflito de hunks e arquivos `.jules/sentinel.md` adicionados repetidamente.

## Comportamento Esperado
Uma única política de headers, revisada por domínio/deployment, sem duplicação, conflito de merge, arquivo sentinel vazio ou diretiva incompatível com desenvolvimento.

## Comportamento Atual
As PRs são concorrentes. A PR #9 é um superconjunto da #2, mas adiciona HSTS `preload`, que exige decisão operacional. O `.jules/sentinel.md` da PR #9 é vazio. Nenhuma das propostas inclui CSP robusta.

## Contexto Técnico
- Camada afetada: frontend e infra.
- Arquivo principal: `next.config.ts`.
- PRs relacionadas: #2, #7 e #9.
- A análise foi somente estática; não houve build ou verificação de headers em respostas reais.

## Hipótese de Causa
O bot criou PRs independentes para o mesmo alerta sem reconciliar branches anteriores. A correção deve ser consolidada em uma única política antes de qualquer merge.

## Plano de Correção
1. Comparar todos os headers e escolher o conjunto necessário.
2. Excluir `preload` até confirmar requisitos do domínio, ou registrar decisão humana explícita.
3. Remover `.jules/sentinel.md` vazio/duplicado.
4. Validar headers em rotas públicas, login, API e desenvolvimento.
5. Avaliar CSP em card separado, evitando diretivas permissivas sem justificativa.

---

## Review

## Feedback
A análise recomenda um único card de headers para as PRs #2, #7 e #9; aplicar as três separadamente causaria conflito e duplicação. A PR #9 é a mais ampla, mas não deve trazer `preload` sem decisão sobre o domínio. Os builds foram apenas alegados pelos autores.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: todas as nove PRs foram aprovadas para implementação.

---

## Validação

> Evidências parciais registradas no LOG: política única de headers confirmada em desenvolvimento; produção/Cloudflare e decisão operacional de HSTS ainda pendentes.

- [x] Bug não reproduz mais
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-headers-seguranca-duplicados` e movida para `archive/bugs/`**

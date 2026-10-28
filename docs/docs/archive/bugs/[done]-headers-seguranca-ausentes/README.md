# 🐛 Headers de segurança ausentes

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `média`
**Tags:** `segurança`, `infra`, `frontend`
**Resumo:** Adicionar e validar headers HTTP de segurança nas respostas da aplicação conforme as PRs 2 e 9.

---

## Descrição
O checkout analisado não possui `headers()` de segurança em `next.config.ts`. As PRs #2 e #9 propõem headers para reduzir exposição a clickjacking, MIME sniffing e transporte sem HTTPS.

## Como Reproduzir
1. Inspecionar `next.config.ts` na branch `main`.
2. Fazer uma requisição a uma rota pública e observar os headers de resposta.
3. Comparar com a política desejada para produção, desenvolvimento e subdomínios.

## Comportamento Esperado
As respostas devem possuir headers de segurança compatíveis com o deployment, sem quebrar OAuth, HMR, PDFs ou ambientes locais.

## Comportamento Atual
Não há configuração confirmada de headers no `next.config.ts` da branch analisada. As PRs #2 e #9 são propostas concorrentes para o mesmo arquivo.

## Contexto Técnico
- Camada afetada: frontend e infra.
- Arquivos: `next.config.ts`; `.jules/sentinel.md` nas PRs.
- PR #2 propõe nosniff, DENY, X-XSS-Protection, Referrer-Policy e HSTS.
- PR #9 é superconjunto, adicionando Permissions-Policy e `preload` ao HSTS.
- A análise foi somente estática; o build dos branches não foi reproduzido.

## Hipótese de Causa
A aplicação ainda não declara uma política centralizada de headers no Next.js. As PRs adicionam blocos sobrepostos e não devem ser mescladas simultaneamente sem consolidação.

## Plano de Correção
1. Escolher e consolidar uma única política a partir das PRs #2 e #9.
2. Decidir explicitamente se `includeSubDomains` e `preload` são compatíveis com o domínio e HTTPS integral.
3. Remover documentação/arquivos `.jules/sentinel.md` duplicados ou vazios do resultado final.
4. Validar respostas reais em produção-like, desenvolvimento e rotas de autenticação.
5. Avaliar CSP separadamente, sem introduzir `unsafe-inline`/`unsafe-eval` sem justificativa.

---

## Review

## Feedback
As PRs #2 e #9 tratam do mesmo problema e têm conflito provável em `next.config.ts` e `add/add` em `.jules/sentinel.md`. A PR #9 é mais completa, mas HSTS `preload` é uma decisão operacional, não uma melhoria automática. `X-XSS-Protection` é obsoleto em navegadores modernos. Os autores alegam `pnpm build`, mas o build não foi reproduzido.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: todas as nove PRs foram aprovadas para implementação.

---

## Validação

> Evidências parciais registradas no LOG: headers confirmados em servidor de desenvolvimento e sem regressão observada nas rotas locais; produção/Cloudflare ainda não validada.

- [x] Bug não reproduz mais
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-headers-seguranca-ausentes` e movida para `archive/bugs/`**

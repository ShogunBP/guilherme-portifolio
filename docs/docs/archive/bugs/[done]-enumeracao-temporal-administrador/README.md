# 🐛 Enumeração temporal do administrador

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `alta`
**Tags:** `segurança`, `backend`, `infra`
**Resumo:** Reduzir diferença temporal na autenticação e validar headers sem comprometer HTTPS e ambientes locais.

---

## Descrição
A PR #7 aponta retorno antecipado em `src/auth.ts` quando o e-mail não corresponde ao administrador, criando possível diferença temporal entre e-mails válidos e inválidos. Também inclui headers em `next.config.ts`.

## Como Reproduzir
1. Enviar tentativas de autenticação com e-mails válidos e inválidos.
2. Medir várias amostras em condições equivalentes.
3. Observar headers de segurança em rotas públicas e administrativas.

## Comportamento Esperado
A autenticação não deve revelar validade do e-mail por tempo de resposta, e headers devem ser compatíveis com HTTPS integral, subdomínios e desenvolvimento.

## Comportamento Atual
O retorno antecipado e a ausência de hash dummy podem manter diferenças mensuráveis. A comparação incondicional proposta reduz o problema, mas não foi acompanhada de medição. HSTS com `includeSubDomains` e `preload` exige decisão operacional.

## Contexto Técnico
- Camada afetada: backend de autenticação e infra.
- Arquivos: `src/auth.ts`, `next.config.ts`, `.jules/sentinel.md`.
- A análise não executou build, benchmark ou checks da PR.

## Hipótese de Causa
O fluxo condiciona o trabalho criptográfico à validade do identificador. A política de headers foi adicionada no mesmo PR, misturando dois escopos e aumentando o risco de revisão incompleta.

## Plano de Correção
1. Separar a correção temporal da política de headers.
2. Avaliar hash dummy e comparar amostras em ambiente controlado.
3. Confirmar comportamento de `bcrypt` e tratamento assíncrono.
4. Decidir HSTS, `includeSubDomains` e `preload` com base no domínio real.
5. Testar login válido, inválido e falhas sem registrar credenciais.

---

## Review

## Feedback
A redução da enumeração temporal é plausível, mas a PR não apresenta medição independente. Headers adequados devem ser tratados no card consolidado das PRs #2 e #9. HSTS preload não deve ser aceito sem decisão humana sobre o domínio.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: todas as nove PRs foram aprovadas para implementação.

---

## Validação

> Evidências parciais registradas no LOG: comparação bcrypt assíncrona e tentativa para e-mail inválido foram revisadas; não houve medição temporal nem teste autenticado.

- [ ] Bug não reproduz mais
- [ ] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-enumeracao-temporal-administrador` e movida para `archive/bugs/`**

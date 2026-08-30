# ♻️ Remover Workflows Legados (ci.yaml, cd.yaml, issue-bot.yaml)

**Status:** `ready-for-review`
**Data:** 2026-08-30
**Prioridade:** `baixa`
**Tags:** `infra`, `dx`
**Resumo:** Remoção dos workflows legados e quebrados (ci.yaml, cd.yaml, issue-bot.yaml) mantendo apenas deploy.yml.

---

## Motivação
O repositório possuía 3 workflows herdados de templates anteriores (`cd.yaml`, `ci.yaml` e `issue-bot.yaml`) que não refletiam a arquitetura atual do projeto. O `cd.yaml` tentava realizar deploy para o Cloudflare Pages (infraestrutura não mais utilizada), o `ci.yaml` falhava devido a incompatibilidades de flags e actions deprecadas (CodeQL v2), e o `issue-bot.yaml` era desnecessário. Essas execuções geravam notificações de erro falsas a cada push no GitHub.

## Situação Atual
- Existência de múltiplos workflows legados gerando falhas nos checks do GitHub.
- Apenas [`.github/workflows/deploy.yml`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/.github/workflows/deploy.yml) (SSH direto na VPS) é o mecanismo oficial e funcional de deploy.

## Situação Desejada
- Workflows `cd.yaml`, `ci.yaml` e `issue-bot.yaml` removidos de `.github/workflows/`.
- Apenas `deploy.yml` mantido em `.github/workflows/`.

## Riscos
- Nenhum risco para a aplicação ou para o fluxo de deploy oficial, já que o deploy em produção depende exclusivamente de `deploy.yml`.

## Estratégia de Execução
1. Remoção dos arquivos `ci.yaml`, `cd.yaml` e `issue-bot.yaml`.
2. Validação da listagem de arquivos no diretório `.github/workflows/` (apenas `deploy.yml`).
3. Commit e push para o repositório remoto.

---

## Critérios de Conclusão
- [x] Arquivo `.github/workflows/cd.yaml` removido
- [x] Arquivo `.github/workflows/ci.yaml` removido
- [x] Arquivo `.github/workflows/issue-bot.yaml` removido
- [x] Arquivo `.github/workflows/deploy.yml` preservado intacto

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

- [x] Listagem de `.github/workflows/` confirmada contendo exclusivamente `deploy.yml`
- [ ] Push realizado e verificado na aba Actions do GitHub que apenas "Deploy to VPS" executa
- [ ] **Pasta renomeada para `[done]-remover-workflows-legados` e movida para `archive/refactoring/` (aguardando aprovação humana)**

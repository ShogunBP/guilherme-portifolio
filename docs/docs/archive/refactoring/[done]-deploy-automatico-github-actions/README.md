# ♻️ Deploy Automático via GitHub Actions (SSH na VPS)

**Status:** `done`
**Data:** 2026-08-30
**Prioridade:** `alta`
**Tags:** `infra`
**Resumo:** Migração do mecanismo de deploy automático para GitHub Actions via SSH com rebuild sem cache.

---

## Motivação
O mecanismo de GitOps nativo do Portainer Community (versão gratuita) possui uma limitação confirmada: ao usar `build: .` no `docker-compose.yml`, o webhook recria o container reaproveitando a imagem local em cache, sem forçar um novo build do código atualizado. Os recursos de "Force redeployment" e "Re-pull image" são exclusivos da versão Business paga do Portainer. Para garantir deploys automáticos confiáveis a cada push na branch `main`, migrou-se a responsabilidade do deploy para o GitHub Actions executando comandos diretamente na VPS via SSH.

## Situação Atual
- O deploy automático dependia do Webhook GitOps do Portainer CE, que não invalidava o cache do build Docker local na VPS.
- Alterações recentes no código não eram refletidas em produção após o push sem rebuild manual via terminal.

## Situação Desejada
- Workflow [`deploy.yml`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/.github/workflows/deploy.yml) no GitHub Actions acionado a cada push na branch `main`.
- A action `appleboy/ssh-action@v1.2.2` conecta via SSH na VPS usando credenciais seguras armazenadas em GitHub Secrets (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PROJECT_PATH`).
- Execução direta dos comandos `git pull origin main`, `docker compose build --no-cache` e `docker compose up -d --force-recreate` no diretório do projeto.

## Riscos
- **Trade-off de Segurança:** O usuário dedicado `deploy-bot` na VPS pertence ao grupo `docker` para ter permissão de gerenciar containers, o que concede acesso equivalente a root na máquina. Mitigado isolando a chave SSH apenas no GitHub Secrets do repositório e restringindo o escopo das tarefas.
- **Dependência de Secrets:** Se algum secret (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PROJECT_PATH`) estiver incorreto ou ausente, o pipeline falhará no step de conexão SSH.

## Estratégia de Execução
1. Criação do workflow [`.github/workflows/deploy.yml`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/.github/workflows/deploy.yml) com a action `appleboy/ssh-action@v1.2.2`.
2. Configuração dos 4 Secrets no repositório GitHub pelo dono do projeto (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PROJECT_PATH`).
3. Commit e push para validação da execução do workflow na aba Actions do GitHub.

---

## Critérios de Conclusão
- [x] Workflow `.github/workflows/deploy.yml` criado com sintaxe válida e action `appleboy/ssh-action@v1.2.2`
- [x] Comandos de deploy configurados com `build --no-cache` e `up -d --force-recreate`
- [x] Nenhum segredo ou dado sensível exposto em texto puro no repositório
- [x] Execução do workflow confirmada com sucesso (verde) na aba Actions do GitHub após configuração dos Secrets

---

## Review

## Feedback
> _(preencher durante o review)_

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [x] Execução do pipeline no GitHub Actions concluída com sucesso
- [x] Site em produção atualizado com as alterações mais recentes da branch `main`
- [x] **Pasta renomeada para `[done]-deploy-automatico-github-actions` e movida para `archive/refactoring/`**

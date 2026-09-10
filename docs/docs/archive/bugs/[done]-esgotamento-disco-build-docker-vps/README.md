# 🐛 Esgotamento de Disco na VPS por Acúmulo de Cache Docker e Risco de Perda de Dados via Prune de Volumes

**Status:** `done`
**Data:** 2026-09-10
**Prioridade:** `alta`
**Tags:** `infra`, `banco`
**Resumo:** Build Docker falhou com ResourceExhausted por disco 100% cheio e identificado risco crítico de perda do SQLite ao usar prune com flag --volumes.

---

## Descrição

Durante o deploy automático via GitHub Actions do commit `57e7bc3` na VPS, a etapa de build Docker falhou com `ResourceExhausted` e saída com status 17. O sistema operacional da VPS atingiu 100% de uso de disco na partição de arquivos do Docker (`/var/lib/docker/overlay2`), impedindo a criação de novos diretórios e extração de pacotes pelo gerenciador `apk`.

Adicionalmente, identificou-se que o procedimento emergencial realizado anteriormente para liberar espaço (`docker system prune -af --volumes`) trazia um risco crítico: se executado com os containers parados ou após uma falha de deploy, o Docker interpreta o volume nomeado `portfolio-data` como órfão e o remove sumariamente, apagando de forma permanente o banco de dados `portfolio.db` (onde residem as credenciais, usuários, segredos TOTP e códigos de backup).

## Como Reproduzir

1. Realizar múltiplos deploys sucessivos com a instrução `docker compose build --no-cache` configurada no `.github/workflows/deploy.yml` sem rotina de limpeza intermediária.
2. Cada execução acumula gigabytes de camadas e cache do BuildKit em `/var/lib/docker/overlay2`.
3. Ao esgotar o disco livre, qualquer tentativa de compilação ou instalação de dependências no Dockerfile (`apk add --no-cache libc6-compat python3 make g++`) falha imediatamente com `No space left on device`.
4. Executar `docker system prune -af --volumes` com a stack parada remove o volume persistente `portfolio-data`.

## Comportamento Esperado

1. O workflow de CI/CD deve realizar a limpeza prévia de caches do BuildKit (`docker builder prune -af`) e imagens descartáveis (`docker image prune -af`) antes de cada compilação, garantindo espaço livre suficiente em disco.
2. Volumes persistentes contendo o banco de dados SQLite (`portfolio-data`) **nunca** devem ser apagados por rotinas de limpeza de cache ou comandos acidentais com `--volumes`.
3. Os logs de containers devem ter limites de tamanho e retenção definidos no `docker-compose.yml` para não consumirem disco indefinidamente.

## Comportamento Atual

1. Builds executados com `docker compose build --no-cache` acumulavam cache sem descarte automático, culminando em `no space left on device` (código de saída 17).
2. O procedimento de limpeza manual utilizado continha a flag `--volumes`, expondo o banco de dados em produção a perda irreversível caso o container estivesse inativo no momento da execução.
3. Não havia limite de tamanho configurado para logs no `docker-compose.yml`.

## Contexto Técnico

- **Camada afetada:** `infra` (pipeline CI/CD, configuração Docker e integridade do banco SQLite).
- **Arquivo(s) suspeito(s) e modificados:**
  - `.github/workflows/deploy.yml`: comandos de execução SSH durante o deploy.
  - `docker-compose.yml`: configuração do serviço `portfolio` e volume `portfolio-data`.
  - `.dockerignore`: inclusão de arquivos e pastas desnecessários no build context.
- **Logs de erro reais:**
  ```text
  #6 [portfolio deps 2/5] RUN apk add --no-cache libc6-compat python3 make g++
  #6 0.704 ( 1/33) Installing libstdc++-dev (15.2.0-r5)
  #6 0.723 ERROR: libstdc++-dev-15.2.0-r5: failed to extract usr/include/c++/15.2.0/bits/gslice.h: No space left on device
  #6 0.724 ERROR: libstdc++-dev-15.2.0-r5: No space left on device
  ...
  failed to solve: ResourceExhausted: failed to prepare 16m8sanhwk44e9j0giirsbk5w as xtv0dvojj6u81cw93o8vje4tx: mkdir /var/lib/docker/overlay2/xtv0dvojj6u81cw93o8vje4tx/diff: no space left on device
  2026/09/10 05:00:51 Process exited with status 17
  ```

## Hipótese de Causa

1. **Tentativa anterior e prática identificada (refutada/arriscada):** Uso manual de `docker system prune -af --volumes` quando o disco enchia. Testado e constatado o risco: a flag `--volumes` exclui qualquer volume que não esteja montado em um container atualmente em estado `running`. Caso o container falhe ou seja pausado, os dados do SQLite são destruídos.
2. **Causa raiz confirmada:**
   - O comando `docker compose build --no-cache` gera árvores inteiras de imagens e cache no BuildKit a cada commit. Na ausência de `prune` automatizado no CI/CD, o disco de partição raiz da VPS atingiu 100% de capacidade.
   - Ausência de rotação de logs (`json-file` com `max-size`) permitia crescimento passivo de espaço ocupado.

## Plano de Correção

1. Atualizar `.github/workflows/deploy.yml` para executar rotina cirúrgica antes do build:
   - `docker builder prune -af || true`: descarta todo o cache acumulado do BuildKit.
   - `docker image prune -af || true`: descarta imagens intermediárias sem uso, preservando containers em execução.
   - `df -h /`: imprime no console do CI o espaço livre em disco para monitoramento contínuo.
   - `docker image prune -f || true`: descarta imagens anteriores após a recriação do container com sucesso.
2. Atualizar `docker-compose.yml` adicionando limites de log (`max-size: 10m`, `max-file: 3`).
3. Adicionar `scratch/` no `.dockerignore` para não poluir o contexto de build.
4. Formalizar instrução de operação segura: nunca utilizar a flag `--volumes` para limpeza de rotina em servidores de produção que usem SQLite em volumes Docker.

---

## Review

## Feedback
Solução implementada no commit `1ba01a9`. A rotina de deploy agora executa limpeza segura de cache e imagens preservando estritamente os volumes do banco de dados, reportando o espaço livre em disco no log do GitHub Actions.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> Validado com sucesso após execução do deploy no GitHub Actions com auto-prune de builder e imagens, mantendo integridade do volume persistente do SQLite.

- [x] Bug não reproduz mais
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-esgotamento-disco-build-docker-vps` e movida para `archive/bugs/`**

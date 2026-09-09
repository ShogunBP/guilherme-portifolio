# 🐛 Falha Silenciosa no Build Docker VPS por SIGSEGV no Alpine e Ausência de set -e no CI/CD

**Status:** done
**Data:** 2026-09-09
**Prioridade:** `alta`
**Tags:** `infra`, `dependências`
**Resumo:** Build Docker na VPS falhava com SIGSEGV por incompatibilidade de ABI do Node 20 com better-sqlite3 e runtime edge, mascarado por falta de set -e.

---

## Descrição

Durante o deploy da nova versão contendo o 2FA via TOTP (commit `c7299e2`), a pipeline do GitHub Actions foi marcada com status verde (sucesso), porém o ambiente de produção continuou servindo a versão anterior da aplicação (sem as rotas `/api/admin/2fa/*` e sem a tela de segurança).

Ao inspecionar os logs detalhados do container e da execução SSH via GitHub Actions, constatou-se que o comando `docker compose build --no-cache` na VPS falhou com `SIGSEGV` durante a etapa de coleta de páginas estáticas (`Collecting page data`). Como o script de deploy no workflow não possuía a instrução `set -e`, a execução continuou para a linha seguinte (`docker compose up -d --force-recreate`), recriando o container a partir da imagem anterior presente no cache local.

## Como Reproduzir

1. Submeter código para a branch `main` com `src/app/not-found.tsx` contendo `export const runtime = "edge"`.
2. O runner do GitHub Actions conecta via SSH na VPS e dispara `docker compose build --no-cache`.
3. Na imagem Docker baseada em `node:20-alpine` sem `libc6-compat`, o comando `next build` executa o worker com Turbopack.
4. Ao encontrar a declaração de runtime `edge` em `not-found.tsx`, o worker do Next.js sofre falha de segmentação:
   ```text
   #14 37.59 Collecting page data using 1 worker ...
   #14 38.18 ⚠ Using edge runtime on a page currently disables static generation for that page
   #14 38.54 ⨯ Next.js build worker exited with code: null and signal: SIGSEGV
   #14 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
   ```
5. O script SSH prossegue para `docker compose up -d --force-recreate` e sai com código 0, mascarando o erro.

## Comportamento Esperado

1. O comando `npm run build` deve compilar com sucesso dentro do container Alpine Linux sem sofrer `SIGSEGV`.
2. Caso qualquer etapa do script SSH no `.github/workflows/deploy.yml` falhe, a execução deve ser abortada imediatamente (`set -e`), reportando a falha no GitHub Actions e não subindo containers desatualizados.
3. A rota `not-found.tsx` deve ser tratada como página estática regular em modo `standalone`.

## Comportamento Atual

1. `next build` encerrava com `SIGSEGV` durante a fase de coleta de páginas estáticas no Alpine Linux.
2. O workflow de CI/CD ignorava o código de saída 1 do build e recriava o container antigo, reportando sucesso falso.
3. A produção ficava desatualizada em relação à branch `main`.

## Contexto Técnico

- **Camadas afetadas:** `infra` (pipeline de CI/CD, Dockerfile) e `frontend` (`not-found.tsx`).
- **Arquivos modificados:**
  - `.github/workflows/deploy.yml`: inclusão de `set -e`.
  - `Dockerfile`: adição de `libc6-compat` nos estágios `deps`, `builder` e `runner`, e `ENV NEXT_TELEMETRY_DISABLED=1`.
  - `src/app/not-found.tsx`: remoção de `export const runtime = "edge"`.
- **Logs de erro:**
  ```text
  deploy UNKNOWN STEP 2026-09-09T21:56:35.6118014Z #14 38.18 ⚠ Using edge runtime on a page currently disables static generation for that page
  deploy UNKNOWN STEP 2026-09-09T21:56:35.9762212Z #14 38.54 ⨯ Next.js build worker exited with code: null and signal: SIGSEGV
  deploy UNKNOWN STEP 2026-09-09T21:56:36.2105848Z #14 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
  deploy UNKNOWN STEP 2026-09-09T21:56:36.3175545Z failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
  deploy UNKNOWN STEP 2026-09-09T21:56:36.4723449Z  Container guilherme-portfolio  Recreate
  deploy UNKNOWN STEP 2026-09-09T21:56:36.7421749Z  Container guilherme-portfolio  Recreated
  deploy UNKNOWN STEP 2026-09-09T21:56:36.9694397Z ✅ Successfully executed commands to all hosts.
  ```

## Hipótese de Causa

1. **Tentativa anterior (refutada):** Suposição de que o deploy na VPS ainda não havia finalizado ou que faltavam variáveis no `.env`. Resultado real: O deploy via GitHub Actions reportava sucesso verde, mas a versão em produção não possuía os novos arquivos porque a compilação Docker havia falhado silenciosamente.
2. **Causa raiz confirmada:**
   - A dependência `better-sqlite3@13.0.3` (assim como `pdfjs-dist@5.7.284`) exige Node.js `>=22` (`EBADENGINE`). Ao tentar carregar os binários nativos C++ compilados nessa versão sob o runtime do `node:20-alpine`, o worker do Next.js disparava `SIGSEGV` durante o `Collecting page data`.
   - A declaração `export const runtime = "edge"` em `src/app/not-found.tsx` forçava inicialização desnecessária de isolamento edge em páginas estáticas.
   - A imagem `node:20-alpine` não possuía `libc6-compat` nos estágios do build.
   - O comando SSH no workflow executava comandos sequenciais em shell sem a flag `set -e`, fazendo com que falhas intermediárias do `docker compose build` fossem ignoradas e o `docker compose up` subisse o container anterior.

## Plano de Correção

1. Atualizar o `Dockerfile` para usar a imagem base `node:22-alpine` (em `deps`, `builder` e `runner`), atendendo ao requisito de engine do `better-sqlite3@13.0.3` (`>=22`).
2. Adicionar `libc6-compat` nos estágios `deps`, `builder` e `runner` do `Dockerfile`.
3. Remover `export const runtime = "edge"` de `src/app/not-found.tsx`, tornando a página 404 estática e compatível com o runtime Node.js standalone.
4. Inserir `set -e` no script do arquivo `.github/workflows/deploy.yml` para garantir que falhas de compilação encerrem a pipeline com erro imediatamente.
5. Validar o deploy na VPS confirmando a resposta HTTP das novas rotas de 2FA em produção.

---

## Review

## Feedback
> Aprovado pelo usuário para marcação como done após validação bem-sucedida do build e deploy em produção na VPS.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> Validado via GitHub Actions run 34417110827 (sucesso em 2m46s) e checagem real dos endpoints via curl/fetch (HTTP 307 em /admin/seguranca e HTTP 401 em /api/admin/2fa/status).

- [x] Bug não reproduz mais
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-falha-silenciosa-build-docker-vps-sigsegv` e movida para `archive/bugs/`**

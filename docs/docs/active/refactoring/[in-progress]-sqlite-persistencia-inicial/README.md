# ♻️ Introdução do SQLite e Persistência via Volume Docker

**Status:** `in-progress`
**Data:** 2026-08-31
**Prioridade:** `alta`
**Tags:** `backend`, `infra`, `banco`
**Resumo:** Introduzir SQLite como primeiro banco de dados do projeto, com volume Docker persistente, como base para autenticação e futuras fases de CRUD.

---

## Depende de

Nenhum card anterior — esta é a base de infraestrutura para os demais.

## Motivação
O painel admin (próximos cards desta mesma fase) precisa persistir dados que não existiam até agora no projeto: o secret TOTP do 2FA, e futuramente (Fases 4+) o próprio conteúdo editável do site (Hero, Skills, Currículo, Projects, Blog). Resolver isso com um banco de dados leve agora evita retrabalho de migrar de uma solução descartável (ex: arquivo solto) para banco de verdade depois.

## Situação Atual
O projeto não tem nenhum banco de dados. O container roda a partir de uma imagem Docker recriada do zero a cada deploy (`docker compose up -d --force-recreate`, workflow já validado na Fase 1) — qualquer dado gravado dentro do container sem um volume explícito é perdido no próximo deploy.

## Situação Desejada
SQLite configurado via `better-sqlite3` com WAL mode ativado, schema auto-inicializado e o arquivo `.db` vivendo em um **volume Docker nomeado** (`portfolio-data:/app/data`), declarado no `docker-compose.yml`, sobrevivendo a recriações do container.

## Rastreabilidade de Escolha Técnica
- Tentativa anterior (substituída): Inicialmente configurado com Prisma ORM v6. Substituído por `better-sqlite3` a pedido do dono do projeto para maior leveza, execução síncrona/direta de queries sem overhead de query engine e maior simplicidade nas próximas fases de CRUD.

## Riscos
- Se o volume não for corretamente declarado, dados parecem persistir em teste local mas se perdem no primeiro deploy real via GitHub Actions — por isso a validação desta tarefa exige testar exatamente esse cenário (derrubar/recriar o container), não só rodar local.
- Nenhum dado real será migrado nesta tarefa (é a primeira introdução do banco) — sem risco de perda de dados existentes.

## Estratégia de Execução
1. Instalar `better-sqlite3` e `@types/better-sqlite3`, configurando `serverExternalPackages` no `next.config.ts`.
2. Criar singleton em `src/lib/db.ts` com schema auto-inicializável para 2FA (`two_factor_auth`).
3. Declarar volume Docker nomeado no `docker-compose.yml` (`portfolio-data:/app/data`) e instalar build tools no `Dockerfile` (`python3 make g++`).
4. Configurar `.gitignore` para excluir o arquivo `.db` do controle de versão (dado de runtime, não código).
5. Testar localmente com `scripts/test-db.ts` (operações CRUD no SQLite).
6. Testar em produção: deploy via GitHub Actions (`--force-recreate`).

---

## Critérios de Conclusão
- [x] SQLite configurado e biblioteca de acesso escolhida (`better-sqlite3`)
- [x] Volume Docker nomeado declarado e funcionando (`portfolio-data:/app/data`)
- [x] Schema inicial criado (tabela `two_factor_auth`, extensível para uso futuro)
- [x] `.gitignore` atualizado para excluir o arquivo `.db`
- [x] Teste local de persistência (`scripts/test-db.ts`) confirmado
- [ ] Teste em produção via deploy real (`--force-recreate` do GitHub Actions) confirmado

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

- [ ] Comportamento idêntico ao anterior (nenhuma regressão no que já funcionava)
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-sqlite-persistencia-inicial` e movida para `archive/refactoring/`**

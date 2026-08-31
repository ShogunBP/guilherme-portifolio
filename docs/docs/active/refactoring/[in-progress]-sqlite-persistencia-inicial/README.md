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
SQLite configurado (via `better-sqlite3` ou Prisma com adapter SQLite — decidir durante a execução qual se integra melhor ao restante do stack) com o arquivo `.db` vivendo em um **volume Docker nomeado**, declarado no `docker-compose.yml`, sobrevivendo a recriações do container.

## Riscos
- Se o volume não for corretamente declarado, dados parecem persistir em teste local mas se perdem no primeiro deploy real via GitHub Actions — por isso a validação desta tarefa exige testar exatamente esse cenário (derrubar/recriar o container), não só rodar local.
- Nenhum dado real será migrado nesta tarefa (é a primeira introdução do banco) — sem risco de perda de dados existentes.

## Estratégia de Execução
1. Escolher entre `better-sqlite3` direto ou Prisma + adapter SQLite (avaliar qual tem melhor suporte a migrations simples, já que futuras fases vão adicionar tabelas novas)
2. Definir o schema inicial mínimo necessário para o 2FA (tabela para armazenar o secret TOTP e status de ativação)
3. Declarar volume Docker nomeado no `docker-compose.yml`, apontando para o caminho onde o arquivo `.db` é criado
4. Configurar `.gitignore` para excluir o arquivo `.db` do controle de versão (dado de runtime, não código)
5. Testar localmente: criar um registro, derrubar o container (`docker compose down`), subir de novo (`docker compose up -d`), confirmar que o registro persiste
6. Testar em produção: fazer um push disparando o workflow de deploy (`--force-recreate`), confirmar que dados gravados antes do push sobrevivem depois

---

## Critérios de Conclusão
- [x] SQLite configurado e biblioteca de acesso escolhida (Prisma + SQLite)
- [x] Volume Docker nomeado declarado e funcionando (`portfolio-data:/app/data`)
- [x] Schema inicial criado (tabela `TwoFactorAuth` para 2FA, extensível para uso futuro)
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

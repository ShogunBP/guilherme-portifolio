# 🔧 Fail-Fast no Boot se AUTH_SECRET Estiver Vazio

**Status:** done
**Data:** 2026-09-05
**Prioridade:** `alta`
**Tags:** `infra`, `segurança`
**Resumo:** Validação fail-fast no boot do container Docker para abortar imediatamente a inicialização se AUTH_SECRET estiver ausente ou vazio.

---

## Contexto
A investigação técnica confirmou que a causa raiz dos incidentes anteriores de autenticação (`MissingSecret`) foi o arquivo `.env` na VPS nunca ter tido as variáveis de auth (`AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`) definidas desde a criação inicial da pasta no host. O Docker Compose substitui variáveis `${VAR}` inexistentes por string vazia `""`, resultando em containers rodando com `AUTH_SECRET=""` silenciosamente até o momento em que um usuário tenta acessar uma rota protegida e se depara com erro de configuração.

## Problema Atual
O container inicia normalmente mesmo quando variáveis críticas como `AUTH_SECRET` estão ausentes ou vazias. O Next.js sobe e o healthcheck responde 200 na página inicial pública, mascarando a falha de infraestrutura até que alguém tente acessar `/admin` ou autenticar, gerando erros silenciosos em produção que podem passar despercebidos por dias.

## Melhoria Proposta
Implementar uma verificação de ambiente *fail-fast* executada antes da subida do servidor (`node server.js`) no container Docker:
1. Criar `scripts/check-env.js` em JavaScript puro para validar a presença e comprimento de `AUTH_SECRET` sem exigir dependências extras no runner standalone.
2. Se `AUTH_SECRET` estiver ausente ou vazio, emitir um log fatal explícito e encerrar o processo imediatamente com `process.exit(1)`.
3. Ajustar o `Dockerfile` para copiar o script para a imagem final e atualizar o `CMD` para executar `node scripts/check-env.js && node server.js`.

## Impacto Esperado
- Qualquer deploy em que o `.env` do servidor ou variáveis do Compose estejam ausentes falhará no primeiro segundo do boot, tornando o erro óbvio no `docker logs` e impedindo a operação com autenticação quebrada.
- Melhora substancial na confiabilidade e observabilidade da infraestrutura para os desenvolvedores.

## Plano de Implementação
1. Criar o script `scripts/check-env.js` com validação de `process.env.AUTH_SECRET` e mensagens de erro visíveis.
2. Atualizar o `Dockerfile` (copiar `scripts/` para o stage runner e atualizar o `CMD`).
3. Validar localmente a parada imediata (código de saída 1) quando `AUTH_SECRET` for omitido ou vazio.
4. Validar localmente a subida limpa e normal quando `AUTH_SECRET` for fornecido.
5. Fazer commit, push e validar no container de produção da VPS.

## Critérios de Conclusão
- [x] `scripts/check-env.js` criado e funcional sem dependências adicionais
- [x] `Dockerfile` copia `scripts/check-env.js` e executa a verificação antes do `server.js`
- [x] Teste local confirma encerramento imediato com código de saída 1 e mensagem fatal quando `AUTH_SECRET` está ausente
- [x] Teste local confirma inicialização bem-sucedida quando `AUTH_SECRET` está configurado
- [x] Container em produção sobe normalmente após deploy com a verificação ativa

---

## Review

## Feedback
Plano e arquitetura validados. Usuário aprovou o início da implementação em 05/09/2026.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

- [x] Melhoria perceptível e funcional
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-failfast-auth-secret-boot` e movida para `archive/enhancements/`**

# ✨ Gerenciamento de Credenciais do Admin pelo Painel

**Status:** `done`
**Data:** 2026-08-31
**Prioridade:** `baixa`
**Tags:** `frontend`, `backend`, `segurança`
**Resumo:** Permitir trocar senha e e-mail do admin pelo painel, sem depender de variável de ambiente + redeploy.

---

## Objetivo
Permitir que o administrador do portfólio altere seu e-mail e senha de login diretamente pelo painel administrativo, eliminando a dependência atual de editar variáveis de ambiente (`ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH`) e disparar um redeploy na VPS.

## Descrição Funcional
Na área de configurações do painel admin, o usuário autenticado terá um formulário para:
1. Alterar o e-mail de acesso (com validação de formato e confirmação).
2. Alterar a senha de acesso (exigindo a confirmação da senha atual e nova senha com requisitos de segurança).
Após a alteração bem-sucedida, as novas credenciais passam a valer imediatamente para os próximos logins, invalidando sessões anteriores se necessário.

## Escopo

### Inclui
- Formulário de troca de e-mail e senha dentro do painel admin.
- Validação de senha atual antes de autorizar a troca.
- Persistência das credenciais alteradas no banco de dados SQLite (`portfolio.db`).

### Não inclui (por ora)
- Recuperação de senha por e-mail tipo "Esqueci minha senha" (fluxo complexo com tokens temporários).
- Múltiplos perfis de usuário / RBAC.

## Requisitos Técnicos
- Camadas envolvidas: frontend (interface do painel), backend (Server Actions / API de autenticação), banco (tabela de credenciais no SQLite).
- Dependências ou integrações necessárias: `bcryptjs` / hashing seguro, `better-sqlite3`.
- Impactos em outras partes do sistema: a lógica de autorização no `src/auth.ts` precisará verificar se existem credenciais salvas no banco de dados antes de recorrer às variáveis de ambiente como fallback.

## Plano de Implementação
1. Definir `AdminCredential` como identidade única completa: e-mail normalizado, hash bcrypt, `credential_version`, `created_at` e `updated_at`. Não permitir registro parcial.
2. Criar a tabela SQLite e helpers síncronos para ler a fonte efetiva, validar a versão e atualizar por transação com controle otimista de concorrência.
3. Manter `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` somente como bootstrap quando não houver registro customizado. Em erro de banco, negar autenticação; não fazer fallback silencioso.
4. Refatorar o provider Credentials de `src/auth.ts` para obter e-mail, hash e versão da mesma fonte efetiva, preservando a comparação bcrypt custosa contra tentativa de enumeração temporal.
5. Definir e provar a fronteira de invalidação antes da UI: incluir `credentialVersion` nos JWTs de credenciais e OAuth e comparar a versão vigente em todas as páginas e APIs administrativas protegidas. Resolver explicitamente a separação entre `src/auth.ts` e o middleware baseado em `auth.config.ts`, sem levar `better-sqlite3` a runtime incompatível.
6. Criar endpoint autenticado para a operação sensível, exigindo senha atual, origem same-site, validação de e-mail, confirmação de senha, política mínima, limite de tamanho e rate limiting. Atualizar e-mail/senha/versão atomicamente; retornar conflito em versão concorrente.
7. Integrar o formulário à página `/admin/security`, com campos separados, estados acessíveis e mensagens que não exponham qual validação sensível falhou. Após sucesso, limpar cookies auxiliares de 2FA e encerrar a sessão atual para novo login.
8. Cobrir em harness SQLite temporário: bootstrap por ambiente, precedência customizada, banco indisponível, registro incompleto rejeitado, senha atual inválida, atualização válida, rollback, concorrência, versão de sessão antiga rejeitada, login novo, OAuth permitido e 2FA preservado.
9. Executar migração e rollback em cópia local do SQLite; não tocar no banco de produção nesta fase. Documentar procedimento administrativo explícito para remover o registro customizado se o rollback for autorizado.

## Critérios de Conclusão
- [x] Formulário de troca de credenciais acessível no painel administrativo
- [x] Validação obrigatória da senha atual antes de aplicar alterações
- [x] Novas credenciais persistidas no SQLite e válidas para o próximo login
- [x] Fallback seguro caso o banco ainda não possua credenciais customizadas

---

## Review

## Feedback
A análise aprofundada confirmou que o card é funcionalmente válido, mas exige decisões de segurança antes da implementação. A revisão seguinte consolidou as decisões recomendadas:

1. **Precedência e fallback:** um registro SQLite customizado completo é a fonte primária para login por credenciais. `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` são usados somente quando o registro ainda não existe. Registro ausente ou incompleto não deve misturar e-mail de uma fonte com hash de outra; falha de leitura do banco deve negar o login, ser registrada sem dados sensíveis e não reativar silenciosamente uma credencial antiga do ambiente.
2. **Bootstrap e rollback:** a primeira troca valida a senha atual contra a fonte efetiva e grava a identidade completa em uma transação. O rollback operacional consiste em remover explicitamente o registro customizado com procedimento administrativo controlado; não há fallback automático após a migração.
3. **Senha:** exigir senha atual, confirmação da nova senha, mínimo de 12 caracteres, ao menos uma letra e um número, nova senha diferente da atual e limite máximo de entrada antes do `bcrypt.compare`/`hash`. Nunca registrar senha ou hash.
4. **Sessões:** acrescentar `credentialVersion` monotônico ao registro e ao JWT. Toda autenticação administrativa recebe a versão vigente; cada uso de sessão protegida deve compará-la à versão atual. A documentação do Auth.js confirma que JWT não é revogado antecipadamente sem estado servidor e checagem em cada apresentação, portanto alterar somente o callback de emissão não invalida sessões existentes.
5. **Middleware:** `src/middleware.ts` usa `auth.config.ts`, separado de `src/auth.ts`, e atualmente não acessa SQLite. A implementação deve escolher uma fronteira compatível com o runtime antes de prometer invalidação imediata: validação server-side nas páginas/APIs protegidas ou mudança explícita de runtime/arquitetura. Não importar `better-sqlite3` no middleware sem prova de compatibilidade.
6. **OAuth:** Google e GitHub continuam autorizados pelas variáveis de ambiente próprias. A troca do e-mail de credenciais não amplia automaticamente a allowlist OAuth. Sessões OAuth também recebem `credentialVersion` e são invalidadas após troca, pois concedem o mesmo acesso administrativo.
7. **Interface:** integrar a troca à página existente `/admin/security`, separando alteração de e-mail e senha quando possível, com mensagens genéricas e reautenticação/saída após sucesso. O endpoint deve exigir sessão, senha atual e proteção contra requisições cross-site, além de rate limiting proporcional para a operação sensível.
8. **Concorrência e auditoria:** a atualização deve ser transacional e condicional à versão lida para impedir duas trocas concorrentes de sobrescreverem uma à outra. Registrar apenas resultado, instante e versão, sem e-mail completo, senha, hash, token ou segredo.

O escopo permanece limitado à identidade administrativa única; recuperação por e-mail e RBAC continuam fora. Antes da aprovação, o plano deve incorporar essas decisões e explicitar a fronteira de invalidação de sessão.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Aprovação e autorização de início registradas em 2026-10-28. O card deve permanecer `in-progress` até validação humana final.

---

## Validação

Validação humana autorizada em 2026-10-29 após o QA local completo. A sessão antiga paralela e OAuth externo não foram exercitados ponta a ponta, conforme registrado no LOG; essas limitações foram aceitas ao autorizar a conclusão do card.

- [x] Todos os critérios de conclusão atendidos
- [x] Testado manualmente do ponto de vista do usuário
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-admin-troca-credenciais` e movida para `archive/features/`**

# ✨ Gerenciamento de Credenciais do Admin pelo Painel

**Status:** `draft`
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
1. _(a detalhar quando o card for priorizado para execução)_

## Critérios de Conclusão
- [ ] Formulário de troca de credenciais acessível no painel administrativo
- [ ] Validação obrigatória da senha atual antes de aplicar alterações
- [ ] Novas credenciais persistidas no SQLite e válidas para o próximo login
- [ ] Fallback seguro caso o banco ainda não possua credenciais customizadas

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

- [ ] Todos os critérios de conclusão atendidos
- [ ] Testado manualmente do ponto de vista do usuário
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-admin-troca-credenciais` e movida para `archive/features/`**

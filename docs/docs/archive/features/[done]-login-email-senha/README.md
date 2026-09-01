# ✨ Login via Email e Senha (Auth.js)

**Status:** `done`
**Data:** 2026-08-31
**Prioridade:** `alta`
**Tags:** `backend`, `frontend`, `segurança`
**Resumo:** Autenticação por email e senha para um único usuário fixo, sem cadastro público, usando Auth.js.

---

## Depende de

`[draft]-sqlite-persistencia-inicial` não é pré-requisito direto deste card (a credencial de login vem de variável de ambiente, não do banco) — pode ser executado em paralelo ou antes, mas o card de 2FA (mais adiante nesta mesma fase) depende deste estar concluído.

## Objetivo
Permitir que o dono do portfólio acesse `/admin` com email e senha, sem expor cadastro público nem gerenciar múltiplos usuários.

## Descrição Funcional
Tela de login em `/admin` (ou rota de login associada) com campos de email e senha. A credencial correta é fixa, vinda de variável de ambiente — não há tabela de usuários. Login incorreto mostra erro genérico (não revela se o e-mail existe ou não, por segurança). Login correto cria uma sessão JWT.

## Escopo

### Inclui
- Configuração inicial do Auth.js (NextAuth v5) no projeto.
- Provider Credentials configurado, validando contra `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` (hash bcrypt/argon2).
- Script one-off para gerar o hash da senha a partir de um texto (rodado uma vez, manualmente, para configurar a variável de ambiente).
- Tela de login em `/admin`.
- Sessão via JWT.
- Configuração de cookies seguros atrás do proxy Nginx (confiar em `X-Forwarded-Proto`, necessário para a sessão persistir corretamente em produção).
- Middleware protegendo rotas sob `/admin` (redireciona para login se não houver sessão válida).
- `NEXTAUTH_SECRET` e `NEXTAUTH_URL` configurados.

### Não inclui
- Login social (card separado).
- 2FA (card separado, depende deste).
- Layout completo do painel pós-login (card separado) — após login bem-sucedido nesta tarefa, uma página simples de confirmação/placeholder é suficiente para validar o fluxo.
- "Esqueci minha senha" (não se aplica a usuário único fixo via env var).

## Requisitos Técnicos
- **Camadas envolvidas:** frontend (tela de login) e backend (Auth.js, callbacks, middleware).
- **Dependências novas:** `next-auth@beta` (v5), `bcryptjs` ou `argon2`.
- **Variáveis de ambiente novas:** `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — todas configuradas na stack do Portainer, nunca commitadas.
- **Impactos em outras partes do sistema:** nenhum impacto no site público existente.

## Plano de Implementação
1. Instalar Auth.js (v5) e configurar o provider Credentials.
2. Criar script one-off para gerar `ADMIN_PASSWORD_HASH`.
3. Implementar tela de login em `/admin`.
4. Configurar cookies seguros atrás do proxy Nginx.
5. Implementar middleware de proteção das rotas `/admin/*`.
6. Página placeholder pós-login para validar o fluxo completo.

## Critérios de Conclusão
- [x] Login com credencial correta gera sessão válida e redireciona para `/admin`
- [x] Login com credencial incorreta mostra erro genérico, sem revelar detalhes
- [x] Acesso direto a `/admin/qualquer-rota` sem sessão redireciona para login (`src/middleware.ts`)
- [x] Script one-off de geração de hash (`scripts/hash-password.ts`) criado e testado
- [x] Sessão configurada via JWT com `trustHost: true` para compatibilidade com proxy Nginx
- [x] Sessão validada em ambiente local com automação via DevTools/Browser Agent e pronta para deploy em produção
- [x] Variáveis sensíveis documentadas e preparadas para a stack do Portainer / ambiente de produção

---

## Review

## Feedback
> Login via credenciais e proteção de rotas testados com sucesso via navegador automatizado (login, renderização do dashboard, bloqueio e logout).

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

- [x] Todos os critérios de conclusão atendidos
- [x] Testado manualmente do ponto de vista do usuário
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-login-email-senha` e movida para `archive/features/`**

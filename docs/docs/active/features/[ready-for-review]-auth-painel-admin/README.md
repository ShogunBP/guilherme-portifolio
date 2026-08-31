# ✨ Autenticação + Esqueleto do Painel Admin

**Status:** `ready-for-review`
**Data:** 2026-08-31
**Prioridade:** `alta`
**Tags:** `frontend`, `backend`, `segurança`
**Resumo:** Sistema de login único com email/senha, social e 2FA TOTP com esqueleto de navegação do painel admin.

---

## Objetivo
Todo o gerenciamento de conteúdo das fases seguintes (i18n, CRUD de Hero/Skills/Currículo, Projects, Blog, Guestbook) depende da existência de uma área administrativa protegida por autenticação segura. Esta fase estabelece a fundação: autenticação robusta (com suporte a credenciais, login social e 2FA TOTP) e a estrutura de navegação do painel administrativo, mantendo as seções com conteúdo placeholder antes da introdução dos formulários de edição reais.

## Descrição Funcional
O administrador acessa `/admin` e é recebido por uma interface de login com duas opções: email+senha ou login social (Google/GitHub). O acesso é restrito exclusivamente à conta do dono do portfólio (sem cadastro público). Após a validação do primeiro fator, é exigido um código TOTP de 6 dígitos (2FA via autenticador como Google Authenticator ou 1Password) antes de liberar a sessão. Uma vez autenticado, o administrador tem acesso ao layout do painel com navegação entre as 6 seções principais (Hero, Skills, Currículo, Projetos, Idioma, Guestbook).

## Escopo

### Inclui
- Login via email e senha com credenciais configuradas via variáveis de ambiente (sem necessidade de banco de dados para tabela de usuários).
- Login social via Google e GitHub, com callback de verificação restringindo o acesso exclusivamente ao `ADMIN_EMAIL`.
- Segundo fator de autenticação (2FA) via TOTP, obrigatório após o primeiro fator.
- Gerenciamento de sessão segura via JWT.
- Proteção de rotas sob `/admin` via Middleware do Next.js (redirecionamento automático para `/admin/login` caso não autenticado).
- Layout base do painel administrativo (sidebar/header de navegação entre as 6 seções: Hero, Skills, Currículo, Projetos, Idioma, Guestbook), utilizando a identidade visual existente (Tailwind CSS, ShadCN UI).
- Páginas estruturais de placeholder para cada seção com rotas navegáveis.

### Não inclui
- Formulários de edição e persistência de dados reais (escopo das Fases 3 a 9).
- Fluxo de recuperação de senha "Esqueci minha senha" (usuário único configurado via ambiente).
- Sistema de cadastro de múltiplos usuários ou controle de permissões por roles.

## Requisitos Técnicos
- **Camadas envolvidas:** frontend (telas de login, desafio 2FA e layout do painel) e backend (rotas de auth, callbacks e validação TOTP).
- **Biblioteca de Autenticação:** Auth.js (NextAuth v5) com providers `Credentials`, `Google` e `GitHub`.
- **Validação de Hash e 2FA:** biblioteca de hashing de senhas (`bcryptjs`/`argon2`) e validação de tokens TOTP (`otpauth`/`speakeasy`).
- **Variáveis de Ambiente:** `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`.
- **Impacto no site público:** nenhum impacto visual ou funcional nas páginas públicas existentes.

## Plano de Implementação
1. Instalar e configurar Auth.js (NextAuth v5) com os providers de Credenciais, Google e GitHub.
2. Criar script auxiliar para geração inicial do hash de senha (`ADMIN_PASSWORD_HASH`) e secret TOTP (`ADMIN_TOTP_SECRET`).
3. Implementar callback `signIn` validando a correspondência estrita com `ADMIN_EMAIL`.
4. Implementar tela e fluxo de desafio 2FA com validação de token TOTP.
5. Criar `middleware.ts` para proteção de todas as rotas sob `/admin` (exceto login).
6. Construir o layout do painel admin com navegação responsiva e suporte a tema dark/light.
7. Criar as páginas placeholder para as 6 seções: Hero, Skills, Currículo, Projetos, Idioma e Guestbook.
8. Documentar instruções de setup inicial dos secrets e pareamento do 2FA.

## Critérios de Conclusão
- [ ] Login via email/senha funcional com credenciais validadas via variáveis de ambiente
- [ ] Login via Google e GitHub funcional e restrito exclusivamente ao `ADMIN_EMAIL`
- [ ] Desafio 2FA TOTP obrigatório e validado com sucesso após o primeiro fator
- [ ] Middleware bloqueando acessos não autenticados a `/admin/*`
- [ ] Layout do painel administrativo navegável entre as 6 seções (Hero, Skills, Currículo, Projetos, Idioma, Guestbook)
- [ ] Nenhuma credencial ou segredo versionado no repositório Git

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
- [ ] Testado manualmente o fluxo de autenticação e navegação
- [ ] Nenhuma regressão identificada no site público
- [ ] **Pasta renomeada para `[done]-auth-painel-admin` e movida para `archive/features/`**

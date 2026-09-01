# ✨ Login via Email e Senha (Auth.js)

**Status:** `ready-for-review`
**Data:** 2026-08-31
**Prioridade:** `alta`
**Tags:** `backend`, `frontend`, `segurança`
**Resumo:** Autenticação por email e senha para usuário único fixo via variáveis de ambiente com Auth.js v5 e proteção de rotas.

---

## Objetivo
Permitir que o administrador do portfólio acesse a área restrita `/admin` autenticando-se com e-mail e senha, sem expor cadastro público e sem necessidade de tabela de usuários no banco de dados.

## Descrição Funcional
- Ao acessar qualquer rota restrita sob `/admin` sem estar autenticado, o usuário é interceptado pelo middleware e redirecionado para `/admin/login`.
- A tela `/admin/login` possui visual no tema dark/glassmorphism do portfólio, com inputs para E-mail e Senha, tratamento visual de carregamento (`Autenticando...`) e banner de erro genérico para credenciais inválidas.
- A validação de credenciais compara o e-mail contra `ADMIN_EMAIL` e o hash bcrypt da senha contra `ADMIN_PASSWORD_HASH`.
- Ao autenticar com sucesso, o Auth.js emite um token de sessão JWT e o usuário é redirecionado para `/admin`.
- No painel `/admin`, é exibido o cabeçalho administrativo com o e-mail logado, atalho para o site público e botão de logout.
- Ao clicar em **Sair**, a sessão é revogada e o usuário é redirecionado de volta para `/admin/login`.

## Escopo

### Inclui
- Configuração do Auth.js (NextAuth v5 beta) com suporte a edge middleware e runtime Node.js.
- Provider Credentials configurado em `src/auth.ts`, com comparação segura via `bcryptjs`.
- Configuração do manipulador de API NextAuth em `src/app/api/auth/[...nextauth]/route.ts`.
- Middleware de autorização em `src/middleware.ts` protegendo o prefixo `/admin/:path*` e impedindo acesso de usuários não logados.
- Tela de login responsiva e estilizada em `src/app/admin/login/page.tsx`.
- Painel administrativo base com verificação de sessão e botão de logout em `src/app/admin/page.tsx`.
- Script CLI utilitário one-off `scripts/hash-password.ts` para geração de hashes bcrypt com segurança.
- Configuração de `trustHost: true` para suportar proxies reversos Nginx em produção.
- Documentação de variáveis de ambiente no `docker-compose.yml` e `.env.example`.

### Não inclui
- Login social com Google e GitHub (escopo da Subfase 2.3).
- Segundo fator de autenticação 2FA/TOTP (escopo da Subfase 2.4).
- Formulários completos de CRUD de cada seção do painel (escopos das Fases 3 a 8).
- Recuperação de senha por e-mail ("esqueci minha senha"), por tratar-se de credencial única controlada via variáveis de ambiente do servidor.

## Requisitos Técnicos
- **Camadas envolvidas:** Frontend (`src/app/admin/login/page.tsx`, `src/app/admin/page.tsx`) e Backend (`src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`).
- **Dependências instaladas:** `next-auth@beta` (^5.0.0-beta.25), `bcryptjs` (^3.0.3), `@types/bcryptjs` (^2.4.6).
- **Variáveis de ambiente requeridas:**
  - `AUTH_SECRET`: chave secreta para assinatura dos tokens JWT.
  - `ADMIN_EMAIL`: e-mail oficial do administrador (ex: `admin@guilhermemenezes.dev`).
  - `ADMIN_PASSWORD_HASH`: hash bcrypt da senha (ex: gerado via `npx tsx scripts/hash-password.ts`).
  - `NEXTAUTH_URL`: URL base da aplicação (ex: `http://localhost:3000` em dev / `https://guilhermemenezes.dev` em prod).

## Plano de Implementação
1. Instalar `next-auth@beta` e `bcryptjs`.
2. Criar configuração edge-safe (`src/auth.config.ts`) e singleton de autenticação Node.js (`src/auth.ts`).
3. Criar route handler do Auth.js (`src/app/api/auth/[...nextauth]/route.ts`).
4. Criar middleware de proteção (`src/middleware.ts`).
5. Criar script utilitário de hash (`scripts/hash-password.ts`).
6. Criar página de login (`src/app/admin/login/page.tsx`).
7. Criar casca do dashboard (`src/app/admin/page.tsx`).
8. Validar o fluxo ponta a ponta com agente navegador automatizado.

---

## Rastreabilidade de Tentativas e Diagnósticos

### Tentativa 1 (refutada) — Hash corrompido por interpolação de variáveis no PowerShell
- **O que foi feito:** O hash bcrypt inicial foi gerado via comando inline no PowerShell (`node -e "..."`) e colado no `.env.local`.
- **Resultado real:** O PowerShell interpretou o prefixo `$2b` e `$12` como variáveis de ambiente nulas durante a execução, gerando uma string de hash corrompida (`$2b$12$X3Ht62bZbp99b5E05OLSku6Z...`) que não correspondia à senha `admin`.
- **Correção aplicada:** Criado o script seguro [`scripts/hash-password.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/scripts/hash-password.ts) para gerar hashes sem interferência do shell. O hash correto para `admin` foi gerado como `$2b$12$9N/2LStr96zF9jaBidrt9u0sUUZq0pWivH2J19e1jJK0jnFSifRHm`.

### Tentativa 2 (refutada) — Interpolação de `$` no parser de `.env` do Next.js
- **O que foi feito:** A variável foi configurada no `.env.local` com aspas duplas: `ADMIN_PASSWORD_HASH="$2b$12$9N/..."`.
- **Resultado real:** O parser nativo de arquivos `.env` do Next.js interpreta símbolos `$` dentro de aspas duplas como interpolação de variáveis. Os blocos `$2b`, `$12` e `$9N` foram removidos em tempo de execução, truncando o hash de 60 para 51 caracteres (`hashPreview: /2LStr96zF`), fazendo `bcrypt.compareSync` falhar.
- **Diagnóstico e confirmação:** Criado endpoint de teste que revelou `hashLength: 51` e `isMatch: false`.
- **Correção aplicada:** Os caracteres `$` foram escapados no `.env.local` como `ADMIN_PASSWORD_HASH=\$2b\$12\$9N...`. O teste de diagnóstico confirmou `hashLength: 60`, `hashPreview: $2b$12$9N/` e `isMatch: true`. Adicionalmente, adicionada sanitização defensiva de aspas em `src/auth.ts`.

### Tentativa 3 (refutada) — Submissão de formulário via `useActionState` vs campos controlados
- **O que foi feito:** A primeira versão da página de login utilizava Server Actions com `useActionState` e submissão direta do `FormData`.
- **Resultado real:** Em testes de automação e no React 19, eventos de dispatch customizados em inputs não-controlados deixavam campos vazios durante chamadas programáticas `requestSubmit()`, ativando a validação nativa de `required`.
- **Correção aplicada:** A página [`src/app/admin/login/page.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/login/page.tsx) foi refatorada para formulário controlado com `useState`, `onSubmit` e chamada client-side a `signIn('credentials', { email, password, redirect: false })`, permitindo feedback instantâneo de erro e transição suave via `router.push('/admin')`.

---

## Evidências da Implementação e Testes

### 1. Configuração do Auth.js (`src/auth.ts`)
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = String(credentials.email).trim().toLowerCase()
        const password = String(credentials.password)

        const adminEmail = (process.env.ADMIN_EMAIL || '')
          .replace(/^["']|["']$/g, '')
          .trim()
          .toLowerCase()
        const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH || '')
          .replace(/^["']|["']$/g, '')
          .trim()

        if (!adminEmail || !adminPasswordHash) {
          console.error('[Auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured in environment')
          return null
        }

        if (email !== adminEmail) {
          return null
        }

        const isValid = bcrypt.compareSync(password, adminPasswordHash)
        if (!isValid) {
          return null
        }

        return {
          id: 'admin',
          email: adminEmail,
          name: 'Administrator',
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
})
```

### 2. Middleware de Proteção de Rotas (`src/middleware.ts`)
```typescript
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: ['/admin/:path*'],
}
```

### 3. Teste Automatizado com Navegador (Chrome DevTools MCP)
- **Redirecionamento não autenticado:** Navegação para `http://localhost:3000/admin` redirecionou com sucesso para `http://localhost:3000/admin/login?callbackUrl=...`.
- **Autenticação:** Submissão de `admin@guilhermemenezes.dev` e senha `admin` resultou em login válido e redirecionamento imediato para `http://localhost:3000/admin`.
- **Dashboard Renderizado:** Exibiu cabeçalho administrativo, badge de "Sessão Ativa (Auth.js v5 JWT)", e os 6 cards de módulos previstos para as próximas fases.
- **Logout:** Clique no botão "Sair" encerrou a sessão JWT e retornou à tela `/admin/login`.

---

## Critérios de Conclusão
- [x] Login com credencial correta gera sessão válida e redireciona para `/admin`
- [x] Login com credencial incorreta mostra erro genérico, sem revelar detalhes
- [x] Acesso direto a `/admin/qualquer-rota` sem sessão redireciona para login (`src/middleware.ts`)
- [x] Script one-off de geração de hash (`scripts/hash-password.ts`) criado e testado
- [x] Sessão configurada via JWT com `trustHost: true` para compatibilidade com proxy Nginx
- [x] Sessão validada localmente via automação com navegador Chrome DevTools
- [x] Variáveis sensíveis (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) mapeadas e documentadas

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
- [ ] **Pasta renomeada para `[done]-nome-da-feature` e movida para `archive/features/`**

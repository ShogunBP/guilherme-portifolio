# ✨ Login via Email e Senha (Auth.js)

**Status:** `done`
**Data:** 2026-08-31
**Prioridade:** `alta`
**Tags:** `backend`, `frontend`, `segurança`
**Resumo:** Autenticação por email e senha para usuário único fixo via variáveis de ambiente com Auth.js v5, hash em Base64 e proteção de rotas.

---

## Objetivo
Permitir que o administrador do portfólio acesse a área restrita `/admin` autenticando-se com e-mail e senha, sem expor cadastro público e sem necessidade de tabela de usuários no banco de dados.

## Descrição Funcional
- Ao acessar qualquer rota restrita sob `/admin` sem estar autenticado, o usuário é interceptado pelo middleware e redirecionado para a URL limpa `/admin/login` (sem expor `?callbackUrl` na barra de navegação).
- A tela `/admin/login` possui visual no tema dark/glassmorphism do portfólio, com inputs para E-mail e Senha, tratamento visual de carregamento (`Autenticando...`) e banner de erro genérico para credenciais inválidas.
- A validação de credenciais compara o e-mail contra `ADMIN_EMAIL` e o hash bcrypt da senha decodificado de Base64 contra `ADMIN_PASSWORD_HASH`.
- Ao autenticar com sucesso, o Auth.js emite um token de sessão JWT e o usuário é redirecionado para `/admin`.
- No painel `/admin`, é exibido o cabeçalho administrativo com o e-mail logado, atalho para o site público e botão de logout.
- Ao clicar em **Sair**, a sessão é revogada e o usuário é redirecionado de volta para `/admin/login`.

## Escopo

### Inclui
- Configuração do Auth.js (NextAuth v5 beta) com suporte a edge middleware e runtime Node.js.
- Provider Credentials configurado em `src/auth.ts`, com comparação segura via `bcryptjs` e decodificação automática de hash em Base64.
- Configuração do manipulador de API NextAuth em `src/app/api/auth/[...nextauth]/route.ts`.
- Middleware de autorização em `src/middleware.ts` protegendo o prefixo `/admin/:path*` e redirecionando para URL limpa `/admin/login`.
- Página de erro mapeada em `pages.error: '/admin/login'` em `src/auth.config.ts`, evitando telas cruas do framework.
- Tela de login responsiva e estilizada em `src/app/admin/login/page.tsx`.
- Painel administrativo base com verificação de sessão e botão de logout em `src/app/admin/page.tsx`.
- Script CLI utilitário `scripts/hash-password.ts` gerando hash bcrypt codificado em Base64 (imune a interpolações de `$` e `\` entre Windows, Linux e Docker).
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
  - `ADMIN_PASSWORD_HASH`: hash bcrypt codificado em Base64 (gerado via `npx tsx scripts/hash-password.ts`).
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
9. Executar auditoria técnica completa e aplicar as 5 correções de segurança, robustez e limpeza (`dev/auth-audit-corrections.md`).

---

## Rastreabilidade de Tentativas e Diagnósticos

### Tentativa 1 (refutada) — Hash corrompido por interpolação de variáveis no PowerShell
- **O que foi feito:** O hash bcrypt inicial foi gerado via comando inline no PowerShell (`node -e "..."`) e colado no `.env.local`.
- **Resultado real:** O PowerShell interpretou o prefixo `$2b` e `$12` como variáveis de ambiente nulas durante a execução, gerando uma string de hash corrompida (`$2b$12$X3Ht62bZbp99b5E05OLSku6Z...`) que não correspondia à senha `admin`.
- **Correção aplicada:** Criado o script seguro [`scripts/hash-password.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/scripts/hash-password.ts) para gerar hashes sem interferência do shell.

### Tentativa 2 (refutada) — Interpolação de `$` no parser de `.env` do Next.js
- **O que foi feito:** A variável foi configurada no `.env.local` com aspas duplas: `ADMIN_PASSWORD_HASH="$2b$12$9N/..."`.
- **Resultado real:** O parser nativo de arquivos `.env` do Next.js interpreta símbolos `$` dentro de aspas duplas como interpolação de variáveis. Os blocos `$2b`, `$12` e `$9N` foram removidos em tempo de execução, truncando o hash de 60 para 51 caracteres (`hashPreview: /2LStr96zF`), fazendo `bcrypt.compareSync` falhar.
- **Correção inicial (workaround):** Os caracteres `$` foram escapados como `\$2b...`.
- **Diagnóstico da auditoria:** O caractere `\` é tratado como literal no Docker Compose da VPS Linux, gerando incompatibilidade silenciosa em produção.
- **Correção definitiva:** Hash codificado em Base64 no script `scripts/hash-password.ts` e decodificado automaticamente em `src/auth.ts`. Strings em Base64 contêm apenas caracteres alfanuméricos, eliminando totalmente qualquer problema de interpolação ou escape entre Windows, Linux e Docker.

### Tentativa 3 (refutada) — Submissão de formulário via `useActionState` vs campos controlados
- **O que foi feito:** A primeira versão da página de login utilizava Server Actions com `useActionState` e submissão direta do `FormData`.
- **Resultado real:** Em testes de automação e no React 19, eventos de dispatch customizados em inputs não-controlados deixavam campos vazios durante chamadas programáticas `requestSubmit()`, ativando a validação nativa de `required`.
- **Correção aplicada:** A página [`src/app/admin/login/page.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/login/page.tsx) foi refatorada para formulário controlado com `useState`, `onSubmit` e chamada client-side a `signIn('credentials', { email, password, redirect: false })`, permitindo feedback instantâneo de erro e transição suave via `router.push('/admin')`.

### Tentativa 4 (Auditoria e Correções Pós-Auditoria — `dev/auth-audit-corrections.md`)
- **Remoção de debug log em produção:** Removido o bloco `console.log('[Auth Debug]', ...)` de `src/auth.ts`, garantindo que metadados e tamanho de senhas não sejam logados nos servidores.
- **URL de login limpa:** Substituído `return false` em `src/auth.config.ts` por `Response.redirect(new URL('/admin/login', nextUrl))`, eliminando a poluição de `?callbackUrl` na barra de navegação do browser.
- **Mapeamento de erro:** Adicionado `error: '/admin/login'` em `pages` do `src/auth.config.ts` para que falhas internas não exponham a tela `/api/auth/error`.
- **Limpeza de código morto e variáveis:** Deletado o arquivo `src/app/admin/login/actions.ts` (sem imports) e removida a linha `- NEXTAUTH_SECRET=${AUTH_SECRET}` do `docker-compose.yml`.

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
        const adminPasswordHashRaw = (process.env.ADMIN_PASSWORD_HASH || '')
          .replace(/^["']|["']$/g, '')
          .trim()

        // Decodifica Base64 para recuperar o hash bcrypt ($2b$12$...)
        const adminPasswordHash = adminPasswordHashRaw
          ? Buffer.from(adminPasswordHashRaw, 'base64').toString('utf8')
          : ''

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

### 2. Configuração Edge-Safe com Redirecionamento Limpo (`src/auth.config.ts`)
```typescript
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isLoginPage = nextUrl.pathname === '/admin/login'

      if (isOnAdmin) {
        if (isLoginPage) {
          if (isLoggedIn) {
            return Response.redirect(new URL('/admin', nextUrl))
          }
          return true
        }
        if (isLoggedIn) {
          return true
        }
        return Response.redirect(new URL('/admin/login', nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string
      }
      return session
    },
  },
  providers: [],
  trustHost: true,
} satisfies NextAuthConfig
```

### 3. Geração de Hash em Base64 (`scripts/hash-password.ts`)
```typescript
import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts <plain-password>')
  process.exit(1)
}

const salt = bcrypt.genSaltSync(12)
const hash = bcrypt.hashSync(password, salt)
const hashBase64 = Buffer.from(hash).toString('base64')

console.log('\n========================================')
console.log('Password hash generated successfully!')
console.log('========================================')
console.log(`ADMIN_PASSWORD_HASH="${hashBase64}"`)
console.log('========================================\n')
console.log('Obs: valor armazenado em Base64. O código decodifica automaticamente antes de comparar.')
```

### 4. Bloco de Ambiente no `docker-compose.yml`
```yaml
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/portfolio.db
      - RESEND_API_KEY=${RESEND_API_KEY}
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL:-https://guilhermemenezes.dev}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
```

### 5. Testes Automatizados no Navegador (Chrome DevTools MCP)
- **URL Limpa no Bloqueio:** Acesso a `http://localhost:3000/admin` redirecionou para `http://localhost:3000/admin/login` (sem `?callbackUrl`).
- **Validação de Credenciais Inválidas:** Tentativa com senha errada exibiu banner vermelho no formulário sem redirecionar para `/api/auth/error`.
- **Autenticação com Hash Base64:** Submissão com `admin@guilhermemenezes.dev` e senha `admin` decodificou o hash Base64 no servidor, autenticou com sucesso e redirecionou para `/admin`.
- **Dashboard Renderizado:** Exibiu sessão ativa e cards do painel administrativo.
- **Logout:** Botão "Sair" encerrou a sessão e retornou para `/admin/login`.

---

## Critérios de Conclusão
- [x] Login com credencial correta gera sessão válida e redireciona para `/admin`
- [x] Login com credencial incorreta mostra erro genérico, sem revelar detalhes
- [x] Acesso direto a `/admin/qualquer-rota` sem sessão redireciona para login limpo (`/admin/login`)
- [x] Script `scripts/hash-password.ts` gera hash seguro em Base64
- [x] Decodificação de Base64 em `src/auth.ts` testada e validada
- [x] `console.log('[Auth Debug]')` removido de `src/auth.ts`
- [x] `pages.error: '/admin/login'` adicionado em `src/auth.config.ts`
- [x] Código morto `src/app/admin/login/actions.ts` removido do repositório
- [x] `NEXTAUTH_SECRET` redundante removido de `docker-compose.yml`
- [x] Sessão configurada via JWT com `trustHost: true` para proxy Nginx
- [x] Validação executada via automação no navegador com captura visual

---

## Review

## Feedback
> Validado e aprovado pelo usuário: funcionou perfeitamente em localhost e em produção (VPS).

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [x] Todos os critérios de conclusão atendidos
- [x] Testado manualmente do ponto de vista do usuário
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-nome-da-feature` e movida para `archive/features/`**

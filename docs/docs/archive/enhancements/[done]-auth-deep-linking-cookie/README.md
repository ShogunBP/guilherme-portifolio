# 🔧 Deep-linking com Cookie na Autenticação (URL Limpa + Redirecionamento Correto)

**Status:** `done`
**Data:** 2026-09-02
**Prioridade:** `alta`
**Tags:** `frontend`, `backend`, `ui-ux`
**Resumo:** Preservação da rota destino via cookie HttpOnly temporário para deep-linking pós-login sem poluição de query string na URL.

---

## Contexto
Na Subfase 2.2 (`login-email-senha`), implementou-se o fluxo de autenticação via e-mail e senha com Auth.js v5. Para manter a interface limpa e elegante, o redirecionamento padrão do Auth.js que anexava `?callbackUrl=...` na barra de endereços do navegador foi suprimido. Como resultado, o usuário vê sempre `/admin/login`.

## Problema Atual
Ao suprimir o `?callbackUrl` da URL e manter `router.push('/admin')` fixo após a autenticação, o destino original que o usuário tentou acessar antes de ser barrado é perdido. Quando o painel tiver múltiplas seções e rotas internas (ex: `/admin/projetos`, `/admin/skills`), qualquer link direto ou bookmark levaria o administrador para a raiz `/admin`, exigindo que ele navegasse manualmente até a página desejada após logar.

## Melhoria Proposta
Armazenar a rota original que o usuário tentou acessar em um cookie temporário HttpOnly (`admin_redirect`) no momento do bloqueio pelo middleware. 
Após o login com sucesso:
1. O cliente consulta uma rota utilitária interna (`/api/admin/redirect-target`) que lê o valor do cookie e o apaga do navegador.
2. O formulário de login redireciona com segurança para o destino recuperado (com fallback defensivo para `/admin`).
3. A URL de login permanece perfeitamente limpa (`/admin/login`), sem expor query parameters.

## Impacto Esperado
- **Experiência do Administrador (UX):** Links diretos para páginas internas do painel continuam funcionando mesmo quando a sessão expira, preservando o contexto de navegação.
- **Segurança:** O cookie é `HttpOnly` e `SameSite=Lax`, inacessível por scripts client-side de terceiros. A rota de destino é validada contra links externos maliciosos (`startsWith('/')`).

## Plano de Implementação
1. Ajustar o middleware em `src/middleware.ts` e `src/auth.config.ts` para gravar o cookie `admin_redirect` com `nextUrl.pathname + nextUrl.search` ao interceptar acesso não autorizado a `/admin/*`.
2. Criar a API Route `src/app/api/admin/redirect-target/route.ts` para leitura e remoção do cookie `admin_redirect`.
3. Atualizar o manipulador de submissão `handleSubmit` em `src/app/admin/login/page.tsx` para redirecionar dinamicamente ao destino retornado pela API.
4. Tratar o edge case em que usuário já logado acessa `/admin/login`, limpando o cookie residual se existir.
5. Validar o fluxo completo via automação de browser (Chrome DevTools MCP), inspecionando cookies e navegação.

---

## Evidências da Implementação e Testes

### 1. Middleware com Cookie de Redirecionamento (`src/middleware.ts`)
```typescript
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user
  const isOnAdmin = nextUrl.pathname.startsWith('/admin')
  const isLoginPage = nextUrl.pathname === '/admin/login'

  if (isOnAdmin) {
    if (isLoginPage) {
      if (isLoggedIn) {
        const response = NextResponse.redirect(new URL('/admin', nextUrl))
        response.cookies.delete('admin_redirect')
        return response
      }
      return NextResponse.next()
    }

    if (isLoggedIn) {
      return NextResponse.next()
    }

    // Usuário deslogado tentando acessar /admin ou subrota protegida
    const loginUrl = new URL('/admin/login', nextUrl)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.set('admin_redirect', nextUrl.pathname + nextUrl.search, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    return response
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
```

### 2. Endpoint de Consumo e Limpeza do Cookie (`src/app/api/admin/redirect-target/route.ts`)
```typescript
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const redirectCookie = cookieStore.get('admin_redirect')
  const redirectTo = redirectCookie?.value ?? '/admin'

  // Limpa o cookie após ler
  const response = NextResponse.json({ redirectTo })
  response.cookies.delete('admin_redirect')
  return response
}
```

### 3. Redirecionamento Dinâmico Seguro na Página de Login (`src/app/admin/login/page.tsx`)
```typescript
      try {
        const redirectRes = await fetch('/api/admin/redirect-target')
        const { redirectTo } = await redirectRes.json()
        // Segurança: só aceita destinos relativos ao próprio site
        const safeRedirect =
          redirectTo && redirectTo.startsWith('/') ? redirectTo : '/admin'
        router.push(safeRedirect)
      } catch {
        router.push('/admin')
      }
      router.refresh()
```

### 4. Validação com Agente Navegador (Chrome DevTools MCP / Browser Subagent)
- **Deep link para subrota:** Navegação deslogada para `http://localhost:3000/admin/projetos` redirecionou para `http://localhost:3000/admin/login` com URL limpa.
- **Armazenamento e leitura:** O cookie `admin_redirect` foi armazenado com `HttpOnly` e `SameSite=Lax`.
- **Login e Redirecionamento:** Submissão das credenciais redirecionou com sucesso de volta para `http://localhost:3000/admin/projetos`, exibindo a confirmação `"✓ Deep-linking via cookie executado com sucesso!"`.
- **Navegação de volta ao Dashboard:** Clique em "← Voltar ao Painel Geral" carregou `/admin` com sessão ativa.
- **Logout:** Botão "Sair" encerrou a sessão e redirecionou para `/admin/login`.
- **Acesso direto à raiz:** Navegação direta para `/admin` redirecionou para `/admin/login` e, após login, retornou para `/admin`.
- **Limpeza do Cookie:** O cookie `admin_redirect` é consumido e apagado imediatamente após o redirecionamento.
- **Teste de Regressão:** Credenciais incorretas continuam exibindo o banner vermelho normalmente sem expor rotas de erro.
- **Gravação do Teste:** Sessão gravada em `auth_deep_link_test_1788399816388.webp`.

---

## Decisões e Aprendizados
- **Causa raiz real do `MissingSecret`:** O Edge Runtime em Docker Standalone (Next.js `output: 'standalone'`) isola o bundle do middleware/proxy e, no `next-auth@5.0.0-beta.32`, determinados codepaths do `@auth/core` buscam especificamente a variável de ambiente `NEXTAUTH_SECRET` no processo do container, ignorando `secret:` do objeto de configuração se `NEXTAUTH_SECRET` não estiver presente no ambiente.
- **Tentativa anterior de limpeza (refutada em prod):** Tentativa de remover `- NEXTAUTH_SECRET=${AUTH_SECRET}` do `docker-compose.yml` baseando-se apenas na documentação teórica da v5 — testado em produção, resultado: reincidência imediata do erro `MissingSecret`. A variável foi restaurada no `docker-compose.yml` para compatibilidade com o `beta.32`.
- **Correções legítimas mantidas:**
  - `secret: process.env.AUTH_SECRET` em `src/auth.config.ts`.
  - `- NEXTAUTH_SECRET=${AUTH_SECRET}` em `docker-compose.yml` (obrigatório enquanto estiver no `next-auth@^5.0.0-beta.32`).
- **Placebos eliminados com sucesso (sem regressão):**
  - `AUTH_TRUST_HOST=true` no `docker-compose.yml`: desnecessário pois `trustHost: true` já está em código.
  - `authorized() { return true }` em `src/auth.config.ts`: no-op removido, com autorização centralizada em `src/middleware.ts`.
  - `|| process.env.NEXTAUTH_SECRET` no campo `secret:` do TS: desnecessário no arquivo TS.

---

## Critérios de Conclusão
- [x] Acesso deslogado a uma sub-rota (ex: `/admin/projetos` ou `/admin`) redireciona para `/admin/login` com URL limpa (sem `?callbackUrl`)
- [x] Cookie `admin_redirect` é gravado como `HttpOnly`, `SameSite=Lax`, `Path=/` contendo o caminho original
- [x] Rota `GET /api/admin/redirect-target` lê o cookie e o apaga da resposta
- [x] Após login com sucesso, o usuário é redirecionado para a sub-rota original solicitada
- [x] Validação de segurança garante que apenas caminhos relativos iniciados com `/` são aceitos
- [x] Cookie `admin_redirect` não permanece ativo no navegador após o login
- [x] Teste de login incorreto não é afetado (sem regressão no banner de erro)

---

## Review

## Feedback
Aprovado pelo usuário após validação dos testes automatizados e limpeza de runtime pós-incidente (`dev/cleanup-auth-runtime.md`).

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

- [x] Todos os critérios de conclusão atendidos
- [x] Testado manualmente do ponto de vista do usuário
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-nome-da-melhoria` e movida para `archive/enhancements/`**

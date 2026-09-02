# 🔧 Deep-linking com Cookie na Autenticação (URL Limpa + Redirecionamento Correto)

**Status:** `ready-for-review`
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

### 4. Validação com Agente Navegador (Chrome DevTools MCP)
- **Deep link para subrota:** Navegação deslogada para `http://localhost:3000/admin/projetos` redirecionou para `http://localhost:3000/admin/login` com URL limpa.
- **Armazenamento e leitura:** O cookie `admin_redirect` foi armazenado com `HttpOnly` e `SameSite=Lax`.
- **Login e Redirecionamento:** Submissão das credenciais redirecionou com sucesso de volta para `http://localhost:3000/admin/projetos`.
- **Limpeza do Cookie:** Consulta imediata confirmou que o cookie foi consumido e deletado, retornando ao fallback `/admin` nas próximas consultas.
- **Teste de Regressão:** Credenciais incorretas continuam exibindo o banner vermelho normalmente sem expor rotas de erro.

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
- [ ] **Pasta renomeada para `[done]-nome-da-melhoria` e movida para `archive/enhancements/`**

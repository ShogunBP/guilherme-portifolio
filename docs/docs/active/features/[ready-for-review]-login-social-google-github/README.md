# ✨ Login Social (Google e GitHub) Restrito ao Dono

**Status:** `ready-for-review`
**Data:** 2026-08-31
**Prioridade:** `alta`
**Tags:** `backend`, `frontend`, `segurança`, `api`
**Resumo:** Login via Google e GitHub condicional e restrito ao dono do portfólio, com ativação dinâmica e proteção de rota.

---

## Depende de

`[done]-login-email-senha` — este card estende a mesma configuração do Auth.js já feita ali (middleware, sessão JWT, cookies seguros).

## Objetivo
Oferecer uma forma mais rápida de login (sem digitar senha) para o dono do portfólio, sem abrir a porta para cadastro público — a segurança do "usuário único" é garantida com whitelist rígida por provedor.

## Descrição Funcional
Na tela de login, os botões "Entrar com Google" e "Entrar com GitHub" são renderizados **condicionalmente** apenas se as respectivas credenciais de API estiverem configuradas no ambiente.
Ao autenticar via OAuth:
1. **Google:** O e-mail retornado é validado contra `ADMIN_GOOGLE_EMAIL` ou `ADMIN_EMAIL`.
2. **GitHub:** O username retornado (`login`) é validado contra `ADMIN_GITHUB_USERNAME` ou o e-mail contra `ADMIN_EMAIL`.
Se a conta for não autorizada, o callback `signIn` rejeita o login (`return false`), redirecionando para `/admin/login?error=AccessDenied`. A tela de login exibe um banner vermelho explicativo: *"Acesso Negado: Esta conta social não possui permissão de administrador."*

## Escopo

### Inclui
- Provedores Google e GitHub configurados dinamicamente no Auth.js (`src/auth.ts`).
- Callback `signIn` com whitelist explícita e logs de advertência para tentativas rejeitadas.
- Separação da tela de login em Server Component (`src/app/admin/login/page.tsx`) e Client Component (`src/app/admin/login/LoginForm.tsx`).
- Botões de login social estilizados com SVG vetoriais, efeitos hover e estados de carregamento.
- Tratamento e banner amigável para `AccessDenied`.
- Mapeamento das variáveis opcionais no `docker-compose.yml` e `.env.example`.

### Não inclui
- 2FA para login social (card separado no roadmap).
- Cadastro público de múltiplos usuários (acesso exclusivo do administrador).

---

## Evidências da Implementação

### 1. Provedores Dinâmicos e Whitelist (`src/auth.ts`)
```typescript
// Ativa Google apenas se as credenciais existirem
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Ativa GitHub apenas se as credenciais existirem
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )
}
```

### 2. Validação Rígida no `signIn` Callback (`src/auth.ts`)
```typescript
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') return true

      const adminEmail = (process.env.ADMIN_EMAIL || '').replace(/^["']|["']$/g, '').trim().toLowerCase()

      if (account?.provider === 'google') {
        const allowedGoogleEmail = (process.env.ADMIN_GOOGLE_EMAIL || adminEmail).replace(/^["']|["']$/g, '').trim().toLowerCase()
        const userEmail = (user.email || profile?.email || '').trim().toLowerCase()
        if (userEmail && (userEmail === allowedGoogleEmail || userEmail === adminEmail)) return true
        console.warn(`[Auth] Tentativa de login Google rejeitada para: ${userEmail}`)
        return false
      }

      if (account?.provider === 'github') {
        const adminGithubUsername = (process.env.ADMIN_GITHUB_USERNAME || '').replace(/^["']|["']$/g, '').trim().toLowerCase()
        const userEmail = (user.email || profile?.email || '').trim().toLowerCase()
        const githubLogin = String((profile as unknown as GitHubProfile)?.login || '').trim().toLowerCase()

        if ((userEmail && userEmail === adminEmail) || (adminGithubUsername && githubLogin === adminGithubUsername)) return true
        console.warn(`[Auth] Tentativa de login GitHub rejeitada: login=${githubLogin}, email=${userEmail}`)
        return false
      }

      return false
    }
```

### 3. Server Component (`src/app/admin/login/page.tsx`)
```typescript
export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = await searchParams
  const errorParam = typeof resolvedParams?.error === 'string' ? resolvedParams.error : undefined

  const availableProviders = {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  }

  return <LoginForm availableProviders={availableProviders} initialError={errorParam} />
}
```

### 4. Validações e Testes Locais
- **`npm run build`:** Compilou com código de saída 0 e tipagem 100% estrita no Next.js 16 (Turbopack).
- **Sem chaves configuradas:** A página `/admin/login` permaneceu idêntica, sem divisória e sem botões quebrados.
- **Com chaves configuradas:** A página renderizou a divisória "ou continue com", o botão "Entrar com Google" e o botão "Entrar com GitHub" com ícones estilizados e estados de loading.
- **Erro `AccessDenied`:** Acessar `/admin/login?error=AccessDenied` exibiu o banner `"Acesso Negado: Esta conta social não possui permissão de administrador."`.

---

## Critérios de Conclusão
- [x] Login social implementado condicionalmente (zero quebra quando chaves não existem)
- [x] Provider Google configurado com validação por whitelist de e-mail
- [x] Provider GitHub configurado com validação por username ou e-mail
- [x] Banner de `AccessDenied` implementado na tela de login
- [x] `docker-compose.yml` e `.env.example` atualizados com as variáveis opcionais
- [x] Compilação `npm run build` validada com sucesso
- [ ] Login via Google em produção testado com a conta autorizada
- [ ] Login via GitHub em produção testado com a conta autorizada

---

## Review

## Feedback
> _(preencher durante o review após configurar chaves no Portainer e testar em prod)_

## Decisão
- [ ] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [ ] Todos os critérios de conclusão atendidos
- [ ] Testado manualmente do ponto de vista do usuário (incluindo tentativa de rejeição com conta não autorizada)
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-login-social-google-github` e movida para `archive/features/`**

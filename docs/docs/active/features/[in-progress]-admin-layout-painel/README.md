# ✨ Layout Base do Painel e 6 Seções Placeholder

**Status:** in-progress
**Data:** 2026-09-09
**Prioridade:** `alta`
**Tags:** `frontend`, `ui-ux`
**Resumo:** Casca de navegação do painel administrativo com sidebar responsiva, header, entrada para segurança e 6 seções placeholder.

---

## Objetivo

Entregar a estrutura base de navegação e o layout responsivo do painel administrativo, acomodando as 6 seções previstas no roadmap do projeto (Hero, Skills, Currículo, Projetos, Idioma, Guestbook) e a área de Segurança, cada uma com sua rota e página placeholder.

## Descrição Funcional

1. **Layout Compartilhado:** Um layout consistente (`src/app/admin/(dashboard)/layout.tsx`) com sidebar lateral no desktop e menu expansível no mobile, utilizando a mesma identidade visual cósmica e dark glassmorphic do site público.
2. **Navegação Funcional:** Menu lateral permitindo transitar entre todas as seções e a visão geral, com destaque visual nítido para a rota ativa.
3. **Header com Contexto:** Barra superior exibindo breadcrumbs da rota atual, e-mail do usuário autenticado, link externo para visualizar o site público e botão de logout funcional.
4. **Indicador de Segurança:** Área na sidebar ou header informando o estado da segurança ("2FA Ativo" ou "2FA Inativo"), lendo o estado real ou operando com fallback enquanto os cards 1-4 são finalizados.
5. **Dashboard Principal (`/admin`):** Grid de cards visuais clicáveis direcionando para as 6 seções e para a página de Segurança.
6. **Páginas Placeholder:** Cada seção como rota autônoma exibindo um visual moderno com indicação explícita de qual fase futura do roadmap implementará sua edição real:
   - `/admin/hero` — Hero & Bio (Fase 4)
   - `/admin/skills` — Skills & Habilidades (Fase 5)
   - `/admin/curriculo` — Experiência & Currículo (Fase 6)
   - `/admin/projetos` — Projetos & Portfólio (Fase 7)
   - `/admin/idioma` — Idioma & Traduções (Fase 3)
   - `/admin/guestbook` — Guestbook & Mensagens (Fase 8)
   - `/admin/security` — Segurança & 2FA (Cards 1 a 4)

## Depende de

Cards 1 a 4 do 2FA concluídos (`[done]-2fa-basico-opcional`, `[done]-2fa-codigos-backup`, `[done]-2fa-confirmacao-seguranca`, `[done]-2fa-script-emergencia`) e autenticação básica (`[done]-login-email-senha`) ✅.

## Escopo

### Inclui

- Grupo de rotas `src/app/admin/(dashboard)/layout.tsx` para compartilhar o layout sem interferir nas telas de login (`/admin/login`) ou verificação (`/admin/verify-2fa`).
- Sidebar responsiva com navegação para as 6 seções, dashboard e segurança.
- Header com breadcrumbs, email do usuário, atalho "Ver site" e ação de logout.
- Dashboard inicial com cards visuais de acesso rápido.
- 6 páginas placeholder com design refinado, skeletons ilustrativos e avisos informativos das fases futuras.

### Não inclui (por ora)

- Nenhuma funcionalidade de edição real de dados, formulários CRUD ou persistência de conteúdo (escopo das Fases 3 a 8).

## Requisitos Técnicos

- **Camadas envolvidas:** frontend (Next.js App Router, Route Groups, Tailwind CSS, Lucide Icons, componentes ShadCN).
- **Consistência:** paleta escura cósmica (`#030014`, tons de roxo/índigo, bordas suaves, tipografia com Inter).
- **Dependências utilizadas:** `lucide-react`, `next/navigation`, `react-dom` (`createPortal`), `next/headers`.

## Rastreabilidade de Tentativas e Ajustes Técnicos

### Tentativa 1 (refutada) — Drawer mobile contido nos limites do header com `backdrop-filter`
- **O que foi feito:** O componente [`MobileSidebar.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/MobileSidebar.tsx) foi inicialmente implementado inserindo o drawer e overlay `fixed inset-0 z-50` diretamente no JSX do elemento `<header>` do layout administrativo.
- **Resultado real:** O `<header>` possui a classe Tailwind `backdrop-blur-md` (`backdrop-filter: blur(12px)`). Pela especificação CSS, qualquer elemento que utilize propriedades de filtro como `filter` ou `backdrop-filter` cria um novo *containing block* para todos os seus elementos descendentes, inclusive aqueles com `position: fixed`. Com isso, a gaveta lateral ficava restrita aos 64px de altura da barra do header, ocultando a lista de rotas de navegação.
- **Correção aplicada:** Refatorado [`MobileSidebar.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/MobileSidebar.tsx) para renderizar a gaveta através de `createPortal(drawerContent, document.body)`. O drawer agora é injetado diretamente no final do `<body>`, garantindo preenchimento de 100% da viewport e escape de quaisquer filtros ou restrições de overflow do header.

```tsx
// Trecho comprovando a correção em src/app/admin/(dashboard)/components/MobileSidebar.tsx
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function MobileSidebar({ twoFactorActive, userEmail }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-purple-600/15 border border-transparent hover:border-purple-500/20 transition-colors cursor-pointer"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && mounted && createPortal(drawerContent, document.body)}
    </>
  )
}
```

### Tentativa 2 (refutada / anomalia visual) — Sobreposição da Navbar e Footer públicos nas rotas `/admin/*`
- **O que foi feito:** O layout raiz do projeto (`src/app/layout.tsx`) renderizava `<Navbar />` e `<Footer />` incondicionalmente para toda a aplicação.
- **Resultado real:** A `Navbar` pública possui posicionamento fixo (`fixed top-0 left-0 w-full z-50`). Ao navegar em qualquer rota administrativa (`/admin`, `/admin/hero`, `/admin/login`), o menu público sobrepunha diretamente o header administrativo. Da mesma forma, o `Footer` público adicionava o rodapé do portfólio no final das páginas de administração.
- **Correção aplicada:** Adicionado o hook `usePathname()` em [`src/components/main/Navbar.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Navbar.tsx) e [`src/components/main/Footer.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Footer.tsx), interrompendo a renderização caso a rota pertença ao painel administrativo:

```tsx
// src/components/main/Navbar.tsx e src/components/main/Footer.tsx
const pathname = usePathname()
if (pathname?.startsWith('/admin')) {
  return null
}
```

---

## Implementação Realizada

### 1. Route Group `(dashboard)` e Layout Compartilhado
Criado em [`src/app/admin/(dashboard)/layout.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/layout.tsx), contendo a sidebar fixa para desktop, o header com breadcrumbs e logout Server Action com limpeza de cookies:

```tsx
// Trecho comprovando o logout seguro e limpeza de cookies em src/app/admin/(dashboard)/layout.tsx
async function handleLogout() {
  'use server'
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.delete('admin_2fa_verified')
  cookieStore.delete('admin_2fa_status')
  await signOut({ redirectTo: '/admin/login' })
}
```

### 2. Destaque Dinâmico de Rota Ativa
Implementado em [`src/app/admin/(dashboard)/components/SidebarNav.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/SidebarNav.tsx) via `usePathname()` com indicador luminoso de gradiente:

```tsx
// Trecho comprovando detecção ativa em SidebarNav.tsx
const pathname = usePathname()
const isActive = item.exact
  ? pathname === item.href
  : pathname.startsWith(item.href)
```

### 3. Migração do Dashboard e Cards 100% Clicáveis
Migrado para [`src/app/admin/(dashboard)/page.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/page.tsx), tornando todos os 7 cards do grid links interativos para suas respectivas seções:
- `/admin/security` (Segurança & 2FA)
- `/admin/hero` (Hero & Bio — Fase 4)
- `/admin/skills` (Skills & Habilidades — Fase 5)
- `/admin/curriculo` (Experiência & Currículo — Fase 6)
- `/admin/projetos` (Projetos & Portfólio — Fase 7)
- `/admin/idioma` (Idioma & Traduções — Fase 3)
- `/admin/guestbook` (Guestbook & Mensagens — Fase 8)

O arquivo antigo `src/app/admin/page.tsx` foi removido para evitar conflitos de rotas no Next.js App Router.

### 4. Criação das 6 Páginas Placeholder
Padronizadas através do componente reutilizável [`src/app/admin/(dashboard)/components/SectionPlaceholder.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/SectionPlaceholder.tsx), exibindo tag de fase, ícone de construção com pulso sutil, descrição dos entregáveis planejados e atalho de retorno ao dashboard.

---

## Critérios de Conclusão

- [x] Layout compartilhado com sidebar responsiva no desktop e menu expansível no mobile
- [x] Navegação funcional entre as 6 seções, painel geral e segurança com destaque na rota ativa
- [x] Header exibindo breadcrumbs corretos, e-mail logado, link para o site público e botão de logout
- [x] Todas as 6 páginas de seções exibem aviso visual de placeholder e a fase correta do roadmap
- [ ] Validado e testado em ambiente local e em produção na VPS

---

## Review

## Feedback
Aprovado pelo usuário em 09/09/2026. Implementação concluída e enviada no commit `9de95db`. Aguardando validação final de testes do usuário.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> Registrado em 11/09/2026 durante testes do usuário.

- **Compilação de Produção (`npm run build`):** 27 páginas estáticas e dinâmicas geradas com sucesso, com 0 erros TypeScript.
- **Navegação e Breadcrumbs:** Validados nos viewports Desktop (1280x800) e Mobile (375x700) via Chrome DevTools MCP.
- **Gaveta Mobile:** Abertura, fechamento ao clicar em links e desvinculação de contêiner testados com `createPortal`.
- **Logout Seguro:** Validação de revogação de sessão e exclusão dos cookies de 2FA.
- **Deploy:** Commit `9de95db` publicado na branch `main`.

- [ ] Todos os critérios de conclusão atendidos
- [ ] Testado manualmente do ponto de vista do usuário
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-admin-layout-painel` e movida para `archive/features/`**

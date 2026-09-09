# ✨ Layout Base do Painel e 6 Seções Placeholder

**Status:** draft
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
   - `/admin/seguranca` — Segurança & 2FA (Cards 1 a 4)

## Depende de

Independente dos cards 1 a 4 de 2FA (pode ser executado em paralelo). Depende apenas da autenticação básica já existente (`[done]-login-email-senha`).

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

## Plano de Implementação

1. Criar o layout `src/app/admin/(dashboard)/layout.tsx` com sidebar e header responsivos.
2. Criar a página de visão geral `src/app/admin/(dashboard)/page.tsx`.
3. Criar as 6 páginas placeholder:
   - `src/app/admin/(dashboard)/hero/page.tsx`
   - `src/app/admin/(dashboard)/skills/page.tsx`
   - `src/app/admin/(dashboard)/curriculo/page.tsx`
   - `src/app/admin/(dashboard)/projetos/page.tsx`
   - `src/app/admin/(dashboard)/idioma/page.tsx`
   - `src/app/admin/(dashboard)/guestbook/page.tsx`
4. Deixar preparada a rota e navegação para `src/app/admin/(dashboard)/seguranca/page.tsx`.
5. Validar navegação, breadcrumbs e logout em desktop e mobile.

## Critérios de Conclusão

- [ ] Layout compartilhado com sidebar responsiva no desktop e menu expansível no mobile
- [ ] Navegação funcional entre as 6 seções, painel geral e segurança com destaque na rota ativa
- [ ] Header exibindo breadcrumbs corretos, e-mail logado, link para o site público e botão de logout
- [ ] Todas as 6 páginas de seções exibem aviso visual de placeholder e a fase correta do roadmap
- [ ] Validado e testado em ambiente local e em produção na VPS

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
- [ ] **Pasta renomeada para `[done]-admin-layout-painel` e movida para `archive/features/`**

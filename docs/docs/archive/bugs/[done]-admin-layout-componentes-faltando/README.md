# 🐛 Componentes SidebarNav e Breadcrumb não criados pelo executor da Fase 3.2.1

**Status:** done
**Data:** 2026-09-14
**Prioridade:** `alta`
**Tags:** `frontend`
**Resumo:** O executor da Fase 3.2.1 criou layout.tsx importando SidebarNav e Breadcrumb que nunca existiram, quebrando o dev server com Module not found.

---

## Descrição

O `layout.tsx` do admin dashboard importa dois componentes que não foram criados durante a execução da Fase 3.2.1:
- `import { SidebarNav } from './components/SidebarNav'`
- `import { Breadcrumb } from './components/Breadcrumb'`

O `MobileSidebar.tsx` também importa `SidebarNav`. Nenhum dos dois arquivos existia em `src/app/admin/(dashboard)/components/`.

## Como Reproduzir

1. Rodar `npm run dev` após a execução da Fase 3.2.1
2. Abrir qualquer rota do admin no navegador
3. Observar erro no browser: `Module not found: Can't resolve './SidebarNav'` e `Module not found: Can't resolve './components/Breadcrumb'`

## Comportamento Esperado

Dev server sobe sem erros e o layout admin renderiza com sidebar de navegação e breadcrumb funcionais.

## Comportamento Atual

Dev server sobe mas qualquer rota admin retorna 500. Console do browser exibe:
```
Module not found: Can't resolve './SidebarNav'
  → src/app/admin/(dashboard)/components/MobileSidebar.tsx:7
Module not found: Can't resolve './components/SidebarNav'
  → src/app/admin/(dashboard)/layout.tsx:12
Module not found: Can't resolve './components/Breadcrumb'
  → src/app/admin/(dashboard)/layout.tsx:13
```

## Contexto Técnico

- Camada afetada: frontend
- Arquivos com import inválido:
  - `src/app/admin/(dashboard)/layout.tsx` (linhas 12–13)
  - `src/app/admin/(dashboard)/components/MobileSidebar.tsx` (linha 7)
- Arquivos faltantes:
  - `src/app/admin/(dashboard)/components/SidebarNav.tsx`
  - `src/app/admin/(dashboard)/components/Breadcrumb.tsx`

## Hipótese de Causa

O executor criou o `layout.tsx` e o `MobileSidebar.tsx` referenciando componentes de navegação planejados, mas não implementou os arquivos correspondentes — provavelmente por falta de escopo explícito no roteiro da Fase 3.2.1 sobre esses componentes de suporte.

## Plano de Correção

Criar os dois arquivos faltantes seguindo o padrão visual já estabelecido no projeto (paleta roxa/cósmica, active state por rota):
- `SidebarNav.tsx`: lista de links de navegação com active state baseado em `usePathname()`
- `Breadcrumb.tsx`: breadcrumb dinâmico baseado nos segmentos do pathname, com mapeamento de rótulos legíveis

---

## Review

## Feedback

Bug identificado durante validação da Fase 3.2.1. Componentes implementados. Em 2026-10-28, a revisão somente leitura confirmou `SidebarNav.tsx` e `Breadcrumb.tsx`, imports válidos no layout, ausência de HTTP 500 ou `Module not found` e apenas redirecionamento esperado de autenticação; o humano aprovou o encerramento pela mensagem “esta aprovado”.

## Decisão

- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

- [x] Bug não reproduz mais — `npm run dev` sobe sem erros de módulo (testado e confirmado)
- [x] Nenhuma regressão identificada — layout admin renderiza perfeitamente com sidebar e breadcrumb
- [x] `npx tsc --noEmit` sem erros após criação dos arquivos
- [x] Mover para `archive/bugs/` após aprovação do teste pelo usuário

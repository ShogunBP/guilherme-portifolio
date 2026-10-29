# 🔧 Otimizações no Painel de Traduções (Transações e Acessibilidade)

**Status:** `done`
**Data:** 2026-10-05
**Prioridade:** `baixa`
**Tags:** `frontend`, `backend`, `banco`, `ui-ux`
**Resumo:** Transação atômica em lote no SQLite para importação e suporte ao atalho Esc no modal de traduções.

---

## Contexto

A Fase 3.2.2 entregou o sistema de Exportação e Importação de traduções no painel `/admin/language`, integrando:
- Download de arquivos `.json` com filtro de categorias e idiomas.
- Upload de arquivos `.json` com cálculo de diff chave a chave.
- Gravação das substituições no SQLite e invalidação de cache SSR com `revalidatePath`.

A funcionalidade está homologada e plenamente operacional. Durante a revisão técnica do Tech Lead, foram identificadas duas oportunidades de melhoria incremental para robustez de banco e refinamento de experiência do usuário.

---

## Problema Atual

1. **Persistência Sequencial no SQLite (Ausência de Transação Explícita):**
   No endpoint [`src/app/api/admin/translations/import/confirm/route.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/api/admin/translations/import/confirm/route.ts), as alterações confirmadas são gravadas através de um loop sequencial simples:
   ```typescript
   for (const item of diff) {
     if (!item.key || !item.lang || typeof item.newValue !== 'string') continue
     if (!['pt', 'en'].includes(item.lang)) continue

     upsertOverride(item.key, item.lang, item.newValue)
     appliedCount++
   }
   ```
   Embora o volume de chaves do portfólio seja pequeno (~130 chaves) e a execução no SQLite leve poucos milissegundos, a ausência de uma transação atômica (`db.transaction`) significa que, em caso de falha inesperada ou interrupção no meio do loop, parte do diff ficaria gravada e parte não.

2. **Acessibilidade no Modal (Fechamento via Teclado):**
   No componente [`src/app/admin/(dashboard)/language/page.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/%28dashboard%29/language/page.tsx), o modal de Exportar/Importar fecha ao clicar no botão `X`, no botão `Cancelar`/`Fechar` ou no backdrop. No entanto, não há captura da tecla `Escape` (`Esc`) para fechar o modal via teclado, o que é um padrão recomendado de acessibilidade e agilidade para o usuário.

---

## Melhoria Proposta

1. **Helper de Transação no Banco:**
   Implementar em `src/lib/translations.ts` a função `upsertOverridesBatch(items: Array<{ key: string, lang: string, value: string }>)` utilizando o método nativo `db.transaction()` do `better-sqlite3`. Isso garante rollback automático total se qualquer registro falhar.

2. **Atalho de Teclado no Modal:**
   Adicionar um listener de `keydown` no `useEffect` dentro da tela `/admin/language` para que pressionar `Esc` execute `handleCloseExportImportModal()` caso o modal esteja aberto.

---

## Impacto Esperado

- **Confiabilidade no Banco:** Garantia matemática de atomicidade (ACID) na importação de traduções em lote.
- **Experiência do Usuário (UX/Acessibilidade):** Navegação mais fluida e intuitiva permitindo dispensar modais rapidamente com o teclado.

---

## Plano de Implementação

1. Criar `upsertOverridesBatch` em `src/lib/translations.ts` usando uma statement preparada dentro de `db.transaction(() => { ... })()`; o helper deve ser síncrono, conforme o contrato do `better-sqlite3`.
2. Refatorar `src/app/api/admin/translations/import/confirm/route.ts` para validar e separar itens aceitos/ignorados antes de executar o lote.
3. Preservar `appliedCount`, `ignoredCount`, a validação de chaves base e a revalidação de `/` após o commit.
4. Adicionar listener de `keydown` em `src/app/admin/(dashboard)/language/page.tsx` somente quando `modalExportImportOpen` estiver ativo; fechar apenas para `event.key === 'Escape'`.
5. Remover o listener no cleanup do `useEffect` e evitar múltiplos registros após re-renderizações.
6. Validar lote vazio, lote válido, item inválido, falha com rollback, fechamento via Esc e desmontagem sem listener residual.
7. Executar `npx tsc --noEmit` e `npm run build`; registrar separadamente qualquer falha preexistente do script `npm run lint`.

---

## Critérios de Conclusão

- [x] Importação de traduções confirmada executa dentro de uma transação SQLite atômica.
- [x] Pressionar `Esc` com o modal de Exportar/Importar aberto fecha a interface com segurança.
- [x] Nenhum listener de evento residual deixado no `window`.
- [x] `npm run build` passa sem erros de tipagem.

---

## Review

## Feedback
A análise confirmou a gravação sequencial em `route.ts`, o helper individual em `src/lib/translations.ts` e a ausência de tratamento de `Escape` para o modal de Export/Import. A mudança é isolada e adequada para execução após aprovação. A documentação atual do `better-sqlite3`, consultada via Context7, confirma commit no retorno normal e rollback quando a função transacional lança exceção; funções transacionais devem permanecer síncronas.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Aprovação humana registrada em 2026-10-28. A aprovação não autoriza o início automático da implementação.

---

## Validação

> QA autenticado concluído em 2026-10-28 no ambiente local. Seis ciclos de abertura e fechamento por `Escape` passaram; a instrumentação dinâmica registrou `add=6` e `remove=6`, sem listener residual ou duplicado. Build, harness SQLite e revisões técnicas também passaram. A autorização humana foi para finalizar a validação, não para marcar o card como done.

- [x] Melhoria perceptível e funcional
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-otimizacoes-painel-traducoes` e movida para `archive/enhancements/`**

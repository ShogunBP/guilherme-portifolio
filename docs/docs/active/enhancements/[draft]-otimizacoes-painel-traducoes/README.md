# 🔧 Otimizações no Painel de Traduções (Transações e Acessibilidade)

**Status:** `draft`
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

1. Criar `upsertOverridesBatch` em `src/lib/translations.ts` envelopado em `db.transaction(() => { ... })()`.
2. Refatorar `src/app/api/admin/translations/import/confirm/route.ts` para invocar a função em lote.
3. Adicionar listener da tecla `Escape` em `src/app/admin/(dashboard)/language/page.tsx` com limpeza adequada no desmontar do componente.
4. Validar o build e a navegação por teclado.

---

## Critérios de Conclusão

- [ ] Importação de traduções confirmada executa dentro de uma transação SQLite atômica.
- [ ] Pressionar `Esc` com o modal de Exportar/Importar aberto fecha a interface com segurança.
- [ ] Nenhum listener de evento residual deixado no `window`.
- [ ] `npm run build` passa sem erros de tipagem.

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

- [ ] Melhoria perceptível e funcional
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-otimizacoes-painel-traducoes` e movida para `archive/enhancements/`**

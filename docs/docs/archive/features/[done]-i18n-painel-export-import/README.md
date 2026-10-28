# ✨ Painel de Traduções — Export/Import (Fase 3.2.2)

**Status:** done
**Data:** 2026-09-14
**Prioridade:** `média`
**Tags:** `frontend`, `backend`, `api`
**Resumo:** Funcionalidade de exportação e importação de traduções com diff preview antes de confirmar, construída sobre o core do card 3.2.1.

---

## Objetivo

Adicionar ao painel `/admin/language` as seções de Export e Import:
- **Export:** gerar um `.json` com os valores em uso (override + fallback JSON) por categoria e idioma selecionados
- **Import:** carregar um `.json`, calcular o diff chave a chave, mostrar prévia (antes/depois) e confirmar antes de aplicar

## Depende de

Card 3.2.1 concluído (`[done]-i18n-painel-traducoes-core`) ✅ — rotas de CRUD e `src/lib/i18n-utils.ts` já existentes.

## Referência de Arquitetura

`dev/utils/reference/SISTEMA_TRADUCAO.md` — mesmo padrão do sistema de referência, com melhoria do diff antes de confirmar.

---

## Decisões de Design aplicáveis a este card

| # | Decisão |
|---|---|
| 1 | Export reflete o valor **em uso** (override do banco OU fallback do JSON) — não só overrides |
| 2 | Export com escopo: seletor de categorias (checkbox múltiplo) + idioma (PT / EN / ambos) |
| 3 | Import: diff chave a chave contra valor atual → prévia → confirmação explícita para aplicar |
| 4 | Import só aplica chaves com valor **diferente** do atual — não regrava o que não mudou |
| 5 | Rotas de export/import exigem sessão de admin |

---

## Escopo

### Inclui

- `GET /api/admin/translations/export?categories={cat1,cat2}&langs={pt,en}` — gera JSON com valores em uso, escopo selecionado
- `POST /api/admin/translations/import/preview` — recebe JSON, retorna diff sem aplicar
- `POST /api/admin/translations/import/confirm` — aplica o diff confirmado
- Seção **Export** na tela `/admin/language`: checkboxes de categoria, seletor de idioma, botão Exportar
- Seção **Import** na tela `/admin/language`: input de arquivo, botão Analisar, prévia de diff (tabela antes/depois), botão Confirmar Importação

### Não inclui

- Criação de chaves novas via import
- Categorias `projects` e `blog` (conteúdo dinâmico — Fases 5/6)

---

## Requisitos Técnicos

- Importar `flatten` de `src/lib/i18n-utils.ts` — **não redefinir** em nenhuma rota
- `GET /api/admin/translations/export`: merge `{ ...base, ...overrides }` filtrado por categoria
- `POST /api/admin/translations/import/preview`: comparar `incoming[key]` vs `overrides[key] ?? base[key]` — só retornar chaves diferentes
- `POST /api/admin/translations/import/confirm`: iterar sobre o diff confirmado e chamar `upsertOverride`
- UI de Import: duas fases distintas — fase 1 (Analisar) mostra diff; fase 2 (Confirmar) aplica

---

## Rotas

### `GET /api/admin/translations/export`

```
?categories=hero,nav    → só essas categorias (omitir = todas)
&langs=pt,en            → idiomas (omitir = ambos)
```

Retorna:
```json
{
  "pt": { "hero.role": "Desenvolvedor Full-Stack" },
  "en": { "hero.role": "Full-Stack Developer" }
}
```

### `POST /api/admin/translations/import/preview`

Body:
```json
{ "translations": { "pt": { "hero.role": "novo valor" }, "en": { ... } } }
```

Retorna:
```json
{ "diff": [{ "key": "hero.role", "lang": "pt", "currentValue": "valor atual", "newValue": "novo valor" }] }
```

### `POST /api/admin/translations/import/confirm`

Body:
```json
{ "diff": [{ "key": "hero.role", "lang": "pt", "newValue": "novo valor" }] }
```

Retorna:
```json
{ "ok": true, "applied": 1 }
```

---

## Layout das seções na tela

```
EXPORT:
  Categorias: [✓] hero [✓] nav [✓] skills [✓] experience [✓] resume [✓] footer [✓] contact
              [Selecionar todas] [Limpar]
  Idioma:     (•) PT  ( ) EN  ( ) Ambos
  [Exportar JSON]  → download do arquivo

IMPORT:
  [Escolher arquivo .json] — exibe nome do arquivo selecionado
  [Analisar]

  → (após analisar) Prévia de mudanças:
  ┌────────────────────┬──────────────┬──────────────────┬──────────────────┐
  │ Chave              │ Idioma       │ Valor atual      │ Novo valor       │
  ├────────────────────┼──────────────┼──────────────────┼──────────────────┤
  │ hero.role          │ EN           │ Full-Stack Dev   │ Full Stack Dev   │
  └────────────────────┴──────────────┴──────────────────┴──────────────────┘
  X chave(s) serão alteradas.
  [Cancelar]  [Confirmar Importação]
```

---

## Critérios de Conclusão

- [x] `GET /api/admin/translations/export` importa `flatten` de `i18n-utils`, sem redefinição local
- [x] Export de categoria `hero` em PT → arquivo com apenas chaves `hero.*` e valores em uso
- [x] Export de todas as categorias em ambos os idiomas → arquivo completo e correto
- [x] `POST /api/admin/translations/import/preview` retorna só as chaves com valor diferente
- [x] Import com 1 chave alterada → prévia mostra só 1 linha, confirmar aplica só essa
- [x] Import com arquivo idêntico ao estado atual → prévia vazia, nada é aplicado
- [x] Confirmar importação → overrides gravados, página recarrega estado do banco
- [x] Rotas exigem sessão admin — sem sessão retorna 401
- [x] `npm run build` sem erros de TypeScript
- [x] Testado em produção na VPS antes de marcar como `[done]`

---

## Review

## Feedback

Aprovado pelo usuário em 14/09/2026. Extraído do card 3.2 original para isolar o core de edição do auxiliar de export/import. Implementado e validado pelo Agente Executor conforme `dev/prompt-executor-fase-3-2-2.md`.

## Decisão

- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [x] Todos os critérios de conclusão atendidos
- [x] Export testado com escopos variados (uma categoria, todas, PT, EN, ambos)
- [x] Import testado com arquivo válido e com arquivo sem diferenças
- [x] Nenhuma regressão nos critérios do card 3.2.1
- [x] **Pasta renomeada para `[done]-i18n-painel-export-import` e movida para `archive/features/`**
- [x] Se for o último card da Fase 3, atualizar `dev/utils/ROADMAP-EXECUCAO.md`

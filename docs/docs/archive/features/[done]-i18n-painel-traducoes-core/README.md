# ✨ Painel de Traduções — Core: Edição em Tempo Real (Fase 3.2.1)

**Status:** done
**Data:** 2026-09-14
**Prioridade:** `alta`
**Tags:** `frontend`, `backend`, `i18n`, `admin`
**Resumo:** Schema SQLite, rotas de leitura/escrita e tela `/admin/idioma` com batch editing completo (editar, salvar, descartar, restaurar por campo e global). Export/Import ficam no card 3.2.2.

---

## Objetivo

Substituir o placeholder de `/admin/idioma` pela interface real de edição de traduções, com:
- Overrides persistidos no SQLite (overlay sobre `pt.json`/`en.json`)
- Site público consumindo overrides via `GET /api/translations` em tempo real
- Interface batch: editar livremente → Salvar global / Descartar / Restaurar padrão

## Depende de

Fase 3 fundação concluída (`[done]-i18n-fundacao-pt-en`) ✅ — `config.ts` com `TODO Fase 3.2` já reservado.

## Próximo card

`[approved]-i18n-painel-export-import` (Fase 3.2.2) — Export/Import de traduções.

## Referência de Arquitetura

`dev/utils/reference/SISTEMA_TRADUCAO.md` — padrão validado no projeto Thiago Bahls.

---

## Decisões de Design aplicáveis a este card

| # | Decisão |
|---|---|
| 1 | Banco SQLite armazena **apenas overrides** — `pt.json`/`en.json` são a base/fallback |
| 2 | Sem criação de chaves novas pelo painel — só edição de valores existentes |
| 3 | Painel organizado pelas 7 categorias dos JSONs |
| 4 | **Batch edit:** editar livremente → Salvar global (modal) / Descartar tudo (modal) / Descartar por categoria (sem modal) |
| 5 | **Restaurar padrão por campo:** sem confirmação, entra no draft como `to-delete` — DELETE executado só no Salvar |
| 6 | **Restaurar tudo ao padrão:** botão global com modal de confirmação, também entra no draft |
| 7 | Badge `● N alterações não salvas` no header da página, navegação livre, aviso `beforeunload` |
| 8 | `GET /api/translations` é pública — rotas de escrita exigem sessão de admin |

---

## Escopo

### Inclui

- `src/lib/i18n-utils.ts` — função `flatten` compartilhada (usada aqui e pelo card 3.2.2)
- Tabela `translation_overrides` (`key`, `lang`, `value`, `updated_at`) no SQLite
- `GET /api/translations?lang={lng}` — pública, retorna overrides ativos do idioma
- `GET /api/admin/translations` — autenticada, retorna overrides de ambos os idiomas
- `PUT /api/admin/translations` — upsert de overrides em lote
- `DELETE /api/admin/translations` — remoção de overrides em lote
- Ativar o `TODO Fase 3.2` no `config.ts`: fetch inicial + `languageChanged` com `addResourceBundle`
- Tela `/admin/idioma` completa: abas de categoria, batch editing, restaurar por campo, restaurar global, badge dirty count

> **Convenção:** `?lang=` em todas as rotas — sem exceção.

### Não inclui (→ card 3.2.2)

- `GET /api/admin/translations/export`
- `POST /api/admin/translations/import/preview`
- `POST /api/admin/translations/import/confirm`
- Seções de Export e Import na UI

---

## Requisitos Técnicos

- `src/lib/i18n-utils.ts` exporta `flatten` — Passos 4c/4d/4e do card 3.2.2 importam daqui
- Estado duplo: `committed` (banco) e `draft` (edições locais)
- `dirtyCount` skipa keys em `toDelete` para evitar double-count
- `handleSave` sincroniza `draft` com `newCommitted` após salvar

---

## Critérios de Conclusão

- [x] `src/lib/i18n-utils.ts` criado com `flatten` exportado
- [x] Schema `translation_overrides` criado sem erros
- [x] `GET /api/translations?lang=` retorna overrides sem autenticação
- [x] `config.ts` busca overrides no carregamento inicial e ao trocar idioma
- [x] Editar `hero.role` em EN pelo painel → site público reflete sem rebuild
- [x] Chave sem override exibe valor do JSON normalmente
- [x] Restaurar padrão por campo entra no draft como `to-delete`, executado no Salvar
- [x] Restaurar tudo ao padrão (modal) marca todos os overrides para delete via Salvar
- [x] Descartar tudo reverte estado local ao banco
- [x] Badge de alterações visível durante edição
- [x] Rotas de escrita retornam 401 sem sessão admin
- [x] `npm run build` sem erros de TypeScript
- [ ] Testado em produção na VPS antes de marcar como `[done]`

---

## Review

## Feedback

Aprovado pelo usuário em 14/09/2026. Card dividido de 3.2 → 3.2.1 + 3.2.2 para separar o core (edição) do auxiliar (export/import).

## Decisão

- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação e Evidências de Execução

### 1. Schema SQLite (`src/lib/db.ts`) e Helpers (`src/lib/translations.ts`)
```sql
CREATE TABLE IF NOT EXISTS translation_overrides (
  key        TEXT    NOT NULL,
  lang       TEXT    NOT NULL,
  value      TEXT    NOT NULL,
  updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (key, lang)
);

CREATE INDEX IF NOT EXISTS idx_translation_overrides_lang
  ON translation_overrides(lang);
```
- Testado via `src/lib/translations.ts`:
  - `getOverridesByLang('pt')` / `getOverridesByLang('en')`
  - `upsertOverride(key, lang, value)`
  - `deleteOverride(key, lang)`
  - `deleteAllOverrides()`

### 2. Utilitários de Transformação (`src/lib/i18n-utils.ts`)
- Funções `flatten` e `unflatten` criadas para compatibilidade total entre chaves escalares (`hero.role`) e arrays aninhados de histórico profissional (`experience.jobs.0.title`, `experience.jobs.0.achievements.0`).

### 3. Rota Pública de Overrides (`src/app/api/translations/route.ts`)
- `GET /api/translations?lang=pt` acessível sem autenticação (200 OK) retornando objeto de overrides ativos.

### 4. Integração Dinâmica no i18n (`src/i18n/config.ts`)
- `applyServerOverrides(lng)` chamada no carregamento inicial (`typeof window !== 'undefined'`) e a cada troca de idioma (`i18n.on('languageChanged')`).
- Merge via `i18n.addResourceBundle(lng, 'translation', data, true, true)` com emissão de evento reativo para atualização imediata dos componentes React.

### 5. Rotas Autenticadas do Painel Admin (`src/app/api/admin/translations/route.ts`)
- `GET`: retorna overrides por idioma ou ambos `{ pt: {...}, en: {...} }` (401 sem sessão).
- `PUT`: upsert em lote `{ updates: [{ key, lang, value }] }` (401 sem sessão).
- `DELETE`: remoção em lote `{ deletes: [{ key, lang }] }` ou `{ all: true }` (401 sem sessão).

### 6. Interface do Painel Administrativo (`src/app/admin/(dashboard)/idioma/page.tsx`)
- Visual cósmico em harmonia com `#030014`, gradientes púrpuras, vidro fumê e feedback de status.
- Navegação entre as 7 categorias: `hero`, `nav`, `skills`, `experience`, `resume`, `footer`, `contact`.
- Renderização especializada de `experience.jobs` em cards expansíveis para cada uma das 3 empresas/cargos (`SCHOTT`, `Avanth`, `CREN`), incluindo realizações.
- Suporte a edição em lote (batch), contagem reativa de `dirtyCount`, avisos `beforeunload`, descarte por categoria, descarte total com modal de confirmação e restauração global com modal de confirmação.

### 7. Testes de Integração e Ciclo Completo no Navegador
1. Acesso à rota `/admin/idioma` com autenticação.
2. Edição do campo `hero.role` em inglês para `"Senior Full-Stack Engineer"`.
3. Notificação e badge de rascunho ativados (`1 alteração não salva`).
4. Clique em "Salvar Alterações" → Modal de confirmação exibindo 1 atualização → Gravado no SQLite com sucesso.
5. Verificação na landing page pública (`http://localhost:3000`): ao selecionar English, o cargo refletiu `"Senior Full-Stack Engineer"` em tempo real sem rebuild.
6. Retorno ao painel administrativo → Clique em "Restaurar padrão" em `hero.role` → Indicador de restauração pendente exibido.
7. Confirmação do salvamento → Override excluído do SQLite.
8. Verificação na landing page pública: cargo restaurado para `"Full-Stack Developer"`.
9. `npm run build` executado com sucesso e zero erros de TypeScript.

# ♻️ Renomear rota admin /idioma para /language

**Status:** done
**Data:** 2026-09-14
**Prioridade:** `baixa`
**Tags:** `frontend`, `dx`
**Resumo:** Rota /admin/idioma renomeada para /admin/language para seguir a convenção em inglês adotada para todas as rotas e pastas do projeto.

---

## Motivação

O usuário definiu que futuramente todas as rotas e pastas do projeto serão em inglês. A rota `/admin/idioma` foi criada em português durante a Fase 3.2.1 e precisava ser alinhada à convenção antes de avançar para a Fase 3.2.2.

## Situação Atual

- Pasta: `src/app/admin/(dashboard)/idioma/`
- Referência no dashboard: `href: '/admin/idioma'`
- Referência no `SidebarNav`: `/admin/language` (criado já no padrão correto)

## Situação Desejada

- Pasta: `src/app/admin/(dashboard)/language/`
- Referência no dashboard: `href: '/admin/language'`
- Breadcrumb: segmento `language` mapeado para label `"Traduções"`
- Sidebar: item já criado com `/admin/language`

## Riscos

Baixo — a rota ainda não foi linkada externamente. Mudança puramente interna.

## Estratégia de Execução

1. Mover pasta `(dashboard)/idioma/` → `(dashboard)/language/` via `Move-Item`
2. Atualizar `href` no `page.tsx` do dashboard
3. Confirmar que nenhuma outra referência a `/admin/idioma` existe no `src/`
4. Limpar cache `.next/types` e validar com `tsc --noEmit`

## Critérios de Conclusão

- [x] Pasta movida para `(dashboard)/language/`
- [x] Href atualizado no `page.tsx`
- [x] Zero ocorrências de `/admin/idioma` no código (`grep` confirmado)
- [x] `tsc --noEmit` sem erros

---

## Review

## Feedback

Mudança solicitada pelo usuário durante validação da Fase 3.2.1 como parte da padronização de rotas em inglês. Código e rotas ajustados. Em 2026-10-28, a revisão somente leitura confirmou a pasta `language`, referências runtime em `/admin/language`, ausência de `/admin/idioma` no código e componentes de navegação presentes; o humano aprovou o encerramento pela mensagem “esta aprovado”.

## Decisão

- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

- [x] Rota `/admin/language` acessível e funcional (testado no navegador com print comprovado)
- [x] Rota `/admin/idioma` não existe mais (removida do disco e do git)
- [x] Sidebar exibe "Traduções" com link correto para `/admin/language`
- [x] Breadcrumb exibe "Traduções" ao acessar a rota
- [x] Nenhuma regressão em outras rotas do admin
- [x] Mover para `archive/refactoring/` após aprovação do teste pelo usuário

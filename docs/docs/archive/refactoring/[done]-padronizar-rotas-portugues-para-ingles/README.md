# ♻ Padronizar rotas restantes do admin para inglês

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `média`
**Tags:** `frontend`, `dx`
**Resumo:** Renomear os segmentos /admin/curriculo e /admin/projetos para URLs em inglês e impedir novas rotas em português.

---

## Motivação

O painel administrativo adotou inglês para segmentos de URL e nomes de pastas que viram rotas. A migração de `/admin/idioma` para `/admin/language` foi concluída, mas o inventário somente leitura de 2026-10-28 encontrou dois segmentos ainda expostos em português: `/admin/curriculo` e `/admin/projetos`. Consolidar a convenção agora reduz inconsistência, evita novos links divergentes e prepara os próximos módulos do painel.

Labels visíveis, títulos e conteúdo podem continuar em português. Este refactoring trata apenas de segmentos técnicos de URL e das pastas do App Router que os produzem.

## Situação Atual

Rotas vigentes em português confirmadas no código:

- `/admin/curriculo`, produzida por `src/app/admin/(dashboard)/curriculo/page.tsx`.
- `/admin/projetos`, produzida por `src/app/admin/(dashboard)/projetos/page.tsx`.

Referências runtime confirmadas:

- `src/app/admin/(dashboard)/page.tsx:54` aponta para `/admin/curriculo`.
- `src/app/admin/(dashboard)/page.tsx:63` aponta para `/admin/projetos`.
- `src/app/admin/(dashboard)/components/SidebarNav.tsx:21-22` contém os mesmos destinos.
- `src/app/admin/(dashboard)/components/Breadcrumb.tsx:11-12` reconhece os segmentos `curriculo` e `projetos`.

`/admin/language` já está em inglês. `/admin/idioma` não é rota vigente e pertence apenas ao histórico do refactoring concluído; não integra esta migração.

O middleware preserva qualquer pathname protegido no cookie `admin_redirect` (`src/middleware.ts:27-34` e `src/middleware.ts:92-100`). Esse destino reaparece após login ou 2FA em `src/middleware.ts:51-69` e `src/app/api/admin/redirect-target/route.ts:8-23`, portanto deep-linking precisa ser testado durante a troca.

## Situação Desejada

- Pasta `src/app/admin/(dashboard)/curriculo/` renomeada para `resume/`, expondo `/admin/resume`.
- Pasta `src/app/admin/(dashboard)/projetos/` renomeada para `projects/`, expondo `/admin/projects`.
- Dashboard, SidebarNav e Breadcrumb atualizados para os novos segmentos.
- Fluxos de login, cookie `admin_redirect`, 2FA e acesso direto preservam corretamente os destinos ingleses.
- Nenhuma pasta sob `src/app` que gere URL usa segmento em português.
- Labels visíveis continuam independentes da convenção técnica e podem permanecer em português.

## Riscos

- Bookmarks e links antigos para `/admin/curriculo` e `/admin/projetos` deixam de funcionar se a migração for tratada como breaking change sem redirects.
- Um cookie `admin_redirect` gravado antes da implantação pode conter uma URL antiga e redirecionar o usuário para um destino removido após login ou 2FA.
- Auth.js, middleware e 2FA preservam pathnames dinamicamente; a renomeação pode parecer correta na navegação normal e ainda falhar em deep-linking.
- Documentação histórica contém URLs antigas e não deve ser alterada indiscriminadamente nem confundida com referência runtime.
- O card arquivado `admin-rota-idioma-para-language` é precedente da convenção, mas não deve ser reaberto nem sobrepor o novo escopo.
- Deve ser decidido em review humano se as URLs antigas receberão redirect permanente/temporário ou se a mudança será intencionalmente incompatível.

## Estratégia de Execução

1. Definir em review se `/admin/curriculo` e `/admin/projetos` terão redirects de compatibilidade ou serão removidas sem fallback.
2. Renomear as pastas para `resume/` e `projects/`, com propriedade exclusiva por arquivo e sem misturar labels visíveis com segmentos técnicos.
3. Atualizar os destinos em `src/app/admin/(dashboard)/page.tsx` e `src/app/admin/(dashboard)/components/SidebarNav.tsx`.
4. Atualizar as chaves de segmento em `src/app/admin/(dashboard)/components/Breadcrumb.tsx`, preservando os labels apresentados ao usuário.
5. Auditar `src/middleware.ts`, `src/app/api/admin/redirect-target/route.ts`, `src/app/api/admin/2fa/verify/route.ts`, `src/app/api/admin/2fa/confirm-sensitive-action/route.ts`, `src/app/admin/login/LoginForm.tsx` e `src/auth.config.ts` quanto a deep-linking e contratos de redirect; alterar somente se existir referência ou comportamento incompatível comprovado.
6. Verificar TypeScript/build e executar smoke tests locais com acesso direto, navegação, login e 2FA, cobrindo destino preservado no cookie.
7. Confirmar por busca runtime que `/admin/curriculo` e `/admin/projetos` não permanecem, exceto em redirects explicitamente aprovados ou documentação histórica.

## Critérios de Conclusão

- [ ] `/admin/resume` substitui `/admin/curriculo` e renderiza o mesmo conteúdo autorizado.
- [ ] `/admin/projects` substitui `/admin/projetos` e renderiza o mesmo conteúdo autorizado.
- [x] Dashboard, SidebarNav e Breadcrumb usam os novos segmentos sem alterar indevidamente os labels visíveis.
- [x] Nenhuma pasta ou segmento de URL em português permanece sob `src/app`.
- [x] Busca no código runtime não encontra `/admin/curriculo` nem `/admin/projetos`, salvo redirects legados explicitamente aprovados.
- [ ] Acesso direto, login, middleware, 2FA e deep-linking preservam corretamente `/admin/resume` e `/admin/projects`.
- [x] A estratégia para URLs antigas foi decidida e testada: breaking change intencional, sem redirects legados, seguindo o precedente `/admin/idioma` → `/admin/language`; sem autenticação, as URLs antigas são interceptadas pelo middleware e redirecionadas ao login antes da resolução da rota.
- [x] TypeScript e build terminam sem erro atribuível à migração.

---

## Review

## Feedback
O humano aprovou diretamente o card e autorizou o início da implementação em 2026-10-28 pela mensagem: “pode passar o card Padronizar rotas restantes do admin para inglês pra in-progress, eu ja aprovei e pode iniciar a implementação”. A estratégia de compatibilidade das URLs antigas deve ser resolvida durante a implementação conforme o risco já documentado, sem ampliar o escopo para labels visíveis.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

O humano informou em 2026-10-28: “Testado e aprovado, pode marcar como done”. O QA autenticado confirmou que o deep-linking preserva `/admin/resume` após o login; o ambiente publicado ainda servia o build anterior, com `/admin/resume` e `/admin/projects` em HTTP 404 e `/admin/curriculo` e `/admin/projetos` em HTTP 200. A decisão humana aprova o card apesar da necessidade de publicação posterior para revalidar o build novo.

- [x] Comportamento idêntico ao anterior
- [x] Nenhuma regressão identificada no escopo deste card
- [x] Dívida técnica removida
- [x] **Pasta renomeada para `[done]-padronizar-rotas-portugues-para-ingles` e movida para `archive/refactoring/`**

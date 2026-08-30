# ♻️ Fase 1: Dockerização (Next.js Standalone) do Guilherme-Portifólio

**Status:** `done`
**Data:** 2026-08-27
**Prioridade:** `alta`
**Tags:** `infra`, `frontend`
**Resumo:** Dockerização do Next.js em modo standalone, correção de runtime na API de contato e criação de compose para Portainer GitOps.

---

## Motivação
Preparar a infraestrutura de deploy do Guilherme-Portifólio para execução em container Docker único na VPS, utilizando o modo `output: 'standalone'` do Next.js para manter a imagem leve e compatível com a stack GitOps nativa do Portainer via Webhook, sem depender de deploys manuais via SSH.

## Situação Atual
- A rota [`src/app/api/contact/route.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/api/contact/route.ts) possuía `export const runtime = 'edge'`, que restringia APIs de Node e era desnecessário para self-hosting em Docker/VPS.
- O [`next.config.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/next.config.ts) não gerava bundle autocontido (`output: 'standalone'`).
- O projeto não possuía `Dockerfile`, `.dockerignore` e `docker-compose.yml` padronizados para o deploy da stack.

## Situação Desejada
- `src/app/api/contact/route.ts` executando no runtime Node padrão.
- `next.config.ts` configurado com `output: 'standalone'`, gerando `.next/standalone` com dependências enxutas e `server.js`.
- `Dockerfile` multi-stage (`deps`, `builder`, `runner`) com usuário não-root `nextjs` e porta 3000 exposta.
- `.dockerignore` configurado excluindo arquivos `.env*`, `.git`, `node_modules`, `.next`, `docs/` e `dev/`.
- `docker-compose.yml` configurado com `127.0.0.1:3000:3000` (porta isolada para Nginx de borda), `RESEND_API_KEY` injetada por variável de ambiente e healthcheck via `wget`.

## Riscos
- Risco de arquivos estáticos (CSS, JS, PDF) retornarem 404 em runtime standalone caso `public` e `.next/static` não fossem copiados: mitigado no `Dockerfile` com instruções explícitas de cópia (`COPY --from=builder /app/public ./public` e `COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static`).
- Risco de quebra no renderizador de PDF (`react-pdf` / `pdfjs-dist`): testado e validado visualmente via navegador.

## Estratégia de Execução
1. **Parte 0 — Remoção do Runtime Edge:**
   - Remoção de `export const runtime = 'edge'` em `src/app/api/contact/route.ts` e `src/app/api/hello/route.ts`.
2. **Parte 1 — Output Standalone:**
   - Adição de `output: 'standalone'` em `next.config.ts`.
   - Ajuste em `tsconfig.json` para ignorar pastas auxiliares `dev` e `docs` na checagem de tipos do build.
   - Ajuste no tipo de transição do `resizable-navbar.tsx` com `as const`.
3. **Parte 2 & 3 — Dockerfile e .dockerignore:**
   - Criação do `Dockerfile` multi-stage com `node:20-alpine` e `npm ci` (confirmado `package-lock.json`).
   - Criação do `.dockerignore`.
4. **Parte 4 — Docker Compose:**
   - Criação do `docker-compose.yml` com binding `127.0.0.1:3000:3000` e injeção de `${RESEND_API_KEY}`.
5. **Validação:**
   - Build de produção via `npm run build` gerando `.next/standalone/server.js`.
   - Execução do servidor standalone em porta local (`3005`) com os assets estáticos mapeados.
   - Validação visual completa via navegador de todas as seções (Hero, Skills, Timeline, PDF Viewer do Resume, Projects Mock e Blogs Mock).

---

## Critérios de Conclusão
- [x] Linha `export const runtime = 'edge'` removida de `src/app/api/contact/route.ts`
- [x] `output: 'standalone'` adicionado ao `next.config.ts`
- [x] `npm run build` executado com sucesso gerando `.next/standalone/server.js`
- [x] `Dockerfile` multi-stage criado na raiz
- [x] `.dockerignore` criado excluindo segredos, dependências e documentação
- [x] `docker-compose.yml` criado com binding local `127.0.0.1:3000:3000`
- [x] Validação visual do servidor standalone com renderização do currículo em PDF realizada via navegador

---

## Review

## Feedback
> _(preencher durante o review)_

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [x] Build standalone gerado e funcional
- [x] Todas as páginas e renderizador de PDF carregam visualmente sem erros
- [x] Arquivos Dockerfile, docker-compose.yml e .dockerignore prontos para a stack do Portainer
- [x] **Pasta renomeada para `[done]-dockerizacao-standalone` e movida para `archive/refactoring/`**

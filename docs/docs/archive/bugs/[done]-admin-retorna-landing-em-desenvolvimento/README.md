# 🐛 Rota admin retorna à landing em desenvolvimento

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `alta`
**Tags:** `frontend`, `dx`
**Resumo:** Corrigir o acesso a /admin no ambiente de desenvolvimento, que retorna à landing em vez do painel administrativo.

---

## Descrição
No ambiente de desenvolvimento, acessar diretamente `/admin` retorna à landing page em vez de abrir o painel administrativo. Em produção, o mesmo caminho abre o painel corretamente.

## Como Reproduzir
1. Iniciar o servidor de desenvolvimento local.
2. Abrir diretamente `http://localhost:3000/admin`.
3. Observar a URL final e a página exibida.

## Comportamento Esperado
`/admin` deve preservar o fluxo do painel administrativo no desenvolvimento, exibindo o login quando não houver sessão e o dashboard quando houver sessão, como ocorre em produção.

## Comportamento Atual
O acesso direto a `/admin` no desenvolvimento retorna à landing page. O comportamento diverge do ambiente de produção.

## Contexto Técnico
- Camada afetada: frontend, roteamento e autenticação.
- Arquivo(s) suspeito(s): `src/middleware.ts`, `src/app/admin/(dashboard)/layout.tsx`, `src/app/admin/login/page.tsx`, configuração do servidor Next.js.
- Logs de erro (se houver): não informado; reproduzir com console e rede locais.

## Hipótese de Causa
Pode haver uma divergência entre o middleware, o matcher de `/admin`, a resolução do layout protegido ou a configuração de desenvolvimento, fazendo a requisição cair na rota pública em vez do fluxo administrativo.

## Plano de Correção
1. Reproduzir no servidor de desenvolvimento e registrar URL final, status e console.
2. Comparar middleware, matcher, redirects e árvore de rotas com o comportamento de produção.
3. Corrigir somente a causa comprovada, preservando o login, o deep-linking e a proteção do painel.
4. Testar `/admin` com e sem sessão e verificar que a landing continua funcionando.

---

## Review

## Feedback
O humano esclareceu que o bug ocorre especificamente ao estar na landing, digitar `/admin` na barra de endereço e pressionar Enter; abrir `/admin` diretamente funciona. Âmbar executou cinco reproduções controladas sem reproduzir o desvio: todas terminaram em `/admin/login`.

A investigação não comprovou causa no código nem reproduziu o desvio de forma determinística. O humano informou que o comportamento funciona em outro navegador e autorizou tratar este card como não reproduzido, com a limitação do cenário específico da barra de endereço não ter sido validado pelo agente.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: “Esta aprovado e autorizado a implementação”.

Autorização humana registrada em 2026-10-28: “Esta aprovado e autorizado a implementação”. Escopo: investigar e corrigir somente o fluxo `/admin` em desenvolvimento, sem alterar o bug visual, Kanban, diário ou Git.

---

## Validação

O bug não foi reproduzido de forma determinística no ambiente de desenvolvimento. Âmbar executou cinco reproduções controladas do fluxo landing → `/admin`; todas terminaram em `/admin/login`. Não houve causa comprovada, alteração de código ou correção aplicada. O cenário exato informado pelo humano — digitar `/admin` na barra da landing e pressionar Enter — não foi controlado diretamente pelo agente. O humano informou que o acesso funciona em outro navegador e autorizou o encerramento como não reproduzido.

- [x] Bug não reproduzido nas cinco reproduções controladas
- [x] Nenhuma regressão identificada nas reproduções executadas
- [x] Limitação do cenário específico da barra de endereço registrada
- [x] **Pasta renomeada para `[done]-admin-retorna-landing-em-desenvolvimento` e movida para `archive/bugs/`**

# ♻️ Preparar Repositório para Publicação Pública

**Status:** `done`
**Data:** 2026-08-26
**Prioridade:** `alta`
**Tags:** `infra`, `segurança`, `frontend`
**Resumo:** Varredura de segurança completa no histórico/código, mock de Projects/Blogs em grade e atualização de README.md e LICENSE (MIT).

---

## Motivação
O repositório do portfólio será tornado público no GitHub. Antes da abertura, é fundamental garantir que nenhum segredo, chave de API ou credencial esteja presente no código ou no histórico do git, que os dados de template de terceiros em Projects e Blogs sejam substituídos por dados mock explícitos ("Projeto Mock 1..5", "Post Mock 1..3") mantendo a grade visual idêntica ao design original, e que o `README.md` principal do repositório e o arquivo `LICENSE` (MIT) estejam devidamente configurados e alinhados.

## Situação Atual
- **Varredura de Segurança (Confirmada):** Nenhum arquivo `.env` está rastreado no git (`.gitignore` cobre `.env*`, `*.pem`, `.dev.vars*`, `/dev/`, `/.github/`). A rota de envio de emails (`src/app/api/contact/route.ts`) lê `process.env.RESEND_API_KEY` exclusivamente via variável de ambiente. A varredura profunda no histórico completo de commits (`git log -p`) resultou em **zero segredos encontrados**.
- **Tentativa anterior de conteúdo (refutada pelo usuário):** Substituição da grade de Projects e Blogs por um único card centralizado "Em Breve" — testado, resultado: rejeitado pelo usuário, pois descaracterizava o layout e a quantidade de cards do design original.
- **Abordagem de Conteúdo (Implementada):**
  - `Projects.tsx`: 5 cards no layout `BentoGrid` original (`md:col-span-2` no card 4), com títulos `Projeto Mock 1` a `Projeto Mock 5`, descrições demonstrativas, mock previews com borda pontilhada e botões sem navegação externa.
  - `Blogs.tsx`: 3 tiles no layout de lista original, com títulos `Post Mock 1` a `Post Mock 3`, resumos e modal dialog funcional para leitura.
- **Documentação do Repositório (Implementada):**
  - `README.md` raiz atualizado com informações profissionais, links reais de contato, link do site ao vivo, aviso explícito sobre dados mock e instrução de execução.
  - `LICENSE` criado na raiz do repositório com licença MIT padrão (Copyright 2026 Guilherme Menezes).

## Situação Desejada
- Repositório auditado e limpo, sem segredos no histórico ou no código.
- As seções Projects e Blogs mantêm o layout em grade com múltiplos cards intacto, com dados mock explícitos e sem links/dados de templates externos.
- `README.md` e `LICENSE` da raiz prontos para o repositório público.
- Seções Experience, Skills, Hero e Navbar mantidas sem alterações ou regressões.

## Riscos
- Links quebrados em mocks: mitigado usando `href="#"` com `onClick={e => e.preventDefault()}` e `cursor-default`.

## Estratégia de Execução
1. **Varredura de Segurança:**
   - Varredura de histórico e arquivos rastreados já concluída e validada (zero segredos).
2. **Implementação dos Mocks em Grade:**
   - [`src/components/main/Projects.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Projects.tsx): 5 cards mock em `BentoGrid`.
   - [`src/components/main/Blogs.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Blogs.tsx): 3 posts mock com modal dialog.
3. **Atualização do README e LICENSE:**
   - [`README.md`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/README.md): Atualizado com a nova apresentação e nota sobre os mocks.
   - [`LICENSE`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/LICENSE): Criado arquivo com licença MIT.
4. **Validação:**
   - Verificação visual de UI via browser em `http://localhost:3000`.
   - Verificação da integridade dos links e da formatação do Markdown.

---

## Critérios de Conclusão
- [x] Varredura de segurança no histórico do git e código atual concluída com zero segredos encontrados
- [x] `Projects.tsx` restaurado em grade BentoGrid com 5 itens mock
- [x] `Blogs.tsx` restaurado em lista com 3 posts mock e modal interativo
- [x] Nomes/links de projetos de template externos removidos completamente
- [x] `README.md` raiz atualizado com nova apresentação, aviso de mock e links corretos
- [x] `LICENSE` MIT adicionado na raiz
- [x] Demais seções (Hero, Skills, Experience, Navbar, Contato) sem regressões

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

- [x] Comportamento e grade visual idênticos ao layout original
- [x] Nenhuma vulnerabilidade ou segredo exposto
- [x] Conteúdo de template de terceiros substituído por mock óbvio
- [x] Documentação e licença MIT configuradas na raiz
- [x] **Pasta renomeada para `[done]-preparar-repositorio-publico` e movida para `archive/refactoring/`**

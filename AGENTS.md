<!-- context7 -->
Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer — your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and what to look up in the library's documentation, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and what to look up in the library's documentation (not single words), scoped to a single concept. If the question spans multiple distinct concepts (e.g. routing and auth and caching), make a separate `query-docs` call per concept with the same library ID, unless the question is about how the concepts interact — combined queries dilute ranking and return shallow results for each topic
4. Answer using the fetched docs
<!-- context7 -->

## Trabalho multiagente e Kanban

O Kanban oficial está em `docs/docs/`; leia `docs/docs/PADRONIZATION.md` e `.agents/skills/docs-standard/SKILL.md` antes de criar, revisar, mover ou validar cards. Leia `.agents/skills/diario-projeto/SKILL.md` ao iniciar uma sessão, mudar de direção ou encerrar uma etapa. O diário resume; o LOG.md do card registra tentativas e resultados reais por acréscimo.

Implementação exige card `[approved]` ou `[in-progress]`, aprovação humana registrada em Decisão, autorização de início e escopo compatível. Confira antes de delegar e novamente antes de executar. Agentes não decidem aprovação, cancelamento, Validação ou conclusão; ao terminar tecnicamente, deixe o card em `[in-progress]`. Após mudança de status, sincronize `node docs/roadmap/roadmap-server.js --sync`.

No Maestri, confira `maestri list` antes de recrutar, use papéis e comunicação nativos e receba resposta real antes de declarar delegação concluída. Em paralelo, defina um proprietário por arquivo e isole escritas; o Orquestrador coordena Kanban e diário no checkout oficial. Modelo indisponível bloqueia o papel: reporte a falha sem substituição silenciosa. Não exponha segredos, não ultrapasse permissões e não faça commit, push, merge, landing ou exclusão de branch sem autorização específica. Preserve alterações existentes e relate testes executados e pendências com precisão.

Na arquitetura operacional atual, os sete papéis permanecem, mas Íris (Frontend Designer Web) e Lúmen (QA Web) usam OpenCode nos mesmos nós do Maestri. Íris usa `opencode/nemotron-3.5-super-vl-free` para programação, ferramentas e análise multimodal; Lúmen usa `opencode/glm-5.3-flash-free` para QA e ferramentas. O navegador do QA deve ser integrado como Playwright MCP do OpenCode, com configuração local restrita e comprovação real antes de ser declarado funcional. Gemini CLI não integra mais esses dois papéis; preserve `GEMINI.md` para outros consumidores.

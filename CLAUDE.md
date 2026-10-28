# Instruções do portfólio

Leia `AGENTS.md` para a governança do Kanban, a delegação no Maestri e o tratamento de modelos, segurança e Git. Preserve as instruções Context7 existentes nesse arquivo. Para operar cards, carregue `.agents/skills/docs-standard/SKILL.md`; para atualizar o Panorama e o histórico do projeto, carregue `.agents/skills/diario-projeto/SKILL.md`.

A execução do workspace multiagente é rastreada em `docs/docs/active/features/[in-progress]-workspace-multiagente-maestri/`. A aprovação do card não autoriza commit, push, merge nem encerramento automático.

A arquitetura mantém sete papéis. Íris (Frontend Designer Web) opera pelo OpenCode com `opencode/nemotron-3.5-super-vl-free`; Lúmen (QA Web) opera pelo OpenCode com `opencode/glm-5.3-flash-free`. Preserve os nós, roles e conexões do Maestri. Playwright é uma integração MCP independente do Gemini e só é considerado funcional após conexão e teste reais no OpenCode. `GEMINI.md` permanece preservado para outros consumidores, mas Gemini CLI não faz parte desses dois papéis operacionais.

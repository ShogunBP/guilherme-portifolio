---
name: diario-projeto
description: Use ao iniciar uma sessão, mudar a direção do trabalho ou encerrar uma etapa para manter o Panorama e as entradas de docs/DIARIO.md.
---

# diario-projeto

`docs/DIARIO.md` resume o estado do projeto. Seu `## Panorama`, no início desse arquivo, contém o quadro atual, papéis/sessões verificados e próximos passos; `## Entradas` preserva a cronologia. O detalhe das ações e saídas reais pertence ao `LOG.md` do card; o Kanban em `docs/docs/` continua sendo a fonte oficial dos estados e aprovações.

## Ao iniciar

1. Leia o Panorama e as últimas datas de `docs/DIARIO.md`.
2. Execute `python -I .agents/skills/docs-standard/scripts/docs_tool.py board` na raiz do projeto e confira os prefixos atuais das pastas. Se o comando falhar, acrescente a tentativa e a saída real ao `LOG.md` do card em trabalho; se ainda não houver card, registre a falha como complemento em `docs/DIARIO.md`, sem inventar um estado para o quadro. Não infira o quadro do diário.

## Ao mudar de direção ou finalizar uma etapa

1. Registre evidências e tentativas por acréscimo no LOG.md do card antes de resumi-las no diário.
2. Confira o board novamente. Atualize somente o Panorama de acordo com os prefixos e com os resultados efetivamente verificados; não transforme aprovação em validação técnica.
3. Para a data já existente, acrescente um complemento à sua entrada em `## Entradas`. Para uma data nova, acrescente uma única entrada no topo das entradas. Preserve o histórico, inclusive informações depois corrigidas, e documente a correção como complemento.
4. Resuma o que foi feito, decidido pelo humano, verificado, o que falta e o que aguarda ação humana. Indique o card correspondente e escreva “não verificado” quando faltar evidência.

Não registre segredos, não marque cards como done e não substitua o LOG por uma narrativa sem saídas reais.

Quando um papel mudar de CLI ou modelo, atualize o Panorama somente depois de confirmar o processo no nó correto e receber uma resposta real do agente. Diferencie modelo listado, inferência, tool calling e integração MCP: uma evidência não implica as demais. A arquitetura atual registra Íris no OpenCode com `opencode/nemotron-3.5-super-vl-free` e Lúmen no OpenCode com `opencode/glm-5.3-flash-free`; o Playwright MCP do QA foi comprovado apenas para navegação, snapshot e fechamento de uma página local controlada, não para uma suíte completa do produto.

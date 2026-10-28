---
name: docs-standard
description: Use antes de criar, revisar, mover ou validar cards do Kanban, mudar seu status ou registrar tentativas no LOG.md.
---

# docs-standard

## Fontes e caminhos

Leia `docs/docs/PADRONIZATION.md` para tags, campos, categorias e templates e `.agents/workflows/docs-standard.md` para as regras locais de transição e sincronização. A raiz canônica dos cards é `docs/docs/`, com `active/` e `archive/`. Preserve os cards e o histórico existentes.

A ferramenta local é `.agents/skills/docs-standard/scripts/docs_tool.py`, adaptada da referência sem modificar `dev/reference-skill/`. Execute a partir da raiz do projeto:

```text
python -I .agents/skills/docs-standard/scripts/docs_tool.py board
python -I .agents/skills/docs-standard/scripts/docs_tool.py validate
```

`--docs <raiz-dos-cards>` e `--standard <arquivo-do-padrão>`, antes do subcomando, permitem apontar separadamente para os dois caminhos. Os padrões são resolvidos a partir da localização do script, não do diretório de trabalho do terminal.

## Procedimento

1. Confira o quadro e localize o card pelo slug; leia seu README e LOG antes de agir. O prefixo da pasta é a fonte de verdade do status; o campo Status é seu espelho.
2. Para novos trabalhos, use o template exato da categoria e crie somente um draft. Para implementar, exija card approved ou in-progress com aprovação humana registrada em Decisão, autorização de início e escopo compatível. Planejamento não concede aprovação.
3. Antes de qualquer transição, confira a autorização explícita na conversa. Approved, changes-requested, cancelled, done e caixas de Decisão/Validação são decisões humanas; o agente apenas pode registrar uma decisão explicitamente fornecida pelo humano. O término técnico permanece em in-progress.
4. Registre cada tentativa no LOG.md por acréscimo: ação, resultado real, conclusão e próximo passo. Registre falhas antes de apresentar outra solução. Preserve entradas anteriores e mantenha segredos fora dos registros.
5. Após criar, mover ou alterar status de um card, execute `node docs/roadmap/roadmap-server.js --sync`. Atualize o Panorama pela skill `diario-projeto` e rode validate. Relate código de saída, erros e avisos sem corrigir automaticamente o acervo legado.

Para acrescentar evidência pela ferramenta:

```text
python -I .agents/skills/docs-standard/scripts/docs_tool.py log <slug> --acao "Ação executada" --resultado "Saída observada" --conclusao parcial --proximo "Próximo passo"
```

## Limites da ferramenta

A suíte de testes em `.agents/skills/docs-standard/tests/test_docs_tool.py` cobre `new`, `status`, `board`, `validate` e as falhas de escrita: os 25 testes automatizados passam (verificação em 2026-10-27). `board` e `validate` foram executados no portfólio; a validação completa encontrou problemas legados e não foi aprovada. Falhas simples de escrita/renomeação em `new` e `status` restabelecem o estado original sem staging remanescente; escrita parcial do LOG preserva as entradas anteriores. Falha dupla (rollback também falhando) deixa a pasta com o marcador `.RECOVERY_REQUIRED` e a ferramenta sinaliza `RuntimeError` pedindo correção manual ou diagnóstico; nesse caso, não continue operando o card até resolver o estado.

O comando `status` bloqueia transições humanas e confere a caixa de aprovação em `approved → in-progress`, mas não autentica a origem da aprovação nem detecta alteração arbitrária no filesystem. Toda transição exige autorização explícita na conversa, além das verificações do script. A ferramenta não é sandbox.

Em tarefas paralelas, executores enviam evidências ao Orquestrador. Por padrão, o Orquestrador é o único proprietário das escritas no Kanban oficial e em `docs/DIARIO.md` no checkout canônico; se delegar essa propriedade, deve nomear um único substituto e suspender sua própria escrita nesses arquivos até a devolução explícita. Cópias em worktrees não substituem a aprovação no checkout canônico.

Mudanças de CLI ou modelo de um papel operacional exigem autorização humana específica e devem preservar o nó, a role e as conexões pelo `maestri recruit --replace`. Registre no LOG o comando efetivo, o modelo exibido, a comunicação e o tool calling realmente comprovados. Na arquitetura atual, Íris usa OpenCode com `opencode/nemotron-3.5-super-vl-free` e Lúmen usa OpenCode com `opencode/glm-5.3-flash-free`; não descreva Gemini CLI ou Playwright como funcional nesses papéis sem evidência atual.

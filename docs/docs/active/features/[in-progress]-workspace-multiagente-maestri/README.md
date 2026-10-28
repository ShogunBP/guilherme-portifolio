# ✨ Workspace multiagente de desenvolvimento web no Maestri

**Status:** `in-progress`
**Data:** 2026-10-27
**Prioridade:** `alta`
**Tags:** `infra`, `dx`, `docs`, `segurança`
**Resumo:** Sete papéis no Maestri com delegação nativa, Kanban preservado e execução aprovada pelo humano.

---

## Objetivo
Disponibilizar um workspace reutilizável para projetos web, com sete papéis independentes, delegação funcional, execução paralela segura, testes e gerenciamento Git. Usar prioritariamente os recursos nativos do Maestri, sem construir outro orquestrador quando os mecanismos existentes atenderem à necessidade. O Kanban continua sendo a fonte oficial das tarefas e aprovações; nenhuma implementação ou configuração operacional desta proposta começa antes da aprovação humana.

## Descrição Funcional
O humano revisa os cards pelo fluxo existente. O Orquestrador verifica a aprovação antes de delegar a implementação; o agente executor confere novamente o card antes de trabalhar. Planejador, Programadores, Frontend Designer, QA e Git Manager atuam sob demanda, com responsabilidades separadas.

A delegação usa os mecanismos nativos de comunicação do Maestri: descoberta de sessões com list, recrutamento com recruit quando necessário, envio com ask, tarefas independentes com ask --batch e acompanhamento pontual com check. Os agentes reportam o resultado ao Orquestrador, vinculando a resposta ao card. A disponibilidade desses comandos foi consultada nas skills e na ajuda instalada; o funcionamento entre as três CLIs ainda precisa de teste real após aprovação.

Cada agente registra atividades, tentativas, resultados reais e evidências no LOG.md do card correspondente. O Orquestrador coordena as escritas compartilhadas, sincroniza o roadmap e consolida o Panorama de docs/DIARIO.md. Ao terminar tecnicamente, executa-se a validação prevista pelas skills e o card permanece em in-progress para validação humana. Agentes não marcam Decisão ou Validação nem aprovam ou concluem cards automaticamente.

A implementação será incremental: primeiro o ciclo mínimo de delegação aprovada, integração com as skills, paralelismo isolado e testes. Recuperação avançada e monitoramento contínuo ficam para evolução posterior, somente se houver necessidade comprovada.

| Papel | CLI | Modelo a configurar | Estado da verificação |
|---|---|---|---|
| Orquestrador | Claude Code | gpt-6.0-sol | CLI instalada; acesso ao identificador solicitado não verificado |
| Planejador | Claude Code | gpt-6.0-sol | CLI instalada; acesso ao identificador solicitado não verificado |
| Programador 1 | OpenCode | opencode/deepseek-v4.1-flash-free | Identificador listado por opencode models; preserva a escolha DeepSeek V4.1 Flash |
| Programador 2 | OpenCode | opencode/glm-5.3-flash-free | Identificador listado por opencode models; preserva a escolha GLM 5.3 Flash |
| Frontend Designer | OpenCode | opencode/nemotron-3.5-super-vl-free | Inferência multimodal, screenshot e tool calling verificados; sessão Íris migrada no mesmo nó |
| QA / Tester | OpenCode | opencode/glm-5.3-flash-free | Tool calling e Playwright MCP verificados; sessão Lúmen migrada no mesmo nó |
| Git Manager | Claude Code | gpt-5.6-luna | CLI instalada; acesso ao identificador solicitado não verificado |

Os identificadores OpenCode foram confirmados novamente em 2026-10-27. Trata-se da identificação real dos modelos escolhidos, não de substituição por outros modelos. A listagem não comprova uma inferência bem-sucedida. Não haverá troca silenciosa dos modelos selecionados; um perfil indisponível será reportado como bloqueado.

## Escopo

### Inclui
- Preservação de docs/docs/active/, docs/docs/archive/, categorias, prefixos de status, cards existentes e compatibilidade com o roadmap atual. Nenhuma migração de diretórios é necessária para esta entrega.
- Adaptação das skills docs-standard e diario-projeto e da ferramenta de dev/reference-skill/ aos caminhos e às regras do projeto, sem importar regras de produto do projeto de referência.
- Preservação de docs/docs/PADRONIZATION.md como padrão existente. Se docs/README.md for necessário como entrada oficial, ele deve apontar para esse padrão, sem duplicar regras ou exigir movimentação de cards. A ferramenta deve ser adaptada para separar o caminho do padrão da raiz dos cards, em vez de impor a estrutura da referência.
- Evolução incremental de CLAUDE.md, AGENTS.md e GEMINI.md, preservando instruções existentes e compartilhando regras de aprovação humana, segurança, testes, colaboração e documentação sem duplicação desnecessária.
- Sete papéis configurados no Maestri, com sessões independentes acionadas sob demanda e os identificadores reais dos modelos escolhidos.
- Uso prioritário de roles, presets, recruit, ask, ask --batch, check e floors/worktrees nativos, conforme compatibilidade verificada. Scripts pequenos somente para lacunas concretas que os recursos nativos não atendam.
- Verificação de aprovação antes de delegar e executar implementação; ferramenta de cards recusando transições reservadas ao humano no uso pelos agentes.
- Execução paralela de tarefas aprovadas independentes em worktrees, com propriedade explícita de arquivos. Escritas no Kanban oficial e no diário são coordenadas pelo Orquestrador, evitando fontes de tarefas divergentes entre worktrees.
- Testes reais de delegação, resposta, bloqueio de tarefa não aprovada, paralelismo e integração com LOGs, diário e roadmap.
- Configuração mínima de QA no OpenCode com Playwright MCP independente, sem acesso irrestrito ao filesystem e somente considerada funcional após conexão e teste reais.
- Tratamento básico de falhas: registrar a tentativa, verificar a sessão antes de reenviar e não repetir automaticamente operações com efeitos de escrita. Repetição somente com justificativa e limite explícito; persistindo a falha, reportar o bloqueio.

### Não inclui (por ora)
- Alterações funcionais no portfólio, autenticação ou traduções em desenvolvimento.
- Migração das árvores do Kanban, reescrita de cards antigos ou correção retroativa de seu histórico.
- Novo orquestrador, scheduler, fila própria de tarefas, banco de execuções, dashboard ou outra fonte oficial de tarefas.
- Monitoramento contínuo, watchdogs, retomada automática após reinício, retries automáticos, rollback genérico ou infraestrutura avançada de locks e recuperação. Necessidades comprovadas podem motivar cards posteriores.
- Aprovação, cancelamento ou encerramento automático de cards por agentes; marcação de Decisão ou Validação por iniciativa dos agentes.
- Commit, push, merge, landing de floor, exclusão de branches ou descarte de alterações sem autorização específica.
- Instalação de outra CLI, troca de provedor/modelo, exposição de segredos ou bypass de permissões para contornar integração indisponível.

## Requisitos Técnicos
- Camadas envolvidas: configuração nativa do Maestri, instruções compartilhadas, adaptação mínima das ferramentas documentais e testes de integração; sem mudança inicial em src/.
- Dependências ou integrações necessárias: Maestri disponível e sessão Maestro; Claude Code e OpenCode 2.1.4 operam os sete papéis atuais. Gemini CLI foi detectado na análise inicial, mas foi retirado dos papéis Íris e Lúmen após falhas de disponibilidade; `GEMINI.md` permanece preservado para outros consumidores. Versões e disponibilidade devem ser rechecadas na execução.
- Impactos em outras partes do sistema: preservar o checkout sujo. Roadmap e Portfolio eram shells para executar o roadmap e o servidor, já encerrados pelo humano; não constituíam uma equipe de agentes existente.
- Compatibilidade documental: a regra local .agents/workflows/docs-standard.md exige docs/docs/active/, docs/docs/archive/ e sincronização com node docs/roadmap/roadmap-server.js --sync. A adaptação preservará esses caminhos e a exigência de autorização explícita para avanço de status. A revisão permaneceu em ready-for-review até a aprovação humana explícita registrada em Decisão; o status atual é approved.
- Bloqueio comprovado na referência: board e validate retornaram erro por ausência de docs/README.md. A solução planejada é adaptar a leitura do padrão e a raiz dos cards, não criar outra árvore docs/active/ nem mover o acervo para satisfazer o script.
- Governança obrigatória: docs-standard rege cards, templates, transições, LOGs e validação; diario-projeto rege o Panorama e os acréscimos ao diário. Entradas históricas e tentativas anteriores não serão apagadas. Critérios técnicos só podem ser marcados com evidências; Decisão e Validação ficam com o humano.
- Aprovação humana: o ciclo mínimo deve recusar delegação de implementação sem card aprovado e exigir a conferência pelo executor. Planejamento de card pode ocorrer antes da aprovação, mas não implementação. Instruções Markdown e um parâmetro de CLI não constituem sandbox nem prova independente de identidade humana; não alegar proteção absoluta contra edição arbitrária do filesystem.
- Segurança MCP: Gemini CLI foi retirado da arquitetura operacional de Íris e Lúmen. Playwright MCP 0.0.80 está configurado localmente no OpenCode com sessão isolada, respostas de imagem omitidas, service workers bloqueados e sem `--allow-unrestricted-file-access`. O QA comprovou descoberta e uso em página `data:` local; o executável aponta para o Chrome instalado neste Windows e deve ser ajustado em outro ambiente.
- Economia: ativar agentes sob demanda, compartilhar apenas o contexto necessário e reutilizar as sessões adequadas. O Orquestrador não refaz o planejamento ou implementação delegados. Nenhuma infraestrutura própria será criada apenas por antecipação.
- Fontes consultadas na análise inicial: skills locais maestri, maestri-manager e maestri-workspace; ajuda instalada de maestri ask/recruit, claude e gemini; documentação via Context7 de OpenCode (https://github.com/anomalyco/opencode/blob/dev/services/www/src/docs/content/cli/commands.mdx) e Gemini CLI (https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/cli-reference.md e https://github.com/google-gemini/gemini-cli/blob/main/docs/reference/configuration.md). A busca Context7 por Maestri retornou produtos chamados Maestro sem correspondência confirmada, que não foram usados como fonte deste Maestri.

## Plano de Implementação
1. Aprovação humana recebida em 2026-10-27 e registrada em Decisão; card movido para approved. Manter Validação desmarcada até os testes e a validação humana final.
2. Após aprovação, adaptar minimamente as skills e a ferramenta documental aos caminhos atuais; conferir o quadro, manter a baseline de problemas legados separada e compartilhar as regras nas três CLIs. Não migrar cards nem criar nova fonte de tarefas.
3. Configurar os papéis e modelos no Maestri sob demanda, começando pelo Planejador e por um executor para comprovar o ciclo mínimo. Usar os identificadores OpenCode confirmados e testar o acesso dos demais perfis sem trocar modelos silenciosamente. Completar os sete papéis incrementalmente.
4. Demonstrar uma delegação aprovada de ponta a ponta com os recursos nativos: conferir o card, enviar tarefa, receber resultado, registrar evidência no LOG.md e consolidar o diário. Testar também a recusa de uma implementação sem aprovação, sem editar cards existentes para fabricar o cenário.
5. Executar duas tarefas aprovadas independentes em paralelo por ask --batch, isoladas em floors/worktrees quando houver escrita. Definir arquivos de cada executor e coordenar os registros no Kanban oficial, sem permitir alterações simultâneas nos mesmos arquivos.
6. Integrar o QA com os testes existentes e o navegador real; configurar Playwright MCP local no OpenCode com opções suportadas e sem acesso irrestrito a arquivos. Registrar falhas reais e bloquear a etapa se não houver conexão e teste funcional, sem simular sucesso.
7. Consolidar evidências dos testes de comunicação, delegação, aprovação, paralelismo e skills. Demonstrar tratamento básico de falha sem reenvio cego. Só propor automação adicional se uma lacuna concreta impedir o ciclo mínimo e, se ampliar o escopo, obter aprovação antes de implementá-la.
8. Executar a validação documental adaptada, sincronizar o roadmap e atualizar o Panorama. Apresentar a entrega técnica mantendo o card em in-progress para validação e encerramento pelo humano. Cards adicionais não recebem aprovação por herança automática.

## Critérios de Conclusão
- [ ] Estrutura e cards do Kanban preservados, sem migração de diretórios ou nova fonte oficial de tarefas.
- [ ] docs-standard e diario-projeto adaptadas ao projeto; ferramenta lê o padrão e os cards atuais, sem exigir a organização do projeto de referência.
- [ ] Instruções das três CLIs consistentes e sem perda de conteúdo existente; aprovação, Decisão, Validação e conclusão permanecem sob controle humano.
- [ ] Sete papéis configurados sob demanda com os modelos escolhidos; Programadores usam opencode/deepseek-v4.1-flash-free e opencode/glm-5.3-flash-free, com acesso efetivo testado.
- [ ] Delegação e resposta real de tarefa aprovada demonstradas usando recursos nativos do Maestri, com evidências no LOG.md.
- [ ] Caso negativo comprova a recusa de implementação sem aprovação e a recusa de transições reservadas ao humano na ferramenta usada pelos agentes.
- [ ] Duas tarefas aprovadas independentes executadas em paralelo com isolamento e propriedade de arquivos, sem colisões de escrita.
- [ ] Testes automatizados e de navegador registrados; integração OpenCode/Playwright comprovada antes de ser declarada funcional.
- [ ] Falha registrada e acompanhamento pontual demonstrado sem reenvio automático nem alegação de recuperação avançada implementada.
- [ ] LOGs, sincronização do roadmap e Panorama do diário refletem resultados reais, preservando o histórico.
- [ ] Validação documental executada com resultado real e eventuais problemas legados separados.
- [ ] Entrega técnica apresentada em in-progress para validação humana, sem aprovação ou conclusão automática por agentes.

---

## Review

## Feedback
Em 2026-10-27, o humano solicitou preservar a estrutura e os cards atuais, adaptar as ferramentas da referência ao projeto, usar os identificadores reais dos modelos OpenCode escolhidos, priorizar mecanismos nativos do Maestri e implementar incrementalmente. Recuperação e monitoramento avançados ficam para evolução conforme necessidade. As regras de docs-standard e diario-projeto permanecem obrigatórias. Esta proposta foi revisada conforme o pedido e permanece em ready-for-review, aguardando aprovação.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Aprovação humana registrada em 2026-10-27 pela mensagem: "o card esta aprovado". A marcação transcreve essa decisão explícita, não uma aprovação pelo agente. Card em approved; execução ainda não iniciada e Validação final pendente.

---

## Validação

> _(preencher após execução e teste)_

- [ ] Todos os critérios de conclusão atendidos
- [ ] Testado manualmente do ponto de vista do usuário
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-workspace-multiagente-maestri` e movida para `archive/features/`**

# Diário do projeto

## Panorama

Atualizado em 2026-10-28 pelo board da ferramenta adaptada, que lê `docs/docs/PADRONIZATION.md` e os cards em `docs/docs/`. O quadro possui 3 cards draft, 1 in-progress, 41 done e 2 cancelled. A última validação completa conhecida retornou 51 erros e 39 avisos do acervo; não equivale à aprovação dos cards.

**Em andamento**
- `docs/docs/active/features/[in-progress]-workspace-multiagente-maestri/` — aprovação humana parcial: 25/25 testes, ferramenta documental, recuperação de falhas e paralelismo OpenCode validados; Planejador e os novos agentes OpenCode respondem; Playwright MCP do QA foi validado em página local controlada.

Os dois bugs reais de 2026-10-28 foram detalhados e arquivados: `docs/docs/archive/bugs/[done]-admin-retorna-landing-em-desenvolvimento/` foi encerrado como não reproduzido após cinco reproduções controladas sem desvio, sem causa comprovada ou alteração de código; `docs/docs/archive/bugs/[done]-estilos-admin-vazam-landing/` registrou a causa no escopo global, a correção por `admin-shell`, TypeScript/ESLint aprovados e validação visual humana, com QA pós-correção automatizado não verificado.

O card `padronizar-rotas-portugues-para-ingles` foi validado pelo humano, movido para `docs/docs/archive/refactoring/[done]-padronizar-rotas-portugues-para-ingles/` e arquivado. Os dois bugs relatados — `/admin` retornando à landing em desenvolvimento e estilos/scroll do painel vazando para a landing — exigem cards separados; não foram incluídos no refactoring de rotas.

**Papéis e sessões**
- Seis roles locais definidas para sete posições; os dois Programadores compartilham Programador Web. Prisma usa o preset nativo atual `Claude Code`, sem modelo fixo, e resolve `cx/gpt-5.6-sol`; comunicação básica está comprovada. Âmbar/Âmbar Isolado usam DeepSeek V4.1 Flash Free e Nébula/Nébula Isolada usam GLM-5.3-Flash Free; os dois isolados executaram escritas em worktrees distintos. Íris foi migrada no mesmo nó para OpenCode com `opencode/nemotron-3.5-super-vl-free`, com visão e shell comprovados. Lúmen foi migrado no mesmo nó para OpenCode com `opencode/glm-5.3-flash-free`, com shell comprovado. Git Manager tem role, sem sessão própria necessária até agora.

**Próximos**
- Demonstração dos sete papéis: concluída, desfeita no produto e arquivada em `docs/docs/archive/features/[done]-demonstracao-integrada-sete-papeis/`; seguir para os cards reais sem repetir a demonstração.
- Planejador: comunicação básica e planejamento real do draft foram comprovados pelo preset atual; gateway e credenciais permanecem inalterados.
- Frontend Designer: usar Íris no OpenCode/Nemotron; multimodalidade e tool calling foram comprovados com uma única verificação autorizada.
- QA: usar Lúmen no OpenCode/GLM-5.3-Flash; tool calling foi comprovado. Não repetir esse teste.
- Playwright MCP 0.0.80 conecta no OpenCode com configuração local restrita. Lúmen descobriu e usou `browser_navigate`, `browser_snapshot` e `browser_close` em uma página `data:` local, confirmando título e heading sem acessar rede externa. O executável usa o Chrome local deste Windows; isso precisa de ajuste em outro ambiente.
- Manter card in-progress, baseline de 51 erros e 39 avisos legados, e os dois floors/branches preservados. Landing, commit, merge e exclusão dependem de autorização específica.

## Entradas

### 2026-10-27
**Feito**
- Analisadas as regras locais, as skills docs-standard e diario-projeto da referência e os recursos instalados do Maestri e das três CLIs.
- Criado o card `[draft]-workspace-multiagente-maestri`, com proposta, critérios e LOG.md de evidências. Não iniciada a implementação.
- Iniciado este diário; nenhum histórico anterior foi reconstruído.

**Decisões**
- Nenhuma nova decisão arquitetural aprovada pelo humano. Compatibilização de docs/README.md com a estrutura docs/docs/ é proposta do agente, aguardando aval.
- Mantidas as restrições expressas pelo usuário: aprovação antes da implementação, validação humana e nenhum done automático.

**Verificado**
- Maestri acessível e sessão atual com Maestro; CLIs Claude Code 2.1.311, OpenCode 2.1.4 e Gemini CLI 0.65.0 instaladas.
- board e validate da ferramenta de referência bloqueados: docs/README.md ausente. Não há validação documental completa concluída.
- Gemini informou diretório não confiável e MCPs desativados; Playwright no Gemini e acesso efetivo aos modelos solicitados não verificados.
- Validação isolada do novo card com o padrão atual em diretório temporário: 1 card, 0 erros, 0 avisos. Isso não valida o acervo completo nem o workspace.
- Roadmap sincronizado: 45 itens, sendo 7 active e 38 archive. Avisos legados de Prioridade e Tags ausentes em navbar-logo-hover-cor-hardcoded; não corrigidos nesta sessão.
- Evidências detalhadas em `docs/docs/active/features/[draft]-workspace-multiagente-maestri/LOG.md`.

**Próximo**
- Submeter o rascunho ao humano e respeitar a transição de status explicitamente autorizada.
- Depois da aprovação, delegar a especificação e implementar incrementalmente; comprovar cada integração por testes reais.

**Aguardando humano**
- Revisão do card draft, autorização para avançar ao review e posterior aprovação antes da execução.
- Confirmação dos identificadores/provedores dos modelos solicitados; nenhum modelo será substituído silenciosamente.

**Complemento — encaminhamento autorizado e correção de contexto**
- O humano autorizou a transição de draft para ready-for-review. O card foi encaminhado; a implementação continua sem aprovação.
- Correção da análise inicial: Roadmap e Portfolio eram apenas shells para iniciar o roadmap e o servidor, não uma equipe de agentes. Segundo o humano, ambos já foram encerrados.
- A proposta e o LOG.md foram atualizados; as informações anteriores desta entrada permanecem como histórico do estado inicial.
- Caminho atual: `docs/docs/active/features/[ready-for-review]-workspace-multiagente-maestri/`. Próximo passo: revisão e aprovação humana, sem iniciar implementação.

**Complemento — revisão de escopo antes da aprovação**
- Por orientação humana, o card foi revisado para preservar integralmente a estrutura e os cards atuais, adaptar as ferramentas de referência ao projeto e priorizar os mecanismos nativos do Maestri, sem desenvolver outro orquestrador se eles forem suficientes.
- O plano passou a ser incremental: skills, delegação funcional com aprovação humana, execução paralela isolada e testes. Infraestrutura avançada de monitoramento e recuperação foi adiada até existir necessidade comprovada.
- Nova consulta `opencode models` confirmou `opencode/deepseek-v4.1-flash-free` e `opencode/glm-5.3-flash-free`, adotados no card sem mudar os modelos escolhidos. Acesso por inferência continua não verificado.
- Validação isolada do formato do card revisado: 1 card, 0 erros, 0 avisos. Roadmap sincronizado: 45 itens, 7 active e 38 archive, com os mesmos avisos legados.
- Card mantido em ready-for-review por pedido explícito do humano; Decisão e Validação desmarcadas. Implementação não iniciada. Evidências no LOG.md do caminho atual acima.

**Complemento — aprovação humana registrada**
- O humano declarou "o card esta aprovado". Registrada essa decisão em Decisão e movida a pasta para `docs/docs/active/features/[approved]-workspace-multiagente-maestri/`, com espelho Status atualizado. Não houve autoaprovação pelo agente.
- Roadmap sincronizado: 45 itens, 7 active e 38 archive; permanecem os avisos legados de Prioridade e Tags ausentes em navbar-logo-hover-cor-hardcoded.
- Execução técnica ainda não iniciada. Próxima etapa: adaptação mínima das skills e da ferramenta conforme o escopo aprovado. Validação final continua pendente; nenhum done automático.

**Complemento — implementação retomada após o crash**
- O humano autorizou iniciar a implementação; o card passou de approved a in-progress, com sync de 45 itens (7 active, 38 archive). O crash não removeu o card, o papel Planejador Web nem a sessão Prisma; `maestri check` mostrou a sessão ociosa após a falha anterior.
- A ferramenta local passou a ler separadamente o padrão em `docs/docs/PADRONIZATION.md` e os cards em `docs/docs/`; `board` listou 3 drafts, 4 in-progress, 36 done e 2 cancelled. `validate` executou e retornou exit 1, com 51 erros e 39 avisos preexistentes em outros cards. Nenhum card legado foi corrigido por esta tarefa.
- Criadas as skills locais `docs-standard` e `diario-projeto`; AGENTS.md, GEMINI.md e CLAUDE.md apontam para a governança comum, preservando as instruções Context7. A ferramenta agora recusa transições humanas por CLI e confere a caixa de aprovação ao iniciar; operações mutáveis ainda não foram testadas em diretório isolado.
- A tentativa de delegação ao Planejador no modelo exato `gpt-6.0-sol` retornou `model_not_found` para a conta atual; não há inferência nem resposta de planejamento. Nenhum modelo foi trocado e não houve novo envio após o crash. Novos testes automatizados aguardam confirmação das interfaces públicas conforme a skill TDD.
- Evidências e limitações detalhadas no `LOG.md` de `docs/docs/active/features/[in-progress]-workspace-multiagente-maestri/`. Validação humana pendente; nenhum done, commit, push ou merge.

**Complemento — comunicação entre programadores verificada**
- `opencode run --standalone` realizou inferência curta com os dois modelos escolhidos; ambos responderam. A primeira inicialização interativa de Âmbar com `opencode --model` falhou (flag não aceita na raiz); corrigida no mesmo nó para `opencode mini --model`, preservando o modelo.
- Âmbar e Nébula receberam, via `maestri ask`, tarefas somente de comunicação e retornaram nome, modelo e confirmação ao Orquestrador via `maestri ask`. Isso comprova ida e volta básica, não tarefas paralelas com escrita.
- A tentativa de verificar `gemini-3.1-pro-preview` encerrou com exit 55 por diretório não confiável; confiança não foi alterada. QA e Playwright no Gemini seguem não verificados. O Planejador segue bloqueado no modelo exato.

**Complemento — papéis, revisão paralela e verificação isolada parcial**
- Seis roles foram definidas no Maestri para sete posições; as quatro roles adicionais não têm sessões próprias. `maestri ask --batch` entregou em paralelo duas revisões somente leitura, com arquivos separados, a Âmbar e Nébula. Ambos responderam; não houve implementação ou escrita paralela em worktrees.
- A revisão apontou risco de pasta incompleta em `new`, escrita não atômica do README e falha de LOG em `status`, além de lacunas nas instruções do diário e de propriedade de escrita. A ferramenta foi ajustada para preparar novos cards antes da publicação e substituir o README por arquivo temporário; as skills agora indicam a localização do Panorama, o registro de falha e o proprietário padrão do checkout canônico.
- Verificação manual em diretório temporário: `new` criou draft com README/LOG, rejeitou duplicação e `status` rejeitou transição inválida, cancelamento humano e passagem com seções incompletas. Uma primeira tentativa de `validate` falhou porque o ambiente temporário não incluía `archive/`; repetido com a estrutura completa, retornou 1 card, 0 erros, 0 avisos. Uma tentativa de transição com template parcialmente preenchido foi recusada; outra, usando cópia isolada de card preenchido, moveu draft → ready-for-review, atualizou o espelho e acrescentou LOG. Falhas de escrita e reversão ainda não foram verificadas. Nenhum teste automatizado novo foi escrito sem confirmação das interfaces públicas.
- Card continua in-progress, Validação humana pendente. Não houve commit, push, merge nem alteração de confiança ou modelo.

**Complemento — falhas de escrita e bloqueios investigados**
- Em diretórios temporários, seis falhas simples injetadas em `new`/`status` não deixaram pasta incompleta nem alteraram o README e o LOG anteriores. Uma falha após escrita parcial do LOG expôs entrada incompleta; corrigida e reexecutada, preservou exatamente os registros anteriores, com e sem LOG preexistente. Não houve teste destrutivo em card real.
- Duas falhas simultâneas (troca do README e renomeação de rollback) ainda deixaram a pasta com status novo e conteúdo anterior; a ferramenta mutável permanece indisponível no acervo real. Nenhum teste automatizado persistente foi escrito sem confirmação das interfaces públicas.
- Planejador: sessão Prisma ainda mostra modelo não reconhecido e aviso de duas fontes de autenticação; tentativa anterior foi `model_not_found` na conta atual. Gemini CLI 0.65.0: `gemini mcp list` confirma diretório não confiável e context7 desativado. Documentação consultada confirma bloqueio headless e MCP nesse estado. Não foram alterados modelos, credenciais, confiança nem permissões. Escrita paralela em worktrees permanece pendente.

**Complemento — testes automatizados da ferramenta concluídos (25/25)**
- A suíte de testes automatizados em `.agents/skills/docs-standard/tests/test_docs_tool.py` foi executada e todos os 25 testes passaram. As duas falhas anteriores foram corrigidas: `test_status_fault_rename_restores_original` (mock do `shutil.move` e `replace_text` para injetar falha dupla) e `test_status_rejects_ready_for_review_with_template_sections` (import de `re` e `datetime` e uso de template bruto da feature com placeholders).
- A ferramenta passa em todos os cenários: criação, validação, transições válidas e inválidas, rejeição de decisões humanas pela CLI, injeção de falhas simples (README, LOG, rename em `new` e `status`), escrita parcial do LOG preservando entradas anteriores, e falha dupla (troca do README + rollback) gerando `.RECOVERY_REQUIRED` e `RuntimeError`. A baseline de 51 erros e 39 avisos do acervo legados permanece separada e não foi corrigida.
- Próximos passos: configurar confiança do Gemini via fluxo interativo normal; resolver acesso ao `gpt-6.0-sol` sem substituição silenciosa; demonstrar delegação aprovada com resposta real e paralelismo isolado em worktrees (floors do Maestri); consolidar evidências e apresentar entrega técnica em in-progress para validação humana final.

**Complemento — escrita paralela em floors e reavaliação dos modelos**
- Dois floors/worktrees nativos foram criados: `Teste CLI Isolado` e `Documentacao Skill`. Por `maestri ask --batch`, Âmbar Isolado (DeepSeek V4.1 Flash Free) recebeu propriedade exclusiva do teste da ferramenta e Nébula Isolada (GLM-5.3-Flash Free) recebeu propriedade exclusiva da skill docs-standard. Ambos conferiram o card aprovado/in-progress, escreveram em paralelo sem colisão e retornaram resultados reais. Não houve commit, landing, merge, push ou exclusão.
- Âmbar silenciou somente a saída esperada dos casos negativos da suíte e obteve 25/25 OK. Nébula atualizou os limites documentados após verificar 25/25 e o comportamento `.RECOVERY_REQUIRED` + `RuntimeError`. Como os arquivos ainda são não rastreados e landing exigiria commit/merge sem autorização, o Orquestrador reaplicou os dois deltas conferidos no checkout canônico. A suíte canônica voltou a passar 25/25 e `git diff --check` não encontrou erros nesses dois arquivos.
- A repetição de `gpt-6.0-sol` retornou novamente `model_not_found` na conta atual. Com confiança somente da sessão, Gemini Designer alcançou a API, mas retornou quota 429; Gemini QA não concluiu por falhas de rede/timeout. Nenhum modelo foi substituído, nenhuma confiança foi persistida e não houve novo reenvio automático.
- A validação documental completa voltou a retornar exit 1, mantendo a baseline conhecida de 45 cards, 51 erros e 39 avisos legados. Card permanece in-progress e Validação humana desmarcada. Próximo passo: apresentar a entrega técnica e os bloqueios externos ao humano.

**Complemento — aprovação parcial e diagnóstico dos agentes pendentes**
- O humano aprovou parcialmente a entrega: considerou comprovados os 25 testes, a adaptação documental, a recuperação controlada de falhas e o paralelismo OpenCode. Planejador e Gemini continuam fora da validação; o card permanece in-progress, sem Validação final ou done. Partes comprovadas não serão refeitas.
- A baseline do Kanban permanece 45 cards, 51 erros e 39 avisos; sync permanece 45 itens, 7 active e 38 archive. Nenhum card legado foi editado nesta etapa. O diff amplo do roadmap reflete também mudanças preexistentes do checkout, não agravamento produzido pelo workspace.
- Orquestrador: Claude Code 2.1.312 retomado por `--resume`, modelo exibido `cx/gpt-5.6-sol`, OAuth first-party/chave gerenciada. Ambiente possui gateway local em `ANTHROPIC_BASE_URL` e `ANTHROPIC_AUTH_TOKEN`. Planejador: Claude Code 2.1.311 iniciado por `--model gpt-6.0-sol`, com alerta de token e chave gerenciada concorrentes; gateway responde `model_not_found` para esse modelo na conta ChatGPT. Roles não explicam a diferença; nenhuma credencial foi alterada.
- Gemini com confiança apenas da sessão conecta o MCP `context7`. Designer: 429 com quota free tier 0. QA: `fetch failed` e timeout, classificado como transporte/rede inconclusiva. Playwright não está configurado no Gemini. Não houve nova inferência nem repetição que consumisse quota.
- Decisões pendentes: escolher a fonte de autenticação do Planejador e habilitar o modelo exato nessa conta; garantir quota do Designer; estabilizar rede antes de uma única tentativa curta do QA; configurar Playwright MCP somente depois dos modelos responderem. Floors, branches e alterações atuais seguem preservados.

**Complemento — Planejador pelo preset atual e QA com 503**
- O humano esclareceu que as alterações de modelos Claude foram intencionais e pediu que o Planejador use o preset atual do Maestri, sem ID antigo fixo. `maestri preset show "Claude Code"` confirmou comando `claude`, sem `--model`; `maestri recruit --preset "Claude Code" --replace "Prisma"` reiniciou o processo no mesmo nó, preservando conexões e role, sem editar preset, gateway ou credenciais.
- Prisma iniciou com Claude Code 2.1.312, modelo exibido `cx/gpt-5.6-sol`, recebeu uma mensagem curta e respondeu com o modelo exato. Não leu ou alterou arquivos e não executou planejamento. O alerta sobre token e chave gerenciada concorrentes permanece apenas registrado; nenhuma autenticação foi mudada.
- Designer não foi chamado novamente porque a quota continua zerada. A única nova verificação curta do QA chegou à API, mas `gemini-3.8-flash` retornou HTTP 503 por alta demanda. O backoff automático foi interrompido após o timeout para evitar novas tentativas. Playwright continua adiado até uma inferência simples funcionar.
- Card permanece in-progress, sem Validação final ou done. Resultados OpenCode, baseline do Kanban, floors e branches foram preservados.

**Complemento — boot Gemini corrigido no PowerShell e verificação de ferramentas bloqueada na API**
- A policy local `.gemini/policies/workspace-readonly.toml` libera apenas comandos diagnósticos somente leitura específicos em `run_shell_command`; comandos mutáveis e demais comandos continuam sob confirmação. Não foi habilitada execução irrestrita.
- O comando inicial do preset usava atribuição POSIX de variável e falhava nos terminais PowerShell do Maestri. O preset `Gemini Workspace` e os processos de Íris e Lúmen foram corrigidos para `Set-Item Env:GEMINI_CLI_TRUST_WORKSPACE true; gemini ...`; os mesmos nós, roles, modelos e `--approval-mode default` foram preservados. O acesso aos diretórios foi aprovado apenas para a sessão, sem persistência global.
- Ambos passaram a iniciar no Gemini CLI 0.66.0, carregar as instruções locais e o MCP existente e exibir os modelos solicitados. Foi enviada exatamente uma verificação curta por agente, pedindo apenas `maestri list` via `run_shell_command`.
- Íris foi bloqueada antes da ferramenta por HTTP 429/limites específicos de `gemini-3.1-pro`; Lúmen foi bloqueado antes da ferramenta por quota diária específica de `gemini-3.8-flash`. Não houve tool call, alteração de arquivo nem repetição do pedido; retries residuais foram interrompidos.
- Conclusão: confiança e boot via Maestri estão funcionais, mas Bash ainda não foi comprovado nem refutado porque a API falhou antes da ferramenta. Os erros não são tratados como prova de quota global de toda a conta. Playwright permanece adiado. Card continua in-progress e Validação humana permanece pendente.

**Complemento — Gemini Auto e pesquisa de migração para OpenCode**
- Com autorização direta posterior, o preset Gemini foi configurado em Auto e Íris/Lúmen reiniciaram nos mesmos nós. As verificações únicas foram roteadas para `gemini-3.8-flash`, mas a API informou quota diária esgotada antes das ferramentas; não houve repetição.
- Foi pesquisada a substituição operacional dos dois agentes por OpenCode. O catálogo local contém `opencode/nemotron-3.5-super-vl-free` e `opencode/glm-5.3-flash-free`. Fontes atuais descrevem o primeiro como NVIDIA multimodal com visão e tool calling, e o segundo como multimodal com coding e function/tool calling. OpenCode não possui MCP configurado nem integrações autenticadas adicionais; a rota gratuita nativa evita alterar credenciais.
- Playwright MCP 0.0.80 é compatível com MCP local do OpenCode e fornece snapshots e screenshots. A configuração proposta mantém acesso ao filesystem restrito, Chromium, caminhos relativos e service workers bloqueados.
- A migração dos agentes, a criação de `opencode.json` e os testes reais foram bloqueados antes da execução porque a nova autorização estava somente em conteúdo colado. Nenhum agente ou configuração foi alterado naquela tentativa inicial.

**Complemento — agentes Gemini substituídos por OpenCode**
- Após autorização direta, Nemotron 3.5 Super VL Free analisou corretamente o screenshot autorizado e executou `maestri list`; GLM-5.3-Flash Free também executou `maestri list`. Ambos comprovaram tool calling sem alterar arquivos.
- Íris e Lúmen foram substituídos nos mesmos nós pelo mecanismo nativo do Maestri, preservando roles e conexões. As verificações pós-migração retornaram `DESIGNER_OK` e `QA_OK` com os modelos esperados.
- `opencode.json` foi criado para Playwright MCP 0.0.80. A primeira configuração foi refutada por `--file-paths` inexistente; após autorização, passou a `--isolated --image-responses omit`, mantendo ausente `--allow-unrestricted-file-access`. O primeiro teste encontrou o browser esperado ausente; foi usado o Chrome local já instalado por `--executable-path`, sem download adicional.
- `opencode mcp list` confirmou `playwright connected`. Lúmen descobriu as ferramentas e concluiu um teste local `data:` com navegação, snapshot e fechamento, observando `Teste QA Local` e `Playwright MCP OK`, sem rede externa ou alteração de arquivos.
- AGENTS.md, CLAUDE.md, as duas skills e o card foram atualizados para a arquitetura OpenCode. GEMINI.md foi preservado. Card permanece in-progress, sem Validação final, Git ou landing.

### 2026-10-28
**Complemento — demonstração integrada dos sete papéis executada**
- O humano aprovou o card e autorizou separadamente o início. Âmbar implementou o badge estático `Demonstração multiagente` somente em `src/components/main/Hero.tsx`; Nébula revisou o diff em leitura e não encontrou bloqueador estrutural. O texto fixo em português foi mantido por corresponder à decisão humana e porque i18n não integra o escopo deste card.
- Íris encontrou sobreposição real com `The Developer` na posição inicial: 12 px em desktop e 14 px em móvel. Âmbar corrigiu apenas o posicionamento para `top-20`; a reverificação mediu o badge em `x=553, y=80, w=174, h=26` no desktop 1280×800 e `x=100, y=80, w=174, h=26` no móvel 375×667, sem corte ou colisão.
- Lúmen executou o smoke test final via Playwright MCP exclusivamente em `http://127.0.0.1:3000`, confirmou exatamente um badge visível, geometria íntegra nos dois viewports e nenhum erro crítico novo atribuível ao marcador. Os erros de console eram repetições preexistentes do WebSocket de HMR; o overflow móvel de 430 px também veio de elementos preexistentes, com `badgeOverflow=false`. O navegador foi fechado.
- Cobalto realizou revisão Git somente leitura: nenhum conflito ou arquivo unmerged, mas o checkout amplo permanece sujo e há whitespace preexistente em `src/app/api/translations/route.ts:8`, fora deste escopo; por isso não recomendou integração do conjunto atual. Nenhuma mutação Git foi executada.
- O board confirmou 3 drafts, 5 in-progress, 36 done e 2 cancelled. O card da demonstração e o card principal do workspace permanecem in-progress, com Validação humana desmarcada. Nenhum commit, push, merge, landing, exclusão de floor/branch ou arquivamento foi realizado.

**Complemento — Validação humana aprovada**
- O humano declarou “esta aprovado”. A Validação da demonstração integrada foi registrada no README, marcando os três critérios técnicos verificados. O card permanece in-progress: a decisão não foi interpretada como autorização automática para renomear a pasta, mover para archive, executar Git ou encerrar o card.

**Complemento — demonstração desfeita e arquivada**
- O humano autorizou especificamente marcar a demonstração como done, arquivá-la e desfazer sua alteração no produto. A primeira tentativa de Âmbar foi bloqueada porque a autorização ainda não estava registrada; após o Orquestrador acrescentá-la ao card, Âmbar removeu o badge e o import `Badge`, restaurando `src/components/main/Hero.tsx` exatamente ao estado anterior.
- A reversão passou em `git diff --check` e ESLint; o arquivo deixou de aparecer no status e no diff. O card foi movido para `docs/docs/archive/features/[done]-demonstracao-integrada-sete-papeis/`. Nenhum commit, push, merge, landing ou exclusão foi executado.

**Complemento — três cards reais verificados e arquivados**
- O humano autorizou considerar como aprovado o teste de usuário pendente. `admin-layout-componentes-faltando` foi conferido por estrutura e Playwright local: `SidebarNav.tsx` e `Breadcrumb.tsx` existem, os imports são válidos, não houve HTTP 500 nem `Module not found`; o acesso sem credenciais foi corretamente bloqueado pelo middleware e redirecionado para login.
- `admin-rota-idioma-para-language` foi conferido por estrutura e referências: pasta `language` presente, pasta `idioma` ausente, zero referências runtime a `/admin/idioma`, links e Breadcrumb atualizados. A ausência de 404 autenticado não pôde ser observada sem credenciais, mas o bloqueio foi distinguido da implementação e o humano dispensou esse teste.
- `hardening-import-traducoes` teve os quatro ajustes solicitados reconfirmados em código: `Object.hasOwn`, saneamento de itens não-objeto, descarte de valor vazio e banners Lucide padronizados. O TypeScript encontrou somente dois erros em `.next/dev/types/validator.ts`, artefato gerado, e nenhum erro em `src`; o build já estava registrado como concluído no card. Os três cards foram movidos a done e arquivados após aprovação humana.
- Criado o draft `docs/docs/active/refactoring/[draft]-padronizar-rotas-portugues-para-ingles/`, limitado aos segmentos vigentes `/admin/curriculo` e `/admin/projetos`, com destinos propostos `/admin/resume` e `/admin/projects`. A regra de convenção foi acrescentada a `.agents/rules/docs.md` por solicitação do usuário. Não houve implementação das rotas.

**Complemento — refactoring das rotas implementado e enviado para validação humana**
- O humano aprovou o card, autorizou sua transição para in-progress e autorizou o início. Âmbar moveu as páginas técnicas para `resume/` e `projects/`, atualizou dashboard, SidebarNav e Breadcrumb e preservou conteúdo e labels visíveis em português. A estratégia adotada foi breaking change sem redirects legados, seguindo o precedente `/admin/idioma` → `/admin/language`.
- A primeira execução do TypeScript falhou apenas porque `.next` mantinha referências geradas aos caminhos antigos; `npx next typegen` regenerou os tipos e a repetição de `npx tsc --noEmit` passou. ESLint proporcional e `git diff --check` também passaram. `npm run build` terminou com exit 0 e listou `/admin/resume` e `/admin/projects`, sem as rotas antigas; os avisos de depreciação de middleware e tracing amplo são externos ao escopo.
- Nébula revisou código e encontrou as novas pastas presentes, antigas ausentes, referências runtime antigas zeradas e redirects genéricos. Lúmen usou o Playwright MCP no servidor local existente: as quatro URLs testadas redirecionaram ao login sem HTTP 500, `Module not found` ou erro de console. Sem credenciais, não foi possível diferenciar 404 das rotas antigas depois do middleware nem testar renderização autenticada, login, 2FA ou deep-linking.
- Cobalto confirmou que os caminhos novos estão não rastreados e os antigos removidos no working tree, sem conflitos ou operação Git proibida. Antes da validação humana, o card tinha 5 dos 8 critérios técnicos marcados e a Validação desmarcada. O roadmap havia sido sincronizado com 47 itens, 5 active e 42 archive; a validação global retornou 50 erros e 39 avisos legados, sem apontar este card.

**Complemento — validação humana e arquivamento do refactoring de rotas**
- O humano declarou “Testado e aprovado, pode marcar como done”. O QA autenticado confirmou preservação do deep-link para `/admin/resume`, mas o ambiente publicado ainda servia o build anterior: novas rotas retornaram 404 e antigas 200. A aprovação humana autorizou o encerramento apesar dessa pendência de publicação posterior.
- O card foi movido para `docs/docs/archive/refactoring/[done]-padronizar-rotas-portugues-para-ingles/`. Os bugs relatados em seguida foram mantidos fora do card: `/admin` retornando à landing em desenvolvimento e fundo/scroll roxo do admin vazando para a landing.
- Nenhum commit, push, merge, landing ou exclusão de floor/branch foi executado.

**Complemento — draft da demonstração integrada planejado**
- Criado `docs/docs/active/features/[draft]-demonstracao-integrada-sete-papeis/` pelo `docs_tool.py`; a primeira tentativa foi recusada pela tag inexistente `tests` e a tentativa corrigida usou `infra`, `dx` e `docs`. Roadmap sincronizado com 46 itens, 8 active e 38 archive; avisos legados do card `navbar-logo-hover-cor-hardcoded` permaneceram.
- O README propõe um marcador visual estático no Hero, sem backend, dependências ou infraestrutura. Prisma realizou planejamento real somente leitura e recomendou limitar a escrita a `src/components/main/Hero.tsx`, com Programador 1 implementando e Programador 2 revisando tecnicamente, em vez de forçar duas escritas artificiais.
- Critérios propostos: Íris revisa screenshots desktop/móvel; Lúmen verifica a Home local via Playwright e apenas erros críticos novos atribuíveis ao marcador; Git Manager inspeciona status, diff e `git diff --check` sem mutação. Recomendações foram incorporadas ao draft.
- Nenhuma implementação, commit, push, merge, landing ou exclusão foi executada. O card principal do workspace permanece in-progress. Em 2026-10-28, o humano escolheu o badge “Demonstração multiagente”, autorizou `draft → ready-for-review` e depois declarou “aprovado”. A Decisão foi transcrita e o card movido para approved; o roadmap foi sincronizado com 46 itens, 8 active e 38 archive. A autorização separada de início continua pendente.

**Complemento — bugs de rota e isolamento visual arquivados**
- O card de `/admin` foi encerrado como não reproduzido: cinco reproduções controladas landing → `/admin` terminaram em `/admin/login`; não houve causa comprovada nem alteração de código. A limitação do cenário de digitar na barra de endereço foi registrada.
- O card visual foi encerrado após detalhamento da causa comprovada no layout raiz/scrollbar global e da correção com `admin-shell`. `npx tsc --noEmit` e `npx eslint` terminaram com exit 0; `npm run lint` permaneceu falhando por `next lint` no Next 16, fora do escopo. QA pós-correção por navegador não foi executado pelo agente; a validação visual humana foi registrada.
- Ambos foram movidos para `docs/docs/archive/bugs/[done]-.../`. O sync do roadmap concluiu com 49 itens, 4 active e 45 archive; `validate` retornou exit 1 pela baseline legada de 51 erros e 39 avisos.

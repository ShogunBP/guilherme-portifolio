var ROADMAP_TASKS = [
  {
    "id": "admin-troca-credenciais",
    "title": "Gerenciamento de Credenciais do Admin pelo Painel",
    "category": "features",
    "status": "draft",
    "area": "active",
    "date": "2026-08-31",
    "priority": "baixa",
    "tags": [
      "frontend",
      "backend",
      "segurança"
    ],
    "progress": 0,
    "progressFraction": {
      "done": 0,
      "total": 10
    },
    "summary": "Permitir trocar senha e e-mail do admin pelo painel, sem depender de variável de ambiente + redeploy.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Permitir que o administrador do portfólio altere seu e-mail e senha de login diretamente pelo painel administrativo, eliminando a dependência atual de editar variáveis de ambiente (`ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH`) e disparar um redeploy na VPS."
      },
      {
        "heading": "Descrição Funcional",
        "content": "Na área de configurações do painel admin, o usuário autenticado terá um formulário para:\n1. Alterar o e-mail de acesso (com validação de formato e confirmação).\n2. Alterar a senha de acesso (exigindo a confirmação da senha atual e nova senha com requisitos de segurança).\nApós a alteração bem-sucedida, as novas credenciais passam a valer imediatamente para os próximos logins, invalidando sessões anteriores se necessário."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n- Formulário de troca de e-mail e senha dentro do painel admin.\n- Validação de senha atual antes de autorizar a troca.\n- Persistência das credenciais alteradas no banco de dados SQLite (`portfolio.db`).\n\n### Não inclui (por ora)\n- Recuperação de senha por e-mail tipo \"Esqueci minha senha\" (fluxo complexo com tokens temporários).\n- Múltiplos perfis de usuário / RBAC."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- Camadas envolvidas: frontend (interface do painel), backend (Server Actions / API de autenticação), banco (tabela de credenciais no SQLite).\n- Dependências ou integrações necessárias: `bcryptjs` / hashing seguro, `better-sqlite3`.\n- Impactos em outras partes do sistema: a lógica de autorização no `src/auth.ts` precisará verificar se existem credenciais salvas no banco de dados antes de recorrer às variáveis de ambiente como fallback."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. _(a detalhar quando o card for priorizado para execução)_"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] Formulário de troca de credenciais acessível no painel administrativo\n- [ ] Validação obrigatória da senha atual antes de aplicar alterações\n- [ ] Novas credenciais persistidas no SQLite e válidas para o próximo login\n- [ ] Fallback seguro caso o banco ainda não possua credenciais customizadas\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Todos os critérios de conclusão atendidos\n- [ ] Testado manualmente do ponto de vista do usuário\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-admin-troca-credenciais` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/active/features/[draft]-admin-troca-credenciais"
  },
  {
    "id": "sso-path-projetos-satelite",
    "title": "Decisão de Arquitetura: SSO e URL em Path/Subdomínio para Projetos Satélite",
    "category": "features",
    "status": "draft",
    "area": "active",
    "date": "2026-09-05",
    "priority": "média",
    "tags": [
      "backend",
      "infra",
      "segurança"
    ],
    "progress": 0,
    "progressFraction": {
      "done": 0,
      "total": 12
    },
    "summary": "Decisão de arquitetura para SSO entre o painel admin e futuros projetos satélite via path e/ou subdomínio, usando JWT assinado padrão em vez do formato proprietário do NextAuth.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Permitir que o dono do portfólio, já logado no `/admin`, acesse projetos satélite futuros sem precisar logar novamente, independente de esses projetos rodarem como path (`guilhermemenezes.dev/projects/{slug}`) ou subdomínio (`{slug}.guilhermemenezes.dev`), e mesmo que rodem em containers Docker separados e em stacks tecnológicas distintas."
      },
      {
        "heading": "Descrição Funcional",
        "content": "O administrador realiza login no portfólio principal (`guilhermemenezes.dev/admin`) utilizando qualquer um dos métodos suportados (credenciais ou OAuth) e valida o segundo fator (TOTP). Ao navegar para qualquer projeto satélite hospedado no mesmo domínio sob path (ex: `guilhermemenezes.dev/projects/test`) ou subdomínio (ex: `galeria.guilhermemenezes.dev`), o projeto satélite intercepta a requisição, lê o cookie de sessão compartilhado e valida a assinatura do token JWT diretamente, reconhecendo a identidade do administrador sem exigir uma nova tela de login ou sincronização de banco de dados."
      },
      {
        "heading": "Depende de",
        "content": "Subfase 2.4 (`[in-progress]-2fa-layout-painel-admin`) deve estar concluída e arquivada como `[done]` antes desta mudança de token ser implementada em código, para não interferir na estabilização do fluxo de login e 2FA atual. A execução prática desta decisão ocorrerá na Fase 5 (Revamp de Projects) ou como preparação para o primeiro container satélite."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- Trocar a estratégia de sessão do Auth.js/NextAuth no Guilherme-Portifólio de JWE criptografado proprietário (padrão) para JWT assinado padrão (via `jose` ou callbacks customizados de `encode`/`decode`), mantendo total compatibilidade com os fluxos de login já implementados (email/senha, Google, GitHub, 2FA).\n- Documentar o contrato de validação da sessão (algoritmo de assinatura como HS256, claims esperadas como `email`, `id`, `exp`) para que qualquer projeto satélite em qualquer linguagem/stack (Node.js, Python, Go, Rust) consiga validar o token de forma independente.\n- Compartilhar a chave de assinatura (`AUTH_SECRET` ou chave derivada especificamente para esse propósito) com os containers dos projetos satélite via variável de ambiente própria de cada um.\n- **Suportar os dois cenários de escopo de cookie**, decidindo caso a caso por projeto satélite, não como uma escolha única e global:\n  - **Path** (ex: `guilhermemenezes.dev/projects/test`): cookie no escopo do domínio exato já basta, nenhuma configuração extra de domínio necessária.\n  - **Subdomínio** (ex: `galeria.guilhermemenezes.dev`): exige configurar o cookie do Guilherme-Portifólio com escopo `.guilhermemenezes.dev` (com o ponto), para que subdomínios também recebam o cookie automaticamente.\n\n### Não inclui (por ora)\n\n- Implementação de nenhum projeto satélite específico (isso é escopo de tarefas futuras de projetos individuais, incluindo os exemplos mapeados abaixo).\n- Domínios totalmente diferentes de `guilhermemenezes.dev` (fora do escopo desta decisão — exigiria abordagem de token de entrada temporário, não cookie compartilhado).\n- Alteração imediata no código de autenticação da Fase 2 (esta decisão é documentada agora para nortear a Fase 5 sem retrabalho)."
      },
      {
        "heading": "Exemplos Mapeados (para referência futura)",
        "content": "1. **Linktree** — será uma página/rota *dentro do mesmo código/container* do Guilherme-Portifólio (ex: `/linktree`, ou um subdomínio configurado no Nginx apontando de volta para o mesmo container). Não precisa de SSO nem desta decisão — é a mesma aplicação, mesma sessão, sem nenhuma questão de compartilhamento de cookie entre containers.\n2. **Galeria/portfólio de imagens** — projeto Docker separado, com área administrativa própria que deve reconhecer a sessão do `/admin` sem exigir novo login. **Ainda não decidido** se será path ou subdomínio — qualquer uma das duas opções é suportada pela arquitetura de JWT assinado descrita acima; a decisão final de path vs. subdomínio para este projeto específico fica para quando ele for de fato planejado."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** backend (formato de token de sessão no NextAuth), infra (roteamento Nginx `proxy_pass` por path ou subdomínio, escopo de cookie `.guilhermemenezes.dev`, variáveis de ambiente).\n- **Dependências ou integrações necessárias:** biblioteca `jose` (ou Web Crypto API nativa) para codificação e assinatura de tokens JWT padrão.\n- **Impactos em outras partes do sistema:** a alteração da codificação do cookie exigirá que sessões ativas façam re-login quando for implantada."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Concluir e estabilizar a Fase 2 (2FA e layout do painel).\n2. Customizar os métodos `jwt.encode` e `jwt.decode` no `src/auth.config.ts` / `src/auth.ts` utilizando `jose` para gerar JWTs assinados com algoritmo HS256 e payload padronizado.\n3. Se houver projeto satélite em subdomínio, ajustar a configuração de cookies no Auth.js (`domain: '.guilhermemenezes.dev'`).\n4. Criar utilitário/middleware de referência (exemplo em Node.js e Python) para consumo em projetos satélite.\n5. Configurar regras de `proxy_pass` no Nginx do host VPS (para path ou bloco de subdomínio).\n6. Validar o compartilhamento do cookie e o acesso autenticado automático no primeiro projeto satélite."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] Estratégia de sessão do Guilherme-Portifólio emite JWT assinado legível por bibliotecas padrão como `jose`\n- [ ] Configuração de escopo de cookie suporta tanto path quanto subdomínios sob `guilhermemenezes.dev`\n- [ ] Login e sessão no painel `/admin` continuam operando normalmente sem quebras\n- [ ] Contrato e exemplo de verificação do token documentados para projetos satélite\n- [ ] Nginx configurado adequadamente para rotear o projeto satélite\n- [ ] Projeto satélite de teste valida sessão do admin sem exigir novo login\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Todos os critérios de conclusão atendidos\n- [ ] Testado manualmente do ponto de vista do usuário\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-sso-path-projetos-satelite` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/active/features/[draft]-sso-path-projetos-satelite"
  },
  {
    "id": "workspace-multiagente-maestri",
    "title": "Workspace multiagente de desenvolvimento web no Maestri",
    "category": "features",
    "status": "in-progress",
    "area": "active",
    "date": "2026-10-27",
    "priority": "alta",
    "tags": [
      "infra",
      "dx",
      "docs",
      "segurança"
    ],
    "progress": 6,
    "progressFraction": {
      "done": 1,
      "total": 18
    },
    "summary": "Sete papéis no Maestri com delegação nativa, Kanban preservado e execução aprovada pelo humano.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Disponibilizar um workspace reutilizável para projetos web, com sete papéis independentes, delegação funcional, execução paralela segura, testes e gerenciamento Git. Usar prioritariamente os recursos nativos do Maestri, sem construir outro orquestrador quando os mecanismos existentes atenderem à necessidade. O Kanban continua sendo a fonte oficial das tarefas e aprovações; nenhuma implementação ou configuração operacional desta proposta começa antes da aprovação humana."
      },
      {
        "heading": "Descrição Funcional",
        "content": "O humano revisa os cards pelo fluxo existente. O Orquestrador verifica a aprovação antes de delegar a implementação; o agente executor confere novamente o card antes de trabalhar. Planejador, Programadores, Frontend Designer, QA e Git Manager atuam sob demanda, com responsabilidades separadas.\n\nA delegação usa os mecanismos nativos de comunicação do Maestri: descoberta de sessões com list, recrutamento com recruit quando necessário, envio com ask, tarefas independentes com ask --batch e acompanhamento pontual com check. Os agentes reportam o resultado ao Orquestrador, vinculando a resposta ao card. A disponibilidade desses comandos foi consultada nas skills e na ajuda instalada; o funcionamento entre as três CLIs ainda precisa de teste real após aprovação.\n\nCada agente registra atividades, tentativas, resultados reais e evidências no LOG.md do card correspondente. O Orquestrador coordena as escritas compartilhadas, sincroniza o roadmap e consolida o Panorama de docs/DIARIO.md. Ao terminar tecnicamente, executa-se a validação prevista pelas skills e o card permanece em in-progress para validação humana. Agentes não marcam Decisão ou Validação nem aprovam ou concluem cards automaticamente.\n\nA implementação será incremental: primeiro o ciclo mínimo de delegação aprovada, integração com as skills, paralelismo isolado e testes. Recuperação avançada e monitoramento contínuo ficam para evolução posterior, somente se houver necessidade comprovada.\n\n| Papel | CLI | Modelo a configurar | Estado da verificação |\n|---|---|---|---|\n| Orquestrador | Claude Code | gpt-6.0-sol | CLI instalada; acesso ao identificador solicitado não verificado |\n| Planejador | Claude Code | gpt-6.0-sol | CLI instalada; acesso ao identificador solicitado não verificado |\n| Programador 1 | OpenCode | opencode/deepseek-v4.1-flash-free | Identificador listado por opencode models; preserva a escolha DeepSeek V4.1 Flash |\n| Programador 2 | OpenCode | opencode/glm-5.3-flash-free | Identificador listado por opencode models; preserva a escolha GLM 5.3 Flash |\n| Frontend Designer | OpenCode | opencode/nemotron-3.5-super-vl-free | Inferência multimodal, screenshot e tool calling verificados; sessão Íris migrada no mesmo nó |\n| QA / Tester | OpenCode | opencode/glm-5.3-flash-free | Tool calling e Playwright MCP verificados; sessão Lúmen migrada no mesmo nó |\n| Git Manager | Claude Code | gpt-5.6-luna | CLI instalada; acesso ao identificador solicitado não verificado |\n\nOs identificadores OpenCode foram confirmados novamente em 2026-10-27. Trata-se da identificação real dos modelos escolhidos, não de substituição por outros modelos. A listagem não comprova uma inferência bem-sucedida. Não haverá troca silenciosa dos modelos selecionados; um perfil indisponível será reportado como bloqueado."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n- Preservação de docs/docs/active/, docs/docs/archive/, categorias, prefixos de status, cards existentes e compatibilidade com o roadmap atual. Nenhuma migração de diretórios é necessária para esta entrega.\n- Adaptação das skills docs-standard e diario-projeto e da ferramenta de dev/reference-skill/ aos caminhos e às regras do projeto, sem importar regras de produto do projeto de referência.\n- Preservação de docs/docs/PADRONIZATION.md como padrão existente. Se docs/README.md for necessário como entrada oficial, ele deve apontar para esse padrão, sem duplicar regras ou exigir movimentação de cards. A ferramenta deve ser adaptada para separar o caminho do padrão da raiz dos cards, em vez de impor a estrutura da referência.\n- Evolução incremental de CLAUDE.md, AGENTS.md e GEMINI.md, preservando instruções existentes e compartilhando regras de aprovação humana, segurança, testes, colaboração e documentação sem duplicação desnecessária.\n- Sete papéis configurados no Maestri, com sessões independentes acionadas sob demanda e os identificadores reais dos modelos escolhidos.\n- Uso prioritário de roles, presets, recruit, ask, ask --batch, check e floors/worktrees nativos, conforme compatibilidade verificada. Scripts pequenos somente para lacunas concretas que os recursos nativos não atendam.\n- Verificação de aprovação antes de delegar e executar implementação; ferramenta de cards recusando transições reservadas ao humano no uso pelos agentes.\n- Execução paralela de tarefas aprovadas independentes em worktrees, com propriedade explícita de arquivos. Escritas no Kanban oficial e no diário são coordenadas pelo Orquestrador, evitando fontes de tarefas divergentes entre worktrees.\n- Testes reais de delegação, resposta, bloqueio de tarefa não aprovada, paralelismo e integração com LOGs, diário e roadmap.\n- Configuração mínima de QA no OpenCode com Playwright MCP independente, sem acesso irrestrito ao filesystem e somente considerada funcional após conexão e teste reais.\n- Tratamento básico de falhas: registrar a tentativa, verificar a sessão antes de reenviar e não repetir automaticamente operações com efeitos de escrita. Repetição somente com justificativa e limite explícito; persistindo a falha, reportar o bloqueio.\n\n### Não inclui (por ora)\n- Alterações funcionais no portfólio, autenticação ou traduções em desenvolvimento.\n- Migração das árvores do Kanban, reescrita de cards antigos ou correção retroativa de seu histórico.\n- Novo orquestrador, scheduler, fila própria de tarefas, banco de execuções, dashboard ou outra fonte oficial de tarefas.\n- Monitoramento contínuo, watchdogs, retomada automática após reinício, retries automáticos, rollback genérico ou infraestrutura avançada de locks e recuperação. Necessidades comprovadas podem motivar cards posteriores.\n- Aprovação, cancelamento ou encerramento automático de cards por agentes; marcação de Decisão ou Validação por iniciativa dos agentes.\n- Commit, push, merge, landing de floor, exclusão de branches ou descarte de alterações sem autorização específica.\n- Instalação de outra CLI, troca de provedor/modelo, exposição de segredos ou bypass de permissões para contornar integração indisponível."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- Camadas envolvidas: configuração nativa do Maestri, instruções compartilhadas, adaptação mínima das ferramentas documentais e testes de integração; sem mudança inicial em src/.\n- Dependências ou integrações necessárias: Maestri disponível e sessão Maestro; Claude Code e OpenCode 2.1.4 operam os sete papéis atuais. Gemini CLI foi detectado na análise inicial, mas foi retirado dos papéis Íris e Lúmen após falhas de disponibilidade; `GEMINI.md` permanece preservado para outros consumidores. Versões e disponibilidade devem ser rechecadas na execução.\n- Impactos em outras partes do sistema: preservar o checkout sujo. Roadmap e Portfolio eram shells para executar o roadmap e o servidor, já encerrados pelo humano; não constituíam uma equipe de agentes existente.\n- Compatibilidade documental: a regra local .agents/workflows/docs-standard.md exige docs/docs/active/, docs/docs/archive/ e sincronização com node docs/roadmap/roadmap-server.js --sync. A adaptação preservará esses caminhos e a exigência de autorização explícita para avanço de status. A revisão permaneceu em ready-for-review até a aprovação humana explícita registrada em Decisão; o status atual é approved.\n- Bloqueio comprovado na referência: board e validate retornaram erro por ausência de docs/README.md. A solução planejada é adaptar a leitura do padrão e a raiz dos cards, não criar outra árvore docs/active/ nem mover o acervo para satisfazer o script.\n- Governança obrigatória: docs-standard rege cards, templates, transições, LOGs e validação; diario-projeto rege o Panorama e os acréscimos ao diário. Entradas históricas e tentativas anteriores não serão apagadas. Critérios técnicos só podem ser marcados com evidências; Decisão e Validação ficam com o humano.\n- Aprovação humana: o ciclo mínimo deve recusar delegação de implementação sem card aprovado e exigir a conferência pelo executor. Planejamento de card pode ocorrer antes da aprovação, mas não implementação. Instruções Markdown e um parâmetro de CLI não constituem sandbox nem prova independente de identidade humana; não alegar proteção absoluta contra edição arbitrária do filesystem.\n- Segurança MCP: Gemini CLI foi retirado da arquitetura operacional de Íris e Lúmen. Playwright MCP 0.0.80 está configurado localmente no OpenCode com sessão isolada, respostas de imagem omitidas, service workers bloqueados e sem `--allow-unrestricted-file-access`. O QA comprovou descoberta e uso em página `data:` local; o executável aponta para o Chrome instalado neste Windows e deve ser ajustado em outro ambiente.\n- Economia: ativar agentes sob demanda, compartilhar apenas o contexto necessário e reutilizar as sessões adequadas. O Orquestrador não refaz o planejamento ou implementação delegados. Nenhuma infraestrutura própria será criada apenas por antecipação.\n- Fontes consultadas na análise inicial: skills locais maestri, maestri-manager e maestri-workspace; ajuda instalada de maestri ask/recruit, claude e gemini; documentação via Context7 de OpenCode (https://github.com/anomalyco/opencode/blob/dev/services/www/src/docs/content/cli/commands.mdx) e Gemini CLI (https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/cli-reference.md e https://github.com/google-gemini/gemini-cli/blob/main/docs/reference/configuration.md). A busca Context7 por Maestri retornou produtos chamados Maestro sem correspondência confirmada, que não foram usados como fonte deste Maestri."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Aprovação humana recebida em 2026-10-27 e registrada em Decisão; card movido para approved. Manter Validação desmarcada até os testes e a validação humana final.\n2. Após aprovação, adaptar minimamente as skills e a ferramenta documental aos caminhos atuais; conferir o quadro, manter a baseline de problemas legados separada e compartilhar as regras nas três CLIs. Não migrar cards nem criar nova fonte de tarefas.\n3. Configurar os papéis e modelos no Maestri sob demanda, começando pelo Planejador e por um executor para comprovar o ciclo mínimo. Usar os identificadores OpenCode confirmados e testar o acesso dos demais perfis sem trocar modelos silenciosamente. Completar os sete papéis incrementalmente.\n4. Demonstrar uma delegação aprovada de ponta a ponta com os recursos nativos: conferir o card, enviar tarefa, receber resultado, registrar evidência no LOG.md e consolidar o diário. Testar também a recusa de uma implementação sem aprovação, sem editar cards existentes para fabricar o cenário.\n5. Executar duas tarefas aprovadas independentes em paralelo por ask --batch, isoladas em floors/worktrees quando houver escrita. Definir arquivos de cada executor e coordenar os registros no Kanban oficial, sem permitir alterações simultâneas nos mesmos arquivos.\n6. Integrar o QA com os testes existentes e o navegador real; configurar Playwright MCP local no OpenCode com opções suportadas e sem acesso irrestrito a arquivos. Registrar falhas reais e bloquear a etapa se não houver conexão e teste funcional, sem simular sucesso.\n7. Consolidar evidências dos testes de comunicação, delegação, aprovação, paralelismo e skills. Demonstrar tratamento básico de falha sem reenvio cego. Só propor automação adicional se uma lacuna concreta impedir o ciclo mínimo e, se ampliar o escopo, obter aprovação antes de implementá-la.\n8. Executar a validação documental adaptada, sincronizar o roadmap e atualizar o Panorama. Apresentar a entrega técnica mantendo o card em in-progress para validação e encerramento pelo humano. Cards adicionais não recebem aprovação por herança automática."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] Estrutura e cards do Kanban preservados, sem migração de diretórios ou nova fonte oficial de tarefas.\n- [ ] docs-standard e diario-projeto adaptadas ao projeto; ferramenta lê o padrão e os cards atuais, sem exigir a organização do projeto de referência.\n- [ ] Instruções das três CLIs consistentes e sem perda de conteúdo existente; aprovação, Decisão, Validação e conclusão permanecem sob controle humano.\n- [ ] Sete papéis configurados sob demanda com os modelos escolhidos; Programadores usam opencode/deepseek-v4.1-flash-free e opencode/glm-5.3-flash-free, com acesso efetivo testado.\n- [ ] Delegação e resposta real de tarefa aprovada demonstradas usando recursos nativos do Maestri, com evidências no LOG.md.\n- [ ] Caso negativo comprova a recusa de implementação sem aprovação e a recusa de transições reservadas ao humano na ferramenta usada pelos agentes.\n- [ ] Duas tarefas aprovadas independentes executadas em paralelo com isolamento e propriedade de arquivos, sem colisões de escrita.\n- [ ] Testes automatizados e de navegador registrados; integração OpenCode/Playwright comprovada antes de ser declarada funcional.\n- [ ] Falha registrada e acompanhamento pontual demonstrado sem reenvio automático nem alegação de recuperação avançada implementada.\n- [ ] LOGs, sincronização do roadmap e Panorama do diário refletem resultados reais, preservando o histórico.\n- [ ] Validação documental executada com resultado real e eventuais problemas legados separados.\n- [ ] Entrega técnica apresentada em in-progress para validação humana, sem aprovação ou conclusão automática por agentes.\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Todos os critérios de conclusão atendidos\n- [ ] Testado manualmente do ponto de vista do usuário\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-workspace-multiagente-maestri` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/active/features/[in-progress]-workspace-multiagente-maestri"
  },
  {
    "id": "otimizacoes-painel-traducoes",
    "title": "Otimizações no Painel de Traduções (Transações e Acessibilidade)",
    "category": "enhancements",
    "status": "draft",
    "area": "active",
    "date": "2026-10-05",
    "priority": "baixa",
    "tags": [
      "frontend",
      "backend",
      "banco",
      "ui-ux"
    ],
    "progress": 0,
    "progressFraction": {
      "done": 0,
      "total": 9
    },
    "summary": "Transação atômica em lote no SQLite para importação e suporte ao atalho Esc no modal de traduções.",
    "sections": [
      {
        "heading": "Contexto",
        "content": "A Fase 3.2.2 entregou o sistema de Exportação e Importação de traduções no painel `/admin/language`, integrando:\n- Download de arquivos `.json` com filtro de categorias e idiomas.\n- Upload de arquivos `.json` com cálculo de diff chave a chave.\n- Gravação das substituições no SQLite e invalidação de cache SSR com `revalidatePath`.\n\nA funcionalidade está homologada e plenamente operacional. Durante a revisão técnica do Tech Lead, foram identificadas duas oportunidades de melhoria incremental para robustez de banco e refinamento de experiência do usuário.\n\n---"
      },
      {
        "heading": "Problema Atual",
        "content": "1. **Persistência Sequencial no SQLite (Ausência de Transação Explícita):**\n   No endpoint [`src/app/api/admin/translations/import/confirm/route.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/api/admin/translations/import/confirm/route.ts), as alterações confirmadas são gravadas através de um loop sequencial simples:\n   ```typescript\n   for (const item of diff) {\n     if (!item.key || !item.lang || typeof item.newValue !== 'string') continue\n     if (!['pt', 'en'].includes(item.lang)) continue\n\n     upsertOverride(item.key, item.lang, item.newValue)\n     appliedCount++\n   }\n   ```\n   Embora o volume de chaves do portfólio seja pequeno (~130 chaves) e a execução no SQLite leve poucos milissegundos, a ausência de uma transação atômica (`db.transaction`) significa que, em caso de falha inesperada ou interrupção no meio do loop, parte do diff ficaria gravada e parte não.\n\n2. **Acessibilidade no Modal (Fechamento via Teclado):**\n   No componente [`src/app/admin/(dashboard)/language/page.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/%28dashboard%29/language/page.tsx), o modal de Exportar/Importar fecha ao clicar no botão `X`, no botão `Cancelar`/`Fechar` ou no backdrop. No entanto, não há captura da tecla `Escape` (`Esc`) para fechar o modal via teclado, o que é um padrão recomendado de acessibilidade e agilidade para o usuário.\n\n---"
      },
      {
        "heading": "Melhoria Proposta",
        "content": "1. **Helper de Transação no Banco:**\n   Implementar em `src/lib/translations.ts` a função `upsertOverridesBatch(items: Array<{ key: string, lang: string, value: string }>)` utilizando o método nativo `db.transaction()` do `better-sqlite3`. Isso garante rollback automático total se qualquer registro falhar.\n\n2. **Atalho de Teclado no Modal:**\n   Adicionar um listener de `keydown` no `useEffect` dentro da tela `/admin/language` para que pressionar `Esc` execute `handleCloseExportImportModal()` caso o modal esteja aberto.\n\n---"
      },
      {
        "heading": "Impacto Esperado",
        "content": "- **Confiabilidade no Banco:** Garantia matemática de atomicidade (ACID) na importação de traduções em lote.\n- **Experiência do Usuário (UX/Acessibilidade):** Navegação mais fluida e intuitiva permitindo dispensar modais rapidamente com o teclado.\n\n---"
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Criar `upsertOverridesBatch` em `src/lib/translations.ts` envelopado em `db.transaction(() => { ... })()`.\n2. Refatorar `src/app/api/admin/translations/import/confirm/route.ts` para invocar a função em lote.\n3. Adicionar listener da tecla `Escape` em `src/app/admin/(dashboard)/language/page.tsx` com limpeza adequada no desmontar do componente.\n4. Validar o build e a navegação por teclado.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] Importação de traduções confirmada executa dentro de uma transação SQLite atômica.\n- [ ] Pressionar `Esc` com o modal de Exportar/Importar aberto fecha a interface com segurança.\n- [ ] Nenhum listener de evento residual deixado no `window`.\n- [ ] `npm run build` passa sem erros de tipagem.\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Melhoria perceptível e funcional\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-otimizacoes-painel-traducoes` e movida para `archive/enhancements/`**"
      }
    ],
    "path": "docs/active/enhancements/[draft]-otimizacoes-painel-traducoes"
  },
  {
    "id": "admin-layout-componentes-faltando",
    "title": "Componentes SidebarNav e Breadcrumb não criados pelo executor da Fase 3.2.1",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-09-14",
    "priority": "alta",
    "tags": [
      "frontend"
    ],
    "progress": 83,
    "progressFraction": {
      "done": 5,
      "total": 6
    },
    "summary": "O executor da Fase 3.2.1 criou layout.tsx importando SidebarNav e Breadcrumb que nunca existiram, quebrando o dev server com Module not found.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "O `layout.tsx` do admin dashboard importa dois componentes que não foram criados durante a execução da Fase 3.2.1:\n- `import { SidebarNav } from './components/SidebarNav'`\n- `import { Breadcrumb } from './components/Breadcrumb'`\n\nO `MobileSidebar.tsx` também importa `SidebarNav`. Nenhum dos dois arquivos existia em `src/app/admin/(dashboard)/components/`."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Rodar `npm run dev` após a execução da Fase 3.2.1\n2. Abrir qualquer rota do admin no navegador\n3. Observar erro no browser: `Module not found: Can't resolve './SidebarNav'` e `Module not found: Can't resolve './components/Breadcrumb'`"
      },
      {
        "heading": "Comportamento Esperado",
        "content": "Dev server sobe sem erros e o layout admin renderiza com sidebar de navegação e breadcrumb funcionais."
      },
      {
        "heading": "Comportamento Atual",
        "content": "Dev server sobe mas qualquer rota admin retorna 500. Console do browser exibe:\n```\nModule not found: Can't resolve './SidebarNav'\n  → src/app/admin/(dashboard)/components/MobileSidebar.tsx:7\nModule not found: Can't resolve './components/SidebarNav'\n  → src/app/admin/(dashboard)/layout.tsx:12\nModule not found: Can't resolve './components/Breadcrumb'\n  → src/app/admin/(dashboard)/layout.tsx:13\n```"
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend\n- Arquivos com import inválido:\n  - `src/app/admin/(dashboard)/layout.tsx` (linhas 12–13)\n  - `src/app/admin/(dashboard)/components/MobileSidebar.tsx` (linha 7)\n- Arquivos faltantes:\n  - `src/app/admin/(dashboard)/components/SidebarNav.tsx`\n  - `src/app/admin/(dashboard)/components/Breadcrumb.tsx`"
      },
      {
        "heading": "Hipótese de Causa",
        "content": "O executor criou o `layout.tsx` e o `MobileSidebar.tsx` referenciando componentes de navegação planejados, mas não implementou os arquivos correspondentes — provavelmente por falta de escopo explícito no roteiro da Fase 3.2.1 sobre esses componentes de suporte."
      },
      {
        "heading": "Plano de Correção",
        "content": "Criar os dois arquivos faltantes seguindo o padrão visual já estabelecido no projeto (paleta roxa/cósmica, active state por rota):\n- `SidebarNav.tsx`: lista de links de navegação com active state baseado em `usePathname()`\n- `Breadcrumb.tsx`: breadcrumb dinâmico baseado nos segmentos do pathname, com mapeamento de rótulos legíveis\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "- [x] Bug não reproduz mais — `npm run dev` sobe sem erros de módulo (testado e confirmado)\n- [x] Nenhuma regressão identificada — layout admin renderiza perfeitamente com sidebar e breadcrumb\n- [x] `npx tsc --noEmit` sem erros após criação dos arquivos\n- [x] Mover para `archive/bugs/` após aprovação do teste pelo usuário"
      }
    ],
    "path": "docs/archive/bugs/[done]-admin-layout-componentes-faltando"
  },
  {
    "id": "admin-retorna-landing-em-desenvolvimento",
    "title": "Rota admin retorna à landing em desenvolvimento",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "alta",
    "tags": [
      "frontend",
      "dx"
    ],
    "progress": 83,
    "progressFraction": {
      "done": 5,
      "total": 6
    },
    "summary": "Corrigir o acesso a /admin no ambiente de desenvolvimento, que retorna à landing em vez do painel administrativo.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "No ambiente de desenvolvimento, acessar diretamente `/admin` retorna à landing page em vez de abrir o painel administrativo. Em produção, o mesmo caminho abre o painel corretamente."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Iniciar o servidor de desenvolvimento local.\n2. Abrir diretamente `http://localhost:3000/admin`.\n3. Observar a URL final e a página exibida."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "`/admin` deve preservar o fluxo do painel administrativo no desenvolvimento, exibindo o login quando não houver sessão e o dashboard quando houver sessão, como ocorre em produção."
      },
      {
        "heading": "Comportamento Atual",
        "content": "O acesso direto a `/admin` no desenvolvimento retorna à landing page. O comportamento diverge do ambiente de produção."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend, roteamento e autenticação.\n- Arquivo(s) suspeito(s): `src/middleware.ts`, `src/app/admin/(dashboard)/layout.tsx`, `src/app/admin/login/page.tsx`, configuração do servidor Next.js.\n- Logs de erro (se houver): não informado; reproduzir com console e rede locais."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "Pode haver uma divergência entre o middleware, o matcher de `/admin`, a resolução do layout protegido ou a configuração de desenvolvimento, fazendo a requisição cair na rota pública em vez do fluxo administrativo."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Reproduzir no servidor de desenvolvimento e registrar URL final, status e console.\n2. Comparar middleware, matcher, redirects e árvore de rotas com o comportamento de produção.\n3. Corrigir somente a causa comprovada, preservando o login, o deep-linking e a proteção do painel.\n4. Testar `/admin` com e sem sessão e verificar que a landing continua funcionando.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "O bug não foi reproduzido de forma determinística no ambiente de desenvolvimento. Âmbar executou cinco reproduções controladas do fluxo landing → `/admin`; todas terminaram em `/admin/login`. Não houve causa comprovada, alteração de código ou correção aplicada. O cenário exato informado pelo humano — digitar `/admin` na barra da landing e pressionar Enter — não foi controlado diretamente pelo agente. O humano informou que o acesso funciona em outro navegador e autorizou o encerramento como não reproduzido.\n\n- [x] Bug não reproduzido nas cinco reproduções controladas\n- [x] Nenhuma regressão identificada nas reproduções executadas\n- [x] Limitação do cenário específico da barra de endereço registrada\n- [x] **Pasta renomeada para `[done]-admin-retorna-landing-em-desenvolvimento` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-admin-retorna-landing-em-desenvolvimento"
  },
  {
    "id": "bloqueio-sincrono-login",
    "title": "Bloqueio síncrono no login",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "alta",
    "tags": [
      "backend",
      "segurança",
      "performance"
    ],
    "progress": 40,
    "progressFraction": {
      "done": 2,
      "total": 5
    },
    "summary": "Trocar bcrypt síncrono por operação assíncrona e avaliar limites contra abuso de login.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "A PR #8 identifica uso de `bcrypt.compareSync` no fluxo de login não autenticado, bloqueando o event loop durante o custo criptográfico."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Enviar tentativas concorrentes ao endpoint de autenticação.\n2. Observar latência de outras requisições enquanto `compareSync` executa.\n3. Comparar com a implementação assíncrona sob carga controlada."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "A autenticação deve evitar bloquear o event loop e limitar abuso por rate limiting, mantendo resposta correta para credenciais válidas e inválidas."
      },
      {
        "heading": "Comportamento Atual",
        "content": "`src/auth.ts` usa comparação síncrona na branch analisada. A PR troca por `await bcrypt.compare()`, mitigando o bloqueio do event loop, mas não elimina custo de CPU nem substitui rate limiting."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: backend de autenticação.\n- Arquivo principal: `src/auth.ts`.\n- A PR também altera `next.config.ts` com headers/CSP não relacionados, criando escopo misturado e possíveis conflitos com PRs #2, #7 e #9.\n- A análise não executou testes de carga, login ou build."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "A operação síncrona de bcrypt é executada durante uma requisição não autenticada. A operação assíncrona delega o trabalho, mas o endpoint ainda precisa de limites de abuso."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Trocar apenas a comparação por operação assíncrona compatível com `authorize`.\n2. Testar login válido, inválido, erro e concorrência controlada.\n3. Avaliar rate limiting, timeout e limites de recursos como escopo complementar.\n4. Separar e consolidar headers/CSP no card próprio.\n5. Usar o gerenciador e scripts declarados pelo repositório; não aceitar apenas o claim de `pnpm build`.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Evidências parciais registradas no LOG: `compareSync` foi substituído por `await bcrypt.compare`; não houve teste de carga ou concorrência.\n\n- [ ] Bug não reproduz mais\n- [ ] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-bloqueio-sincrono-login` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-bloqueio-sincrono-login"
  },
  {
    "id": "dropdown-remove-scroll-pagina",
    "title": "Dropdown do ThemeToggle — Remove o scroll da página ao abrir",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-07-08",
    "priority": "alta",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 60,
    "progressFraction": {
      "done": 3,
      "total": 5
    },
    "summary": "Resolve o bloqueio de scroll da página causado pelo comportamento do menu dropdown.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "Ao abrir o dropdown do seletor de tema na navbar, o Radix UI injeta `overflow: hidden` no elemento `<body>`, o que trava o scroll da página enquanto o menu está aberto. Isso é um comportamento indesejado em portfólios de página única com scroll nativo."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Abrir o portfólio\n2. Rolar a página levemente para baixo\n3. Clicar no botão de toggle de tema (ícone Sol/Lua)\n4. Observar que o scroll da página trava imediatamente ao abrir o dropdown\n5. Fechar o dropdown — o scroll volta"
      },
      {
        "heading": "Comportamento Esperado",
        "content": "O dropdown deve abrir sem interferir no scroll da página. O usuário deve conseguir rolar a página mesmo com o dropdown visível (ou o dropdown deve fechar ao rolar)."
      },
      {
        "heading": "Comportamento Atual",
        "content": "O Radix `DropdownMenuPrimitive.Root` possui a propriedade `modal` ativada por padrão (`true`). Isso aciona internamente a biblioteca `react-remove-scroll`, que injeta o atributo `data-scroll-locked` no `<body>` com `overflow: hidden`, travando o scroll da página inteira enquanto o dropdown está aberto.\n\n```tsx\n// src/hooks/use-toogle.tsx — estrutura atual\n// O DropdownMenu (que repassa as props para DropdownMenuPrimitive.Root)\n// não define a prop 'modal', assumindo o padrão true:\n<DropdownMenu>\n  <DropdownMenuTrigger asChild>...</DropdownMenuTrigger>\n  <DropdownMenuContent align=\"end\">\n    ...\n  </DropdownMenuContent>\n</DropdownMenu>\n```\n\n```tsx\n// src/hooks/use-toogle.tsx — estrutura atual\n<DropdownMenu>\n  <DropdownMenuTrigger asChild>...</DropdownMenuTrigger>\n  <DropdownMenuContent align=\"end\">\n    ...\n  </DropdownMenuContent>\n</DropdownMenu>\n```"
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend\n- Arquivo(s) suspeito(s): `src/hooks/use-toogle.tsx` — uso do `DropdownMenu`\n- Logs de erro (se houver): nenhum — é comportamento intencional do Radix (via react-remove-scroll) que conflita com o design do portfólio"
      },
      {
        "heading": "Hipótese de Causa",
        "content": "A prop `modal` do `DropdownMenuPrimitive.Root` (padrão `true`) está acionando o bloqueio de scroll no `<body>`. A solução é passar explicitamente `modal={false}` para evitar a injeção do atributo `data-scroll-locked`."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Em `src/hooks/use-toogle.tsx`, adicionar a prop `modal={false}` ao componente `<DropdownMenu>`:\n   ```tsx\n   <DropdownMenu modal={false}>\n   ```\n2. Verificar se o comportamento de fechamento ao clicar fora ainda funciona corretamente com `modal={false}`\n3. Testar em desktop e mobile\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-dropdown-remove-scroll-pagina`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-dropdown-remove-scroll-pagina"
  },
  {
    "id": "enumeracao-temporal-administrador",
    "title": "Enumeração temporal do administrador",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "alta",
    "tags": [
      "segurança",
      "backend",
      "infra"
    ],
    "progress": 40,
    "progressFraction": {
      "done": 2,
      "total": 5
    },
    "summary": "Reduzir diferença temporal na autenticação e validar headers sem comprometer HTTPS e ambientes locais.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "A PR #7 aponta retorno antecipado em `src/auth.ts` quando o e-mail não corresponde ao administrador, criando possível diferença temporal entre e-mails válidos e inválidos. Também inclui headers em `next.config.ts`."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Enviar tentativas de autenticação com e-mails válidos e inválidos.\n2. Medir várias amostras em condições equivalentes.\n3. Observar headers de segurança em rotas públicas e administrativas."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "A autenticação não deve revelar validade do e-mail por tempo de resposta, e headers devem ser compatíveis com HTTPS integral, subdomínios e desenvolvimento."
      },
      {
        "heading": "Comportamento Atual",
        "content": "O retorno antecipado e a ausência de hash dummy podem manter diferenças mensuráveis. A comparação incondicional proposta reduz o problema, mas não foi acompanhada de medição. HSTS com `includeSubDomains` e `preload` exige decisão operacional."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: backend de autenticação e infra.\n- Arquivos: `src/auth.ts`, `next.config.ts`, `.jules/sentinel.md`.\n- A análise não executou build, benchmark ou checks da PR."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "O fluxo condiciona o trabalho criptográfico à validade do identificador. A política de headers foi adicionada no mesmo PR, misturando dois escopos e aumentando o risco de revisão incompleta."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Separar a correção temporal da política de headers.\n2. Avaliar hash dummy e comparar amostras em ambiente controlado.\n3. Confirmar comportamento de `bcrypt` e tratamento assíncrono.\n4. Decidir HSTS, `includeSubDomains` e `preload` com base no domínio real.\n5. Testar login válido, inválido e falhas sem registrar credenciais.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Evidências parciais registradas no LOG: comparação bcrypt assíncrona e tentativa para e-mail inválido foram revisadas; não houve medição temporal nem teste autenticado.\n\n- [ ] Bug não reproduz mais\n- [ ] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-enumeracao-temporal-administrador` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-enumeracao-temporal-administrador"
  },
  {
    "id": "esgotamento-disco-build-docker-vps",
    "title": "Esgotamento de Disco na VPS por Acúmulo de Cache Docker e Risco de Perda de Dados via Prune de Volumes",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-09-10",
    "priority": "alta",
    "tags": [
      "infra",
      "banco"
    ],
    "progress": 80,
    "progressFraction": {
      "done": 4,
      "total": 5
    },
    "summary": "Build Docker falhou com ResourceExhausted por disco 100% cheio e identificado risco crítico de perda do SQLite ao usar prune com flag --volumes.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "Durante o deploy automático via GitHub Actions do commit `57e7bc3` na VPS, a etapa de build Docker falhou com `ResourceExhausted` e saída com status 17. O sistema operacional da VPS atingiu 100% de uso de disco na partição de arquivos do Docker (`/var/lib/docker/overlay2`), impedindo a criação de novos diretórios e extração de pacotes pelo gerenciador `apk`.\n\nAdicionalmente, identificou-se que o procedimento emergencial realizado anteriormente para liberar espaço (`docker system prune -af --volumes`) trazia um risco crítico: se executado com os containers parados ou após uma falha de deploy, o Docker interpreta o volume nomeado `portfolio-data` como órfão e o remove sumariamente, apagando de forma permanente o banco de dados `portfolio.db` (onde residem as credenciais, usuários, segredos TOTP e códigos de backup)."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Realizar múltiplos deploys sucessivos com a instrução `docker compose build --no-cache` configurada no `.github/workflows/deploy.yml` sem rotina de limpeza intermediária.\n2. Cada execução acumula gigabytes de camadas e cache do BuildKit em `/var/lib/docker/overlay2`.\n3. Ao esgotar o disco livre, qualquer tentativa de compilação ou instalação de dependências no Dockerfile (`apk add --no-cache libc6-compat python3 make g++`) falha imediatamente com `No space left on device`.\n4. Executar `docker system prune -af --volumes` com a stack parada remove o volume persistente `portfolio-data`."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "1. O workflow de CI/CD deve realizar a limpeza prévia de caches do BuildKit (`docker builder prune -af`) e imagens descartáveis (`docker image prune -af`) antes de cada compilação, garantindo espaço livre suficiente em disco.\n2. Volumes persistentes contendo o banco de dados SQLite (`portfolio-data`) **nunca** devem ser apagados por rotinas de limpeza de cache ou comandos acidentais com `--volumes`.\n3. Os logs de containers devem ter limites de tamanho e retenção definidos no `docker-compose.yml` para não consumirem disco indefinidamente."
      },
      {
        "heading": "Comportamento Atual",
        "content": "1. Builds executados com `docker compose build --no-cache` acumulavam cache sem descarte automático, culminando em `no space left on device` (código de saída 17).\n2. O procedimento de limpeza manual utilizado continha a flag `--volumes`, expondo o banco de dados em produção a perda irreversível caso o container estivesse inativo no momento da execução.\n3. Não havia limite de tamanho configurado para logs no `docker-compose.yml`."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- **Camada afetada:** `infra` (pipeline CI/CD, configuração Docker e integridade do banco SQLite).\n- **Arquivo(s) suspeito(s) e modificados:**\n  - `.github/workflows/deploy.yml`: comandos de execução SSH durante o deploy.\n  - `docker-compose.yml`: configuração do serviço `portfolio` e volume `portfolio-data`.\n  - `.dockerignore`: inclusão de arquivos e pastas desnecessários no build context.\n- **Logs de erro reais:**\n  ```text\n  #6 [portfolio deps 2/5] RUN apk add --no-cache libc6-compat python3 make g++\n  #6 0.704 ( 1/33) Installing libstdc++-dev (15.2.0-r5)\n  #6 0.723 ERROR: libstdc++-dev-15.2.0-r5: failed to extract usr/include/c++/15.2.0/bits/gslice.h: No space left on device\n  #6 0.724 ERROR: libstdc++-dev-15.2.0-r5: No space left on device\n  ...\n  failed to solve: ResourceExhausted: failed to prepare 16m8sanhwk44e9j0giirsbk5w as xtv0dvojj6u81cw93o8vje4tx: mkdir /var/lib/docker/overlay2/xtv0dvojj6u81cw93o8vje4tx/diff: no space left on device\n  2026/09/10 05:00:51 Process exited with status 17\n  ```"
      },
      {
        "heading": "Hipótese de Causa",
        "content": "1. **Tentativa anterior e prática identificada (refutada/arriscada):** Uso manual de `docker system prune -af --volumes` quando o disco enchia. Testado e constatado o risco: a flag `--volumes` exclui qualquer volume que não esteja montado em um container atualmente em estado `running`. Caso o container falhe ou seja pausado, os dados do SQLite são destruídos.\n2. **Causa raiz confirmada:**\n   - O comando `docker compose build --no-cache` gera árvores inteiras de imagens e cache no BuildKit a cada commit. Na ausência de `prune` automatizado no CI/CD, o disco de partição raiz da VPS atingiu 100% de capacidade.\n   - Ausência de rotação de logs (`json-file` com `max-size`) permitia crescimento passivo de espaço ocupado."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Atualizar `.github/workflows/deploy.yml` para executar rotina cirúrgica antes do build:\n   - `docker builder prune -af || true`: descarta todo o cache acumulado do BuildKit.\n   - `docker image prune -af || true`: descarta imagens intermediárias sem uso, preservando containers em execução.\n   - `df -h /`: imprime no console do CI o espaço livre em disco para monitoramento contínuo.\n   - `docker image prune -f || true`: descarta imagens anteriores após a recriação do container com sucesso.\n2. Atualizar `docker-compose.yml` adicionando limites de log (`max-size: 10m`, `max-file: 3`).\n3. Adicionar `scratch/` no `.dockerignore` para não poluir o contexto de build.\n4. Formalizar instrução de operação segura: nunca utilizar a flag `--volumes` para limpeza de rotina em servidores de produção que usem SQLite em volumes Docker.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Validado com sucesso após execução do deploy no GitHub Actions com auto-prune de builder e imagens, mantendo integridade do volume persistente do SQLite.\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-esgotamento-disco-build-docker-vps` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-esgotamento-disco-build-docker-vps"
  },
  {
    "id": "estilos-admin-vazam-landing",
    "title": "Estilos do admin vazam para a landing",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "média",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 89,
    "progressFraction": {
      "done": 8,
      "total": 9
    },
    "summary": "Isolar fundo e scrollbar do painel administrativo para impedir vazamento visual na landing page.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "Estilos globais usados pelo painel administrativo estão vazando para a landing page. O fundo do admin aparece na landing e o scrollbar global usa o roxo do painel também na página pública."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Iniciar o servidor local.\n2. Abrir o painel administrativo e depois navegar para a landing page, ou abrir a landing diretamente após carregar o admin.\n3. Observar o fundo da página e as cores do scrollbar."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "A landing deve manter seu próprio fundo e identidade visual. O scrollbar pode continuar estilizado, mas deve usar as cores adequadas à landing page. Os estilos do painel não devem afetar páginas públicas."
      },
      {
        "heading": "Comportamento Atual",
        "content": "O fundo do painel aparece na landing e o scrollbar fica roxo, com a aparência do admin, em vez de usar as cores da página pública."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend e estilos globais.\n- Arquivos alterados: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/admin/(dashboard)/layout.tsx`, `src/app/admin/login/LoginForm.tsx`, `src/app/admin/verify-2fa/page.tsx`, `src/app/admin/setup-2fa/page.tsx`, `src/app/admin/security/page.tsx`.\n- Evidência pré-correção: Playwright observou `body` com `rgb(3,0,20)` em `http://localhost:3000/`, correspondente ao fundo cósmico do admin.\n- Testes reportados: `npx tsc --noEmit` exit 0; `npx eslint` nos arquivos alterados exit 0, com dois avisos preexistentes; `npm run lint` exit 1 porque o script usa `next lint`, indisponível no Next 16. O último resultado não é regressão deste card."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "Confirmada pela leitura do código e pela evidência pré-correção: `src/app/layout.tsx` aplicava `className=\"dark\"`, `colorScheme: 'dark'`, fundo `#030014` e texto branco no layout raiz; `src/app/globals.css` aplicava scrollbar cósmico roxo globalmente. Os oito roots administrativos já possuíam wrappers próprios com `min-h-screen bg-[#030014] text-white`; a landing não possuía wrapper equivalente, portanto os estilos raiz vazavam para as páginas públicas."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Identificar os seletores globais responsáveis pelo fundo e scrollbar.\n2. Escopar estilos exclusivos do admin ao layout ou a uma classe raiz do painel.\n3. Definir as cores da landing separadamente, mantendo scrollbar funcional e visualmente coerente.\n4. Testar navegação landing → admin → landing em desktop e móvel, verificando ausência de vazamento visual.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "A correção foi aplicada nos sete arquivos listados em Contexto Técnico. `src/app/layout.tsx` voltou à neutralidade de tema; o scrollbar global foi neutralizado em `src/app/globals.css`; o scrollbar cósmico foi escopado por `html:has(.admin-shell)`, `.admin-shell` e `.admin-shell *`; e o marcador `admin-shell` foi adicionado aos oito roots administrativos em cinco arquivos. O humano informou validação visual positiva. QA pós-correção por navegador, screenshots antes/depois e navegação automatizada landing → admin → landing não foram executados pelo agente e permanecem não verificados.\n\n- [x] Causa do vazamento identificada no escopo global\n- [x] Correção de escopo aplicada e arquivos registrados\n- [x] TypeScript termina sem erro (`npx tsc --noEmit`, exit 0)\n- [x] ESLint termina sem erro (`npx eslint`, exit 0; dois avisos preexistentes registrados)\n- [x] Validação visual humana informada\n- [x] Limitação de QA pós-correção registrada como não verificada\n- [x] **Pasta renomeada para `[done]-estilos-admin-vazam-landing` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-estilos-admin-vazam-landing"
  },
  {
    "id": "falha-silenciosa-build-docker-vps-sigsegv",
    "title": "Falha Silenciosa no Build Docker VPS por SIGSEGV no Alpine e Ausência de set -e no CI/CD",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-09-09",
    "priority": "alta",
    "tags": [
      "infra",
      "dependências"
    ],
    "progress": 80,
    "progressFraction": {
      "done": 4,
      "total": 5
    },
    "summary": "Build Docker na VPS falhava com SIGSEGV por incompatibilidade de ABI do Node 20 com better-sqlite3 e runtime edge, mascarado por falta de set -e.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "Durante o deploy da nova versão contendo o 2FA via TOTP (commit `c7299e2`), a pipeline do GitHub Actions foi marcada com status verde (sucesso), porém o ambiente de produção continuou servindo a versão anterior da aplicação (sem as rotas `/api/admin/2fa/*` e sem a tela de segurança).\n\nAo inspecionar os logs detalhados do container e da execução SSH via GitHub Actions, constatou-se que o comando `docker compose build --no-cache` na VPS falhou com `SIGSEGV` durante a etapa de coleta de páginas estáticas (`Collecting page data`). Como o script de deploy no workflow não possuía a instrução `set -e`, a execução continuou para a linha seguinte (`docker compose up -d --force-recreate`), recriando o container a partir da imagem anterior presente no cache local."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Submeter código para a branch `main` com `src/app/not-found.tsx` contendo `export const runtime = \"edge\"`.\n2. O runner do GitHub Actions conecta via SSH na VPS e dispara `docker compose build --no-cache`.\n3. Na imagem Docker baseada em `node:20-alpine` sem `libc6-compat`, o comando `next build` executa o worker com Turbopack.\n4. Ao encontrar a declaração de runtime `edge` em `not-found.tsx`, o worker do Next.js sofre falha de segmentação:\n   ```text\n   #14 37.59 Collecting page data using 1 worker ...\n   #14 38.18 ⚠ Using edge runtime on a page currently disables static generation for that page\n   #14 38.54 ⨯ Next.js build worker exited with code: null and signal: SIGSEGV\n   #14 ERROR: process \"/bin/sh -c npm run build\" did not complete successfully: exit code: 1\n   ```\n5. O script SSH prossegue para `docker compose up -d --force-recreate` e sai com código 0, mascarando o erro."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "1. O comando `npm run build` deve compilar com sucesso dentro do container Alpine Linux sem sofrer `SIGSEGV`.\n2. Caso qualquer etapa do script SSH no `.github/workflows/deploy.yml` falhe, a execução deve ser abortada imediatamente (`set -e`), reportando a falha no GitHub Actions e não subindo containers desatualizados.\n3. A rota `not-found.tsx` deve ser tratada como página estática regular em modo `standalone`."
      },
      {
        "heading": "Comportamento Atual",
        "content": "1. `next build` encerrava com `SIGSEGV` durante a fase de coleta de páginas estáticas no Alpine Linux.\n2. O workflow de CI/CD ignorava o código de saída 1 do build e recriava o container antigo, reportando sucesso falso.\n3. A produção ficava desatualizada em relação à branch `main`."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- **Camadas afetadas:** `infra` (pipeline de CI/CD, Dockerfile) e `frontend` (`not-found.tsx`).\n- **Arquivos modificados:**\n  - `.github/workflows/deploy.yml`: inclusão de `set -e`.\n  - `Dockerfile`: adição de `libc6-compat` nos estágios `deps`, `builder` e `runner`, e `ENV NEXT_TELEMETRY_DISABLED=1`.\n  - `src/app/not-found.tsx`: remoção de `export const runtime = \"edge\"`.\n- **Logs de erro:**\n  ```text\n  deploy UNKNOWN STEP 2026-09-09T21:56:35.6118014Z #14 38.18 ⚠ Using edge runtime on a page currently disables static generation for that page\n  deploy UNKNOWN STEP 2026-09-09T21:56:35.9762212Z #14 38.54 ⨯ Next.js build worker exited with code: null and signal: SIGSEGV\n  deploy UNKNOWN STEP 2026-09-09T21:56:36.2105848Z #14 ERROR: process \"/bin/sh -c npm run build\" did not complete successfully: exit code: 1\n  deploy UNKNOWN STEP 2026-09-09T21:56:36.3175545Z failed to solve: process \"/bin/sh -c npm run build\" did not complete successfully: exit code: 1\n  deploy UNKNOWN STEP 2026-09-09T21:56:36.4723449Z  Container guilherme-portfolio  Recreate\n  deploy UNKNOWN STEP 2026-09-09T21:56:36.7421749Z  Container guilherme-portfolio  Recreated\n  deploy UNKNOWN STEP 2026-09-09T21:56:36.9694397Z ✅ Successfully executed commands to all hosts.\n  ```"
      },
      {
        "heading": "Hipótese de Causa",
        "content": "1. **Tentativa anterior (refutada):** Suposição de que o deploy na VPS ainda não havia finalizado ou que faltavam variáveis no `.env`. Resultado real: O deploy via GitHub Actions reportava sucesso verde, mas a versão em produção não possuía os novos arquivos porque a compilação Docker havia falhado silenciosamente.\n2. **Causa raiz confirmada:**\n   - A dependência `better-sqlite3@13.0.3` (assim como `pdfjs-dist@5.7.284`) exige Node.js `>=22` (`EBADENGINE`). Ao tentar carregar os binários nativos C++ compilados nessa versão sob o runtime do `node:20-alpine`, o worker do Next.js disparava `SIGSEGV` durante o `Collecting page data`.\n   - A declaração `export const runtime = \"edge\"` em `src/app/not-found.tsx` forçava inicialização desnecessária de isolamento edge em páginas estáticas.\n   - A imagem `node:20-alpine` não possuía `libc6-compat` nos estágios do build.\n   - O comando SSH no workflow executava comandos sequenciais em shell sem a flag `set -e`, fazendo com que falhas intermediárias do `docker compose build` fossem ignoradas e o `docker compose up` subisse o container anterior."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Atualizar o `Dockerfile` para usar a imagem base `node:22-alpine` (em `deps`, `builder` e `runner`), atendendo ao requisito de engine do `better-sqlite3@13.0.3` (`>=22`).\n2. Adicionar `libc6-compat` nos estágios `deps`, `builder` e `runner` do `Dockerfile`.\n3. Remover `export const runtime = \"edge\"` de `src/app/not-found.tsx`, tornando a página 404 estática e compatível com o runtime Node.js standalone.\n4. Inserir `set -e` no script do arquivo `.github/workflows/deploy.yml` para garantir que falhas de compilação encerrem a pipeline com erro imediatamente.\n5. Validar o deploy na VPS confirmando a resposta HTTP das novas rotas de 2FA em produção.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Validado via GitHub Actions run 34417110827 (sucesso em 2m46s) e checagem real dos endpoints via curl/fetch (HTTP 307 em /admin/seguranca e HTTP 401 em /api/admin/2fa/status).\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-falha-silenciosa-build-docker-vps-sigsegv` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-falha-silenciosa-build-docker-vps-sigsegv"
  },
  {
    "id": "flicker-navbar-logo-scroll",
    "title": "Flicker/quebra de linha no NavbarLogo ao voltar do scroll para o topo",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-07-09",
    "priority": "média",
    "tags": [
      "frontend",
      "ui-ux",
      "animação"
    ],
    "progress": 80,
    "progressFraction": {
      "done": 4,
      "total": 5
    },
    "summary": "Elimina o flicker e quebra de linha no texto do NavbarLogo ao retornar do scroll para o topo.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "Ao rolar a página e depois retornar ao topo, o texto do `NavbarLogo` na navbar desktop sofre um flicker visual: por um instante ele quebra para duas linhas antes de voltar para uma linha só."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Acessar a página com a navbar no estado não-scrollado (topo).\n2. Rolar a página para baixo até a navbar entrar no estado \"scrollado\" (versão reduzida).\n3. Rolar de volta até o topo, fazendo a navbar retornar ao estado não-scrollado.\n4. Observar o texto do logo (`guilherme-menezes@home:~$` ou equivalente atual) durante a transição."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "A transição entre o estado scrollado e não-scrollado deve ser suave, com o texto do logo permanecendo em uma única linha durante toda a animação, sem quebra ou salto visual."
      },
      {
        "heading": "Comportamento Atual",
        "content": "No momento em que a navbar retorna ao estado não-scrollado, o texto do logo quebra brevemente para duas linhas e, em seguida, volta para uma linha — gerando um flicker perceptível."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend\n- Arquivo(s) suspeito(s): `src/components/ui/resizable-navbar.tsx` (componente `NavbarLogo` e lógica de transição scrolled/não-scrollado)\n- Logs de erro: nenhum (bug visual, não gera erro de console — a confirmar)"
      },
      {
        "heading": "Evidências Coletadas",
        "content": "**1. Renderização condicional no NavItems:**\n```tsx\n// src/components/ui/resizable-navbar.tsx (linha 138)\n<div className=\"relative z-20 flex items-center justify-between gap-2\">\n  {item.icon} {!isScrolled && <span className=\"font-semibold\">{item.name}</span>}\n</div>\n```\n**Confirmação:** A hipótese está correta neste ponto. O span do texto é montado/desmontado instantaneamente via react sem nenhuma transição quando `isScrolled` vira `false`.\n\n**2. Animação de largura no NavBody:**\n```tsx\n// src/components/ui/resizable-navbar.tsx (linhas 89 e 92-96)\nwidth: visible ? 'fit-content' : '100%',\n// ...\ntransition={{\n  type: 'spring',\n  stiffness: 200,\n  damping: 50,\n}}\n```\n**Confirmação:** A hipótese se sustenta completamente. O NavBody cresce em largura com um easing do tipo `spring`, mas o texto interno exige o espaço instantaneamente, causando o esmagamento do `NavbarLogo`."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "**Confirmada pelas evidências:** O flicker acontece porque há uma dessincronia fundamental: a re-exibição do texto do menu é instantânea, mas a expansão do container (`NavBody`) é animada via `spring`. O reflow instantâneo do texto espreme os demais itens flexíveis do layout até que a animação da largura do pai termine."
      },
      {
        "heading": "Plano de Correção",
        "content": "Para corrigir a dessincronia e evitar o esmagamento do logo sem remover sua capacidade de \"quebrar linha\" (wrap) quando o viewport é genuinamente pequeno:\n\n1. **Constante Compartilhada de Transição:** Extrair o objeto de transição do `NavBody` para uma constante no topo do arquivo para garantir sincronia absoluta:\n```tsx\nconst sharedTransition = { type: 'spring', stiffness: 200, damping: 50 }\n```\n\n2. **Técnica Exata de Animação (NavItems):**\nEm vez de renderização condicional instantânea, utilizaremos a propriedade `layout` do Framer Motion. Para que a largura do texto anime suavemente de zero ao tamanho total, a abordagem principal será utilizar a prop `layout` no `<motion.div>` pai do texto, permitindo que a engine do Framer Motion calcule e interpole automaticamente o bounding box durante a montagem/desmontagem do elemento, dispensando hacks com `width: \"auto\"`.\n\n3. **Garantia Estrutural Complementar:** Em `src/components/ui/resizable-navbar.tsx`, adicionar as classes utilitárias Tailwind `whitespace-nowrap` e `shrink-0` ao container `span` principal do texto do logo:\n```tsx\n<span className=\"font-mono text-sm md:text-base font-semibold group-hover:text-brand-highlight transition-colors flex items-center whitespace-nowrap shrink-0\">\n```\n\n4. Aplicar a mesma `sharedTransition` ao `NavBody` e ao `NavItems`, garantindo que o texto cresça exatamente no mesmo ritmo que o container se expande.\n\n5. Testar a correção manualmente, repetindo o ciclo scroll → topo → scroll várias vezes para garantir que o flicker não ocorre mais.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-flicker-navbar-logo-scroll` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-flicker-navbar-logo-scroll"
  },
  {
    "id": "hardening-html-email-contato",
    "title": "Hardening HTML do e-mail de contato",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "média",
    "tags": [
      "backend",
      "segurança",
      "api"
    ],
    "progress": 80,
    "progressFraction": {
      "done": 4,
      "total": 5
    },
    "summary": "Escapar corretamente conteúdo enviado no e-mail de contato sem introduzir regressão no assunto.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "A rota de contato insere nome, assunto e mensagem fornecidos pelo usuário em um template HTML de e-mail. A PR #4 troca a remoção simples de `<` e `>` por `escapeHtml`."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Enviar conteúdo com entidades, aspas e marcação para a API de contato.\n2. Inspecionar o HTML do e-mail recebido.\n3. Verificar também o assunto e entradas com CRLF e tamanho excessivo."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "Conteúdo do usuário deve ser exibido como texto no e-mail, sem HTML interpretável, e o assunto deve preservar o texto esperado sem entidades literais indevidas."
      },
      {
        "heading": "Comportamento Atual",
        "content": "A sanitização existente remove `<` e `>`, o que já bloqueia tags simples no corpo, mas não é um escaping HTML completo. A PR melhora o corpo, porém aplica `sanitizedSubject` no header `subject`, podendo fazer o assunto exibir `&amp;` literalmente. Não há evidência de teste da branch."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: backend e API.\n- Arquivo: `src/app/api/contact/route.ts`.\n- A análise indicou que o e-mail é validado por regex; não foram avaliados limites de tamanho nem CRLF em execução.\n- O risco principal é HTML injection no e-mail de notificação, não XSS confirmado no site."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "O mesmo valor escapado para HTML foi reutilizado no campo de assunto, que possui contrato diferente. O escaping deve ocorrer por contexto: HTML no corpo e tratamento apropriado para assunto/headers."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Separar valores de texto cru validados dos valores escapados para o corpo HTML.\n2. Escapar `&` antes dos demais caracteres no corpo.\n3. Definir tratamento para CRLF, tamanho e conteúdo do assunto.\n4. Adicionar testes unitários do helper e testes da rota sem credenciais reais.\n5. Confirmar envio usando uma integração controlada ou mock do provedor.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Evidências parciais registradas no LOG: harness com `fetch` mockado confirmou escaping, sanitização do assunto e rejeição de payload não-string; não houve envio real de e-mail.\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-hardening-html-email-contato` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-hardening-html-email-contato"
  },
  {
    "id": "headers-seguranca-ausentes",
    "title": "Headers de segurança ausentes",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "média",
    "tags": [
      "segurança",
      "infra",
      "frontend"
    ],
    "progress": 80,
    "progressFraction": {
      "done": 4,
      "total": 5
    },
    "summary": "Adicionar e validar headers HTTP de segurança nas respostas da aplicação conforme as PRs 2 e 9.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "O checkout analisado não possui `headers()` de segurança em `next.config.ts`. As PRs #2 e #9 propõem headers para reduzir exposição a clickjacking, MIME sniffing e transporte sem HTTPS."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Inspecionar `next.config.ts` na branch `main`.\n2. Fazer uma requisição a uma rota pública e observar os headers de resposta.\n3. Comparar com a política desejada para produção, desenvolvimento e subdomínios."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "As respostas devem possuir headers de segurança compatíveis com o deployment, sem quebrar OAuth, HMR, PDFs ou ambientes locais."
      },
      {
        "heading": "Comportamento Atual",
        "content": "Não há configuração confirmada de headers no `next.config.ts` da branch analisada. As PRs #2 e #9 são propostas concorrentes para o mesmo arquivo."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend e infra.\n- Arquivos: `next.config.ts`; `.jules/sentinel.md` nas PRs.\n- PR #2 propõe nosniff, DENY, X-XSS-Protection, Referrer-Policy e HSTS.\n- PR #9 é superconjunto, adicionando Permissions-Policy e `preload` ao HSTS.\n- A análise foi somente estática; o build dos branches não foi reproduzido."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "A aplicação ainda não declara uma política centralizada de headers no Next.js. As PRs adicionam blocos sobrepostos e não devem ser mescladas simultaneamente sem consolidação."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Escolher e consolidar uma única política a partir das PRs #2 e #9.\n2. Decidir explicitamente se `includeSubDomains` e `preload` são compatíveis com o domínio e HTTPS integral.\n3. Remover documentação/arquivos `.jules/sentinel.md` duplicados ou vazios do resultado final.\n4. Validar respostas reais em produção-like, desenvolvimento e rotas de autenticação.\n5. Avaliar CSP separadamente, sem introduzir `unsafe-inline`/`unsafe-eval` sem justificativa.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Evidências parciais registradas no LOG: headers confirmados em servidor de desenvolvimento e sem regressão observada nas rotas locais; produção/Cloudflare ainda não validada.\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-headers-seguranca-ausentes` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-headers-seguranca-ausentes"
  },
  {
    "id": "headers-seguranca-duplicados",
    "title": "Headers de segurança duplicados",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "média",
    "tags": [
      "segurança",
      "infra",
      "frontend"
    ],
    "progress": 80,
    "progressFraction": {
      "done": 4,
      "total": 5
    },
    "summary": "Consolidar a proposta de headers da PR 9 e evitar conflito com as PRs 2 e 7.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "As PRs #2, #7 e #9 adicionam políticas sobrepostas em `next.config.ts`. A PR #9 propõe o conjunto mais amplo entre as três, incluindo `Permissions-Policy` e HSTS com `preload`."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Comparar os diffs das PRs #2, #7 e #9 contra `main`.\n2. Tentar aplicar mais de uma alteração ao mesmo `next.config.ts`.\n3. Observar conflito de hunks e arquivos `.jules/sentinel.md` adicionados repetidamente."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "Uma única política de headers, revisada por domínio/deployment, sem duplicação, conflito de merge, arquivo sentinel vazio ou diretiva incompatível com desenvolvimento."
      },
      {
        "heading": "Comportamento Atual",
        "content": "As PRs são concorrentes. A PR #9 é um superconjunto da #2, mas adiciona HSTS `preload`, que exige decisão operacional. O `.jules/sentinel.md` da PR #9 é vazio. Nenhuma das propostas inclui CSP robusta."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend e infra.\n- Arquivo principal: `next.config.ts`.\n- PRs relacionadas: #2, #7 e #9.\n- A análise foi somente estática; não houve build ou verificação de headers em respostas reais."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "O bot criou PRs independentes para o mesmo alerta sem reconciliar branches anteriores. A correção deve ser consolidada em uma única política antes de qualquer merge."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Comparar todos os headers e escolher o conjunto necessário.\n2. Excluir `preload` até confirmar requisitos do domínio, ou registrar decisão humana explícita.\n3. Remover `.jules/sentinel.md` vazio/duplicado.\n4. Validar headers em rotas públicas, login, API e desenvolvimento.\n5. Avaliar CSP em card separado, evitando diretivas permissivas sem justificativa.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Evidências parciais registradas no LOG: política única de headers confirmada em desenvolvimento; produção/Cloudflare e decisão operacional de HSTS ainda pendentes.\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-headers-seguranca-duplicados` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-headers-seguranca-duplicados"
  },
  {
    "id": "hero-destaque-texto-desalinhado",
    "title": "Destaque/seleção com desalinhamento vertical em \"Desenvolvedor Full-Stack\" no Hero",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-08-26",
    "priority": "média",
    "tags": [
      "frontend",
      "animação",
      "ui-ux"
    ],
    "progress": 83,
    "progressFraction": {
      "done": 5,
      "total": 6
    },
    "summary": "O retângulo de destaque animado do componente PointerHighlight não ficava perfeitamente centralizado em volta do texto Desenvolvedor Full-Stack.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "Na seção Hero da home, o texto `\"Desenvolvedor Full-Stack\"` é envolvido pelo componente `<PointerHighlight>`, que anima um retângulo com borda e um ícone de cursor azul.\nVisualmente, o texto não estava centralizado verticalmente dentro do retângulo de destaque: a margem superior entre o topo das letras maiúsculas e a borda superior era visivelmente menor (~18px) do que a margem inferior até a borda inferior (~24px), dando a impressão de que o texto estava deslocado para cima."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Acessar a página inicial (`http://localhost:3000/`) no topo.\n2. Observar o Hero e aguardar a animação da caixa de destaque ao redor de `\"Desenvolvedor Full-Stack\"`.\n3. Inspecionar o espaçamento vertical entre o texto e as bordas superior/inferior da caixa."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "O texto `\"Desenvolvedor Full-Stack\"` deve estar perfeitamente centralizado vertical e horizontalmente dentro do retângulo de borda desenhado pelo `PointerHighlight`, com margens simétricas e equilibradas."
      },
      {
        "heading": "Comportamento Atual (Após Correção)",
        "content": "- **Desktop (`lg:text-6xl`):**\n  - Altura total da caixa: `84px`\n  - Distância do topo ao cap-height (\"D\", \"F\", \"S\"): `21px`\n  - Distância da base à borda inferior: `21px`\n  - Simetria vertical exata de 1:1 (`0px` de diferença).\n- **Mobile (`text-3xl`):**\n  - Altura total da caixa: `60px`\n  - Distância do topo ao cap-height: `15px`\n  - Distância da base à borda inferior: `15px`\n  - Simetria vertical exata de 1:1 (`0px` de diferença)."
      },
      {
        "heading": "Contexto Técnico",
        "content": "### 1. `src/components/sub/HeroContent.tsx` (linhas 60-65)\n```tsx\n        <PointerHighlight rectangleClassName=\"rounded-none\">\n          <span className=\"text-primary inline-flex items-center justify-center p-3 text-3xl lg:text-6xl leading-none\">\n            Desenvolvedor Full-Stack\n          </span>\n        </PointerHighlight>\n```\n\n### 2. `src/components/ui/pointer-highlight.tsx` (linhas 7-96)\nComponente de apresentação que mede as dimensões do elemento filho e desenha a borda via animação Framer Motion.\n\n---"
      },
      {
        "heading": "Hipótese de Causa (Confirmada)",
        "content": "O `<span>` filho em `HeroContent.tsx` tinha `display: inline` padrão e não especificava `line-height`, herdando `leading-tight` ou o `line-height` padrão da fonte. Isso reservava espaço extra desnecessário abaixo da linha de base para letras descendentes (como \"g\", \"j\", \"p\"), criando a assimetria visual de 6px dentro do padding uniforme `p-3`."
      },
      {
        "heading": "Plano de Correção (Executado)",
        "content": "1. **Adição de `leading-none`:** Ajusta a altura da linha para corresponder exatamente ao tamanho da fonte (`1em`), eliminando a folga residual de descendentes.\n2. **Definição de `inline-flex items-center justify-center`:** Transforma o `<span>` em um container flex inline que centraliza o glifo do texto no centro geométrico da caixa.\n3. **Preservação de `p-3`:** O padding uniforme de `12px` agora gera margens simétricas perfeitas em todos os lados.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste da correção)_\n\n- [x] Texto perfeitamente centralizado vertical e horizontalmente na caixa de destaque (21px/21px em desktop, 15px/15px em mobile).\n- [x] Caixa de destaque e cursor azul sincronizados nas dimensões corretas em todas as resoluções de tela.\n- [x] Animação de desenho da borda e posicionamento do ponteiro funcionando com fluidez.\n- [x] **Pasta renomeada para `[done]-hero-destaque-texto-desalinhado` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-hero-destaque-texto-desalinhado"
  },
  {
    "id": "navbar-corte-largura-intermediaria",
    "title": "Navbar corta botões da direita em larguras de tela intermediárias (768px - 1024px)",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-08-26",
    "priority": "alta",
    "tags": [
      "frontend",
      "responsividade",
      "ui-ux"
    ],
    "progress": 86,
    "progressFraction": {
      "done": 6,
      "total": 7
    },
    "summary": "Ajusta o texto do logo e espaçamentos da navbar para evitar corte de botões na faixa intermediária de 768px a 1024px.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "Na faixa de largura de viewport onde a navbar desktop já é ativada (`md:flex`, a partir de 768px), mas a tela ainda não atingiu o breakpoint `lg` ou superior, o conteúdo total do `NavBody` (logo com texto longo `guilherme-menezes@home:~$`, 5 links de navegação com ícones + texto e os 3 botões de ação na direita: idioma, tema e email) excede o espaço disponível do container `max-w-7xl`.\nComo o `NavBody` possui `overflow-hidden`, os últimos elementos da direita (especialmente o botão de email) sofrem corte visual na borda direita."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Acessar a página em um viewport com largura entre 768px e 1000px.\n2. Manter a página no estado não-scrollado (navbar expandida).\n3. Observar que o botão de email no canto direito da navbar fica cortado pelo limite do container."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend (`src/components/ui/resizable-navbar.tsx` e `src/components/main/Navbar.tsx`)"
      },
      {
        "heading": "Hipótese de Causa",
        "content": "O texto do terminal no logo (`guilherme-menezes@home:~$`) tem largura horizontal considerável (~230px). Somado aos 5 links de menu com padding `px-4 py-2` e `space-x-2`, e ao bloco de ações da direita, a largura mínima do conteúdo ultrapassa a largura da viewport na faixa entre 768px e 1024px."
      },
      {
        "heading": "Plano de Correção (Executado)",
        "content": "Aplicados ajustes puramente responsivos via CSS/Tailwind:\n1. **Logo com texto curto em tela intermediária (`NavbarLogo`):**\n   Exibição da versão compacta `gui@home:~$` no breakpoint `md` (768px a 1023px) e alternância limpa para a versão completa `guilherme-menezes@home:~$` a partir do breakpoint `lg` (`1024px+`).\n2. **Compressão proporcional de espaçamentos:**\n   - Reduzido `gap-4` para `gap-2 lg:gap-4` no container flex do `NavBody`.\n   - Reduzido `space-x-3` para `space-x-2 lg:space-x-3` na `NavbarLogo`.\n   - Reduzido padding dos links de `px-4 py-2` para `px-2 py-1.5 lg:px-4 lg:py-2` e `space-x-2` para `space-x-1 lg:space-x-2` em `NavItems`.\n   - Reduzido `gap-2` para `gap-1.5 lg:gap-2` no bloco de ações da direita (`Navbar.tsx`).\n   - Adicionado `shrink-0` nos blocos principais para evitar compressão acidental.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Sem corte de nenhum botão em viewports de 768px a 1440px.\n- [x] Logo exibe `gui@home:~$` na faixa `md` e `guilherme-menezes@home:~$` em `lg+`.\n- [x] Cursor piscante `█` funciona perfeitamente nas duas versões do logo.\n- [x] Transição de scroll (colapso e expansão) continua funcionando perfeitamente em telas intermediárias.\n- [x] **Pasta renomeada para `[done]-navbar-corte-largura-intermediaria` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-navbar-corte-largura-intermediaria"
  },
  {
    "id": "navbar-desktop-sobreposicao-botoes-1200px",
    "title": "Navbar Desktop — Sobreposição de botões em larguras próximas a 1200px",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-07-09",
    "priority": "média",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 80,
    "progressFraction": {
      "done": 4,
      "total": 5
    },
    "summary": "Ajusta o espaçamento e responsividade da navbar desktop em telas de 1200px evitando sobreposição.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "Ao scrollar a página em desktop, com a largura da viewport próxima de 1200px (e potencialmente em todo o intervalo entre o breakpoint mínimo de desktop e ~1200px), os botões de ação da navbar (email, theme toggle, language toggle) começam a se sobrepor visualmente aos links de navegação (About, Skills, Experience, Projects, Blogs).\n\n> [!NOTE]\n> **Causa raiz unificada:** Este bug é também a causa raiz do que era tratado originalmente no roadmap como o \"bug #4\" (itens de navegação não clicáveis / `NavBody` / `NavbarWrapper`). A falha no clique dos links de navegação é uma consequência direta da sobreposição física detalhada neste documento (conforme verificado em teste manual pelo dono do projeto), e por isso não deve ser tratado como um problema separado nem possuir uma pasta própria na documentação."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Abrir o site em desktop com a viewport em torno de 1200px de largura.\n2. Scrollar a página verticalmente (mais de 50px, ativando o estado de navbar \"encolhida\").\n3. Observar a área central/direita da navbar: os links de navegação e os botões de ação passam a ocupar o mesmo espaço visual.\n4. Em ~1200px de largura, com o scroll ativo (navbar colapsada), tentar clicar nos links de navegação (About, Skills, Experience, Projects, Blogs). O clique para de funcionar porque os botões de ação (idioma, tema, e-mail) passam a ficar fisicamente sobrepostos a eles (confirmado em teste manual pelo dono do projeto)."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "Independentemente da largura da tela (dentro do breakpoint de desktop) ou do estado de scroll, os links de navegação e os botões de ação devem permanecer visualmente distintos, sem sobreposição, ajustando-se ao espaço disponível."
      },
      {
        "heading": "Comportamento Atual",
        "content": "Ao ativar o estado de scroll (`isScrolled`/`visible`), a navbar (`NavBody`) anima sua largura de `100%` para `40%` da tela. Nesse estado reduzido, os elementos internos (logo, links, botões de ação) passam a competir pelo mesmo espaço, com os links de navegação se sobrepondo aos botões por estarem posicionados de forma absoluta."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- **Camada afetada:** frontend (componente de navbar desktop)\n- **Arquivo(s) confirmado(s) por trecho de código real:**\n  - `resizable-navbar.tsx` — componentes `NavBody` e `NavItems`\n  - `Navbar.tsx` — composição da navbar desktop (`NavBody` + `NavbarLogo` + `NavItems` + botões de ação)\n- **Logs de erro:** não aplicável (bug visual de layout, não runtime)\n\n### Evidência de código coletada\n\nContainer da navbar desktop (`NavBody`):\n```tsx\n<motion.div\n  animate={{\n    backdropFilter: visible ? 'blur(10px)' : 'none',\n    boxShadow: visible ? '...' : 'none',\n    width: visible ? '40%' : '100%',\n    y: visible ? 20 : 0,\n  }}\n  transition={{ type: 'spring', stiffness: 200, damping: 50 }}\n  style={{ minWidth: '200px' }}\n  className={cn(\n    'relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex dark:bg-transparent',\n    visible && 'bg-white/80 dark:bg-neutral-950/80',\n    className,\n  )}\n>\n  {children}\n</motion.div>\n```\n\nBloco de links de navegação (`NavItems`), posicionado de forma absoluta dentro do container:\n```tsx\n<motion.div\n  onMouseLeave={() => setHovered(null)}\n  className={cn(\n    'absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2',\n    className,\n  )}\n>\n  {/* ... */}\n</motion.div>\n```\n\nComposição em `Navbar.tsx`:\n```tsx\n<NavBody>\n  <NavbarLogo isScrolled={isScrolled} />\n  <NavItems items={navItems} isScrolled={isScrolled} />\n  <div className=\"relative z-10 flex items-center gap-2\">\n    <LanguageToggle />\n    <ThemeToggle />\n    <Button variant=\"default\" className=\"rounded-full z-50\" onClick={() => { /* ... */ }}>\n      <FaEnvelope />\n    </Button>\n  </div>\n</NavBody>\n```\n\n### Valores relevantes confirmados no código\n- Breakpoint de ativação do layout desktop: `lg:` (1024px, padrão Tailwind).\n- Largura máxima da navbar: `max-w-7xl` (1280px).\n- Largura no estado \"scrolled\": `40%` da viewport — em 1200px de tela, equivale a 480px físicos; em 1024px (breakpoint mínimo), equivale a ~409.6px.\n- `minWidth: '200px'` definido inline na `NavBody` (ainda não analisado se conflita com os 40% — ver lacuna abaixo)."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "**Confirmada parcialmente por teste manual do dono do projeto.** Duas causas candidatas, combinadas, levantadas a partir da leitura do código:\n\n1. **Posicionamento absoluto do `NavItems`** (`absolute inset-0`): por estar fora do fluxo normal do flexbox da `NavBody`, o bloco de links não interage com a largura física dos elementos vizinhos (logo, botões de ação) para evitar sobreposição — ele simplesmente se centraliza por cima do espaço disponível.\n   *Nota: O cenário sem scroll próximo de 1024px não foi reproduzido no teste manual do dono do projeto (que testou apenas com scroll ativo). Portanto, a Causa 1 permanece não testada e precisa ser validada futuramente.*\n2. **Redução para 40% no estado \"scrolled\"**: com a navbar reduzida a ~480px (a 1200px de tela) ou ~409.6px (a 1024px), o espaço pode não comportar logo + links + botões de ação simultaneamente, forçando a sobreposição do conteúdo absoluto sobre os botões (`relative z-10`).\n   *Nota: Esta causa foi confirmada por teste manual real. O dono do projeto verificou que, a ~1200px de largura com scroll ativo, o clique nos links de navegação falha porque os botões de ação ficam fisicamente sobre eles, validando o comportamento previsto.*\n\n**Lacuna identificada, não preenchida por suposição:** não foi analisado se `minWidth: '200px'` (definido inline) entra em conflito ou mitiga parcialmente o problema em alguma faixa de largura. Isso precisa ser investigado antes de qualquer plano de correção."
      },
      {
        "heading": "Plano de Correção",
        "content": "> [!IMPORTANT]\n> **Proposta de Direção de Design (Dono do Projeto):**\n> O plano a seguir descreve a direção de design proposta pelo dono do projeto. Esta proposta ainda **não está aprovada** como a especificação técnica final para implementação. Os detalhes técnicos exatos do \"como\" (por exemplo, uso de `width: fit-content`, remoção de animações percentuais rígidas, determinação precisa dos breakpoints para tablets) ainda dependem de definição e validação antes que o status do documento possa avançar para `[approved]`.\n\n### Diretrizes Propostas:\n- **Exibição do Nome:** Não ocultar o nome \"Guilherme Menezes\" ao scrollar, mantendo-o sempre visível na barra.\n- **Largura Dinâmica no Scroll:** Ao colapsar devido ao scroll, o menu (`NavBody`) não deve assumir uma porcentagem fixa (como os atuais `40%`) de forma rígida. Em vez disso, a largura deve se ajustar com base no espaço real necessário para comportar o nome, os links e as ações juntos, prevenindo qualquer sobreposição.\n- **Comportamento em Tablets:** Esse modelo de dimensionamento fluido baseado no conteúdo deve se estender também para resoluções de tablet, e não apenas desktop.\n- **Layout Mobile:** O layout simplificado (exibindo foto de perfil $\\rightarrow$ texto centralizado \"Portfólio\" $\\rightarrow$ ícone do menu hambúrguer) deve ser ativado apenas ao entrar formalmente no breakpoint mobile.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-navbar-desktop-sobreposicao-botoes-1200px`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-navbar-desktop-sobreposicao-botoes-1200px"
  },
  {
    "id": "navbar-logo-nao-clicavel-desktop",
    "title": "NavbarLogo — Não é clicável no desktop",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-07-09",
    "priority": "baixa",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 60,
    "progressFraction": {
      "done": 3,
      "total": 5
    },
    "summary": "Torna o texto/logo da navbar clicável em dispositivos desktop para rolar ao topo.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "O `NavbarLogo` está projetado para ser um link navegável (envolto por uma tag `<a>`). Ele funciona e é clicável corretamente na versão responsiva (mobile), porém, no desktop (estado não-scrollado), o clique no logo não tem efeito."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Abrir o portfólio em desktop (viewport >= 1024px)\n2. Tentar clicar no logo \"Guilherme Menezes\" no lado esquerdo da navbar\n3. Observar que o clique não funciona e o cursor não muda para pointer"
      },
      {
        "heading": "Comportamento Esperado",
        "content": "O logo deve ser clicável e ancorar para a seção `#about`, assim como ocorre no mobile."
      },
      {
        "heading": "Comportamento Atual",
        "content": "O `NavbarLogo` de fato possui a estrutura de link com `href` e é clicável no mobile (onde é renderizado dentro de `MobileNavHeader`), mas não funciona no desktop quando o componente irmão `NavItems` está renderizado junto com ele no `NavBody`:\n\n```tsx\n// src/components/ui/resizable-navbar.tsx (linhas 232-237)\nexport const NavbarLogo = ({ isScrolled }: { isScrolled: boolean }) => {\n  return (\n    <a\n      href=\"#about\"\n      className=\"group flex items-center space-x-3\"\n      aria-label=\"Navigate to About section\"\n    >\n```"
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend\n- Arquivo(s) suspeito(s):\n  - `src/components/ui/resizable-navbar.tsx` — `NavbarLogo` e `NavItems`"
      },
      {
        "heading": "Hipótese de Causa",
        "content": "**Hipótese não confirmada por inspeção real —** A suspeita atual é que o componente irmão `NavItems` esteja sobrepondo fisicamente a área do logo e bloqueando os eventos de clique no desktop.\n\nO `NavItems` possui a classe `absolute inset-0`, que faz com que ele estique sobre todo o `NavBody`:\n```tsx\n// src/components/ui/resizable-navbar.tsx (linhas 114-121)\nexport const NavItems = ({ items, className, isScrolled, onItemClick }: NavItemsProps) => {\n  const [hovered, setHovered] = useState<number | null>(null)\n\n  return (\n    <motion.div\n      onMouseLeave={() => setHovered(null)}\n      className={cn(\n        'absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 ... lg:flex ...',\n        className,\n      )}\n    >\n```\nSem uma declaração de `z-index` explícita no `NavbarLogo`, a camada absoluta do `NavItems` pode estar posicionada acima dele no contexto de empilhamento."
      },
      {
        "heading": "Diagnóstico Real (Comprovado via Teste Programático)",
        "content": "A hipótese visual foi testada e **confirmada como a causa exata**. \nAtravés de um script de diagnóstico rodando `document.elementFromPoint(x, y)` exatamente no centro do `NavbarLogo`, o elemento retornado pelo navegador foi:\n```text\nDIV class: absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2\n```\nEste é o container de `NavItems`. Como ele usa `absolute inset-0`, ele estica para cobrir 100% da Navbar (para permitir que os itens fiquem centralizados perfeitamente na tela). Por estar no mesmo nível hierárquico, ele é renderizado sobre o Logo, interceptando invisivelmente os cliques."
      },
      {
        "heading": "Plano de Correção",
        "content": "Como a classe `inset-0` do `NavItems` é estrutural para o alinhamento central do flexbox, a solução não deve alterar a geometria do menu, mas sim ajustar a ordem de empilhamento (stacking context). O uso de `pointer-events-none` causou uma regressão no efeito de `:hover` do logo, portanto a abordagem correta é o controle de eixo Z.\n\n1. Em `src/components/ui/resizable-navbar.tsx`, adicionar as classes `relative z-10` ao elemento `<a>` principal do `NavbarLogo`.\n2. Adicionar as mesmas classes `relative z-10` ao container das ações da direita (`ThemeToggle` e botão de CV) em `NavBody`, para garantir que eles também fiquem acima da camada invisível do menu central.\nIsso fará com que os elementos clicáveis fiquem em uma camada fisicamente superior ao `NavItems` (que tem `z-index` automático), restaurando tanto o clique quanto a detecção nativa de hover.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-navbar-logo-nao-clicavel-desktop`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-navbar-logo-nao-clicavel-desktop"
  },
  {
    "id": "navbar-nome-desaparece-ao-scroll",
    "title": "Navbar — Nome \"Guilherme Menezes\" desaparece ao scrollar (desktop e mobile)",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-07-09",
    "priority": "alta",
    "tags": [
      "frontend",
      "animação",
      "ui-ux"
    ],
    "progress": 80,
    "progressFraction": {
      "done": 4,
      "total": 5
    },
    "summary": "Corrige o desaparecimento abrupto do nome no logo da navbar durante o scroll.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "O nome \"Guilherme Menezes\", exibido ao lado da foto de perfil na navbar, desaparece quando a página é scrollada (mais de 50px), tanto em desktop quanto em mobile. Confirmado pelo dono do projeto como comportamento antigo, presente desde sempre — não é regressão recente."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Abrir o site (desktop ou mobile).\n2. Observar a navbar no topo: foto + nome \"Guilherme Menezes\" visíveis.\n3. Scrollar a página verticalmente além de 50px.\n4. Observar que o nome desaparece, restando apenas a foto (e, no mobile, o espaço em branco entre foto e menu hambúrguer)."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "O nome deve permanecer visível na navbar independentemente do estado de scroll, tanto em desktop quanto em mobile."
      },
      {
        "heading": "Comportamento Atual",
        "content": "O componente `NavbarLogo` condiciona a renderização do `<span>` do nome à negação do estado `isScrolled`. Quando `isScrolled` é `true`, o `<span>` não é renderizado."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- **Camada afetada:** frontend (componente compartilhado entre navbar desktop e mobile)\n- **Arquivo(s) confirmado(s) por trecho de código real:**\n  - `resizable-navbar.tsx` — componente `NavbarLogo`\n  - `Navbar.tsx` — estado `isScrolled` e os dois pontos de uso do `NavbarLogo`\n\n### Evidência de código coletada\n\nComponente `NavbarLogo` completo:\n```tsx\nexport const NavbarLogo = ({ isScrolled }: { isScrolled: boolean }) => {\n  return (\n    <a\n      href=\"#about\"\n      className=\"group relative z-10 flex items-center space-x-3\"\n      aria-label=\"Navigate to About section\"\n    >\n      <Image\n        src=\"/guilherme.jpg\"\n        alt=\"Guilherme Menezes\"\n        width={32}\n        height={32}\n        className=\"rounded-full\"\n      />\n      {!isScrolled && (\n        <span className=\"text-lg font-bold group-hover:text-brand-highlight transition-colors\">\n          Guilherme Menezes\n        </span>\n      )}\n    </a>\n  )\n}\n```\n\nEstado de scroll, definido em `Navbar.tsx`:\n```tsx\nconst [isScrolled, setIsScrolled] = useState(false)\n// ...\nuseEffect(() => {\n  const onScroll = () => setIsScrolled(window.scrollY > 50)\n  window.addEventListener('scroll', onScroll)\n  return () => window.removeEventListener('scroll', onScroll)\n}, [])\n```\n\nUso no layout desktop:\n```tsx\n<NavBody>\n  <NavbarLogo isScrolled={isScrolled} />\n  <NavItems items={navItems} isScrolled={isScrolled} />\n```\n\nUso no layout mobile:\n```tsx\n<MobileNav>\n  <MobileNavHeader>\n    <NavbarLogo isScrolled={isScrolled} />\n    <MobileNavToggle\n      isOpen={isMobileMenuOpen}\n      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}\n    />\n  </MobileNavHeader>\n```\n\nIsso confirma, por evidência direta (mesmo componente, mesma prop, mesmo estado), que desktop e mobile compartilham exatamente a mesma lógica de ocultação — não são dois bugs independentes, é uma única causa raiz."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "Não é hipótese — é causa confirmada por leitura direta do código: a condicional `{!isScrolled && (...)}` no `NavbarLogo` remove o `<span>` do nome inteiramente da árvore de renderização quando `isScrolled` é `true`. Não há CSS de transição/fade envolvido — é renderização condicional binária."
      },
      {
        "heading": "Plano de Correção",
        "content": "*(Não preenchido — plano de correção é trabalho do agente executor após aprovação, não deste documento.)*\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-navbar-nome-desaparece-ao-scroll`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-navbar-nome-desaparece-ao-scroll"
  },
  {
    "id": "navbar-travando-intermediario",
    "title": "Navbar trava em estado intermediário na transição grande → pequena (regressão)",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-07-11",
    "priority": "alta",
    "tags": [
      "frontend",
      "animação",
      "ui-ux"
    ],
    "progress": 88,
    "progressFraction": {
      "done": 7,
      "total": 8
    },
    "summary": "Corrige o travamento e distorção de escala da navbar na transição grande para pequena via engine de layout.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "Após a primeira tentativa de correção (mudando o controle do NavBody para a engine de `layout` em vez de `animate` explícito), a navbar parou de \"travar\" com o erro de medição do Framer Motion, **porém**, a fluidez ficou terrível. Durante a transição do estado grande pro pequeno (e vice-versa), os elementos filhos (textos, botões, logo) ficam todos esmagados, esticados e visualmente bugados até que a animação termine. Além disso, o pause/travadinha retornou sob novas condições."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Acessar a página com a navbar no estado não-scrollado.\n2. Rolar a página para baixo e para cima.\n3. Observar a distorção (estiramento/esmagamento) do texto do logo e dos botões direitos durante a escala do fundo da navbar."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend (`src/components/ui/resizable-navbar.tsx` e `src/components/main/Navbar.tsx`)"
      },
      {
        "heading": "Hipótese de Causa e Investigação Incremental",
        "content": "**Rodada 1 (refutada):**\nAdicionado `layout`/`layout=\"position\"` simultaneamente nos 3 filhos do `NavBody` (`NavbarLogo`, `NavItems` e container de ações). Resultado: distorção piorou.\n\n**Rodada 2 (refutada):**\nRemovida a classe `flex-1` do `NavItems`. Resultado: a distorção no scroll continuou ocorrendo.\n\n**Rodada 3 — Isolação dos Filhos (Resultado B):**\nRevertemos `NavbarLogo` (voltou a ser `<a>` simples) e a `div` de ações da direita (voltou a ser `div` HTML simples), mantendo apenas o `NavItems` com `layout`. Mesmo com um único filho animando `layout`, o estouro e distorção visual continuaram acontecendo.\n\n**Rodada 4 — Substituição do Mecanismo de Largura (Abordagem A):**\nEliminamos a dependência da prop `layout`/FLIP no `NavBody`. A largura do conteúdo interno passou a ser animada numericamente (`width: visible ? ${contentWidth + 32}px : '100%'`) com spring a partir de medição via `ResizeObserver`, eliminando a distorção por escala `scaleX`.\n\n**Rodada 5 (refutada/insuficiente):**\nA alternância condicional da classe (`visible ? 'w-max' : 'w-full'`) no mesmo wrapper de exibição fazia com que a medição do `ResizeObserver` chegasse com atraso assíncrono em relação à troca de estado, fazendo a barra deslocar para a esquerda durante a animação e causando cortes ocasionais de botões.\n\n**Rodada 6 — Clone de Medição Dedicado (SOLUÇÃO DEFINITIVA):**\nSeparamos totalmente a medição da exibição no `NavBody`:\n1. **Elemento Visível Real:** Renderiza os filhos com `<div className=\"flex w-full items-center justify-between gap-4\">` (sempre `w-full`, preservando o alinhamento balanceado de ponta a ponta no estado expandido).\n2. **Clone Invisível de Medição:** Renderiza uma cópia dos filhos com `aria-hidden=\"true\"`, `opacity-0`, `pointer-events-none` e `absolute -z-10 inline-flex w-max`, dedicado exclusivamente a alimentar o `ResizeObserver` com a largura natural real dos elementos sem interferir no fluxo do layout visual."
      },
      {
        "heading": "Plano de Correção (Executado)",
        "content": "1. **Remoção da prop `layout` e FLIP:** Removidas as props `layout` e `layout=\"position\"` do `NavBody`, `NavbarLogo`, `NavItems` e container de ações da direita.\n2. **Separação Exibição x Medição:** O conteúdo real fica em um container fixo `w-full`, e um clone invisível `w-max` absoluto fornece a largura precisa ao `ResizeObserver`.\n3. **Animação Numérica de Largura:** O `NavBody` interpola sua largura numericamente entre `100%` e `${contentWidth + 32}px` via Framer Motion `animate` e `sharedTransition` spring, com aceleração no texto dos itens para evitar atrasos no fechamento.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Sem distorção no logo e botões (largura animada numericamente sem FLIP scale).\n- [x] Sem pausa intermediária ou dependência de hover (ResizeObserver reage à largura real do clone).\n- [x] Sem desalinhamento à esquerda no estado expandido (conteúdo visível sempre `w-full` com `justify-between`).\n- [x] Sem corte de botões ou sobra de espaço no estado colapsado (testado em 5 ciclos seguidos de scroll).\n- [x] Clone invisível com `pointer-events-none` e `aria-hidden=\"true\"` isolado fora do fluxo visual.\n- [x] **Pasta renomeada para `[done]-navbar-travando-intermediario` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-navbar-travando-intermediario"
  },
  {
    "id": "open-redirect-fluxo-autenticacao",
    "title": "Open redirect no fluxo de autenticação",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "alta",
    "tags": [
      "segurança",
      "backend",
      "frontend",
      "api"
    ],
    "progress": 40,
    "progressFraction": {
      "done": 2,
      "total": 5
    },
    "summary": "Consolidar a validação de redirectTo no login, 2FA, middleware e destino de redirect.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "As PRs #3, #5 e #6 tratam do mesmo vetor: valores `redirectTo` ou destinos derivados aceitam `//host`, podendo produzir redirect externo após login ou 2FA."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Fornecer `//evil.example`, URL absoluta, vazio e caminho local em query/cookie.\n2. Exercitar login, confirmação 2FA, middleware e `redirect-target`.\n3. Registrar URL final e resposta sem usar credenciais reais."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "Somente destinos locais permitidos devem ser preservados, com fallback seguro para `/admin` quando a entrada for inválida."
      },
      {
        "heading": "Comportamento Atual",
        "content": "A branch `main` ainda possui validações textuais incompletas. A PR #6 cobre mais pontos — `LoginForm`, `verify-2fa`, API de verificação, `redirect-target/route.ts` e `middleware.ts` — mas ainda duplica a regra e não possui testes automatizados."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend, backend e API de autenticação.\n- Arquivos envolvidos: `src/app/admin/login/LoginForm.tsx`, `src/app/admin/verify-2fa/page.tsx`, `src/app/api/admin/2fa/verify/route.ts`, `src/app/api/admin/redirect-target/route.ts`, `src/middleware.ts`.\n- Nenhuma PR teve checks ou testes independentes confirmados na análise."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "A aplicação trata `startsWith('/')` como sinônimo de caminho relativo, embora `//` seja protocol-relative. A duplicação aumenta o risco de correções divergentes."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Consolidar as PRs #3, #5 e #6 em uma única alteração coerente.\n2. Preferir helper compartilhado com fallback seguro e validação por URL/origem.\n3. Testar todos os consumidores e transições login/2FA/deep-link.\n4. Incluir casos de barra invertida e normalização do Next.js.\n5. Verificar ausência de destino externo em respostas e navegação final.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Evidências parciais registradas no LOG: helper compartilhado validado em 15/15 casos e consumidores atualizados; fluxo autenticado completo, cookie e 2FA ainda não foram exercitados.\n\n- [ ] Bug não reproduz mais\n- [ ] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-open-redirect-fluxo-autenticacao` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-open-redirect-fluxo-autenticacao"
  },
  {
    "id": "open-redirect-login-parcial",
    "title": "Open redirect parcial no login",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "alta",
    "tags": [
      "segurança",
      "frontend",
      "api"
    ],
    "progress": 40,
    "progressFraction": {
      "done": 2,
      "total": 5
    },
    "summary": "Corrigir o bloqueio incompleto de URLs protocol-relative em login, 2FA e API conforme a PR 3.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "A validação textual de `redirectTo` aceita strings iniciadas por `//`, que podem ser interpretadas como URLs protocol-relative externas."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Fornecer `redirectTo=//evil.example` ao fluxo de login ou 2FA.\n2. Exercitar a conclusão do login.\n3. Observar se o destino é aceito como caminho local ou se pode sair da origem."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "Somente caminhos locais permitidos devem ser aceitos; valores protocol-relative, absolutos, vazios ou malformados devem cair em destino seguro."
      },
      {
        "heading": "Comportamento Atual",
        "content": "Na branch `main`, a análise encontrou validações vulneráveis em `LoginForm.tsx`, `verify-2fa/page.tsx` e `src/app/api/admin/2fa/verify/route.ts`. A PR #3 corrige os três consumidores, mas não cobre o destino centralizado nem o middleware."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend, backend e API de autenticação.\n- Arquivos propostos pela PR #3: `src/app/admin/login/LoginForm.tsx`, `src/app/admin/verify-2fa/page.tsx`, `src/app/api/admin/2fa/verify/route.ts`.\n- Não há testes automatizados nem evidência independente de execução."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "A checagem `startsWith('/')` confunde caminhos locais com URLs protocol-relative. A correção precisa ser centralizada ou aplicada a todos os consumidores para evitar cobertura parcial."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Mapear todos os consumidores de `redirectTo` e `admin_redirect`.\n2. Criar helper seguro ou validação equivalente única.\n3. Cobrir `//evil.example`, `/admin/path`, URL absoluta, vazio e deep-linking com cookie/query.\n4. Avaliar também formas com barra invertida e normalização do framework.\n5. Executar testes de login e 2FA sem expor credenciais.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Evidências parciais registradas no LOG: casos do helper validados e rotas não autenticadas redirecionam ao login; fluxo autenticado não foi exercitado.\n\n- [ ] Bug não reproduz mais\n- [ ] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-open-redirect-login-parcial` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-open-redirect-login-parcial"
  },
  {
    "id": "open-redirect-loginform-parcial",
    "title": "Open redirect parcial no LoginForm",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "alta",
    "tags": [
      "segurança",
      "frontend"
    ],
    "progress": 40,
    "progressFraction": {
      "done": 2,
      "total": 5
    },
    "summary": "Avaliar a correção isolada do LoginForm para URLs protocol-relative e sua cobertura incompleta.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "A PR #5 adiciona `!redirectTo.startsWith('//')` em dois pontos de `LoginForm.tsx` para impedir redirects protocol-relative após autenticação."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Acessar o login com `redirectTo=//evil.example`.\n2. Concluir o login.\n3. Repetir o fluxo por 2FA e pelo endpoint de redirect."
      },
      {
        "heading": "Comportamento Esperado",
        "content": "Nenhum caminho controlado pelo usuário deve redirecionar para origem externa; todos os consumidores devem aplicar a mesma política."
      },
      {
        "heading": "Comportamento Atual",
        "content": "A correção da PR #5 cobre somente dois pontos do `LoginForm`. Permanecem consumidores em `verify-2fa/page.tsx`, `api/admin/2fa/verify/route.ts` e `api/admin/redirect-target/route.ts`. A forma com barra invertida também não é tratada explicitamente."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend e autenticação.\n- Arquivo da PR: `src/app/admin/login/LoginForm.tsx`.\n- `.jules/sentinel.md` é documentação adicional.\n- Não há testes automatizados; apenas build alegado pelo autor."
      },
      {
        "heading": "Hipótese de Causa",
        "content": "A validação foi corrigida localmente, mas a regra não foi centralizada nem propagada a todos os destinos. O cookie `admin_redirect` é HttpOnly e criado pelo middleware, reduzindo alguns vetores, mas não substitui validação consistente."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Não aplicar a PR isoladamente como solução final.\n2. Consolidar com as PRs #3 e #6.\n3. Criar testes para protocol-relative, barra invertida, caminho local, URL absoluta e deep-linking.\n4. Remover documentação duplicada e confirmar o contrato do destino seguro.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> Evidências parciais registradas no LOG: os dois destinos do LoginForm usam o helper e o login local renderiza; credenciais e redirect autenticado não foram testados.\n\n- [ ] Bug não reproduz mais\n- [ ] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-open-redirect-loginform-parcial` e movida para `archive/bugs/`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-open-redirect-loginform-parcial"
  },
  {
    "id": "resume-pdf-largura-sem-resize",
    "title": "Resume — Largura do PDF calculada apenas no carregamento inicial",
    "category": "bugs",
    "status": "done",
    "area": "archive",
    "date": "2026-07-08",
    "priority": "média",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 60,
    "progressFraction": {
      "done": 3,
      "total": 5
    },
    "summary": "Corrige a renderização e o ajuste de largura do componente de exibição de PDF do currículo.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "A largura do componente `<Page>` do `react-pdf` na seção Resume é calculada uma única vez no momento da renderização, usando `window.innerWidth` diretamente no JSX. Isso significa que se o usuário redimensionar a janela após o carregamento da página, o PDF permanece com a largura original e não se adapta."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Abrir o portfólio em desktop com a janela em largura máxima\n2. Rolar até a seção \"My Resume\"\n3. Observar que o PDF renderiza com uma largura correta\n4. Redimensionar a janela do browser para uma largura menor (ex: de 1440px para 768px) sem recarregar\n5. Observar que o PDF permanece com a largura do carregamento inicial, transbordando ou ficando desalinhado"
      },
      {
        "heading": "Comportamento Esperado",
        "content": "O PDF deve se adaptar dinamicamente ao redimensionamento da janela, respeitando sempre `Math.min(890, window.innerWidth - 20)`."
      },
      {
        "heading": "Comportamento Atual",
        "content": "A largura é calculada inline no JSX, avaliada apenas uma vez no render estático:\n```tsx\n// src/components/main/Resume.tsx — linha 67\nwidth={Math.min(890, typeof window !== 'undefined' ? window.innerWidth - 20 : 1200)}\n```\nNão existe `useState` + `useEffect` + listener de `resize` para atualizar o valor dinamicamente."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend\n- Arquivo(s) suspeito(s): `src/components/main/Resume.tsx` (linha 67)\n- Logs de erro (se houver): nenhum"
      },
      {
        "heading": "Hipótese de Causa",
        "content": "O valor `window.innerWidth - 20` é lido somente durante o render. Como não há subscription ao evento `window.resize`, o componente nunca é notificado de que a viewport mudou e não re-renderiza."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Em `src/components/main/Resume.tsx`, criar um estado `containerWidth`:\n   ```tsx\n   const [containerWidth, setContainerWidth] = useState(\n     typeof window !== 'undefined' ? Math.min(890, window.innerWidth - 20) : 890\n   )\n   ```\n2. Adicionar um `useEffect` que escuta o evento `resize`:\n   ```tsx\n   useEffect(() => {\n     const handleResize = () => {\n       setContainerWidth(Math.min(890, window.innerWidth - 20))\n     }\n     window.addEventListener('resize', handleResize)\n     return () => window.removeEventListener('resize', handleResize)\n   }, [])\n   ```\n3. Substituir o atributo `width` do `<Page>` por `{containerWidth}`\n4. Testar redimensionamento em desktop e dispositivos mobile\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-resume-pdf-largura-sem-resize`**"
      }
    ],
    "path": "docs/archive/bugs/[done]-resume-pdf-largura-sem-resize"
  },
  {
    "id": "2fa-layout-painel-admin",
    "title": "2FA (TOTP) e Layout Base do Painel Admin",
    "category": "features",
    "status": "cancelled",
    "area": "archive",
    "date": "2026-09-09",
    "priority": "alta",
    "tags": [
      "backend",
      "frontend",
      "segurança",
      "ui-ux"
    ],
    "progress": 5,
    "progressFraction": {
      "done": 1,
      "total": 21
    },
    "summary": "Card monolítico cancelado e decomposto em 5 cards menores modulares para execução incremental da Subfase 2.4.",
    "sections": [
      {
        "heading": "Depende de",
        "content": "`[done]-sqlite-persistencia-inicial` (para armazenar o secret TOTP e códigos de backup), `[done]-login-email-senha` e `[done]-login-social-google-github` (2FA se aplica a todos os métodos de login existentes)."
      },
      {
        "heading": "Objetivo",
        "content": "Adicionar uma segunda camada de segurança ao login de forma opcional (configurável pelo painel admin na seção de segurança), com códigos de backup e mecanismo de recuperação emergencial via SSH, além de entregar o layout base do painel e suas 6 seções administrativas funcionais (como placeholders para as fases futuras)."
      },
      {
        "heading": "Descrição Funcional",
        "content": "1. **2FA Opcional:** No primeiro login (ou em qualquer login enquanto o 2FA não for ativado), o usuário é direcionado imediatamente ao painel (`/admin`), sem qualquer bloqueio ou redirecionamento forçado.\n2. **Gerenciamento no Painel:** Na página de Segurança (`/admin/seguranca`), o administrador pode acompanhar o status do 2FA, ativar pela primeira vez, desativar ou redefinir.\n3. **Setup e Códigos de Backup:** Ao ativar em `/admin/setup-2fa`, o sistema gera o segredo TOTP, exibe o QR Code e confirma o primeiro código de 6 dígitos. Após a ativação bem-sucedida, são gerados 10 códigos de backup de uso único (formato `XXXX-XXXX`), hasheados no SQLite e exibidos em texto claro uma única vez em tela dedicada com botão de cópia e confirmação obrigatória de salvamento.\n4. **Desafio de Segundo Fator:** Com o 2FA ativo, todo login subsequente (Email/Senha, Google ou GitHub) exige o código TOTP de 6 dígitos ou um código de backup na tela `/admin/verify-2fa`.\n5. **Confirmação para Ações Sensíveis:** Desativar ou redefinir o 2FA exige confirmação de segundo fator (TOTP ou código de backup). A interface contém campo para confirmação por e-mail com aviso de integração futura (sem simulação).\n6. **Recuperação de Emergência via SSH:** Script direto no servidor (`scripts/emergency-disable-2fa.ts`) para desativação emergencial em caso de perda total de dispositivos.\n7. **Sessão Sincronizada de 7 dias:** A sessão JWT do NextAuth e o cookie `admin_2fa_verified` têm validade de 7 dias (`604800` segundos).\n8. **Layout Base do Painel:** Navegação entre as 6 seções (Hero, Skills, Currículo, Projetos, Idioma, Guestbook) com layout responsivo dark glassmorphic e páginas placeholder."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- **2FA Condicional:** middleware verifica `admin_2fa_verified` apenas se o 2FA estiver ativo no banco (`enabled = 1`).\n- **Setup 2FA (`/admin/setup-2fa`):** geração de secret TOTP com `otpauth`, QR code com `qrcode`, validação de primeiro código.\n- **Códigos de Backup:** geração de 10 códigos alfanuméricos (`XXXX-XXXX`), hash bcrypt no SQLite (`two_factor_backup_codes`), exibição única com botão de cópia e validação/consumo de uso único em `/admin/verify-2fa`.\n- **Página de Segurança (`/admin/seguranca`):** status de proteção, botão para ativar, e botões para desativar/redefinir.\n- **Confirmação de Ações Sensíveis:** verificação de TOTP ou código de backup antes de desativar ou redefinir o 2FA. Interface com campo para confirmação por e-mail com aviso de pendência.\n- **Script de Emergência SSH (`scripts/emergency-disable-2fa.ts`):** comando via terminal para desativar 2FA e limpar backups diretamente no SQLite.\n- **Sessão de 7 dias:** configuração de `maxAge: 7 * 24 * 60 * 60` no NextAuth e no cookie `admin_2fa_verified`.\n- **Layout Base e 6 Seções:** layout compartilhado com sidebar responsiva, badges de fases e 6 páginas com rotas funcionais (`/admin/hero`, `/admin/skills`, `/admin/curriculo`, `/admin/projetos`, `/admin/idioma`, `/admin/guestbook`).\n\n### Não inclui (por ora)\n\n- Envio real de e-mails de confirmação via Resend (interface mockada com aviso claro de integração futura).\n- Tela de regeneração avulsa de códigos de backup sem redefinir o 2FA.\n- Edição real de conteúdo nas 6 seções administrativas (Fase 3 em diante)."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** frontend (telas de setup, verificação, segurança e layout do painel), backend (rotas e Server Actions de autenticação TOTP/backup) e banco de dados SQLite (`better-sqlite3`).\n- **Dependências:** `otpauth` (validação TOTP RFC 6238), `qrcode` e `@types/qrcode` (renderização de QR Code), `bcryptjs` (hashing dos códigos de backup).\n- **Banco de Dados:** tabela `two_factor_auth` (já existente no SQLite) e nova tabela `two_factor_backup_codes`.\n- **Criptografia de Sessão 2FA:** token assinado com HMAC-SHA256 via Web Crypto API (`src/lib/totp-token.ts`), válido no Edge Runtime."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. **Schema & Helpers de Banco:** adicionar tabela `two_factor_backup_codes` em `src/lib/db.ts` e métodos de consulta/atualização em `src/lib/totp.ts`.\n2. **Configuração de Sessão (7 dias):** configurar `maxAge: 604800` em `src/auth.config.ts`, `src/auth.ts` e `src/lib/totp-token.ts`.\n3. **Middleware Condicional:** ajustar `src/middleware.ts` para checar 2FA apenas quando ativado.\n4. **Telas e Rotas de 2FA:**\n   - `/admin/setup-2fa` e tela de backup codes.\n   - `/admin/verify-2fa` com suporte a TOTP e código de backup.\n   - Ação para desativar/redefinir com confirmação.\n5. **Layout Base e Seção de Segurança:**\n   - Implementar layout `src/app/admin/(dashboard)/layout.tsx`.\n   - Página `/admin/seguranca`.\n   - Páginas placeholder das 6 seções.\n6. **Script de Emergência:** criar `scripts/emergency-disable-2fa.ts`.\n7. **Testes e Validação:** validar todos os 6 pontos de teste solicitados."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] 2FA opcional: login sem 2FA ativado entra direto no `/admin` sem redirecionamento para telas de 2FA\n- [ ] Setup inicial de 2FA funcional (gera secret, QR code escaneável, confirma ativação)\n- [ ] 10 códigos de backup de uso único gerados no setup, hasheados no SQLite e exibidos uma única vez\n- [ ] Login com 2FA ativo exige TOTP em todos os métodos (Email/Senha, Google, GitHub)\n- [ ] Opção de código de backup na tela de verificação valida e consome o código (código usado é rejeitado na tentativa seguinte)\n- [ ] Página de Segurança no painel exibe status e opções de ativar, desativar e redefinir\n- [ ] Desativar ou redefinir 2FA exige confirmação de segundo fator (TOTP ou backup válido)\n- [ ] Script de emergência via SSH (`emergency-disable-2fa.ts`) desativa o 2FA e limpa backups diretamente no SQLite\n- [ ] Duração da sessão JWT e do cookie 2FA configurada para 7 dias (`maxAge: 604800`)\n- [ ] Layout do painel navegável entre as 6 seções com visual consistente com o site público\n- [ ] Secret TOTP e códigos de backup persistem corretamente no SQLite após redeploy\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Todos os critérios de conclusão atendidos\n- [ ] Teste de opcionalidade validado\n- [ ] Teste de códigos de backup validado\n- [ ] Teste de desativação e redefinição validado\n- [ ] Teste de script de emergência validado\n- [ ] Teste de duração de sessão (7 dias) validado\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-2fa-layout-painel-admin` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[cancelled]-2fa-layout-painel-admin"
  },
  {
    "id": "auth-painel-admin",
    "title": "Autenticação + Esqueleto do Painel Admin",
    "category": "features",
    "status": "cancelled",
    "area": "archive",
    "date": "2026-08-31",
    "priority": "alta",
    "tags": [
      "frontend",
      "backend",
      "segurança"
    ],
    "progress": 17,
    "progressFraction": {
      "done": 2,
      "total": 12
    },
    "summary": "Sistema de login único com email/senha, social e 2FA TOTP com esqueleto de navegação do painel admin.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Todo o gerenciamento de conteúdo das fases seguintes (i18n, CRUD de Hero/Skills/Currículo, Projects, Blog, Guestbook) depende da existência de uma área administrativa protegida por autenticação segura. Esta fase estabelece a fundação: autenticação robusta (com suporte a credenciais, login social e 2FA TOTP) e a estrutura de navegação do painel administrativo, mantendo as seções com conteúdo placeholder antes da introdução dos formulários de edição reais."
      },
      {
        "heading": "Descrição Funcional",
        "content": "O administrador acessa `/admin` e é recebido por uma interface de login com duas opções: email+senha ou login social (Google/GitHub). O acesso é restrito exclusivamente à conta do dono do portfólio (sem cadastro público). Após a validação do primeiro fator, é exigido um código TOTP de 6 dígitos (2FA via autenticador como Google Authenticator ou 1Password) antes de liberar a sessão. Uma vez autenticado, o administrador tem acesso ao layout do painel com navegação entre as 6 seções principais (Hero, Skills, Currículo, Projetos, Idioma, Guestbook)."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n- Login via email e senha com credenciais configuradas via variáveis de ambiente (sem necessidade de banco de dados para tabela de usuários).\n- Login social via Google e GitHub, com callback de verificação restringindo o acesso exclusivamente ao `ADMIN_EMAIL`.\n- Segundo fator de autenticação (2FA) via TOTP, obrigatório após o primeiro fator.\n- Gerenciamento de sessão segura via JWT.\n- Proteção de rotas sob `/admin` via Middleware do Next.js (redirecionamento automático para `/admin/login` caso não autenticado).\n- Layout base do painel administrativo (sidebar/header de navegação entre as 6 seções: Hero, Skills, Currículo, Projetos, Idioma, Guestbook), utilizando a identidade visual existente (Tailwind CSS, ShadCN UI).\n- Páginas estruturais de placeholder para cada seção com rotas navegáveis.\n\n### Não inclui\n- Formulários de edição e persistência de dados reais (escopo das Fases 3 a 9).\n- Fluxo de recuperação de senha \"Esqueci minha senha\" (usuário único configurado via ambiente).\n- Sistema de cadastro de múltiplos usuários ou controle de permissões por roles."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** frontend (telas de login, desafio 2FA e layout do painel) e backend (rotas de auth, callbacks e validação TOTP).\n- **Biblioteca de Autenticação:** Auth.js (NextAuth v5) com providers `Credentials`, `Google` e `GitHub`.\n- **Validação de Hash e 2FA:** biblioteca de hashing de senhas (`bcryptjs`/`argon2`) e validação de tokens TOTP (`otpauth`/`speakeasy`).\n- **Variáveis de Ambiente:** `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`.\n- **Impacto no site público:** nenhum impacto visual ou funcional nas páginas públicas existentes."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Instalar e configurar Auth.js (NextAuth v5) com os providers de Credenciais, Google e GitHub.\n2. Criar script auxiliar para geração inicial do hash de senha (`ADMIN_PASSWORD_HASH`) e secret TOTP (`ADMIN_TOTP_SECRET`).\n3. Implementar callback `signIn` validando a correspondência estrita com `ADMIN_EMAIL`.\n4. Implementar tela e fluxo de desafio 2FA com validação de token TOTP.\n5. Criar `middleware.ts` para proteção de todas as rotas sob `/admin` (exceto login).\n6. Construir o layout do painel admin com navegação responsiva e suporte a tema dark/light.\n7. Criar as páginas placeholder para as 6 seções: Hero, Skills, Currículo, Projetos, Idioma e Guestbook.\n8. Documentar instruções de setup inicial dos secrets e pareamento do 2FA."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] Login via email/senha funcional com credenciais validadas via variáveis de ambiente\n- [ ] Login via Google e GitHub funcional e restrito exclusivamente ao `ADMIN_EMAIL`\n- [ ] Desafio 2FA TOTP obrigatório e validado com sucesso após o primeiro fator\n- [ ] Middleware bloqueando acessos não autenticados a `/admin/*`\n- [ ] Layout do painel administrativo navegável entre as 6 seções (Hero, Skills, Currículo, Projetos, Idioma, Guestbook)\n- [ ] Nenhuma credencial ou segredo versionado no repositório Git\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Todos os critérios de conclusão atendidos\n- [ ] Testado manualmente o fluxo de autenticação e navegação\n- [ ] Nenhuma regressão identificada no site público\n- [x] **Pasta renomeada para `[cancelled]-auth-painel-admin` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[cancelled]-auth-painel-admin"
  },
  {
    "id": "2fa-basico-opcional",
    "title": "2FA Básico Opcional (TOTP)",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-09-10",
    "priority": "alta",
    "tags": [
      "backend",
      "frontend",
      "segurança"
    ],
    "progress": 92,
    "progressFraction": {
      "done": 12,
      "total": 13
    },
    "summary": "Implementação base de 2FA via TOTP totalmente opcional, sincronizada em 7 dias, com setup por QR Code e toggle simples no painel.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Implementar a camada base de autenticação de dois fatores via TOTP (RFC 6238), sendo **totalmente opcional** — nunca forçado em nenhum login. O usuário ativa quando desejar pelo painel administrativo, mantendo o login funcionando apenas com o primeiro fator (senha ou social) enquanto estiver desativado."
      },
      {
        "heading": "Descrição Funcional",
        "content": "1. **Login Sem 2FA:** Se o 2FA nunca foi ativado (`enabled = false`), o login com senha ou OAuth direciona o usuário imediatamente para o painel (`/admin`), sem qualquer tela de 2FA.\n2. **Setup sob Demanda:** A qualquer momento, um usuário autenticado pode acessar a página de segurança (`/admin/security`) e clicar em \"Ativar 2FA\", abrindo a tela `/admin/setup-2fa`.\n3. **Ativação:** A tela de setup gera um segredo TOTP, exibe o QR Code escaneável e código alfanumérico para digitação manual, exigindo a confirmação do primeiro código de 6 dígitos para marcar `enabled = true`.\n4. **Desafio de Login:** Uma vez ativado, todo login subsequente (qualquer método) exige o código TOTP na tela `/admin/verify-2fa` antes de liberar o acesso.\n5. **Toggle Simples:** Nesta versão básica, o usuário pode desativar o 2FA com um simples toggle no painel logado (a exigência de confirmação de segundo fator para desativação será implementada no Card 3).\n6. **Duração de 7 dias:** A sessão JWT do NextAuth e o cookie de 2FA (`admin_2fa_verified`) possuem validade sincronizada de 7 dias (`604800` segundos)."
      },
      {
        "heading": "Depende de",
        "content": "`[done]-sqlite-persistencia-inicial`, `[done]-login-email-senha`, `[done]-login-social-google-github`. Este é o card 1 de 5 da Subfase 2.4 — os cards 2, 3 e 4 dependem deste."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- Tabela `two_factor_auth` no SQLite (`id`, `secret`, `enabled`, `created_at`, `updated_at`).\n- Utilitários de geração e validação TOTP em `src/lib/totp.ts` utilizando a biblioteca `otpauth`.\n- Geração de imagem do QR Code em Data URL via biblioteca `qrcode`.\n- Cookie de sessão 2FA `admin_2fa_verified` assinado via HMAC-SHA256 (Web Crypto API em `src/lib/totp-token.ts`) com duração de 7 dias.\n- Configuração de `maxAge: 7 * 24 * 60 * 60` na sessão JWT do NextAuth em `src/auth.config.ts`.\n- Tela `/admin/setup-2fa` para geração de secret, exibição do QR Code e confirmação do primeiro código.\n- Tela `/admin/verify-2fa` para desafio de 6 dígitos no login, preservando deep-linking (`admin_redirect`).\n- Middleware condicional em `src/middleware.ts` que só exige 2FA se `enabled = true`.\n- Página de segurança mínima (`/admin/security`) com status do 2FA e botão para ativar/desativar.\n\n### Não inclui (por ora)\n\n- Códigos de backup descartáveis (escopo do Card 2).\n- Confirmação com segundo fator para desativar ou redefinir (escopo do Card 3).\n- Script de emergência via SSH (escopo do Card 4).\n- Layout completo do painel com as 6 seções (escopo do Card 5)."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** backend (NextAuth, rotas de validação TOTP, SQLite), frontend (telas de setup, verificação e página simples de segurança) e middleware (Edge Runtime).\n- **Dependências:** `otpauth` (RFC 6238) e `qrcode` (`@types/qrcode`).\n- **Impactos:** login sem 2FA permanece transparente; sessões ativas são sincronizadas para 7 dias."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Garantir que `otpauth`, `qrcode` e `@types/qrcode` estejam presentes no `package.json`.\n2. Implementar `src/lib/totp.ts` (geração de secret, URI, QR code e validação com tolerância de 30s).\n3. Implementar `src/lib/totp-token.ts` (assinatura/validação HMAC-SHA256 com `AUTH_SECRET` e validade de 7 dias).\n4. Configurar `session.maxAge: 604800` e `jwt.maxAge: 604800` em `src/auth.config.ts` e `src/auth.ts`.\n5. Criar tela de setup `/admin/setup-2fa` e rota de confirmação de primeiro código.\n6. Criar tela de verificação `/admin/verify-2fa` com input de 6 dígitos e auto-focus.\n7. Ajustar `src/middleware.ts` para verificar `admin_2fa_verified` apenas se o 2FA estiver ativo no banco.\n8. Criar rota/página `/admin/security` com toggle simples de ativar/desativar.\n9. **Correção de Logout:** Garantir que o logout (signOut) limpe os cookies de 2FA (`admin_2fa_verified` e `admin_2fa_status`), evitando que um novo login reaproveite a verificação anterior.\n10. **Renomeação de Rota:** Migrar rota `/admin/seguranca` para `/admin/security` conforme solicitação do usuário."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] 2FA opcional: login sem 2FA ativado entra direto no `/admin` sem redirecionamento para telas de 2FA\n- [x] Setup funcional: gera secret, exibe QR code real escaneável e confirma ativação com código de 6 dígitos\n- [x] Login com 2FA ativo exige código TOTP em todos os métodos após logout (Email/Senha, Google, GitHub)\n- [x] Código TOTP incorreto rejeita o acesso\n- [x] Desativar pelo toggle simples desliga o 2FA e o próximo login não pede mais código\n- [x] Sessão principal JWT e cookie `admin_2fa_verified` configurados com duração sincronizada de 7 dias (`maxAge: 604800`)\n- [x] Validado e testado em ambiente local e em produção na VPS\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> Validado e aprovado pelo usuário após execução e testes locais e em produção na VPS.\n\n- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente do ponto de vista do usuário\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-2fa-basico-opcional` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[done]-2fa-basico-opcional"
  },
  {
    "id": "2fa-codigos-backup",
    "title": "Códigos de Backup do 2FA",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-09-10",
    "priority": "alta",
    "tags": [
      "backend",
      "segurança"
    ],
    "progress": 92,
    "progressFraction": {
      "done": 11,
      "total": 12
    },
    "summary": "Geração de 10 códigos de backup de uso único hasheados no SQLite com exibição única no setup e uso alternativo no login.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Implementar um mecanismo de recuperação de acesso caso o dispositivo do usuário com o app autenticador seja perdido ou fique inacessível, fornecendo 10 códigos de backup descartáveis gerados no momento da ativação do 2FA."
      },
      {
        "heading": "Descrição Funcional",
        "content": "1. **Geração no Setup:** Ao confirmar o primeiro código TOTP com sucesso no setup do 2FA (Card 1), o sistema gera 10 códigos de backup aleatórios no formato `XXXX-XXXX`.\n2. **Exibição Única:** Os 10 códigos são exibidos em texto claro uma única vez em tela dedicada (`/admin/setup-2fa/backup-codes`), com aviso destacado, botão de cópia de todos os códigos e uma trava por checkbox obrigatório (\"Já salvei meus códigos de backup com segurança\") antes de prosseguir.\n3. **Uso no Login:** Na tela de verificação `/admin/verify-2fa`, é exibida a opção alternativa \"Usar código de backup\". O usuário digita um dos códigos em vez do TOTP de 6 dígitos.\n4. **Descarte Imediato:** Ao validar o hash com sucesso, o código é marcado como usado (`used = 1`) no banco de dados e nunca mais pode ser reutilizado."
      },
      {
        "heading": "Depende de",
        "content": "Card 1 (`[ready-for-review]-2fa-basico-opcional`) deve estar `[done]` antes de iniciar este. Os cards 3 e 4 dependem da estrutura criada aqui."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- Tabela `two_factor_backup_codes` no SQLite (`id`, `user_id`, `code_hash`, `used`, `used_at`, `created_at`).\n- Geração criptograficamente segura de 10 códigos no formato `XXXX-XXXX`.\n- Armazenamento dos códigos sempre em formato hasheado (`bcryptjs`), nunca em texto puro.\n- Tela de exibição dos códigos pós-setup com botão de copiar e checkbox de confirmação.\n- Opção alternativa na tela `/admin/verify-2fa` para validar código de backup e emitir o cookie de sessão `admin_2fa_verified`.\n- Rejeição estrita de códigos já utilizados.\n\n### Não inclui (por ora)\n\n- Regeneração avulsa de códigos de backup fora do fluxo de redefinição completa (melhoria futura).\n- Exigência de código de backup para confirmar desativação ou redefinição de segurança (escopo do Card 3)."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** backend (geração segura, hashing com bcrypt, persistência SQLite), frontend (etapa de exibição no setup e alternância de input na verificação).\n- **Dependências:** `bcryptjs` (já presente no projeto) e módulo nativo `crypto`.\n- **Segurança:** códigos são armazenados exclusivamente como hashes; após uso, a flag `used` é ativada imediatamente."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Criar a tabela `two_factor_backup_codes` em `src/lib/db.ts`.\n2. Implementar em `src/lib/totp.ts` funções para gerar 10 códigos `XXXX-XXXX`, hashear e persistir no SQLite.\n3. Criar função de validação de código de backup que compara o hash, valida se `used === 0` e atualiza para `used = 1` com timestamp.\n4. Adicionar etapa no fluxo de setup (`/admin/setup-2fa`) para exibir os 10 códigos em texto claro com botão de cópia e trava por checkbox.\n5. Adicionar alternância na tela `/admin/verify-2fa` para alternar entre código TOTP e código de backup.\n6. Validar a rejeição de códigos já consumidos."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] 10 códigos de backup no formato `XXXX-XXXX` são gerados na ativação do 2FA\n- [x] Códigos são armazenados hasheados no SQLite (nunca em texto puro)\n- [x] Códigos são exibidos em texto claro exatamente uma vez, com botão de copiar e trava de confirmação antes de prosseguir\n- [x] Opção \"Usar código de backup\" na tela de verificação permite login bem-sucedido\n- [x] Código de backup usado é marcado como consumido e rejeitado em tentativas posteriores\n- [x] Validado e testado em ambiente local e em produção na VPS\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> Validado e aprovado pelo usuário com geração de 10 códigos de backup, exibição com trava, login com consumo de código de backup e rejeição de reuso.\n\n- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente do ponto de vista do usuário\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-2fa-codigos-backup` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[done]-2fa-codigos-backup"
  },
  {
    "id": "2fa-confirmacao-seguranca",
    "title": "Confirmação de Segurança para Desativar e Redefinir 2FA",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-09-09",
    "priority": "alta",
    "tags": [
      "backend",
      "frontend",
      "segurança"
    ],
    "progress": 92,
    "progressFraction": {
      "done": 11,
      "total": 12
    },
    "summary": "Exigência de confirmação via TOTP ou código de backup para desativar ou redefinir 2FA, fechando a brecha do toggle simples.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Eliminar a vulnerabilidade do toggle simples (onde qualquer pessoa com a sessão HTTP ativa poderia desativar a segurança), passando a exigir obrigatoriamente a comprovação de posse do segundo fator (TOTP atual ou código de backup) antes de permitir que o 2FA seja desativado ou redefinido."
      },
      {
        "heading": "Descrição Funcional",
        "content": "1. **Ações Sensíveis Bloqueadas:** Na página `/admin/security`, os botões \"Desativar 2FA\" e \"Redefinir 2FA\" deixam de executar a ação imediatamente e passam a abrir um modal de confirmação de segurança.\n2. **Métodos de Confirmação:** O usuário pode confirmar fornecendo:\n   - O código TOTP atual de 6 dígitos.\n   - Um código de backup válido e não utilizado.\n3. **Opção de E-mail (Mockada com Aviso):** O modal exibe também a opção \"Confirmar por e-mail\", mas não envia e-mails reais nesta fase — exibe um aviso claro de que a funcionalidade está em integração futura, com comentário `// TODO:` para integração futura via Resend.\n4. **Lógica de Desativação:** Após confirmação válida, marca `enabled = false`, desativa os códigos de backup e limpa o cookie `admin_2fa_verified`.\n5. **Lógica de Redefinição:** Descarta o secret atual e invalida todos os códigos de backup antigos, encaminhando imediatamente para novo setup com geração de novos códigos."
      },
      {
        "heading": "Depende de",
        "content": "Cards 1 (`[done]-2fa-basico-opcional`) e 2 (`[done]-2fa-codigos-backup`) estão concluídos ✅."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- Rota/Server Action dedicada `src/app/api/admin/2fa/confirm-sensitive-action/route.ts` que valida a prova de segundo fator antes de autorizar a ação.\n- Modal de confirmação na página `/admin/security` acionado pelos botões \"Desativar 2FA\" e \"Redefinir 2FA\".\n- Suporte a validação por código TOTP de 6 dígitos ou código de backup `XXXX-XXXX`.\n- Opção visual de confirmação por e-mail com aviso de pendência futura.\n- Descarte e invalidação atômica de credenciais antigas ao redefinir.\n\n### Não inclui (por ora)\n\n- Envio real de mensagens por e-mail via Resend (interface presente com aviso transparente de pendência)."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** backend (rota de validação e desativação/redefinição no SQLite), frontend (modal de confirmação responsivo com tratamento de erros).\n- **Segurança:** nenhuma ação de desativação ou redefinição é executada sem a validação do token do segundo fator."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Criar rota `src/app/api/admin/2fa/confirm-sensitive-action/route.ts` aceitando `{ action, code, type }`.\n2. Implementar verificação se o código é TOTP ou backup code não usado.\n3. Decisão de consumo: códigos de backup usados em confirmações sensíveis são marcados como consumidos para evitar reuso.\n4. Implementar modal no componente de segurança em `/admin/security`.\n5. Implementar botão \"Confirmar por e-mail\" com mensagem clara e comentário `// TODO: Resend integration`.\n6. Conectar a confirmação bem-sucedida à desativação (`enabled = 0`) ou redefinição (novo setup)."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Tentativa de desativar ou redefinir 2FA sem fornecer código de confirmação é estritamente rejeitada\n- [x] Desativação de 2FA funciona com código TOTP atual válido\n- [x] Desativação de 2FA funciona com código de backup válido\n- [x] Redefinição invalida segredo e códigos de backup anteriores, encaminhando para novo setup\n- [x] Opção de confirmação por e-mail exibe mensagem de pendência sem simular envio\n- [x] Validado e testado em ambiente local e em produção na VPS\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> Validado e aprovado em produção na VPS pelo usuário em 10/09/2026. Todas as ações sensíveis exigem segundo fator antes de serem executadas.\n\n- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente do ponto de vista do usuário\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-2fa-confirmacao-seguranca` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[done]-2fa-confirmacao-seguranca"
  },
  {
    "id": "2fa-script-emergencia",
    "title": "Script de Emergência via SSH para 2FA",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-09-09",
    "priority": "média",
    "tags": [
      "infra",
      "segurança",
      "dx"
    ],
    "progress": 92,
    "progressFraction": {
      "done": 11,
      "total": 12
    },
    "summary": "Script de linha de comando para desativar o 2FA diretamente no SQLite via SSH em caso de perda total de acessos.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Prover um mecanismo operacional de última instância para que o administrador do portfólio consiga desativar o 2FA caso perca simultaneamente o dispositivo autenticador e todos os códigos de backup, operando diretamente no servidor via SSH sem depender de interface web ou rotas HTTP."
      },
      {
        "heading": "Descrição Funcional",
        "content": "1. **Acesso Direto ao Servidor:** O administrador conecta-se à VPS via SSH e executa o script `npx tsx scripts/emergency-disable-2fa.ts`.\n2. **Desativação no Banco:** O script lê o caminho do banco a partir de `process.env.DATABASE_PATH` e executa a desativação da flag `enabled` na tabela `two_factor_auth`.\n3. **Invalidação dos Códigos:** Todos os códigos de backup associados são marcados como usados ou deletados para impedir acessos residuais.\n4. **Feedback Claro:** O terminal imprime uma mensagem explicativa com o resultado da operação. Se o 2FA já estiver inativo, avisa sem emitir erro confuso.\n5. **Isolamento de Segurança:** O script nunca é exposto via web ou API HTTP — a chave de acesso SSH do servidor é o único controle de autorização."
      },
      {
        "heading": "Depende de",
        "content": "Cards 1 (`[done]-2fa-basico-opcional`), 2 (`[done]-2fa-codigos-backup`) e 3 (`[done]-2fa-confirmacao-seguranca`) estão concluídos ✅."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- Script `scripts/emergency-disable-2fa.ts` executável via `npx tsx` ou `node`.\n- Conexão direta ao SQLite respeitando `process.env.DATABASE_PATH`.\n- Desativação do 2FA (`enabled = 0`) e invalidação de todos os códigos de backup.\n- Comentário explícito no topo do arquivo alertando que o script é estritamente para uso via SSH e jamais deve ser exposto via HTTP.\n- Menção no `README.md` da raiz do repositório na seção de scripts operacionais.\n\n### Não inclui (por ora)\n\n- Nenhuma rota de API, formulário web ou interface HTTP."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** infra / scripts (Node.js/TypeScript com `better-sqlite3`).\n- **Segurança:** restrito ao canal seguro SSH do host VPS; nenhuma dependência de autenticação web."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Criar o arquivo `scripts/emergency-disable-2fa.ts`.\n2. Implementar conexão com o SQLite usando `process.env.DATABASE_PATH` com fallback para `./data/portfolio.db`.\n3. Adicionar lógica de verificação se o 2FA está ativo: se já inativo, emitir mensagem clara e sair com código 0.\n4. Se ativo, atualizar `enabled = 0`, invalidar/limpar `two_factor_backup_codes` e imprimir confirmação destacada.\n5. Incluir aviso de segurança no topo do arquivo proibindo exposição HTTP.\n6. Adicionar instrução de uso no `README.md` da raiz do projeto."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Script conecta ao SQLite via `DATABASE_PATH` e desativa `enabled` do 2FA com sucesso\n- [x] Todos os códigos de backup existentes são invalidados\n- [x] Execução com 2FA já inativo informa o estado sem falhas\n- [x] Após a execução, login volta a funcionar apenas com primeiro fator (sem pedir 2FA)\n- [x] Comentários no topo do script reforçam proibição estrita de exposição HTTP\n- [x] Validado e testado localmente com SQLite e documentado para uso em produção\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> Validado com sucesso nos 3 cenários operacionais e aprovado pelo usuário em 10/09/2026.\n\n- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente do ponto de vista operacional\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-2fa-script-emergencia` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[done]-2fa-script-emergencia"
  },
  {
    "id": "admin-layout-painel",
    "title": "Layout Base do Painel e 6 Seções Placeholder",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-09-09",
    "priority": "alta",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 91,
    "progressFraction": {
      "done": 10,
      "total": 11
    },
    "summary": "Casca de navegação do painel administrativo com sidebar responsiva, header, entrada para segurança e 6 seções placeholder.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Entregar a estrutura base de navegação e o layout responsivo do painel administrativo, acomodando as 6 seções previstas no roadmap do projeto (Hero, Skills, Currículo, Projetos, Idioma, Guestbook) e a área de Segurança, cada uma com sua rota e página placeholder."
      },
      {
        "heading": "Descrição Funcional",
        "content": "1. **Layout Compartilhado:** Um layout consistente (`src/app/admin/(dashboard)/layout.tsx`) com sidebar lateral no desktop e menu expansível no mobile, utilizando a mesma identidade visual cósmica e dark glassmorphic do site público.\n2. **Navegação Funcional:** Menu lateral permitindo transitar entre todas as seções e a visão geral, com destaque visual nítido para a rota ativa.\n3. **Header com Contexto:** Barra superior exibindo breadcrumbs da rota atual, e-mail do usuário autenticado, link externo para visualizar o site público e botão de logout funcional.\n4. **Indicador de Segurança:** Área na sidebar ou header informando o estado da segurança (\"2FA Ativo\" ou \"2FA Inativo\"), lendo o estado real ou operando com fallback enquanto os cards 1-4 são finalizados.\n5. **Dashboard Principal (`/admin`):** Grid de cards visuais clicáveis direcionando para as 6 seções e para a página de Segurança.\n6. **Páginas Placeholder:** Cada seção como rota autônoma exibindo um visual moderno com indicação explícita de qual fase futura do roadmap implementará sua edição real:\n   - `/admin/hero` — Hero & Bio (Fase 4)\n   - `/admin/skills` — Skills & Habilidades (Fase 5)\n   - `/admin/curriculo` — Experiência & Currículo (Fase 6)\n   - `/admin/projetos` — Projetos & Portfólio (Fase 7)\n   - `/admin/idioma` — Idioma & Traduções (Fase 3)\n   - `/admin/guestbook` — Guestbook & Mensagens (Fase 8)\n   - `/admin/security` — Segurança & 2FA (Cards 1 a 4)"
      },
      {
        "heading": "Depende de",
        "content": "Cards 1 a 4 do 2FA concluídos (`[done]-2fa-basico-opcional`, `[done]-2fa-codigos-backup`, `[done]-2fa-confirmacao-seguranca`, `[done]-2fa-script-emergencia`) e autenticação básica (`[done]-login-email-senha`) ✅."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- Grupo de rotas `src/app/admin/(dashboard)/layout.tsx` para compartilhar o layout sem interferir nas telas de login (`/admin/login`) ou verificação (`/admin/verify-2fa`).\n- Sidebar responsiva com navegação para as 6 seções, dashboard e segurança.\n- Header com breadcrumbs, email do usuário, atalho \"Ver site\" e ação de logout.\n- Dashboard inicial com cards visuais de acesso rápido.\n- 6 páginas placeholder com design refinado, skeletons ilustrativos e avisos informativos das fases futuras.\n\n### Não inclui (por ora)\n\n- Nenhuma funcionalidade de edição real de dados, formulários CRUD ou persistência de conteúdo (escopo das Fases 3 a 8)."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** frontend (Next.js App Router, Route Groups, Tailwind CSS, Lucide Icons, componentes ShadCN).\n- **Consistência:** paleta escura cósmica (`#030014`, tons de roxo/índigo, bordas suaves, tipografia com Inter).\n- **Dependências utilizadas:** `lucide-react`, `next/navigation`, `react-dom` (`createPortal`), `next/headers`."
      },
      {
        "heading": "Rastreabilidade de Tentativas e Ajustes Técnicos",
        "content": "### Tentativa 1 (refutada) — Drawer mobile contido nos limites do header com `backdrop-filter`\n- **O que foi feito:** O componente [`MobileSidebar.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/MobileSidebar.tsx) foi inicialmente implementado inserindo o drawer e overlay `fixed inset-0 z-50` diretamente no JSX do elemento `<header>` do layout administrativo.\n- **Resultado real:** O `<header>` possui a classe Tailwind `backdrop-blur-md` (`backdrop-filter: blur(12px)`). Pela especificação CSS, qualquer elemento que utilize propriedades de filtro como `filter` ou `backdrop-filter` cria um novo *containing block* para todos os seus elementos descendentes, inclusive aqueles com `position: fixed`. Com isso, a gaveta lateral ficava restrita aos 64px de altura da barra do header, ocultando a lista de rotas de navegação.\n- **Correção aplicada:** Refatorado [`MobileSidebar.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/MobileSidebar.tsx) para renderizar a gaveta através de `createPortal(drawerContent, document.body)`. O drawer agora é injetado diretamente no final do `<body>`, garantindo preenchimento de 100% da viewport e escape de quaisquer filtros ou restrições de overflow do header.\n\n```tsx\n// Trecho comprovando a correção em src/app/admin/(dashboard)/components/MobileSidebar.tsx\nimport React, { useState, useEffect } from 'react'\nimport { createPortal } from 'react-dom'\n\nexport function MobileSidebar({ twoFactorActive, userEmail }: MobileSidebarProps) {\n  const [isOpen, setIsOpen] = useState(false)\n  const [mounted, setMounted] = useState(false)\n\n  useEffect(() => {\n    setMounted(true)\n  }, [])\n\n  return (\n    <>\n      <button\n        type=\"button\"\n        onClick={() => setIsOpen(true)}\n        className=\"lg:hidden p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-purple-600/15 border border-transparent hover:border-purple-500/20 transition-colors cursor-pointer\"\n        aria-label=\"Abrir menu de navegação\"\n      >\n        <Menu className=\"w-5 h-5\" />\n      </button>\n\n      {isOpen && mounted && createPortal(drawerContent, document.body)}\n    </>\n  )\n}\n```\n\n### Tentativa 2 (refutada / anomalia visual) — Sobreposição da Navbar e Footer públicos nas rotas `/admin/*`\n- **O que foi feito:** O layout raiz do projeto (`src/app/layout.tsx`) renderizava `<Navbar />` e `<Footer />` incondicionalmente para toda a aplicação.\n- **Resultado real:** A `Navbar` pública possui posicionamento fixo (`fixed top-0 left-0 w-full z-50`). Ao navegar em qualquer rota administrativa (`/admin`, `/admin/hero`, `/admin/login`), o menu público sobrepunha diretamente o header administrativo. Da mesma forma, o `Footer` público adicionava o rodapé do portfólio no final das páginas de administração.\n- **Correção aplicada:** Adicionado o hook `usePathname()` em [`src/components/main/Navbar.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Navbar.tsx) e [`src/components/main/Footer.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Footer.tsx), interrompendo a renderização caso a rota pertença ao painel administrativo:\n\n```tsx\n// src/components/main/Navbar.tsx e src/components/main/Footer.tsx\nconst pathname = usePathname()\nif (pathname?.startsWith('/admin')) {\n  return null\n}\n```\n\n### Tentativa 3 (Ajuste visual) — Borda cinza na lateral direita e largura restrita em monitores 1080p+\n- **O que foi feito:** Na primeira versão do dashboard e dos placeholders de seção, foram utilizadas classes Tailwind de largura máxima fixa (`max-w-7xl` em [`page.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/page.tsx) e `max-w-5xl` em [`SectionPlaceholder.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/SectionPlaceholder.tsx)), sem customização global de calha de barra de rolagem e sem `color-scheme: dark` forçado na tag raiz `<html>`.\n- **Resultado real:** Em resoluções widescreen (ex.: 1920x1080 / Full HD), o conteúdo centralizava deixando um espaço vazio à direita em vez de ocupar 100% da área útil disponível. Simultaneamente, o navegador Chromium no Windows renderizava a calha da barra de rolagem vertical do sistema operacional com fundo cinza claro (`#f1f1f1` com 17px de espessura), criando a ilusão visual de uma borda vertical cinza indesejada cortando toda a lateral direita da aplicação cósmica.\n- **Correção aplicada:**\n  1. Em [`src/app/globals.css`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/globals.css): Definido `html { color-scheme: dark; }` e adicionada estilização global da barra de rolagem cósmica (`::-webkit-scrollbar` com largura de 8px, track na cor `#030014` idêntica ao fundo, e thumb roxo translúcido com `scrollbar-color` para navegadores modernos).\n  2. Em [`src/app/layout.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/layout.tsx): Definido `className=\"dark\" style={{ colorScheme: 'dark' }}` na tag `<html>` e `bg-[#030014] text-white min-h-screen` no `<body>`.\n  3. Em [`src/app/admin/(dashboard)/layout.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/layout.tsx): Adicionado `w-full min-w-0` no contêiner principal e no elemento `<main>`.\n  4. Em [`src/app/admin/(dashboard)/page.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/page.tsx): Substituído `max-w-7xl` por `w-full` no contêiner raiz, no banner de boas-vindas e no grid de cards.\n  5. Em [`src/app/admin/(dashboard)/components/SectionPlaceholder.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/SectionPlaceholder.tsx): Substituído `max-w-5xl` por `w-full`.\n\n```css\n/* Trecho comprovando a remoção da borda cinza em src/app/globals.css */\nhtml {\n  color-scheme: dark;\n}\n\n::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n\n::-webkit-scrollbar-track {\n  background: #030014;\n}\n\n::-webkit-scrollbar-thumb {\n  background: rgba(168, 85, 247, 0.25);\n  border-radius: 9999px;\n  border: 2px solid #030014;\n}\n```\n\n---"
      },
      {
        "heading": "Implementação Realizada",
        "content": "### 1. Route Group `(dashboard)` e Layout Compartilhado\nCriado em [`src/app/admin/(dashboard)/layout.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/layout.tsx), contendo a sidebar fixa para desktop, o header com breadcrumbs e logout Server Action com limpeza de cookies:\n\n```tsx\n// Trecho comprovando o logout seguro e limpeza de cookies em src/app/admin/(dashboard)/layout.tsx\nasync function handleLogout() {\n  'use server'\n  const { cookies } = await import('next/headers')\n  const cookieStore = await cookies()\n  cookieStore.delete('admin_2fa_verified')\n  cookieStore.delete('admin_2fa_status')\n  await signOut({ redirectTo: '/admin/login' })\n}\n```\n\n### 2. Destaque Dinâmico de Rota Ativa\nImplementado em [`src/app/admin/(dashboard)/components/SidebarNav.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/SidebarNav.tsx) via `usePathname()` com indicador luminoso de gradiente:\n\n```tsx\n// Trecho comprovando detecção ativa em SidebarNav.tsx\nconst pathname = usePathname()\nconst isActive = item.exact\n  ? pathname === item.href\n  : pathname.startsWith(item.href)\n```\n\n### 3. Migração do Dashboard e Cards 100% Clicáveis\nMigrado para [`src/app/admin/(dashboard)/page.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/page.tsx), tornando todos os 7 cards do grid links interativos para suas respectivas seções:\n- `/admin/security` (Segurança & 2FA)\n- `/admin/hero` (Hero & Bio — Fase 4)\n- `/admin/skills` (Skills & Habilidades — Fase 5)\n- `/admin/curriculo` (Experiência & Currículo — Fase 6)\n- `/admin/projetos` (Projetos & Portfólio — Fase 7)\n- `/admin/idioma` (Idioma & Traduções — Fase 3)\n- `/admin/guestbook` (Guestbook & Mensagens — Fase 8)\n\nO arquivo antigo `src/app/admin/page.tsx` foi removido para evitar conflitos de rotas no Next.js App Router.\n\n### 4. Criação das 6 Páginas Placeholder\nPadronizadas através do componente reutilizável [`src/app/admin/(dashboard)/components/SectionPlaceholder.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/(dashboard)/components/SectionPlaceholder.tsx), exibindo tag de fase, ícone de construção com pulso sutil, descrição dos entregáveis planejados e atalho de retorno ao dashboard.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Layout compartilhado com sidebar responsiva no desktop e menu expansível no mobile\n- [x] Navegação funcional entre as 6 seções, painel geral e segurança com destaque na rota ativa\n- [x] Header exibindo breadcrumbs corretos, e-mail logado, link para o site público e botão de logout\n- [x] Todas as 6 páginas de seções exibem aviso visual de placeholder e a fase correta do roadmap\n- [x] Validado e testado em ambiente local e em produção na VPS\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> Registrado e validado em 11/09/2026 pelo usuário em produção.\n\n- **Compilação de Produção (`npm run build`):** 27 páginas estáticas e dinâmicas geradas com sucesso, com 0 erros TypeScript.\n- **Navegação e Breadcrumbs:** Validados nos viewports Desktop (1280x800) e Mobile (375x700) via Chrome DevTools MCP.\n- **Gaveta Mobile:** Abertura, fechamento ao clicar em links e desvinculação de contêiner testados com `createPortal`.\n- **Logout Seguro:** Validação de revogação de sessão e exclusão dos cookies de 2FA.\n- **Ajuste Widescreen & Scrollbar:** Largura 100% sem borda cinza na VPS validada pelo usuário no commit `508f6e0`.\n- **Deploy:** Commits `9de95db` e `508f6e0` publicados na branch `main`.\n\n- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente do ponto de vista do usuário\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-admin-layout-painel` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[done]-admin-layout-painel"
  },
  {
    "id": "demonstracao-integrada-sete-papeis",
    "title": "Demonstração integrada dos sete papéis",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-10-27",
    "priority": "baixa",
    "tags": [
      "infra",
      "dx",
      "docs"
    ],
    "progress": 93,
    "progressFraction": {
      "done": 13,
      "total": 14
    },
    "summary": "Demonstrar de ponta a ponta o fluxo humano e técnico dos sete papéis do workspace Maestri em um cenário mínimo e seguro.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Comprovar, antes da validação humana final do workspace, que os sete papéis do Maestri participam de um fluxo único governado pelo Kanban: planejamento, aprovação humana, delegação, implementação mínima, revisão visual, QA com navegador e consolidação documental."
      },
      {
        "heading": "Descrição Funcional",
        "content": "A demonstração acrescenta ao Hero da página inicial um pequeno marcador visual de ambiente de demonstração, com texto curto e acessível, sem backend, persistência ou nova infraestrutura. O Planejador especifica a alteração; o humano aprova o card; um Programador implementa com propriedade exclusiva e o outro faz revisão técnica somente leitura; Íris revisa a apresentação com screenshots; Lúmen verifica o comportamento em navegador real; o Git Manager faz somente revisão de status/diff; e o Orquestrador consolida as evidências no Kanban e no diário.\n\nO marcador proposto deve exibir **“Demonstração multiagente”** como badge estático, discreto, responsivo e removível, próximo à apresentação principal do Hero, reutilizando os estilos existentes. O humano definiu esse texto e localização ao autorizar o envio para review em 2026-10-28. A remoção ocorrerá apenas mediante solicitação posterior. Nenhum agente pode iniciar implementação enquanto o card não estiver aprovado e o humano não autorizar expressamente o início."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n- Planejamento somente leitura pelo papel Planejador Web.\n- Uma alteração visual mínima e reversível no Hero da página inicial, limitada a `src/components/main/Hero.tsx`; `src/app/page.tsx` é alternativa somente se surgir necessidade real de posicionamento entre seções e houver nova delimitação de escopo.\n- Implementação por um Programador com propriedade exclusiva e revisão técnica somente leitura pelo segundo, evitando uma divisão artificial de escrita.\n- Revisão visual por Íris com screenshot local.\n- Verificação por Lúmen em navegador local via Playwright MCP.\n- Revisão somente leitura do status e diff pelo papel Git Manager Web.\n- Registro append-only no LOG deste card, atualização do Panorama e sincronização do roadmap.\n\n### Não inclui (por ora)\n- Backend, banco, autenticação, i18n, APIs, dependências novas ou alteração de infraestrutura.\n- Mudança nos cards ou códigos atualmente em andamento fora dos arquivos explicitamente atribuídos.\n- Reexecução dos 25 testes documentais ou dos testes de paralelismo OpenCode já aprovados.\n- Commit, push, merge, landing, exclusão de floor/branch ou marcação automática de done/Validação."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- Camadas envolvidas: frontend estático e documentação do fluxo.\n- Dependências ou integrações necessárias: Maestri, OpenCode nos papéis de implementação/design/QA, Playwright MCP já validado e servidor local do portfólio.\n- Impactos em outras partes do sistema: nenhum contrato de API ou persistência; a alteração deve respeitar tema, responsividade, acessibilidade e i18n existente ou ser neutra a idioma.\n- Segurança: somente ambiente local; nenhuma navegação externa; nenhuma credencial; operações Git somente leitura.\n- Governança: cada agente deve conferir este card e sua aprovação antes de executar; o Orquestrador é o único proprietário de README/LOG e `docs/DIARIO.md` no checkout canônico."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Planejador produz um plano curto, aponta os arquivos candidatos e separa responsabilidades sem editar arquivos.\n2. Humano revisa este draft, autoriza `ready-for-review`, aprova o card e autoriza o início da implementação em mensagens explícitas.\n3. Orquestrador registra a decisão, inicia ou reutiliza o servidor local autorizado e delega `src/components/main/Hero.tsx` com propriedade exclusiva ao Programador 1; nenhum executor altera Kanban ou diário.\n4. Programador 1 implementa somente no Hero; Programador 2 revisa o diff em modo somente leitura quanto a escopo, semântica, acessibilidade e responsividade. Ambos retornam resultados reais pelo Maestri.\n5. Íris captura ou analisa screenshots locais em viewport desktop e móvel, verificando legibilidade, contraste, ausência de corte/sobreposição e coerência visual; não altera arquivos sem delegação explícita posterior.\n6. Lúmen executa smoke test local via Playwright MCP, incluindo carregamento da Home, marcador único e visível, texto aprovado, responsividade e ausência de erro crítico novo atribuível ao marcador.\n7. Git Manager revisa status, diff e `git diff --check` somente leitura; confirma que apenas arquivos autorizados mudaram e que não houve staging, commit, dependências ou mudanças externas.\n8. Orquestrador consolida LOG e diário, sincroniza roadmap e apresenta o resultado mantendo o card in-progress para validação humana."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Plano real do Planejador recebido e registrado antes da implementação.\n- [x] Aprovação humana e autorização de início registradas antes de qualquer código.\n- [x] Implementação mínima concluída pelo Programador 1 em `src/components/main/Hero.tsx`, seguida de revisão somente leitura pelo Programador 2, sem tocar arquivos fora do escopo.\n- [x] Revisão visual de Íris registrada com screenshots locais desktop/móvel e resultado real sobre legibilidade, contraste, corte/sobreposição e coerência.\n- [x] Smoke test de Lúmen via Playwright MCP registrado com resultado real e sem erro crítico novo atribuível ao marcador.\n- [x] Revisão somente leitura do Git Manager registrada, sem commit ou mutação Git.\n- [x] LOG, Panorama e roadmap refletem a demonstração sem repetir testes já aprovados.\n- [x] Card permanece in-progress para validação humana final.\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> Validação humana registrada em 2026-10-28 pela mensagem: “esta aprovado”. Em seguida, o humano autorizou especificamente encerrar, arquivar e desfazer a alteração demonstrativa pela mensagem: “como é uma desmontração pode marcar como done, arquivar e desfazer, agora vamos pros trabalhos reais”. Operações Git continuam fora desta autorização.\n\n- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente do ponto de vista do usuário\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-demonstracao-integrada-sete-papeis` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[done]-demonstracao-integrada-sete-papeis"
  },
  {
    "id": "i18n-fundacao-pt-en",
    "title": "Sistema de Idioma PT/EN — Fundação (i18next)",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-09-11",
    "priority": "alta",
    "tags": [
      "frontend",
      "i18n",
      "ux"
    ],
    "progress": 93,
    "progressFraction": {
      "done": 13,
      "total": 14
    },
    "summary": "Instalação e configuração da fundação de internacionalização com i18next, arquivos de tradução PT/EN completos e conexão do LanguageToggle existente, seguindo a arquitetura validada no projeto Thiago Bahls.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Ativar o sistema de tradução PT/EN da landing page pública, substituindo todos os textos hardcoded nos componentes por chamadas ao hook `useTranslation()` do i18next. O `LanguageToggle` da navbar, que hoje é decorativo (alterna estado local sem efeito), passa a trocar o idioma real da aplicação e persistir a preferência no `localStorage`."
      },
      {
        "heading": "Depende de",
        "content": "Nenhuma dependência técnica de cards anteriores. Fase 2 concluída ✅."
      },
      {
        "heading": "Referência de Arquitetura",
        "content": "`dev/utils/reference/SISTEMA_TRADUCAO.md` — arquitetura validada no projeto Thiago Bahls.\nA implementação deve ser **idêntica** ao padrão descrito nesse documento nos pontos que estão no escopo desta fase."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- Instalação de `i18next`, `react-i18next` e `i18next-browser-languagedetector`\n- Criação de `src/i18n/config.ts` com:\n  - `defaultResources` embutidos (sem chamada de rede)\n  - Detecção síncrona de idioma: `localStorage('i18nextLng')` → `navigator.language` → fallback `'pt'`\n  - Comentário `// TODO Fase 3.2` para o endpoint dinâmico `/api/translations?language={lng}`\n- Criação de `src/i18n/locales/pt.json` e `src/i18n/locales/en.json` com todas as chaves aprovadas\n- Criação de `src/i18n/index.ts` (reexporta o `i18n` inicializado)\n- Provider `I18nProvider` ('use client') importado no `src/app/layout.tsx` para inicializar o i18n globalmente\n- Atualização do `LanguageToggle` para chamar `i18n.changeLanguage('pt' | 'en')` e persistir no `localStorage`\n- Migração de todos os textos hardcoded nos componentes da landing page:\n  - `src/components/sub/HeroContent.tsx`\n  - `src/components/main/Navbar.tsx`\n  - `src/components/main/Skills.tsx`\n  - `src/components/main/Timeline.tsx`\n  - `src/components/main/Resume.tsx`\n  - `src/components/main/Footer.tsx`\n  - `src/components/main/ContactUs.tsx`\n\n### Não inclui (por ora — Fase 3.2)\n\n- Endpoint `/api/translations?language={lng}` para chaves gerenciadas pelo painel\n- `i18n.addResourceBundle()` dinâmico pós-init\n- Hook `useTranslatedContent` (só faz sentido quando o conteúdo vier do banco — Fases 4-7)\n- Painel de edição de chaves no `/admin/idioma` (CRUD real)"
      },
      {
        "heading": "Chaves Aprovadas",
        "content": "### `pt.json`\n```json\n{\n  \"hero\": {\n    \"badge\": \"O Desenvolvedor\",\n    \"name\": \"Guilherme Menezes\",\n    \"role\": \"Desenvolvedor Full-Stack\",\n    \"description\": \"Migração de legados, performance e escalabilidade com Vue.js e .NET.\",\n    \"cta_connect\": \"Vamos Conversar ↓\",\n    \"cta_github\": \"GitHub\"\n  },\n  \"nav\": {\n    \"about\": \"Sobre\",\n    \"skills\": \"Skills\",\n    \"experience\": \"Experiência\",\n    \"resume\": \"Currículo\",\n    \"projects\": \"Projetos\",\n    \"blog\": \"Blog\",\n    \"contact\": \"Contato\"\n  },\n  \"skills\": {\n    \"heading\": \"Especialidade Técnica\",\n    \"subheading\": \"Uma seleção refinada das minhas habilidades em ferramentas e tecnologias modernas de desenvolvimento\",\n    \"footer\": \"Constantemente refinando e expandindo meu conjunto de habilidades técnicas\"\n  },\n  \"experience\": {\n    \"heading\": \"Experiência Profissional & Projetos\",\n    \"subheading\": \"Destaques da minha carreira e projetos relevantes que demonstram minhas habilidades e impacto.\",\n    \"jobs\": [\n      {\n        \"title\": \"Desenvolvedor Full-Stack\",\n        \"company\": \"SCHOTT\",\n        \"location\": \"Diadema – São Paulo – Brasil\",\n        \"date\": \"Jan 2024 – Mar 2025\",\n        \"description\": \"Migração Vue 2 → 3, redesign de dashboard e plataforma de monitoramento industrial com Vue 3 e ASP.NET.\",\n        \"achievements\": [\n          \"Liderou migração e redesign de dashboard (+40% performance).\",\n          \"Desenvolveu plataforma com sensores, temas dark/light e KPIs em tempo real.\",\n          \"Evoluiu filtros dinâmicos e painéis com dados atualizados.\",\n          \"Stack: Vue.js 2/3, TypeScript, ASP.NET, Entity Framework, MySQL, Docker, Azure DevOps.\"\n        ]\n      },\n      {\n        \"title\": \"Desenvolvedor\",\n        \"company\": \"Avanth\",\n        \"location\": \"Brasil\",\n        \"date\": \"Fev 2023 – Out 2023\",\n        \"description\": \"Dashboard para fintech com Vue.js 2 e .NET 7, APIs RESTful com JWT e RBAC.\",\n        \"achievements\": [\n          \"Redução de 40% no tempo de processamento de operações financeiras.\",\n          \"APIs .NET 7 com autenticação JWT e controle de acesso RBAC.\",\n          \"Stack: Vue.js 2, Vuex, JavaScript, .NET 7, SQL Server, Swagger.\"\n        ]\n      },\n      {\n        \"title\": \"Desenvolvedor\",\n        \"company\": \"CREN\",\n        \"location\": \"Brasil\",\n        \"date\": \"Jan 2022 – Dez 2022\",\n        \"description\": \"Prontuário eletrônico em WinForms com foco em usabilidade e conformidade LGPD.\",\n        \"achievements\": [\n          \"+40% de agilidade e -70% em erros de digitação.\",\n          \"Stack: C#, WinForms, MySQL, Dapper, DevExpress.\"\n        ]\n      }\n    ]\n  },\n  \"resume\": {\n    \"heading\": \"Meu Currículo\",\n    \"subheading\": \"Veja minhas qualificações profissionais e experiência em desenvolvimento full-stack.\",\n    \"download\": \"Baixar Currículo\",\n    \"error\": \"Falha ao carregar o PDF\"\n  },\n  \"footer\": {\n    \"description\": \"Criando aplicações web escaláveis, ferramentas open-source e experiências digitais inovadoras.\",\n    \"quick_links\": \"Links Rápidos\",\n    \"connect\": \"Conecte-se\",\n    \"built_by\": \"Feito com ❤️ por Guilherme Menezes.\",\n    \"visitors\": \"Visitantes\"\n  },\n  \"contact\": {\n    \"heading\": \"Fale comigo\",\n    \"subheading\": \"Tem um projeto ou dúvida? Me chame e vamos transformar suas ideias em realidade.\",\n    \"field_name\": \"Nome\",\n    \"field_email\": \"E-mail\",\n    \"field_subject\": \"Assunto\",\n    \"field_message\": \"Digite sua mensagem...\",\n    \"submit\": \"Enviar Mensagem\",\n    \"sending\": \"Enviando...\",\n    \"success\": \"Mensagem enviada com sucesso!\",\n    \"error\": \"Falha ao enviar mensagem. Tente novamente.\",\n    \"error_generic\": \"Ocorreu um erro. Tente novamente mais tarde.\",\n    \"copied\": \"copiado!\"\n  }\n}\n```\n\n### `en.json`\n```json\n{\n  \"hero\": {\n    \"badge\": \"The Developer\",\n    \"name\": \"Guilherme Menezes\",\n    \"role\": \"Full-Stack Developer\",\n    \"description\": \"Legacy migration, performance and scalability with Vue.js and .NET.\",\n    \"cta_connect\": \"Let's Connect ↓\",\n    \"cta_github\": \"GitHub\"\n  },\n  \"nav\": {\n    \"about\": \"About\",\n    \"skills\": \"Skills\",\n    \"experience\": \"Experience\",\n    \"resume\": \"Resume\",\n    \"projects\": \"Projects\",\n    \"blog\": \"Blog\",\n    \"contact\": \"Contact\"\n  },\n  \"skills\": {\n    \"heading\": \"Technical Expertise\",\n    \"subheading\": \"A refined selection of my proficiency in modern development tools and technologies\",\n    \"footer\": \"Constantly refining and expanding my technical skillset\"\n  },\n  \"experience\": {\n    \"heading\": \"Professional Experience & Projects\",\n    \"subheading\": \"Highlights of my career and key projects showcasing my skills & impact.\",\n    \"jobs\": [\n      {\n        \"title\": \"Full-Stack Developer\",\n        \"company\": \"SCHOTT\",\n        \"location\": \"Diadema – São Paulo – Brazil\",\n        \"date\": \"Jan 2024 – Mar 2025\",\n        \"description\": \"Vue 2 → 3 migration, dashboard redesign and industrial monitoring platform with Vue 3 and ASP.NET.\",\n        \"achievements\": [\n          \"Led migration and dashboard redesign (+40% performance).\",\n          \"Built platform with sensors, dark/light themes and real-time KPIs.\",\n          \"Enhanced dynamic filters and panels with live data.\",\n          \"Stack: Vue.js 2/3, TypeScript, ASP.NET, Entity Framework, MySQL, Docker, Azure DevOps.\"\n        ]\n      },\n      {\n        \"title\": \"Developer\",\n        \"company\": \"Avanth\",\n        \"location\": \"Brazil\",\n        \"date\": \"Feb 2023 – Oct 2023\",\n        \"description\": \"Fintech dashboard with Vue.js 2 and .NET 7, RESTful APIs with JWT and RBAC.\",\n        \"achievements\": [\n          \"40% reduction in financial transaction processing time.\",\n          \".NET 7 APIs with JWT authentication and RBAC.\",\n          \"Stack: Vue.js 2, Vuex, JavaScript, .NET 7, SQL Server, Swagger.\"\n        ]\n      },\n      {\n        \"title\": \"Developer\",\n        \"company\": \"CREN\",\n        \"location\": \"Brazil\",\n        \"date\": \"Jan 2022 – Dec 2022\",\n        \"description\": \"Electronic health record in WinForms focused on usability and LGPD compliance.\",\n        \"achievements\": [\n          \"+40% agility and -70% in typing errors.\",\n          \"Stack: C#, WinForms, MySQL, Dapper, DevExpress.\"\n        ]\n      }\n    ]\n  },\n  \"resume\": {\n    \"heading\": \"My Resume\",\n    \"subheading\": \"View my professional qualifications and experience in full-stack development.\",\n    \"download\": \"Download Resume\",\n    \"error\": \"Failed to load PDF\"\n  },\n  \"footer\": {\n    \"description\": \"Crafting scalable web apps, open-source tools, and innovative digital experiences.\",\n    \"quick_links\": \"Quick Links\",\n    \"connect\": \"Connect\",\n    \"built_by\": \"Built with ❤️ by Guilherme Menezes.\",\n    \"visitors\": \"Visitors\"\n  },\n  \"contact\": {\n    \"heading\": \"Get in Touch\",\n    \"subheading\": \"Have a project or question? Reach out and let's turn your ideas into reality.\",\n    \"field_name\": \"Name\",\n    \"field_email\": \"Email\",\n    \"field_subject\": \"Subject\",\n    \"field_message\": \"Please drop your short message...\",\n    \"submit\": \"Send Message\",\n    \"sending\": \"Sending...\",\n    \"success\": \"Message sent successfully!\",\n    \"error\": \"Failed to send message. Please try again.\",\n    \"error_generic\": \"An error occurred. Please try again later.\",\n    \"copied\": \"copied!\"\n  }\n}\n```"
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas:** frontend (React client components, Next.js App Router)\n- **Sem SSR de i18n:** todos os componentes da landing já são `'use client'` — sem impacto de hidratação\n- **Sem flash de idioma:** detecção síncrona antes do init garante que o idioma correto seja aplicado no primeiro render"
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. `npm install i18next react-i18next i18next-browser-languagedetector`\n2. Criar `src/i18n/locales/pt.json` e `src/i18n/locales/en.json` com as chaves aprovadas acima\n3. Criar `src/i18n/config.ts` com init síncrono e TODO para endpoint dinâmico\n4. Criar `src/i18n/index.ts` reexportando o i18n configurado\n5. Criar `src/components/providers/I18nProvider.tsx` ('use client') importando o config\n6. Adicionar `<I18nProvider>` no `src/app/layout.tsx` (wrapping apenas o público, não o admin)\n7. Atualizar `src/components/ui/language-toggle.tsx` para chamar `i18n.changeLanguage()`\n8. Migrar cada componente da landing com `useTranslation()`:\n   - `HeroContent.tsx` — badge, role, description, botões\n   - `Navbar.tsx` — labels dos links de navegação\n   - `Skills.tsx` — heading, subheading, footer\n   - `Timeline.tsx` — heading, subheading + dados do array `timelineData` via chaves indexadas\n   - `Resume.tsx` — heading, subheading, botão download\n   - `Footer.tsx` — description, quick_links, connect, built_by, visitors\n   - `ContactUs.tsx` — heading, subheading, placeholders dos campos, botão, mensagens de status"
      },
      {
        "heading": "Implementação Realizada",
        "content": "### 1. Configuração e Detecção Síncrona (`src/i18n/config.ts`)\nImplementado em [`src/i18n/config.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/i18n/config.ts) com detecção prévia no `localStorage` antes de inicializar para evitar qualquer efeito de flash de idioma:\n\n```typescript\n// src/i18n/config.ts\nimport i18n from 'i18next'\nimport { initReactI18next } from 'react-i18next'\nimport LanguageDetector from 'i18next-browser-languagedetector'\nimport pt from './locales/pt.json'\nimport en from './locales/en.json'\n\nconst SUPPORTED = ['pt', 'en']\nconst savedLang =\n  typeof window !== 'undefined'\n    ? localStorage.getItem('i18nextLng') ||\n      navigator.language?.split('-')[0] ||\n      'pt'\n    : 'pt'\nconst initialLang = SUPPORTED.includes(savedLang) ? savedLang : 'pt'\n\nif (!i18n.isInitialized) {\n  i18n\n    .use(LanguageDetector)\n    .use(initReactI18next)\n    .init({\n      resources: {\n        pt: { translation: pt },\n        en: { translation: en },\n      },\n      lng: initialLang,\n      fallbackLng: 'pt',\n      interpolation: { escapeValue: false },\n      detection: {\n        order: ['localStorage', 'navigator'],\n        caches: ['localStorage'],\n        lookupLocalStorage: 'i18nextLng',\n      },\n    })\n}\n```\n\n### 2. Provider de Inicialização e Layout\nCriado [`src/components/providers/I18nProvider.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/providers/I18nProvider.tsx) e envolvido no layout raiz em [`src/app/layout.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/layout.tsx) cobrindo a navbar, o conteúdo e o rodapé públicos.\n\n### 3. Toggle Funcional de Idioma\nImplementado em [`src/components/ui/language-toggle.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/ui/language-toggle.tsx), integrando diretamente com `useTranslation()`:\n\n```tsx\n// src/components/ui/language-toggle.tsx\nexport function LanguageToggle() {\n  const { i18n } = useTranslation()\n  const currentLang = i18n.language?.startsWith('en') ? 'EN' : 'PT'\n\n  const toggle = () => {\n    const next = currentLang === 'PT' ? 'en' : 'pt'\n    i18n.changeLanguage(next)\n  }\n\n  return (\n    <Button\n      variant=\"outline\"\n      size=\"icon\"\n      className=\"rounded-full font-bold text-xs z-50 cursor-pointer\"\n      onClick={toggle}\n      title=\"Toggle language\"\n    >\n      {currentLang}\n      <span className=\"sr-only\">Toggle language</span>\n    </Button>\n  )\n}\n```\n\n### 4. Migração dos 7 Componentes da Landing Page\nTodos os textos hardcoded foram convertidos em chamadas a `t()`:\n- `HeroContent.tsx`: `t('hero.badge')`, `t('hero.name')`, `t('hero.role')`, `t('hero.description')`, `t('hero.cta_connect')`, `t('hero.cta_github')`.\n- `Navbar.tsx`: `navItems` com `t('nav.about')`, `t('nav.skills')`, `t('nav.experience')`, `t('nav.projects')`, `t('nav.blog')`.\n- `Skills.tsx`: `t('skills.heading')`, `t('skills.subheading')`, `t('skills.footer')`.\n- `Timeline.tsx`: `t('experience.jobs', { returnObjects: true })` para mesclagem reativa das experiências e headings traduzidos.\n- `Resume.tsx`: `t('resume.heading')`, `t('resume.subheading')`, `t('resume.download')`, `t('resume.error')`.\n- `Footer.tsx`: `t('footer.description')`, `t('footer.quick_links')`, `t('footer.connect')`, `t('footer.built_by')`, `t('footer.visitors')`, e links rápidos traduzidos.\n- `ContactUs.tsx`: `t('contact.heading')`, `t('contact.subheading')`, placeholders dos campos (`name`, `email`, `subject`, `message`), estados de envio (`sending`, `submit`), e toasts.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] `npm install` das 3 dependências sem conflitos de versão\n- [x] `src/i18n/config.ts` inicializa sem erro em SSR (guard `typeof window !== 'undefined'`)\n- [x] `LanguageToggle` chama `i18n.changeLanguage()` e persiste no `localStorage`\n- [x] Ao alternar para EN, todos os textos da landing mudam instantaneamente sem reload\n- [x] Ao recarregar a página, o idioma escolhido é restaurado do `localStorage`\n- [x] Nenhum texto hardcoded residual nos componentes migrados (inclusive header mobile e endereço)\n- [x] `npm run build` sem erros de TypeScript (27/27 rotas geradas)\n- [x] Testado em desktop e mobile, local e produção na VPS\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> Registrado e validado em 12/09/2026.\n\n- **Compilação (`npm run build`):** Executada com sucesso sem erros TypeScript, gerando 27 páginas estáticas e dinâmicas.\n- **Alternância PT ↔ EN via DevTools:** Testada no navegador local:\n  - Estado PT inicial verificado: `\"localStorageLang\":\"pt\"`, `\"badgeText\":\"O Desenvolvedor\"`, `\"roleText\":\"Desenvolvedor Full-Stack\"`, `\"mobileTitle\":\"Portfólio\"`, `\"location\":\"Diadema – São Paulo – Brasil\"`.\n  - Clique no botão de idioma: transição imediata para `\"localStorageLang\":\"en\"`, `\"badgeText\":\"The Developer\"`, `\"roleText\":\"Full-Stack Developer\"`, `\"skillsHeading\":\"Technical Expertise\"`, `\"contactHeading\":\"Get in Touch\"`, `\"mobileTitle\":\"Portfolio\"`, `\"location\":\"Diadema – São Paulo – Brazil\"`.\n  - Recarregamento da página (F5): preferência em inglês preservada sem piscar.\n  - Alternância de volta para PT: restabelecimento imediato de todos os textos em português.\n- **Deploy:** Código e configurações enviados para a branch `main` e validados na VPS.\n\n- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente em PT e EN na VPS pelo usuário\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-i18n-fundacao-pt-en` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[done]-i18n-fundacao-pt-en"
  },
  {
    "id": "i18n-painel-export-import",
    "title": "Painel de Traduções — Export/Import (Fase 3.2.2)",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-09-14",
    "priority": "média",
    "tags": [
      "frontend",
      "backend",
      "api"
    ],
    "progress": 94,
    "progressFraction": {
      "done": 17,
      "total": 18
    },
    "summary": "Funcionalidade de exportação e importação de traduções com diff preview antes de confirmar, construída sobre o core do card 3.2.1.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Adicionar ao painel `/admin/language` as seções de Export e Import:\n- **Export:** gerar um `.json` com os valores em uso (override + fallback JSON) por categoria e idioma selecionados\n- **Import:** carregar um `.json`, calcular o diff chave a chave, mostrar prévia (antes/depois) e confirmar antes de aplicar"
      },
      {
        "heading": "Depende de",
        "content": "Card 3.2.1 concluído (`[done]-i18n-painel-traducoes-core`) ✅ — rotas de CRUD e `src/lib/i18n-utils.ts` já existentes."
      },
      {
        "heading": "Referência de Arquitetura",
        "content": "`dev/utils/reference/SISTEMA_TRADUCAO.md` — mesmo padrão do sistema de referência, com melhoria do diff antes de confirmar.\n\n---"
      },
      {
        "heading": "Decisões de Design aplicáveis a este card",
        "content": "| # | Decisão |\n|---|---|\n| 1 | Export reflete o valor **em uso** (override do banco OU fallback do JSON) — não só overrides |\n| 2 | Export com escopo: seletor de categorias (checkbox múltiplo) + idioma (PT / EN / ambos) |\n| 3 | Import: diff chave a chave contra valor atual → prévia → confirmação explícita para aplicar |\n| 4 | Import só aplica chaves com valor **diferente** do atual — não regrava o que não mudou |\n| 5 | Rotas de export/import exigem sessão de admin |\n\n---"
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- `GET /api/admin/translations/export?categories={cat1,cat2}&langs={pt,en}` — gera JSON com valores em uso, escopo selecionado\n- `POST /api/admin/translations/import/preview` — recebe JSON, retorna diff sem aplicar\n- `POST /api/admin/translations/import/confirm` — aplica o diff confirmado\n- Seção **Export** na tela `/admin/language`: checkboxes de categoria, seletor de idioma, botão Exportar\n- Seção **Import** na tela `/admin/language`: input de arquivo, botão Analisar, prévia de diff (tabela antes/depois), botão Confirmar Importação\n\n### Não inclui\n\n- Criação de chaves novas via import\n- Categorias `projects` e `blog` (conteúdo dinâmico — Fases 5/6)\n\n---"
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- Importar `flatten` de `src/lib/i18n-utils.ts` — **não redefinir** em nenhuma rota\n- `GET /api/admin/translations/export`: merge `{ ...base, ...overrides }` filtrado por categoria\n- `POST /api/admin/translations/import/preview`: comparar `incoming[key]` vs `overrides[key] ?? base[key]` — só retornar chaves diferentes\n- `POST /api/admin/translations/import/confirm`: iterar sobre o diff confirmado e chamar `upsertOverride`\n- UI de Import: duas fases distintas — fase 1 (Analisar) mostra diff; fase 2 (Confirmar) aplica\n\n---"
      },
      {
        "heading": "Rotas",
        "content": "### `GET /api/admin/translations/export`\n\n```\n?categories=hero,nav    → só essas categorias (omitir = todas)\n&langs=pt,en            → idiomas (omitir = ambos)\n```\n\nRetorna:\n```json\n{\n  \"pt\": { \"hero.role\": \"Desenvolvedor Full-Stack\" },\n  \"en\": { \"hero.role\": \"Full-Stack Developer\" }\n}\n```\n\n### `POST /api/admin/translations/import/preview`\n\nBody:\n```json\n{ \"translations\": { \"pt\": { \"hero.role\": \"novo valor\" }, \"en\": { ... } } }\n```\n\nRetorna:\n```json\n{ \"diff\": [{ \"key\": \"hero.role\", \"lang\": \"pt\", \"currentValue\": \"valor atual\", \"newValue\": \"novo valor\" }] }\n```\n\n### `POST /api/admin/translations/import/confirm`\n\nBody:\n```json\n{ \"diff\": [{ \"key\": \"hero.role\", \"lang\": \"pt\", \"newValue\": \"novo valor\" }] }\n```\n\nRetorna:\n```json\n{ \"ok\": true, \"applied\": 1 }\n```\n\n---"
      },
      {
        "heading": "Layout das seções na tela",
        "content": "```\nEXPORT:\n  Categorias: [✓] hero [✓] nav [✓] skills [✓] experience [✓] resume [✓] footer [✓] contact\n              [Selecionar todas] [Limpar]\n  Idioma:     (•) PT  ( ) EN  ( ) Ambos\n  [Exportar JSON]  → download do arquivo\n\nIMPORT:\n  [Escolher arquivo .json] — exibe nome do arquivo selecionado\n  [Analisar]\n\n  → (após analisar) Prévia de mudanças:\n  ┌────────────────────┬──────────────┬──────────────────┬──────────────────┐\n  │ Chave              │ Idioma       │ Valor atual      │ Novo valor       │\n  ├────────────────────┼──────────────┼──────────────────┼──────────────────┤\n  │ hero.role          │ EN           │ Full-Stack Dev   │ Full Stack Dev   │\n  └────────────────────┴──────────────┴──────────────────┴──────────────────┘\n  X chave(s) serão alteradas.\n  [Cancelar]  [Confirmar Importação]\n```\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] `GET /api/admin/translations/export` importa `flatten` de `i18n-utils`, sem redefinição local\n- [x] Export de categoria `hero` em PT → arquivo com apenas chaves `hero.*` e valores em uso\n- [x] Export de todas as categorias em ambos os idiomas → arquivo completo e correto\n- [x] `POST /api/admin/translations/import/preview` retorna só as chaves com valor diferente\n- [x] Import com 1 chave alterada → prévia mostra só 1 linha, confirmar aplica só essa\n- [x] Import com arquivo idêntico ao estado atual → prévia vazia, nada é aplicado\n- [x] Confirmar importação → overrides gravados, página recarrega estado do banco\n- [x] Rotas exigem sessão admin — sem sessão retorna 401\n- [x] `npm run build` sem erros de TypeScript\n- [x] Testado em produção na VPS antes de marcar como `[done]`\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Todos os critérios de conclusão atendidos\n- [x] Export testado com escopos variados (uma categoria, todas, PT, EN, ambos)\n- [x] Import testado com arquivo válido e com arquivo sem diferenças\n- [x] Nenhuma regressão nos critérios do card 3.2.1\n- [x] **Pasta renomeada para `[done]-i18n-painel-export-import` e movida para `archive/features/`**\n- [x] Se for o último card da Fase 3, atualizar `dev/utils/ROADMAP-EXECUCAO.md`"
      }
    ],
    "path": "docs/archive/features/[done]-i18n-painel-export-import"
  },
  {
    "id": "i18n-painel-traducoes-core",
    "title": "Painel de Traduções — Core: Edição em Tempo Real (Fase 3.2.1)",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-09-14",
    "priority": "alta",
    "tags": [
      "frontend",
      "backend",
      "i18n",
      "admin"
    ],
    "progress": 87,
    "progressFraction": {
      "done": 13,
      "total": 15
    },
    "summary": "Schema SQLite, rotas de leitura/escrita e tela `/admin/idioma` com batch editing completo (editar, salvar, descartar, restaurar por campo e global). Export/Import ficam no card 3.2.2.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Substituir o placeholder de `/admin/idioma` pela interface real de edição de traduções, com:\n- Overrides persistidos no SQLite (overlay sobre `pt.json`/`en.json`)\n- Site público consumindo overrides via `GET /api/translations` em tempo real\n- Interface batch: editar livremente → Salvar global / Descartar / Restaurar padrão"
      },
      {
        "heading": "Depende de",
        "content": "Fase 3 fundação concluída (`[done]-i18n-fundacao-pt-en`) ✅ — `config.ts` com `TODO Fase 3.2` já reservado."
      },
      {
        "heading": "Próximo card",
        "content": "`[approved]-i18n-painel-export-import` (Fase 3.2.2) — Export/Import de traduções."
      },
      {
        "heading": "Referência de Arquitetura",
        "content": "`dev/utils/reference/SISTEMA_TRADUCAO.md` — padrão validado no projeto Thiago Bahls.\n\n---"
      },
      {
        "heading": "Decisões de Design aplicáveis a este card",
        "content": "| # | Decisão |\n|---|---|\n| 1 | Banco SQLite armazena **apenas overrides** — `pt.json`/`en.json` são a base/fallback |\n| 2 | Sem criação de chaves novas pelo painel — só edição de valores existentes |\n| 3 | Painel organizado pelas 7 categorias dos JSONs |\n| 4 | **Batch edit:** editar livremente → Salvar global (modal) / Descartar tudo (modal) / Descartar por categoria (sem modal) |\n| 5 | **Restaurar padrão por campo:** sem confirmação, entra no draft como `to-delete` — DELETE executado só no Salvar |\n| 6 | **Restaurar tudo ao padrão:** botão global com modal de confirmação, também entra no draft |\n| 7 | Badge `● N alterações não salvas` no header da página, navegação livre, aviso `beforeunload` |\n| 8 | `GET /api/translations` é pública — rotas de escrita exigem sessão de admin |\n\n---"
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n\n- `src/lib/i18n-utils.ts` — função `flatten` compartilhada (usada aqui e pelo card 3.2.2)\n- Tabela `translation_overrides` (`key`, `lang`, `value`, `updated_at`) no SQLite\n- `GET /api/translations?lang={lng}` — pública, retorna overrides ativos do idioma\n- `GET /api/admin/translations` — autenticada, retorna overrides de ambos os idiomas\n- `PUT /api/admin/translations` — upsert de overrides em lote\n- `DELETE /api/admin/translations` — remoção de overrides em lote\n- Ativar o `TODO Fase 3.2` no `config.ts`: fetch inicial + `languageChanged` com `addResourceBundle`\n- Tela `/admin/idioma` completa: abas de categoria, batch editing, restaurar por campo, restaurar global, badge dirty count\n\n> **Convenção:** `?lang=` em todas as rotas — sem exceção.\n\n### Não inclui (→ card 3.2.2)\n\n- `GET /api/admin/translations/export`\n- `POST /api/admin/translations/import/preview`\n- `POST /api/admin/translations/import/confirm`\n- Seções de Export e Import na UI\n\n---"
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- `src/lib/i18n-utils.ts` exporta `flatten` — Passos 4c/4d/4e do card 3.2.2 importam daqui\n- Estado duplo: `committed` (banco) e `draft` (edições locais)\n- `dirtyCount` skipa keys em `toDelete` para evitar double-count\n- `handleSave` sincroniza `draft` com `newCommitted` após salvar\n\n---"
      },
      {
        "heading": "Validação e Evidências de Execução",
        "content": "### 1. Schema SQLite (`src/lib/db.ts`) e Helpers (`src/lib/translations.ts`)\n```sql\nCREATE TABLE IF NOT EXISTS translation_overrides (\n  key        TEXT    NOT NULL,\n  lang       TEXT    NOT NULL,\n  value      TEXT    NOT NULL,\n  updated_at TEXT    NOT NULL DEFAULT (datetime('now')),\n  PRIMARY KEY (key, lang)\n);\n\nCREATE INDEX IF NOT EXISTS idx_translation_overrides_lang\n  ON translation_overrides(lang);\n```\n- Testado via `src/lib/translations.ts`:\n  - `getOverridesByLang('pt')` / `getOverridesByLang('en')`\n  - `upsertOverride(key, lang, value)`\n  - `deleteOverride(key, lang)`\n  - `deleteAllOverrides()`\n\n### 2. Utilitários de Transformação (`src/lib/i18n-utils.ts`)\n- Funções `flatten` e `unflatten` criadas para compatibilidade total entre chaves escalares (`hero.role`) e arrays aninhados de histórico profissional (`experience.jobs.0.title`, `experience.jobs.0.achievements.0`).\n\n### 3. Rota Pública de Overrides (`src/app/api/translations/route.ts`)\n- `GET /api/translations?lang=pt` acessível sem autenticação (200 OK) retornando objeto de overrides ativos.\n\n### 4. Integração Dinâmica no i18n (`src/i18n/config.ts`)\n- `applyServerOverrides(lng)` chamada no carregamento inicial (`typeof window !== 'undefined'`) e a cada troca de idioma (`i18n.on('languageChanged')`).\n- Merge via `i18n.addResourceBundle(lng, 'translation', data, true, true)` com emissão de evento reativo para atualização imediata dos componentes React.\n\n### 5. Rotas Autenticadas do Painel Admin (`src/app/api/admin/translations/route.ts`)\n- `GET`: retorna overrides por idioma ou ambos `{ pt: {...}, en: {...} }` (401 sem sessão).\n- `PUT`: upsert em lote `{ updates: [{ key, lang, value }] }` (401 sem sessão).\n- `DELETE`: remoção em lote `{ deletes: [{ key, lang }] }` ou `{ all: true }` (401 sem sessão).\n\n### 6. Interface do Painel Administrativo (`src/app/admin/(dashboard)/idioma/page.tsx`)\n- Visual cósmico em harmonia com `#030014`, gradientes púrpuras, vidro fumê e feedback de status.\n- Navegação entre as 7 categorias: `hero`, `nav`, `skills`, `experience`, `resume`, `footer`, `contact`.\n- Renderização especializada de `experience.jobs` em cards expansíveis para cada uma das 3 empresas/cargos (`SCHOTT`, `Avanth`, `CREN`), incluindo realizações.\n- Suporte a edição em lote (batch), contagem reativa de `dirtyCount`, avisos `beforeunload`, descarte por categoria, descarte total com modal de confirmação e restauração global com modal de confirmação.\n\n### 7. Testes de Integração e Ciclo Completo no Navegador\n1. Acesso à rota `/admin/idioma` com autenticação.\n2. Edição do campo `hero.role` em inglês para `\"Senior Full-Stack Engineer\"`.\n3. Notificação e badge de rascunho ativados (`1 alteração não salva`).\n4. Clique em \"Salvar Alterações\" → Modal de confirmação exibindo 1 atualização → Gravado no SQLite com sucesso.\n5. Verificação na landing page pública (`http://localhost:3000`): ao selecionar English, o cargo refletiu `\"Senior Full-Stack Engineer\"` em tempo real sem rebuild.\n6. Retorno ao painel administrativo → Clique em \"Restaurar padrão\" em `hero.role` → Indicador de restauração pendente exibido.\n7. Confirmação do salvamento → Override excluído do SQLite.\n8. Verificação na landing page pública: cargo restaurado para `\"Full-Stack Developer\"`.\n9. `npm run build` executado com sucesso e zero erros de TypeScript."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] `src/lib/i18n-utils.ts` criado com `flatten` exportado\n- [x] Schema `translation_overrides` criado sem erros\n- [x] `GET /api/translations?lang=` retorna overrides sem autenticação\n- [x] `config.ts` busca overrides no carregamento inicial e ao trocar idioma\n- [x] Editar `hero.role` em EN pelo painel → site público reflete sem rebuild\n- [x] Chave sem override exibe valor do JSON normalmente\n- [x] Restaurar padrão por campo entra no draft como `to-delete`, executado no Salvar\n- [x] Restaurar tudo ao padrão (modal) marca todos os overrides para delete via Salvar\n- [x] Descartar tudo reverte estado local ao banco\n- [x] Badge de alterações visível durante edição\n- [x] Rotas de escrita retornam 401 sem sessão admin\n- [x] `npm run build` sem erros de TypeScript\n- [ ] Testado em produção na VPS antes de marcar como `[done]`\n\n---"
      }
    ],
    "path": "docs/archive/features/[done]-i18n-painel-traducoes-core"
  },
  {
    "id": "login-email-senha",
    "title": "Login via Email e Senha (Auth.js)",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-08-31",
    "priority": "alta",
    "tags": [
      "backend",
      "frontend",
      "segurança"
    ],
    "progress": 94,
    "progressFraction": {
      "done": 16,
      "total": 17
    },
    "summary": "Autenticação por email e senha para usuário único fixo via variáveis de ambiente com Auth.js v5, hash em Base64 e proteção de rotas.",
    "sections": [
      {
        "heading": "Objetivo",
        "content": "Permitir que o administrador do portfólio acesse a área restrita `/admin` autenticando-se com e-mail e senha, sem expor cadastro público e sem necessidade de tabela de usuários no banco de dados."
      },
      {
        "heading": "Descrição Funcional",
        "content": "- Ao acessar qualquer rota restrita sob `/admin` sem estar autenticado, o usuário é interceptado pelo middleware e redirecionado para a URL limpa `/admin/login` (sem expor `?callbackUrl` na barra de navegação).\n- A tela `/admin/login` possui visual no tema dark/glassmorphism do portfólio, com inputs para E-mail e Senha, tratamento visual de carregamento (`Autenticando...`) e banner de erro genérico para credenciais inválidas.\n- A validação de credenciais compara o e-mail contra `ADMIN_EMAIL` e o hash bcrypt da senha decodificado de Base64 contra `ADMIN_PASSWORD_HASH`.\n- Ao autenticar com sucesso, o Auth.js emite um token de sessão JWT e o usuário é redirecionado para `/admin`.\n- No painel `/admin`, é exibido o cabeçalho administrativo com o e-mail logado, atalho para o site público e botão de logout.\n- Ao clicar em **Sair**, a sessão é revogada e o usuário é redirecionado de volta para `/admin/login`."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n- Configuração do Auth.js (NextAuth v5 beta) com suporte a edge middleware e runtime Node.js.\n- Provider Credentials configurado em `src/auth.ts`, com comparação segura via `bcryptjs` e decodificação automática de hash em Base64.\n- Configuração do manipulador de API NextAuth em `src/app/api/auth/[...nextauth]/route.ts`.\n- Middleware de autorização em `src/middleware.ts` protegendo o prefixo `/admin/:path*` e redirecionando para URL limpa `/admin/login`.\n- Página de erro mapeada em `pages.error: '/admin/login'` em `src/auth.config.ts`, evitando telas cruas do framework.\n- Tela de login responsiva e estilizada em `src/app/admin/login/page.tsx`.\n- Painel administrativo base com verificação de sessão e botão de logout em `src/app/admin/page.tsx`.\n- Script CLI utilitário `scripts/hash-password.ts` gerando hash bcrypt codificado em Base64 (imune a interpolações de `$` e `\\` entre Windows, Linux e Docker).\n- Configuração de `trustHost: true` para suportar proxies reversos Nginx em produção.\n- Documentação de variáveis de ambiente no `docker-compose.yml` e `.env.example`.\n\n### Não inclui\n- Login social com Google e GitHub (escopo da Subfase 2.3).\n- Segundo fator de autenticação 2FA/TOTP (escopo da Subfase 2.4).\n- Formulários completos de CRUD de cada seção do painel (escopos das Fases 3 a 8).\n- Recuperação de senha por e-mail (\"esqueci minha senha\"), por tratar-se de credencial única controlada via variáveis de ambiente do servidor."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** Frontend (`src/app/admin/login/page.tsx`, `src/app/admin/page.tsx`) e Backend (`src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`).\n- **Dependências instaladas:** `next-auth@beta` (^5.0.0-beta.25), `bcryptjs` (^3.0.3), `@types/bcryptjs` (^2.4.6).\n- **Variáveis de ambiente requeridas:**\n  - `AUTH_SECRET`: chave secreta para assinatura dos tokens JWT.\n  - `ADMIN_EMAIL`: e-mail oficial do administrador (ex: `admin@guilhermemenezes.dev`).\n  - `ADMIN_PASSWORD_HASH`: hash bcrypt codificado em Base64 (gerado via `npx tsx scripts/hash-password.ts`).\n  - `NEXTAUTH_URL`: URL base da aplicação (ex: `http://localhost:3000` em dev / `https://guilhermemenezes.dev` em prod)."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Instalar `next-auth@beta` e `bcryptjs`.\n2. Criar configuração edge-safe (`src/auth.config.ts`) e singleton de autenticação Node.js (`src/auth.ts`).\n3. Criar route handler do Auth.js (`src/app/api/auth/[...nextauth]/route.ts`).\n4. Criar middleware de proteção (`src/middleware.ts`).\n5. Criar script utilitário de hash (`scripts/hash-password.ts`).\n6. Criar página de login (`src/app/admin/login/page.tsx`).\n7. Criar casca do dashboard (`src/app/admin/page.tsx`).\n8. Validar o fluxo ponta a ponta com agente navegador automatizado.\n9. Executar auditoria técnica completa e aplicar as 5 correções de segurança, robustez e limpeza (`dev/auth-audit-corrections.md`).\n\n---"
      },
      {
        "heading": "Rastreabilidade de Tentativas e Diagnósticos",
        "content": "### Tentativa 1 (refutada) — Hash corrompido por interpolação de variáveis no PowerShell\n- **O que foi feito:** O hash bcrypt inicial foi gerado via comando inline no PowerShell (`node -e \"...\"`) e colado no `.env.local`.\n- **Resultado real:** O PowerShell interpretou o prefixo `$2b` e `$12` como variáveis de ambiente nulas durante a execução, gerando uma string de hash corrompida (`$2b$12$X3Ht62bZbp99b5E05OLSku6Z...`) que não correspondia à senha `admin`.\n- **Correção aplicada:** Criado o script seguro [`scripts/hash-password.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/scripts/hash-password.ts) para gerar hashes sem interferência do shell.\n\n### Tentativa 2 (refutada) — Interpolação de `$` no parser de `.env` do Next.js\n- **O que foi feito:** A variável foi configurada no `.env.local` com aspas duplas: `ADMIN_PASSWORD_HASH=\"$2b$12$9N/...\"`.\n- **Resultado real:** O parser nativo de arquivos `.env` do Next.js interpreta símbolos `$` dentro de aspas duplas como interpolação de variáveis. Os blocos `$2b`, `$12` e `$9N` foram removidos em tempo de execução, truncando o hash de 60 para 51 caracteres (`hashPreview: /2LStr96zF`), fazendo `bcrypt.compareSync` falhar.\n- **Correção inicial (workaround):** Os caracteres `$` foram escapados como `\\$2b...`.\n- **Diagnóstico da auditoria:** O caractere `\\` é tratado como literal no Docker Compose da VPS Linux, gerando incompatibilidade silenciosa em produção.\n- **Correção definitiva:** Hash codificado em Base64 no script `scripts/hash-password.ts` e decodificado automaticamente em `src/auth.ts`. Strings em Base64 contêm apenas caracteres alfanuméricos, eliminando totalmente qualquer problema de interpolação ou escape entre Windows, Linux e Docker.\n\n### Tentativa 3 (refutada) — Submissão de formulário via `useActionState` vs campos controlados\n- **O que foi feito:** A primeira versão da página de login utilizava Server Actions com `useActionState` e submissão direta do `FormData`.\n- **Resultado real:** Em testes de automação e no React 19, eventos de dispatch customizados em inputs não-controlados deixavam campos vazios durante chamadas programáticas `requestSubmit()`, ativando a validação nativa de `required`.\n- **Correção aplicada:** A página [`src/app/admin/login/page.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/admin/login/page.tsx) foi refatorada para formulário controlado com `useState`, `onSubmit` e chamada client-side a `signIn('credentials', { email, password, redirect: false })`, permitindo feedback instantâneo de erro e transição suave via `router.push('/admin')`.\n\n### Tentativa 4 (Auditoria e Correções Pós-Auditoria — `dev/auth-audit-corrections.md`)\n- **Remoção de debug log em produção:** Removido o bloco `console.log('[Auth Debug]', ...)` de `src/auth.ts`, garantindo que metadados e tamanho de senhas não sejam logados nos servidores.\n- **URL de login limpa:** Substituído `return false` em `src/auth.config.ts` por `Response.redirect(new URL('/admin/login', nextUrl))`, eliminando a poluição de `?callbackUrl` na barra de navegação do browser.\n- **Mapeamento de erro:** Adicionado `error: '/admin/login'` em `pages` do `src/auth.config.ts` para que falhas internas não exponham a tela `/api/auth/error`.\n- **Limpeza de código morto e variáveis:** Deletado o arquivo `src/app/admin/login/actions.ts` (sem imports) e removida a linha `- NEXTAUTH_SECRET=${AUTH_SECRET}` do `docker-compose.yml`.\n\n---"
      },
      {
        "heading": "Evidências da Implementação e Testes",
        "content": "### 1. Configuração do Auth.js (`src/auth.ts`)\n```typescript\nimport NextAuth from 'next-auth'\nimport Credentials from 'next-auth/providers/credentials'\nimport bcrypt from 'bcryptjs'\nimport { authConfig } from './auth.config'\n\nexport const { handlers, signIn, signOut, auth } = NextAuth({\n  ...authConfig,\n  providers: [\n    Credentials({\n      name: 'Credentials',\n      credentials: {\n        email: { label: 'Email', type: 'email' },\n        password: { label: 'Password', type: 'password' },\n      },\n      async authorize(credentials) {\n        if (!credentials?.email || !credentials?.password) {\n          return null\n        }\n\n        const email = String(credentials.email).trim().toLowerCase()\n        const password = String(credentials.password)\n\n        const adminEmail = (process.env.ADMIN_EMAIL || '')\n          .replace(/^[\"']|[\"']$/g, '')\n          .trim()\n          .toLowerCase()\n        const adminPasswordHashRaw = (process.env.ADMIN_PASSWORD_HASH || '')\n          .replace(/^[\"']|[\"']$/g, '')\n          .trim()\n\n        // Decodifica Base64 para recuperar o hash bcrypt ($2b$12$...)\n        const adminPasswordHash = adminPasswordHashRaw\n          ? Buffer.from(adminPasswordHashRaw, 'base64').toString('utf8')\n          : ''\n\n        if (!adminEmail || !adminPasswordHash) {\n          console.error('[Auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured in environment')\n          return null\n        }\n\n        if (email !== adminEmail) {\n          return null\n        }\n\n        const isValid = bcrypt.compareSync(password, adminPasswordHash)\n        if (!isValid) {\n          return null\n        }\n\n        return {\n          id: 'admin',\n          email: adminEmail,\n          name: 'Administrator',\n        }\n      },\n    }),\n  ],\n  session: {\n    strategy: 'jwt',\n  },\n  trustHost: true,\n})\n```\n\n### 2. Configuração Edge-Safe com Redirecionamento Limpo (`src/auth.config.ts`)\n```typescript\nimport type { NextAuthConfig } from 'next-auth'\n\nexport const authConfig = {\n  pages: {\n    signIn: '/admin/login',\n    error: '/admin/login',\n  },\n  callbacks: {\n    authorized({ auth, request: { nextUrl } }) {\n      const isLoggedIn = !!auth?.user\n      const isOnAdmin = nextUrl.pathname.startsWith('/admin')\n      const isLoginPage = nextUrl.pathname === '/admin/login'\n\n      if (isOnAdmin) {\n        if (isLoginPage) {\n          if (isLoggedIn) {\n            return Response.redirect(new URL('/admin', nextUrl))\n          }\n          return true\n        }\n        if (isLoggedIn) {\n          return true\n        }\n        return Response.redirect(new URL('/admin/login', nextUrl))\n      }\n      return true\n    },\n    jwt({ token, user }) {\n      if (user) {\n        token.id = user.id\n        token.email = user.email\n      }\n      return token\n    },\n    session({ session, token }) {\n      if (token && session.user) {\n        session.user.email = token.email as string\n      }\n      return session\n    },\n  },\n  providers: [],\n  trustHost: true,\n} satisfies NextAuthConfig\n```\n\n### 3. Geração de Hash em Base64 (`scripts/hash-password.ts`)\n```typescript\nimport bcrypt from 'bcryptjs'\n\nconst password = process.argv[2]\n\nif (!password) {\n  console.error('Usage: npx tsx scripts/hash-password.ts <plain-password>')\n  process.exit(1)\n}\n\nconst salt = bcrypt.genSaltSync(12)\nconst hash = bcrypt.hashSync(password, salt)\nconst hashBase64 = Buffer.from(hash).toString('base64')\n\nconsole.log('\\n========================================')\nconsole.log('Password hash generated successfully!')\nconsole.log('========================================')\nconsole.log(`ADMIN_PASSWORD_HASH=\"${hashBase64}\"`)\nconsole.log('========================================\\n')\nconsole.log('Obs: valor armazenado em Base64. O código decodifica automaticamente antes de comparar.')\n```\n\n### 4. Bloco de Ambiente no `docker-compose.yml`\n```yaml\n    environment:\n      - NODE_ENV=production\n      - DATABASE_PATH=/app/data/portfolio.db\n      - RESEND_API_KEY=${RESEND_API_KEY}\n      - AUTH_SECRET=${AUTH_SECRET}\n      - NEXTAUTH_URL=${NEXTAUTH_URL:-https://guilhermemenezes.dev}\n      - ADMIN_EMAIL=${ADMIN_EMAIL}\n      - ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}\n```\n\n### 5. Testes Automatizados no Navegador (Chrome DevTools MCP)\n- **URL Limpa no Bloqueio:** Acesso a `http://localhost:3000/admin` redirecionou para `http://localhost:3000/admin/login` (sem `?callbackUrl`).\n- **Validação de Credenciais Inválidas:** Tentativa com senha errada exibiu banner vermelho no formulário sem redirecionar para `/api/auth/error`.\n- **Autenticação com Hash Base64:** Submissão com `admin@guilhermemenezes.dev` e senha `admin` decodificou o hash Base64 no servidor, autenticou com sucesso e redirecionou para `/admin`.\n- **Dashboard Renderizado:** Exibiu sessão ativa e cards do painel administrativo.\n- **Logout:** Botão \"Sair\" encerrou a sessão e retornou para `/admin/login`.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Login com credencial correta gera sessão válida e redireciona para `/admin`\n- [x] Login com credencial incorreta mostra erro genérico, sem revelar detalhes\n- [x] Acesso direto a `/admin/qualquer-rota` sem sessão redireciona para login limpo (`/admin/login`)\n- [x] Script `scripts/hash-password.ts` gera hash seguro em Base64\n- [x] Decodificação de Base64 em `src/auth.ts` testada e validada\n- [x] `console.log('[Auth Debug]')` removido de `src/auth.ts`\n- [x] `pages.error: '/admin/login'` adicionado em `src/auth.config.ts`\n- [x] Código morto `src/app/admin/login/actions.ts` removido do repositório\n- [x] `NEXTAUTH_SECRET` redundante removido de `docker-compose.yml`\n- [x] Sessão configurada via JWT com `trustHost: true` para proxy Nginx\n- [x] Validação executada via automação no navegador com captura visual\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente do ponto de vista do usuário\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-nome-da-feature` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[done]-login-email-senha"
  },
  {
    "id": "login-social-google-github",
    "title": "Login Social (Google e GitHub) Restrito ao Dono",
    "category": "features",
    "status": "done",
    "area": "archive",
    "date": "2026-08-31",
    "priority": "alta",
    "tags": [
      "backend",
      "frontend",
      "segurança",
      "api"
    ],
    "progress": 93,
    "progressFraction": {
      "done": 13,
      "total": 14
    },
    "summary": "Login via Google e GitHub condicional e restrito ao dono do portfólio, com ativação dinâmica e proteção de rota.",
    "sections": [
      {
        "heading": "Depende de",
        "content": "`[done]-login-email-senha` — este card estende a mesma configuração do Auth.js já feita ali (middleware, sessão JWT, cookies seguros)."
      },
      {
        "heading": "Objetivo",
        "content": "Oferecer uma forma mais rápida de login (sem digitar senha) para o dono do portfólio, sem abrir a porta para cadastro público — a segurança do \"usuário único\" é garantida com whitelist rígida por provedor."
      },
      {
        "heading": "Descrição Funcional",
        "content": "Na tela de login, os botões \"Entrar com Google\" e \"Entrar com GitHub\" são renderizados **condicionalmente** apenas se as respectivas credenciais de API estiverem configuradas no ambiente.\nAo autenticar via OAuth:\n1. **Google:** O e-mail retornado é validado contra `ADMIN_GOOGLE_EMAIL` ou `ADMIN_EMAIL`.\n2. **GitHub:** O username retornado (`login`) é validado contra `ADMIN_GITHUB_USERNAME` ou o e-mail contra `ADMIN_EMAIL`.\nSe a conta for não autorizada, o callback `signIn` rejeita o login (`return false`), redirecionando para `/admin/login?error=AccessDenied`. A tela de login exibe um banner vermelho explicativo: *\"Acesso Negado: Esta conta social não possui permissão de administrador.\"*"
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n- Provedores Google e GitHub configurados dinamicamente no Auth.js (`src/auth.ts`).\n- Callback `signIn` com whitelist explícita e logs de advertência para tentativas rejeitadas.\n- Separação da tela de login em Server Component (`src/app/admin/login/page.tsx`) e Client Component (`src/app/admin/login/LoginForm.tsx`).\n- Botões de login social estilizados com SVG vetoriais, efeitos hover e estados de carregamento.\n- Tratamento e banner amigável para `AccessDenied`.\n- Mapeamento das variáveis opcionais no `docker-compose.yml` e `.env.example`.\n\n### Não inclui\n- 2FA para login social (card separado no roadmap).\n- Cadastro público de múltiplos usuários (acesso exclusivo do administrador).\n\n---"
      },
      {
        "heading": "Evidências da Implementação",
        "content": "### 1. Provedores Dinâmicos e Whitelist (`src/auth.ts`)\n```typescript\n// Ativa Google apenas se as credenciais existirem\nif (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {\n  providers.push(\n    Google({\n      clientId: process.env.GOOGLE_CLIENT_ID,\n      clientSecret: process.env.GOOGLE_CLIENT_SECRET,\n    })\n  )\n}\n\n// Ativa GitHub apenas se as credenciais existirem\nif (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {\n  providers.push(\n    GitHub({\n      clientId: process.env.GITHUB_CLIENT_ID,\n      clientSecret: process.env.GITHUB_CLIENT_SECRET,\n    })\n  )\n}\n```\n\n### 2. Validação Rígida no `signIn` Callback (`src/auth.ts`)\n```typescript\n    async signIn({ user, account, profile }) {\n      if (account?.provider === 'credentials') return true\n\n      const adminEmail = (process.env.ADMIN_EMAIL || '').replace(/^[\"']|[\"']$/g, '').trim().toLowerCase()\n\n      if (account?.provider === 'google') {\n        const allowedGoogleEmail = (process.env.ADMIN_GOOGLE_EMAIL || adminEmail).replace(/^[\"']|[\"']$/g, '').trim().toLowerCase()\n        const userEmail = (user.email || profile?.email || '').trim().toLowerCase()\n        if (userEmail && (userEmail === allowedGoogleEmail || userEmail === adminEmail)) return true\n        console.warn(`[Auth] Tentativa de login Google rejeitada para: ${userEmail}`)\n        return false\n      }\n\n      if (account?.provider === 'github') {\n        const adminGithubUsername = (process.env.ADMIN_GITHUB_USERNAME || '').replace(/^[\"']|[\"']$/g, '').trim().toLowerCase()\n        const userEmail = (user.email || profile?.email || '').trim().toLowerCase()\n        const githubLogin = String((profile as unknown as GitHubProfile)?.login || '').trim().toLowerCase()\n\n        if ((userEmail && userEmail === adminEmail) || (adminGithubUsername && githubLogin === adminGithubUsername)) return true\n        console.warn(`[Auth] Tentativa de login GitHub rejeitada: login=${githubLogin}, email=${userEmail}`)\n        return false\n      }\n\n      return false\n    }\n```\n\n### 3. Server Component (`src/app/admin/login/page.tsx`)\n```typescript\nexport default async function AdminLoginPage({ searchParams }: LoginPageProps) {\n  const resolvedParams = await searchParams\n  const errorParam = typeof resolvedParams?.error === 'string' ? resolvedParams.error : undefined\n\n  const availableProviders = {\n    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),\n    github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),\n  }\n\n  return <LoginForm availableProviders={availableProviders} initialError={errorParam} />\n}\n```\n\n### 4. Validações e Testes Locais\n- **`npm run build`:** Compilou com código de saída 0 e tipagem 100% estrita no Next.js 16 (Turbopack).\n- **Sem chaves configuradas:** A página `/admin/login` permaneceu idêntica, sem divisória e sem botões quebrados.\n- **Com chaves configuradas:** A página renderizou a divisória \"ou continue com\", o botão \"Entrar com Google\" e o botão \"Entrar com GitHub\" com ícones estilizados e estados de loading.\n- **Erro `AccessDenied`:** Acessar `/admin/login?error=AccessDenied` exibiu o banner `\"Acesso Negado: Esta conta social não possui permissão de administrador.\"`.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Login social implementado condicionalmente (zero quebra quando chaves não existem)\n- [x] Provider Google configurado com validação por whitelist de e-mail\n- [x] Provider GitHub configurado com validação por username ou e-mail\n- [x] Banner de `AccessDenied` implementado na tela de login\n- [x] `docker-compose.yml` e `.env.example` atualizados com as variáveis opcionais\n- [x] Compilação `npm run build` validada com sucesso\n- [x] Login via Google testado e validado com sucesso\n- [x] Login via GitHub testado e validado com sucesso\n\n---"
      },
      {
        "heading": "Validação",
        "content": "- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente do ponto de vista do usuário (incluindo tentativa de rejeição com conta não autorizada)\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-login-social-google-github` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/archive/features/[done]-login-social-google-github"
  },
  {
    "id": "a11y-botoes-navbar",
    "title": "Acessibilidade dos botões da navbar",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "média",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 90,
    "progressFraction": {
      "done": 9,
      "total": 10
    },
    "summary": "Corrigir foco, teclado e nomes acessíveis dos controles da navbar conforme a PR 1.",
    "sections": [
      {
        "heading": "Contexto",
        "content": "A PR #1 (`ux-a11y-navbar-improvements-13606226299156377748`) identificou controles da navbar com semântica e nomes acessíveis insuficientes."
      },
      {
        "heading": "Problema Atual",
        "content": "A análise da branch confirmou que `MobileNavToggle` usa SVG cru com `onClick`, sem foco e teclado adequados, e que botões somente com ícone em `src/components/ui/resizable-navbar.tsx` e `src/components/main/Navbar.tsx` podem não ter nome acessível. A PR analisada não contém a correção: `gh pr diff 1 --name-only` listou somente `.Jules/palette.md` e `pnpm-lock.yaml`.\n\nO lockfile adicionado também não corresponde ao fluxo principal observado no repositório, que usa npm, criando risco de tooling duplicado e diff sem benefício funcional."
      },
      {
        "heading": "Melhoria Proposta",
        "content": "Recriar a correção diretamente nos componentes da navbar, usando elementos `button` semânticos, `aria-label`, `aria-expanded`, texto quando necessário e estados `focus-visible`, sem adicionar um segundo gerenciador de dependências."
      },
      {
        "heading": "Impacto Esperado",
        "content": "- Controles utilizáveis por teclado e tecnologias assistivas.\n- Nome acessível para botões somente com ícone.\n- Alvo de toque e indicação de foco preservados em desktop e móvel.\n- Nenhuma alteração de dependências ou lockfile não utilizado."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Inspecionar `src/components/ui/resizable-navbar.tsx` e `src/components/main/Navbar.tsx`.\n2. Substituir o `onClick` em SVG cru por botão semântico e adicionar estados ARIA.\n3. Nomear os botões de contato e preservar o layout responsivo.\n4. Testar teclado, foco visível, leitores de tela por atributos DOM e viewports desktop/móvel."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Toggle móvel é um `button` focável, acionável por teclado e possui nome acessível.\n- [x] `aria-expanded` representa o estado do menu.\n- [x] Botões somente com ícone possuem nome acessível e foco visível.\n- [x] Fluxos desktop e móvel não apresentam regressão visual ou funcional.\n- [x] Nenhum lockfile ou dependência não necessária é introduzido.\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> Evidências: Playwright local confirmou nomes acessíveis após scroll, abertura/fechamento mobile por teclado, `aria-expanded` correto e 0 erros de console; TypeScript, ESLint e `git diff --check` passaram. O clone invisível de medição ainda pode receber foco por Tab.\n\n- [x] Melhoria perceptível e funcional\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-a11y-botoes-navbar` e movida para `archive/enhancements/`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-a11y-botoes-navbar"
  },
  {
    "id": "auth-deep-linking-cookie",
    "title": "Deep-linking com Cookie na Autenticação (URL Limpa + Redirecionamento Correto)",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-09-02",
    "priority": "alta",
    "tags": [
      "frontend",
      "backend",
      "ui-ux"
    ],
    "progress": 92,
    "progressFraction": {
      "done": 12,
      "total": 13
    },
    "summary": "Preservação da rota destino via cookie HttpOnly temporário para deep-linking pós-login sem poluição de query string na URL.",
    "sections": [
      {
        "heading": "Contexto",
        "content": "Na Subfase 2.2 (`login-email-senha`), implementou-se o fluxo de autenticação via e-mail e senha com Auth.js v5. Para manter a interface limpa e elegante, o redirecionamento padrão do Auth.js que anexava `?callbackUrl=...` na barra de endereços do navegador foi suprimido. Como resultado, o usuário vê sempre `/admin/login`."
      },
      {
        "heading": "Problema Atual",
        "content": "Ao suprimir o `?callbackUrl` da URL e manter `router.push('/admin')` fixo após a autenticação, o destino original que o usuário tentou acessar antes de ser barrado é perdido. Quando o painel tiver múltiplas seções e rotas internas (ex: `/admin/projetos`, `/admin/skills`), qualquer link direto ou bookmark levaria o administrador para a raiz `/admin`, exigindo que ele navegasse manualmente até a página desejada após logar."
      },
      {
        "heading": "Melhoria Proposta",
        "content": "Armazenar a rota original que o usuário tentou acessar em um cookie temporário HttpOnly (`admin_redirect`) no momento do bloqueio pelo middleware. \nApós o login com sucesso:\n1. O cliente consulta uma rota utilitária interna (`/api/admin/redirect-target`) que lê o valor do cookie e o apaga do navegador.\n2. O formulário de login redireciona com segurança para o destino recuperado (com fallback defensivo para `/admin`).\n3. A URL de login permanece perfeitamente limpa (`/admin/login`), sem expor query parameters."
      },
      {
        "heading": "Impacto Esperado",
        "content": "- **Experiência do Administrador (UX):** Links diretos para páginas internas do painel continuam funcionando mesmo quando a sessão expira, preservando o contexto de navegação.\n- **Segurança:** O cookie é `HttpOnly` e `SameSite=Lax`, inacessível por scripts client-side de terceiros. A rota de destino é validada contra links externos maliciosos (`startsWith('/')`)."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Ajustar o middleware em `src/middleware.ts` e `src/auth.config.ts` para gravar o cookie `admin_redirect` com `nextUrl.pathname + nextUrl.search` ao interceptar acesso não autorizado a `/admin/*`.\n2. Criar a API Route `src/app/api/admin/redirect-target/route.ts` para leitura e remoção do cookie `admin_redirect`.\n3. Atualizar o manipulador de submissão `handleSubmit` em `src/app/admin/login/page.tsx` para redirecionar dinamicamente ao destino retornado pela API.\n4. Tratar o edge case em que usuário já logado acessa `/admin/login`, limpando o cookie residual se existir.\n5. Validar o fluxo completo via automação de browser (Chrome DevTools MCP), inspecionando cookies e navegação.\n\n---"
      },
      {
        "heading": "Evidências da Implementação e Testes",
        "content": "### 1. Middleware com Cookie de Redirecionamento (`src/middleware.ts`)\n```typescript\nimport NextAuth from 'next-auth'\nimport { authConfig } from './auth.config'\nimport { NextResponse } from 'next/server'\n\nconst { auth } = NextAuth(authConfig)\n\nexport default auth((req) => {\n  const { nextUrl } = req\n  const isLoggedIn = !!req.auth?.user\n  const isOnAdmin = nextUrl.pathname.startsWith('/admin')\n  const isLoginPage = nextUrl.pathname === '/admin/login'\n\n  if (isOnAdmin) {\n    if (isLoginPage) {\n      if (isLoggedIn) {\n        const response = NextResponse.redirect(new URL('/admin', nextUrl))\n        response.cookies.delete('admin_redirect')\n        return response\n      }\n      return NextResponse.next()\n    }\n\n    if (isLoggedIn) {\n      return NextResponse.next()\n    }\n\n    // Usuário deslogado tentando acessar /admin ou subrota protegida\n    const loginUrl = new URL('/admin/login', nextUrl)\n    const response = NextResponse.redirect(loginUrl)\n    response.cookies.set('admin_redirect', nextUrl.pathname + nextUrl.search, {\n      httpOnly: true,\n      sameSite: 'lax',\n      path: '/',\n    })\n    return response\n  }\n\n  return NextResponse.next()\n})\n\nexport const config = {\n  matcher: ['/admin/:path*'],\n}\n```\n\n### 2. Endpoint de Consumo e Limpeza do Cookie (`src/app/api/admin/redirect-target/route.ts`)\n```typescript\nimport { NextResponse } from 'next/server'\nimport { cookies } from 'next/headers'\n\nexport async function GET() {\n  const cookieStore = await cookies()\n  const redirectCookie = cookieStore.get('admin_redirect')\n  const redirectTo = redirectCookie?.value ?? '/admin'\n\n  // Limpa o cookie após ler\n  const response = NextResponse.json({ redirectTo })\n  response.cookies.delete('admin_redirect')\n  return response\n}\n```\n\n### 3. Redirecionamento Dinâmico Seguro na Página de Login (`src/app/admin/login/page.tsx`)\n```typescript\n      try {\n        const redirectRes = await fetch('/api/admin/redirect-target')\n        const { redirectTo } = await redirectRes.json()\n        // Segurança: só aceita destinos relativos ao próprio site\n        const safeRedirect =\n          redirectTo && redirectTo.startsWith('/') ? redirectTo : '/admin'\n        router.push(safeRedirect)\n      } catch {\n        router.push('/admin')\n      }\n      router.refresh()\n```\n\n### 4. Validação com Agente Navegador (Chrome DevTools MCP / Browser Subagent)\n- **Deep link para subrota:** Navegação deslogada para `http://localhost:3000/admin/projetos` redirecionou para `http://localhost:3000/admin/login` com URL limpa.\n- **Armazenamento e leitura:** O cookie `admin_redirect` foi armazenado com `HttpOnly` e `SameSite=Lax`.\n- **Login e Redirecionamento:** Submissão das credenciais redirecionou com sucesso de volta para `http://localhost:3000/admin/projetos`, exibindo a confirmação `\"✓ Deep-linking via cookie executado com sucesso!\"`.\n- **Navegação de volta ao Dashboard:** Clique em \"← Voltar ao Painel Geral\" carregou `/admin` com sessão ativa.\n- **Logout:** Botão \"Sair\" encerrou a sessão e redirecionou para `/admin/login`.\n- **Acesso direto à raiz:** Navegação direta para `/admin` redirecionou para `/admin/login` e, após login, retornou para `/admin`.\n- **Limpeza do Cookie:** O cookie `admin_redirect` é consumido e apagado imediatamente após o redirecionamento.\n- **Teste de Regressão:** Credenciais incorretas continuam exibindo o banner vermelho normalmente sem expor rotas de erro.\n- **Gravação do Teste:** Sessão gravada em `auth_deep_link_test_1788399816388.webp`.\n\n---"
      },
      {
        "heading": "Decisões e Aprendizados",
        "content": "- **Causa raiz real do `MissingSecret`:** O Edge Runtime em Docker Standalone (Next.js `output: 'standalone'`) isola o bundle do middleware/proxy e, no `next-auth@5.0.0-beta.32`, determinados codepaths do `@auth/core` buscam especificamente a variável de ambiente `NEXTAUTH_SECRET` no processo do container, ignorando `secret:` do objeto de configuração se `NEXTAUTH_SECRET` não estiver presente no ambiente.\n- **Tentativa anterior de limpeza (refutada em prod):** Tentativa de remover `- NEXTAUTH_SECRET=${AUTH_SECRET}` do `docker-compose.yml` baseando-se apenas na documentação teórica da v5 — testado em produção, resultado: reincidência imediata do erro `MissingSecret`. A variável foi restaurada no `docker-compose.yml` para compatibilidade com o `beta.32`.\n- **Correções legítimas mantidas:**\n  - `secret: process.env.AUTH_SECRET` em `src/auth.config.ts`.\n  - `- NEXTAUTH_SECRET=${AUTH_SECRET}` em `docker-compose.yml` (obrigatório enquanto estiver no `next-auth@^5.0.0-beta.32`).\n- **Placebos eliminados com sucesso (sem regressão):**\n  - `AUTH_TRUST_HOST=true` no `docker-compose.yml`: desnecessário pois `trustHost: true` já está em código.\n  - `authorized() { return true }` em `src/auth.config.ts`: no-op removido, com autorização centralizada em `src/middleware.ts`.\n  - `|| process.env.NEXTAUTH_SECRET` no campo `secret:` do TS: desnecessário no arquivo TS.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Acesso deslogado a uma sub-rota (ex: `/admin/projetos` ou `/admin`) redireciona para `/admin/login` com URL limpa (sem `?callbackUrl`)\n- [x] Cookie `admin_redirect` é gravado como `HttpOnly`, `SameSite=Lax`, `Path=/` contendo o caminho original\n- [x] Rota `GET /api/admin/redirect-target` lê o cookie e o apaga da resposta\n- [x] Após login com sucesso, o usuário é redirecionado para a sub-rota original solicitada\n- [x] Validação de segurança garante que apenas caminhos relativos iniciados com `/` são aceitos\n- [x] Cookie `admin_redirect` não permanece ativo no navegador após o login\n- [x] Teste de login incorreto não é afetado (sem regressão no banner de erro)\n\n---"
      },
      {
        "heading": "Validação",
        "content": "- [x] Todos os critérios de conclusão atendidos\n- [x] Testado manualmente do ponto de vista do usuário\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-nome-da-melhoria` e movida para `archive/enhancements/`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-auth-deep-linking-cookie"
  },
  {
    "id": "badge-dmca-footer",
    "title": "Badge DMCA Protection Status no Footer",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-08-28",
    "priority": "baixa",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 89,
    "progressFraction": {
      "done": 8,
      "total": 9
    },
    "summary": "Inserção do badge DMCA Protection Status no rodapé do site com script externo lazyOnload.",
    "sections": [
      {
        "heading": "Contexto",
        "content": "O domínio `guilhermemenezes.dev` foi registrado e validado no DMCA.com. Para assegurar proteção de direitos autorais e sinalizar formalmente o status de proteção de conteúdo, é necessário exibir o selo oficial \"Protection Status\" do DMCA.com no rodapé do site."
      },
      {
        "heading": "Problema Atual",
        "content": "O rodapé continha os links rápidos, redes sociais e contador de visitas, mas carecia de sinalização formal e link de verificação de proteção de propriedade intelectual / DMCA."
      },
      {
        "heading": "Melhoria Proposta",
        "content": "Inserção do link oficial com a imagem do badge do DMCA e carregamento assíncrono não-bloqueante do script auxiliar `DMCABadgeHelper.min.js` via `next/script` com estratégia `lazyOnload` no componente [`src/components/main/Footer.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Footer.tsx)."
      },
      {
        "heading": "Impacto Esperado",
        "content": "- Proteção visual e jurídica explícita para o conteúdo do portfólio.\n- Sem impacto negativo de performance/LCP graças à estratégia `lazyOnload`.\n- Link seguro com `target=\"_blank\"` e `rel=\"noopener noreferrer\"`."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Importar `Script` de `next/script` em `Footer.tsx`.\n2. Adicionar o link do badge (`<a>` com `<img>`) e `<Script>` dentro do container inferior do rodapé.\n3. Validar build (`npm run build`) e carregamento no navegador."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Componente `Footer.tsx` atualizado com badge e script DMCA\n- [x] Script configurado com estratégia `lazyOnload`\n- [x] Imagem e link do DMCA carregando corretamente\n- [x] `npm run build` executado com sucesso sem erros ou quebras de tipo\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Badge exibido visualmente no rodapé em ambiente de desenvolvimento\n- [x] Script DMCA carregado sem erros no console\n- [x] **Pasta renomeada para `[done]-badge-dmca-footer` e movida para `archive/enhancements/`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-badge-dmca-footer"
  },
  {
    "id": "botao-idioma-ui-navbar",
    "title": "Language Toggle — Botão de Idioma na Navbar (UI)",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-07-09",
    "priority": "baixa",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 67,
    "progressFraction": {
      "done": 4,
      "total": 6
    },
    "summary": "Adiciona e estiliza o botão de alternância de idioma (PT/EN) na navbar.",
    "sections": [
      {
        "heading": "Descrição",
        "content": "A Fase 0 do roadmap exige a base visual para a escolha de idiomas. Este item foca na criação estrita da UI do botão (toggle) na Navbar, que ficará ao lado do botão de Tema. Ele prepara o terreno para a Fase 3, onde a lógica sistêmica real e a infraestrutura de tradução (i18next) serão inseridas neste mesmo componente."
      },
      {
        "heading": "Escopo",
        "content": "O que **ESTÁ INCLUSO** neste item (Fase 0):\n- Um botão/toggle visual novo, posicionado ao lado do `ThemeToggle` na navbar, construído como um controle separado.\n- Um estado local (mock) simples no componente, permitindo alternar a aparência visual ao clicar (ex: exibir a sigla \"PT\" ou \"EN\").\n\nO que **NÃO ESTÁ INCLUSO** neste item (Reservado para a Fase 3):\n- Lógica real de tradução, troca de conteúdo no site ou instalação do `i18next`.\n- Persistência de preferência (localStorage, cookies, session, etc.)."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camadas afetadas: frontend (interface)\n- Arquivo(s) alvo:\n  - `src/components/ui/resizable-navbar.tsx` (para posicionar o botão dentro da div de ações à direita).\n  - Criação do componente estritamente visual em `src/components/ui/language-toggle.tsx`. **Nota de Convenção:** Seguimos o padrão kebab-case (`language-toggle.tsx`) usado em outros componentes UI do projeto. Ele é explicitamente um componente visual no momento, e não um hook de lógica (`use-idioma`), já que o papel dele agora é prover a casca da interface."
      },
      {
        "heading": "Plano de Correção",
        "content": "1. Criar o componente visual `LanguageToggle` usando um ícone descritivo ou botões de sigla (PT/EN), aderindo ao mesmo estilo de botão fantasma (ghost/variant) e tema visual do `ThemeToggle`.\n2. Embutir um `useState<'PT' | 'EN'>` puramente cosmético que responde a cliques com uma transição suave. **Observação de Arquitetura:** Este estado local é estritamente temporário e desenhado apenas para dar feedback visual agora. Na Fase 3, ele será completamente substituído por um hook de contexto/provider (similar ao funcionamento do `next-themes` para o dark mode) para orquestrar o i18next globalmente.\n3. Importar e adicionar o `LanguageToggle` em `resizable-navbar.tsx`, junto ao `ThemeToggle` na div `flex items-center gap-2`.\n4. Assegurar que ele herde a classe `relative z-10` recém-implementada para não perder a interatividade no desktop sob o grid invisível.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] O botão foi adicionado com sucesso e não desconfigura a Navbar responsivamente.\n- [x] O clique alterna a indicação de idioma (PT/EN) no estado local apenas visualmente.\n- [x] O botão compartilha a correta interação de pointer-events da versão refatorada (sem regressões para o layout global).\n- [x] **Pasta renomeada para `[done]-botao-idioma-ui-navbar`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-botao-idioma-ui-navbar"
  },
  {
    "id": "failfast-auth-secret-boot",
    "title": "Fail-Fast no Boot se AUTH_SECRET Estiver Vazio",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-09-05",
    "priority": "alta",
    "tags": [
      "infra",
      "segurança"
    ],
    "progress": 90,
    "progressFraction": {
      "done": 9,
      "total": 10
    },
    "summary": "Validação fail-fast no boot do container Docker para abortar imediatamente a inicialização se AUTH_SECRET estiver ausente ou vazio.",
    "sections": [
      {
        "heading": "Contexto",
        "content": "A investigação técnica confirmou que a causa raiz dos incidentes anteriores de autenticação (`MissingSecret`) foi o arquivo `.env` na VPS nunca ter tido as variáveis de auth (`AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`) definidas desde a criação inicial da pasta no host. O Docker Compose substitui variáveis `${VAR}` inexistentes por string vazia `\"\"`, resultando em containers rodando com `AUTH_SECRET=\"\"` silenciosamente até o momento em que um usuário tenta acessar uma rota protegida e se depara com erro de configuração."
      },
      {
        "heading": "Problema Atual",
        "content": "O container inicia normalmente mesmo quando variáveis críticas como `AUTH_SECRET` estão ausentes ou vazias. O Next.js sobe e o healthcheck responde 200 na página inicial pública, mascarando a falha de infraestrutura até que alguém tente acessar `/admin` ou autenticar, gerando erros silenciosos em produção que podem passar despercebidos por dias."
      },
      {
        "heading": "Melhoria Proposta",
        "content": "Implementar uma verificação de ambiente *fail-fast* executada antes da subida do servidor (`node server.js`) no container Docker:\n1. Criar `scripts/check-env.js` em JavaScript puro para validar a presença e comprimento de `AUTH_SECRET` sem exigir dependências extras no runner standalone.\n2. Se `AUTH_SECRET` estiver ausente ou vazio, emitir um log fatal explícito e encerrar o processo imediatamente com `process.exit(1)`.\n3. Ajustar o `Dockerfile` para copiar o script para a imagem final e atualizar o `CMD` para executar `node scripts/check-env.js && node server.js`."
      },
      {
        "heading": "Impacto Esperado",
        "content": "- Qualquer deploy em que o `.env` do servidor ou variáveis do Compose estejam ausentes falhará no primeiro segundo do boot, tornando o erro óbvio no `docker logs` e impedindo a operação com autenticação quebrada.\n- Melhora substancial na confiabilidade e observabilidade da infraestrutura para os desenvolvedores."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Criar o script `scripts/check-env.js` com validação de `process.env.AUTH_SECRET` e mensagens de erro visíveis.\n2. Atualizar o `Dockerfile` (copiar `scripts/` para o stage runner e atualizar o `CMD`).\n3. Validar localmente a parada imediata (código de saída 1) quando `AUTH_SECRET` for omitido ou vazio.\n4. Validar localmente a subida limpa e normal quando `AUTH_SECRET` for fornecido.\n5. Fazer commit, push e validar no container de produção da VPS."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] `scripts/check-env.js` criado e funcional sem dependências adicionais\n- [x] `Dockerfile` copia `scripts/check-env.js` e executa a verificação antes do `server.js`\n- [x] Teste local confirma encerramento imediato com código de saída 1 e mensagem fatal quando `AUTH_SECRET` está ausente\n- [x] Teste local confirma inicialização bem-sucedida quando `AUTH_SECRET` está configurado\n- [x] Container em produção sobe normalmente após deploy com a verificação ativa\n\n---"
      },
      {
        "heading": "Validação",
        "content": "- [x] Melhoria perceptível e funcional\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-failfast-auth-secret-boot` e movida para `archive/enhancements/`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-failfast-auth-secret-boot"
  },
  {
    "id": "hardening-import-traducoes",
    "title": "Hardening do Import de Traduções (validação de tipo e de chave)",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-10-06",
    "priority": "média",
    "tags": [
      "backend",
      "segurança",
      "api"
    ],
    "progress": 94,
    "progressFraction": {
      "done": 15,
      "total": 16
    },
    "summary": "Impedir que o import grave valores inválidos (ex.: null virando \"null\") e que o confirm aceite chaves que não existem nos dicionários base.",
    "sections": [
      {
        "heading": "Contexto",
        "content": "O painel `/admin/language` permite exportar e importar traduções em JSON (Fase 3.2.2). O fluxo tem duas rotas: `import/preview` (calcula o diff) e `import/confirm` (grava os overrides). Na auditoria de fechamento da Fase 3 (`dev/relatorio-execucao-auditoria-fase-3.md`), o Agente Executor testou casos de borda e reportou os dois comportamentos abaixo. Os trechos e linhas citados vêm desse relatório e foram reconfirmados no código real antes da implementação."
      },
      {
        "heading": "Problema Atual",
        "content": "1. **Coerção de tipo no preview:** Em [`src/app/api/admin/translations/import/preview/route.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/api/admin/translations/import/preview/route.ts#L49), o valor era convertido com `String(val)`. Um JSON com `\"hero.role\": null` gerava diff com `newValue: \"null\"` (string literal), e um número `12345` virava `\"12345\"`. Se o admin confirmasse, o site público passava a exibir \"null\".\n2. **Confirm sem validar a chave:** Em [`src/app/api/admin/translations/import/confirm/route.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/api/admin/translations/import/confirm/route.ts#L25-L31), o loop só verificava se `item.key` estava preenchida, `item.lang` em `pt`/`en` e `newValue` do tipo string. Diferente do preview, não verificava se a chave existia nos dicionários base. Uma chamada direta à rota (com sessão admin válida) conseguia gravar override de chave inventada.\n3. O confirm confiava no `diff` enviado pelo cliente em vez de recalcular a partir do estado atual ou validar as chaves contra os dicionários base.\n4. **Chaves herdadas e itens inválidos no confirm:** O uso do operador `in` aceitava propriedades herdadas de `Object.prototype` (`toString`, `constructor`), elementos `null` no diff causavam erro 500, e valores vazios `\"\"` eram gravados como overrides.\n\nImpacto atual: baixo para segurança (rotas exigem sessão admin, comprovado na auditoria), médio para integridade do conteúdo público."
      },
      {
        "heading": "Melhoria Proposta",
        "content": "- **Preview:** valores que não sejam `string` (ex.: `null`, números, booleanos ou objetos) e valores vazios são ignorados ou rejeitados, impedindo coerção silenciosa para texto ou gravação de strings vazias.\n- **Confirm:** rejeitar (ou ignorar de forma explícita e reportada) itens cuja chave não exista como propriedade própria na base de PT/EN, reaproveitando `flatten` de `src/lib/i18n-utils.ts` (não reescrever).\n- Resposta de ambas as rotas deve informar o que foi descartado/ignorado, para o painel poder exibir feedback transparente.\n- Banner da interface com ícone Lucide padronizado e mensagem informativa unificada."
      },
      {
        "heading": "Impacto Esperado",
        "content": "- Elimina a possibilidade de publicar \"null\"/números por engano via import.\n- Mantém o contrato do preview e do confirm consistente entre si.\n- Afeta o administrador (feedback mais claro no modal de import); sem mudança para o visitante."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Reconfirmar no código real os pontos (citar trecho e linhas).\n2. Fechar as decisões com o dono do produto.\n3. Ajustar o preview conforme a decisão sobre valores não-string e valores vazios.\n4. Ajustar o confirm para validar propriedade própria contra a base (via `Object.hasOwn`), sanitizar tipos do array diff e tratar valores vazios.\n5. Ajustar o banner do modal de import para usar componente Lucide `<Info />` e texto padronizado.\n6. Testar com os casos de borda (null, número, objeto, chave inexistente, chaves herdadas, itens não-objeto no diff, valor vazio, JSON vazio, JSON inválido).\n\n**Decisões registradas e aprovadas pelo dono do produto (06/10/2026):**\n- **Valor não-string no arquivo:** Descartar pontualmente apenas os itens com valor não-string e listá-los como ignorados na resposta do preview (`ignored: [...]`).\n- **Chave inexistente no confirm:** Filtrar e ignorar chaves inexistentes, gravando apenas as válidas e reportando a contagem de itens aplicados e descartados (`{ ok: true, applied, ignored }`).\n- **Estratégia do confirm:** Validar individualmente cada item do diff recebido contra a lista de chaves base válidas e tipo string antes de persistir.\n- **Valor vazio no import:** Ignorar e listar como ignorado (decisão do dono do produto em 06/10/2026).\n\n**Relação com outros cards:** `[draft]-otimizacoes-painel-traducoes` (transação atômica no confirm e atalho `Esc`) mexe no mesmo `confirm/route.ts`. Sugestão de ordem: este card primeiro, depois a transação, para não haver conflito de edição."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Importar JSON com valor `null`, número ou objeto não gera mais diff com texto coagido\n- [x] Preview e confirm aplicam a mesma regra de validação de chave\n- [x] Confirm com chave inexistente não grava nada para aquela chave (comportamento conforme decisão registrada)\n- [x] A resposta das rotas informa os itens descartados\n- [x] Rotas continuam retornando 401 sem sessão admin\n- [x] `flatten` continua vindo de `src/lib/i18n-utils.ts`, sem redefinição local\n- [x] `npx tsc --noEmit` e `npm run build` sem erros\n- [x] Validação de chave por propriedade própria em preview e confirm (chaves herdadas ignoradas)\n- [x] Itens não-objeto no `diff` do confirm ignorados sem erro 500\n- [x] Valor vazio ignorado e listado em preview e confirm\n- [x] Banner com ícone Lucide e texto único nos dois cenários\n\n---"
      },
      {
        "heading": "Validação",
        "content": "Validação completa executada em 06/10/2026: (1) Chaves herdadas de Object.prototype ignoradas em preview e confirm via Object.hasOwn; (2) Elementos inválidos no array diff (especialmente null) tratados sem erro 500; (3) Valores vazios descartados com reason 'Valor vazio'; (4) Banner de interface padronizado com Lucide Info; (5) Export e persistência SSR sem regressões, validados com tsc e build limpos.\n\n- [x] Melhoria perceptível e funcional\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-hardening-import-traducoes` e movida para `archive/enhancements/`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-hardening-import-traducoes"
  },
  {
    "id": "login-social-popup",
    "title": "Login Social via Janela Popup com Loading Visual",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-09-03",
    "priority": "média",
    "tags": [
      "frontend",
      "ui-ux",
      "segurança"
    ],
    "progress": 92,
    "progressFraction": {
      "done": 11,
      "total": 12
    },
    "summary": "Login social via janela popup sem redirecionar a tela principal, com feedback visual de carregamento contínuo.",
    "sections": [
      {
        "heading": "Contexto",
        "content": "O login social via Google e GitHub foi implementado e validado. Atualmente, ao clicar nos botões sociais, o navegador executa um redirecionamento de página inteira (`window.location.href`) para o provedor OAuth (Google/GitHub) e retorna para o painel administrativo."
      },
      {
        "heading": "Problema Atual",
        "content": "O redirecionamento de página inteira remove o usuário do contexto da tela de login (`/admin/login`), provocando recarregamento de página e quebrando a fluidez da experiência administrativa. Além disso, caso o usuário demore ou queira cancelar, a página anterior precisa ser recarregada."
      },
      {
        "heading": "Melhoria Proposta",
        "content": "1. Implementar fluxo de autenticação OAuth em janela popup dedicada (`window.open` centralizado).\n2. Criar uma rota de apoio `/auth/popup` que dispara o `signIn(provider, { callbackUrl: '/auth/popup?status=success' })` dentro do popup.\n3. Ao concluir a autenticação com sucesso:\n   - A página do popup transmite uma mensagem segura (`postMessage`) para a janela mãe (`window.opener`): `{ type: 'AUTH_POPUP_SUCCESS' }` e se fecha automaticamente (`window.close()`).\n   - A janela mãe detecta o sucesso, busca o destino de deep-linking (`/api/admin/redirect-target`) e redireciona suavemente para `/admin` ou para a rota previamente acessada.\n4. Ao ocorrer erro de autorização (`AccessDenied`, etc.):\n   - O popup transmite `{ type: 'AUTH_POPUP_ERROR', error }` e se fecha automaticamente.\n   - A janela mãe exibe o banner de erro correspondente.\n5. Feedback visual de carregamento:\n   - Enquanto o popup estiver aberto, o botão social clicado exibe um estado de carregamento contínuo (`Loader2` animado) e os botões permanecem desabilitados para evitar múltiplos cliques.\n   - Caso o usuário feche o popup manualmente antes de completar o login, a janela mãe detecta o fechamento (`popup.closed`), encerra o estado de carregamento e restaura os botões ao estado normal."
      },
      {
        "heading": "Impacto Esperado",
        "content": "- Melhoria direta na experiência do usuário (UX): o administrador nunca sai da tela principal do portfólio.\n- Feedback visual claro durante todo o ciclo de autenticação externa."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Criar a rota de apoio `/auth/popup/page.tsx` (isenta do middleware de proteção do admin).\n2. Atualizar `src/app/admin/login/LoginForm.tsx` com o utilitário de abertura de popup centralizado, monitoramento de fechamento (`popup.closed`), escuta de mensagens `postMessage` e estado de loading ininterrupto.\n3. Garantir compatibilidade com o redirecionamento de deep-linking via cookie já existente.\n4. Adicionar `/auth/popup` ao matcher do `src/middleware.ts` para garantir injeção de `authConfig` e `secret` no Edge Runtime, passando direto pelo middleware sem bloqueio (`isOnAdmin = false`).\n5. Validar funcionamento em desenvolvimento e build de produção (`npm run build`)."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Clicar em \"Entrar com Google\" abre popup centralizado sem sair da tela de login\n- [x] Clicar em \"Entrar com GitHub\" abre popup centralizado sem sair da tela de login\n- [x] Botão clicado permanece em estado de carregamento (`Loader2`) enquanto o popup estiver aberto\n- [x] Se o popup for fechado pelo usuário, o loading é cancelado automaticamente\n- [x] Ao concluir o login no popup, o popup se fecha e a página mãe redireciona para o admin\n- [x] Se a conta for rejeitada (não autorizada), o popup fecha e o banner de erro é exibido na tela mãe\n- [x] `npm run build` executa sem erros\n\n---"
      },
      {
        "heading": "Validação",
        "content": "- [x] Melhoria perceptível e funcional\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-login-social-popup` e movida para `archive/enhancements/`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-login-social-popup"
  },
  {
    "id": "navbar-logo-hover-cor-hardcoded",
    "title": "NavbarLogo — Texto \"Guilherme Menezes\" com cor de hover hardcoded",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-07-09",
    "priority": null,
    "tags": [],
    "progress": 60,
    "progressFraction": {
      "done": 3,
      "total": 5
    },
    "summary": "> Aviso:Este item é um achado espontâneo, levantado acidentalmente durante a investigação do item original de \"texto estático do navbar\". Ele não fazia parte do escopo original da Fase 0. > Decisão...",
    "sections": [
      {
        "heading": "Descrição",
        "content": "O texto \"Guilherme Menezes\" exibido na navbar (logo/nome clicável) possui a cor de hover definida com a classe hardcoded `group-hover:text-red-500`. Isso ignora o sistema de design tokens do projeto (variáveis CSS do Tailwind/shadcn), cria inconsistência visual e dificulta a manutenção de temas (claro/escuro)."
      },
      {
        "heading": "Como Reproduzir",
        "content": "1. Abrir o portfólio em desktop (navbar expandida, estado não-scrollado)\n2. Passar o mouse sobre o texto \"Guilherme Menezes\" à esquerda da navbar\n3. Observar a cor de hover: vermelho puro (`red-500`) que não pertence ao sistema de cores do portfólio"
      },
      {
        "heading": "Comportamento Esperado",
        "content": "O hover do nome na navbar deve usar a cor do design token correspondente (ex: `text-primary` ou `text-destructive` conforme definição do tema), não uma cor hardcoded."
      },
      {
        "heading": "Comportamento Atual",
        "content": "A classe Tailwind está hardcoded no componente `NavbarLogo` em `resizable-navbar.tsx`:\n```tsx\n// src/components/ui/resizable-navbar.tsx — linhas 247–251\n{!isScrolled && (\n  <span className=\"text-lg font-bold group-hover:text-red-500 transition-colors\">\n    Guilherme Menezes\n  </span>\n)}\n```\nA classe `group-hover:text-red-500` usa um valor de cor absoluto de fora do sistema de tokens."
      },
      {
        "heading": "Contexto Técnico",
        "content": "- Camada afetada: frontend\n- Arquivo(s) suspeito(s): `src/components/ui/resizable-navbar.tsx` (linha 248)\n- Logs de erro (se houver): nenhum — é problema de design/consistência"
      },
      {
        "heading": "Hipótese de Causa",
        "content": "A cor foi definida manualmente (`red-500`) durante o desenvolvimento, sem consultar o sistema de design tokens disponível via CSS variables (shadcn/ui). \n\nAnálise real do `src/app/globals.css`:\nO projeto utiliza cores no formato `oklch`. \n- **Token `--primary`**: É um tom de preto no modo claro (`oklch(0.205 0 0)`) e branco no modo escuro (`oklch(0.922 0 0)`). Como o texto normal já usa as cores de foreground (quase preto/branco), usar `text-primary` no hover **não traria uma mudança visual perceptível**.\n- **Token `--destructive`**: É um vermelho temático (`oklch(0.577 0.245 27.325)` no claro, e `oklch(0.704 0.191 22.216)` no escuro). Porém, usar este token apenas porque a cor resultante é vermelha é um **erro semântico**, já que `--destructive` sinaliza estados de erro/perigo/exclusão, não um hover decorativo de identidade.\n\nNenhum outro token do sistema (`--accent`, `--secondary`, etc.) serve para um highlight de marca. Portanto, a transição para um token existente não é viável sem quebrar a semântica."
      },
      {
        "heading": "Plano de Correção (Opção B Aprovada)",
        "content": "Para expandir o Design System e preparar o terreno para a customização via painel administrativo, os seguintes passos serão executados:\n\n1. **Definir a variável CSS do token**: Em `src/app/globals.css`, adicionar `--brand-highlight` nos blocos `:root` e `.dark`. \n   - Valor exato: `oklch(0.637 0.237 25.331)`. Este é o valor literal da paleta nativa do Tailwind v4 para a cor `red-500` (extraído do source `tailwindcss/theme.css`). Usar este valor garante 100% de paridade com a intenção visual atual, aplicando a mesma cor para o modo claro e escuro.\n2. **Registrar o token no Tailwind v4**: O projeto não utiliza `tailwind.config.ts`, pois adota o Tailwind v4 com `@theme inline`. Portanto, adicionar a linha `--color-brand-highlight: var(--brand-highlight);` dentro do bloco `@theme inline` no topo do `globals.css`.\n3. **Aplicar no componente**: Em `src/components/ui/resizable-navbar.tsx` (linha 248), substituir a classe hardcoded `group-hover:text-red-500` pela classe gerada pelo novo token: `group-hover:text-brand-highlight`.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Bug não reproduz mais\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-navbar-logo-hover-cor-hardcoded`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-navbar-logo-hover-cor-hardcoded"
  },
  {
    "id": "navbar-logo-texto-terminal",
    "title": "NavbarLogo — Substituir texto estático por estilo terminal com cursor piscando",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-07-09",
    "priority": "baixa",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 91,
    "progressFraction": {
      "done": 10,
      "total": 11
    },
    "summary": "Substitui o texto estático do logo por um estilo terminal com prompt e cursor piscando.",
    "sections": [
      {
        "heading": "Contexto",
        "content": "O `NavbarLogo` exibe \"Guilherme Menezes\" em texto plano ao lado da foto de perfil na navbar, no estado não-scrollado. O texto é um `<span>` simples sem qualquer estilo visual diferenciado.\n\n```tsx\n// src/components/ui/resizable-navbar.tsx — linhas 247-251\n<span className=\"text-lg font-bold group-hover:text-brand-highlight transition-colors\">\n  {text}\n</span>\n```"
      },
      {
        "heading": "Problema Atual",
        "content": "O texto é genérico e não comunica a identidade de desenvolvedor. \"Guilherme Menezes\" em fonte bold não diferencia visualmente o portfólio de qualquer outro — não aproveita o espaço da navbar para reforçar o posicionamento técnico do dono do portfólio."
      },
      {
        "heading": "Melhoria Proposta",
        "content": "Substituir o `<span>` por um componente de texto com estética de terminal:\n\n```\nguilherme-menezes@home:~$▌\n```\n\n- Texto fixo: `guilherme-menezes@home:~$`\n- Cursor: quadradinho (`▌` ou `█`) piscando em loop, simulando prompt de terminal ativo\n- Fonte: monospace (ex: `font-mono`) para reforçar o estilo de CLI\n- Cursor animado via CSS (`@keyframes blink` ou classe Tailwind `animate-pulse` / animação customizada)"
      },
      {
        "heading": "Impacto Esperado",
        "content": "- Reforço visual imediato do posicionamento como desenvolvedor técnico\n- Diferenciação estética em relação a portfólios genéricos\n- Impacto contido: apenas o `<span>` do nome na navbar desktop (estado não-scrollado)"
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Em `src/components/ui/resizable-navbar.tsx`, atualizar o componente `NavbarLogo` (que agora é usado apenas no desktop) para renderizar a estética de terminal:\n   ```tsx\n   <span className=\"font-mono text-sm md:text-base font-semibold group-hover:text-brand-highlight transition-colors flex items-center\">\n     guilherme-menezes@home:~$\n     <span className=\"ml-[2px] inline-block w-2 h-4 bg-current animate-blink\" />\n   </span>\n   ```\n\n2. Adicionar a animação `animate-blink` no CSS global (`src/app/globals.css` ou via Tailwind config):\n   ```css\n   @keyframes blink {\n     0%, 100% { opacity: 1; }\n     50%       { opacity: 0; }\n   }\n   .animate-blink {\n     animation: blink 1s step-start infinite;\n   }\n   ```\n   *Ou via `tailwind.config` em `theme.extend.animation` e `theme.extend.keyframes`.*\n\n3. Verificar contraste do cursor em modo claro e escuro (`bg-current` acompanha a cor do texto).\n\n4. Como o `MobileNavHeader` foi refatorado recentemente para não usar mais o `NavbarLogo` para o texto central (utilizando uma tag separada), a alteração do `NavbarLogo` afetará exclusivamente o desktop, cumprindo o requisito de manter o layout limpo no mobile."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Texto \"guilherme-menezes@home:~$\" visível na navbar desktop (independente do estado de scroll)\n- [x] Cursor quadrado piscando em loop após o `$`\n- [x] Fonte monospace aplicada corretamente\n- [x] Funciona em modo claro e escuro sem perda de contraste\n- [x] Sem regressão no comportamento de scroll (sumiço do texto ao scrollar) existente\n- [x] Comportamento definido para mobile (aplica ou mantém texto simples)\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Melhoria perceptível e funcional\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-navbar-logo-texto-terminal` e movida para `archive/enhancements/`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-navbar-logo-texto-terminal"
  },
  {
    "id": "navbar-mobile-menu-reorganizacao",
    "title": "Navbar Mobile — Reorganização do menu hambúrguer aberto",
    "category": "enhancements",
    "status": "done",
    "area": "archive",
    "date": "2026-07-09",
    "priority": "média",
    "tags": [
      "frontend",
      "ui-ux"
    ],
    "progress": 60,
    "progressFraction": {
      "done": 6,
      "total": 10
    },
    "summary": "Reorganiza o layout e os elementos do menu mobile para melhorar a navegação.",
    "sections": [
      {
        "heading": "Contexto",
        "content": "O menu mobile (hambúrguer) aberto hoje funciona sem erros, mas o dono do projeto suspeita que o layout pode ser melhorado. Não há comportamento quebrado — é uma questão de UX a ser decidida, ainda sem direção definida."
      },
      {
        "heading": "Problema Atual",
        "content": "Comprovado por evidência visual (print anexado pelo dono do projeto) e por trecho de código real:\n\n- O botão de email ocupa 100% da largura, posicionado abaixo dos toggles de tema/idioma.\n- Os toggles de tema e idioma ficam nas extremidades opostas de uma mesma linha (idioma à esquerda, tema à direita), acima do botão de email.\n- Não há consenso ainda sobre se essa disposição é a ideal — o próprio dono do projeto declarou não saber qual direção de UI/UX tomar."
      },
      {
        "heading": "Contexto Técnico (evidência de código)",
        "content": "Container do menu mobile aberto (`MobileNavMenu`):\n```tsx\nexport const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => {\n  return (\n    <AnimatePresence>\n      {isOpen && (\n        <motion.div\n          initial={{ opacity: 0 }}\n          animate={{ opacity: 1 }}\n          exit={{ opacity: 0 }}\n          className={cn(\n            'absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[...] dark:bg-neutral-950',\n            className,\n          )}\n        >\n          {children}\n        </motion.div>\n      )}\n    </AnimatePresence>\n  )\n}\n```\n\nConteúdo interno, em `Navbar.tsx`:\n```tsx\n<MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>\n  {navItems.map((item) => (\n    <Link\n      key={`mobile-link-${item.name}`}\n      href={item.link}\n      onClick={() => {\n        setIsMobileMenuOpen(false)\n        document.getElementById(item.link.slice(1))?.scrollIntoView({ behavior: 'smooth' })\n      }}\n      className=\"relative text-neutral-600 dark:text-neutral-300 flex gap-2 items-center\"\n    >\n      {item.icon} <span>{item.name}</span>\n    </Link>\n  ))}\n  <div className=\"flex w-full flex-col gap-4\">\n    <div className=\"flex justify-between w-full gap-4\">\n      <LanguageToggle />\n      <ThemeToggle />\n    </div>\n    <Button\n      onClick={() => {\n        setIsMobileMenuOpen(false)\n        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })\n      }}\n      variant=\"default\"\n      className=\"w-full rounded-full\"\n    >\n      <FaEnvelope />\n    </Button>\n  </div>\n</MobileNavMenu>\n```\n\n**Confirmado por trecho real:**\n- O menu é posicionado de forma absoluta (`absolute inset-x-0 top-16`), logo abaixo da navbar fixa.\n- Ordem no DOM (de cima para baixo no fluxo `flex-col`): links de navegação → linha de toggles (idioma/tema) → botão de email.\n- `LanguageToggle` e `ThemeToggle` reaproveitam exatamente os mesmos componentes usados no desktop; o `Button` de email também reaproveita o mesmo componente base, com classes diferentes (`w-full` no mobile vs `rounded-full z-50` no desktop)."
      },
      {
        "heading": "Melhoria Proposta",
        "content": "Esta seção reflete a decisão de UX confirmada pelo dono do projeto, e não uma sugestão da IA:\n- **Header fixo (`MobileNavHeader`), estado FECHADO do menu**: mantém \"foto — 'Portfólio' — ícone hambúrguer\" (a alteração para manter o texto já está coberta pelo bug `docs/bugs/[approved]-navbar-desktop-sobreposicao-botoes-1200px` — esta é apenas uma referência, não duplicar a especificação).\n- **Header fixo, estado ABERTO do menu**: muda para \"foto — texto 'Menu' — Idioma — Tema — X\", todos na mesma linha do topo, nessa ordem da esquerda para a direita. O ícone do botão de fechar (hoje hambúrguer) vira X quando o menu está aberto — isso já é comportamento existente, não muda.\n- **Estrutural**: `LanguageToggle` e `ThemeToggle` devem ser MOVIDOS de dentro do `MobileNavMenu` (onde estão hoje) para dentro do `MobileNavHeader`, aparecendo apenas quando o menu está aberto (não devem aparecer com o menu fechado).\n- **Conteúdo do `MobileNavMenu`** (área que abre/fecha): passa a conter apenas os links de navegação (About, Skills, Experience, Projects, Blogs) e o botão de email (mantém `w-full`, destacado, sem mudança de estilo).\n- **Nota para o futuro**: quando existir o painel administrativo (fase futura do roadmap), pode surgir opção para os toggles aparecerem mesmo com o menu fechado — isso está FORA de escopo deste documento, é apenas contexto para não surpreender quem revisitar isso depois."
      },
      {
        "heading": "Impacto Esperado",
        "content": "A mudança visa reduzir a assimetria percebida hoje (toggles isolados nos cantos, desconectados do botão de fechar) e consolidar ações de \"configuração\" (idioma/tema/fechar) num único agrupamento, deixando o email como a única ação de destaque na área de conteúdo do menu."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Mover os componentes `LanguageToggle` e `ThemeToggle` de dentro do `MobileNavMenu` para dentro do `MobileNavHeader`.\n2. Condicionar a renderização desses dois componentes dentro do `MobileNavHeader` ao estado `isOpen` do menu (só renderizam quando `isOpen` é `true`).\n3. Ajustar o texto do `NavbarLogo` (ou equivalente) dentro do header para alternar entre \"Portfólio\" (fechado) e \"Menu\" (aberto), dependendo do mesmo estado `isOpen`.\n4. Verificar que o ícone de hambúrguer/X já responde a esse mesmo estado (parece já ser o comportamento atual — confirmar com trecho de código antes de assumir).\n5. Remover os toggles do bloco de ações dentro do `MobileNavMenu`, deixando apenas o botão de email.\n6. Validar visualmente que a linha do header (foto + Menu + Idioma + Tema + X) não quebra ou aperta em larguras mobile pequenas (ex: 320-375px) — isso é uma nova área de risco de sobreposição que não existia antes."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Header fechado mostra \"Portfólio\".\n- [x] Header aberto mostra \"Menu\" + toggles + X.\n- [x] Toggles não aparecem com o menu fechado.\n- [x] Email mantém destaque isolado na área do menu.\n- [x] Sem quebra ou sobreposição de elementos na linha do header em larguras pequenas (320-375px).\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Melhoria perceptível e funcional\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-navbar-mobile-menu-reorganizacao`**"
      }
    ],
    "path": "docs/archive/enhancements/[done]-navbar-mobile-menu-reorganizacao"
  },
  {
    "id": "admin-rota-idioma-para-language",
    "title": "Renomear rota admin /idioma para /language",
    "category": "refactoring",
    "status": "done",
    "area": "archive",
    "date": "2026-09-14",
    "priority": "baixa",
    "tags": [
      "frontend",
      "dx"
    ],
    "progress": 92,
    "progressFraction": {
      "done": 11,
      "total": 12
    },
    "summary": "Rota /admin/idioma renomeada para /admin/language para seguir a convenção em inglês adotada para todas as rotas e pastas do projeto.",
    "sections": [
      {
        "heading": "Motivação",
        "content": "O usuário definiu que futuramente todas as rotas e pastas do projeto serão em inglês. A rota `/admin/idioma` foi criada em português durante a Fase 3.2.1 e precisava ser alinhada à convenção antes de avançar para a Fase 3.2.2."
      },
      {
        "heading": "Situação Atual",
        "content": "- Pasta: `src/app/admin/(dashboard)/idioma/`\n- Referência no dashboard: `href: '/admin/idioma'`\n- Referência no `SidebarNav`: `/admin/language` (criado já no padrão correto)"
      },
      {
        "heading": "Situação Desejada",
        "content": "- Pasta: `src/app/admin/(dashboard)/language/`\n- Referência no dashboard: `href: '/admin/language'`\n- Breadcrumb: segmento `language` mapeado para label `\"Traduções\"`\n- Sidebar: item já criado com `/admin/language`"
      },
      {
        "heading": "Riscos",
        "content": "Baixo — a rota ainda não foi linkada externamente. Mudança puramente interna."
      },
      {
        "heading": "Estratégia de Execução",
        "content": "1. Mover pasta `(dashboard)/idioma/` → `(dashboard)/language/` via `Move-Item`\n2. Atualizar `href` no `page.tsx` do dashboard\n3. Confirmar que nenhuma outra referência a `/admin/idioma` existe no `src/`\n4. Limpar cache `.next/types` e validar com `tsc --noEmit`"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Pasta movida para `(dashboard)/language/`\n- [x] Href atualizado no `page.tsx`\n- [x] Zero ocorrências de `/admin/idioma` no código (`grep` confirmado)\n- [x] `tsc --noEmit` sem erros\n\n---"
      },
      {
        "heading": "Validação",
        "content": "- [x] Rota `/admin/language` acessível e funcional (testado no navegador com print comprovado)\n- [x] Rota `/admin/idioma` não existe mais (removida do disco e do git)\n- [x] Sidebar exibe \"Traduções\" com link correto para `/admin/language`\n- [x] Breadcrumb exibe \"Traduções\" ao acessar a rota\n- [x] Nenhuma regressão em outras rotas do admin\n- [x] Mover para `archive/refactoring/` após aprovação do teste pelo usuário"
      }
    ],
    "path": "docs/archive/refactoring/[done]-admin-rota-idioma-para-language"
  },
  {
    "id": "deploy-automatico-github-actions",
    "title": "Deploy Automático via GitHub Actions (SSH na VPS)",
    "category": "refactoring",
    "status": "done",
    "area": "archive",
    "date": "2026-08-30",
    "priority": "alta",
    "tags": [
      "infra"
    ],
    "progress": 89,
    "progressFraction": {
      "done": 8,
      "total": 9
    },
    "summary": "Migração do mecanismo de deploy automático para GitHub Actions via SSH com rebuild sem cache.",
    "sections": [
      {
        "heading": "Motivação",
        "content": "O mecanismo de GitOps nativo do Portainer Community (versão gratuita) possui uma limitação confirmada: ao usar `build: .` no `docker-compose.yml`, o webhook recria o container reaproveitando a imagem local em cache, sem forçar um novo build do código atualizado. Os recursos de \"Force redeployment\" e \"Re-pull image\" são exclusivos da versão Business paga do Portainer. Para garantir deploys automáticos confiáveis a cada push na branch `main`, migrou-se a responsabilidade do deploy para o GitHub Actions executando comandos diretamente na VPS via SSH."
      },
      {
        "heading": "Situação Atual",
        "content": "- O deploy automático dependia do Webhook GitOps do Portainer CE, que não invalidava o cache do build Docker local na VPS.\n- Alterações recentes no código não eram refletidas em produção após o push sem rebuild manual via terminal."
      },
      {
        "heading": "Situação Desejada",
        "content": "- Workflow [`deploy.yml`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/.github/workflows/deploy.yml) no GitHub Actions acionado a cada push na branch `main`.\n- A action `appleboy/ssh-action@v1.2.2` conecta via SSH na VPS usando credenciais seguras armazenadas em GitHub Secrets (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PROJECT_PATH`).\n- Execução direta dos comandos `git pull origin main`, `docker compose build --no-cache` e `docker compose up -d --force-recreate` no diretório do projeto."
      },
      {
        "heading": "Riscos",
        "content": "- **Trade-off de Segurança:** O usuário dedicado `deploy-bot` na VPS pertence ao grupo `docker` para ter permissão de gerenciar containers, o que concede acesso equivalente a root na máquina. Mitigado isolando a chave SSH apenas no GitHub Secrets do repositório e restringindo o escopo das tarefas.\n- **Dependência de Secrets:** Se algum secret (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PROJECT_PATH`) estiver incorreto ou ausente, o pipeline falhará no step de conexão SSH."
      },
      {
        "heading": "Estratégia de Execução",
        "content": "1. Criação do workflow [`.github/workflows/deploy.yml`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/.github/workflows/deploy.yml) com a action `appleboy/ssh-action@v1.2.2`.\n2. Configuração dos 4 Secrets no repositório GitHub pelo dono do projeto (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PROJECT_PATH`).\n3. Commit e push para validação da execução do workflow na aba Actions do GitHub.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Workflow `.github/workflows/deploy.yml` criado com sintaxe válida e action `appleboy/ssh-action@v1.2.2`\n- [x] Comandos de deploy configurados com `build --no-cache` e `up -d --force-recreate`\n- [x] Nenhum segredo ou dado sensível exposto em texto puro no repositório\n- [x] Execução do workflow confirmada com sucesso (verde) na aba Actions do GitHub após configuração dos Secrets\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Execução do pipeline no GitHub Actions concluída com sucesso\n- [x] Site em produção atualizado com as alterações mais recentes da branch `main`\n- [x] **Pasta renomeada para `[done]-deploy-automatico-github-actions` e movida para `archive/refactoring/`**"
      }
    ],
    "path": "docs/archive/refactoring/[done]-deploy-automatico-github-actions"
  },
  {
    "id": "dockerizacao-standalone",
    "title": "Fase 1: Dockerização (Next.js Standalone) do Guilherme-Portifólio",
    "category": "refactoring",
    "status": "done",
    "area": "archive",
    "date": "2026-08-27",
    "priority": "alta",
    "tags": [
      "infra",
      "frontend"
    ],
    "progress": 92,
    "progressFraction": {
      "done": 12,
      "total": 13
    },
    "summary": "Dockerização do Next.js em modo standalone, correção de runtime na API de contato e criação de compose para Portainer GitOps.",
    "sections": [
      {
        "heading": "Motivação",
        "content": "Preparar a infraestrutura de deploy do Guilherme-Portifólio para execução em container Docker único na VPS, utilizando o modo `output: 'standalone'` do Next.js para manter a imagem leve e compatível com a stack GitOps nativa do Portainer via Webhook, sem depender de deploys manuais via SSH."
      },
      {
        "heading": "Situação Atual",
        "content": "- A rota [`src/app/api/contact/route.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/api/contact/route.ts) possuía `export const runtime = 'edge'`, que restringia APIs de Node e era desnecessário para self-hosting em Docker/VPS.\n- O [`next.config.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/next.config.ts) não gerava bundle autocontido (`output: 'standalone'`).\n- O projeto não possuía `Dockerfile`, `.dockerignore` e `docker-compose.yml` padronizados para o deploy da stack."
      },
      {
        "heading": "Situação Desejada",
        "content": "- `src/app/api/contact/route.ts` executando no runtime Node padrão.\n- `next.config.ts` configurado com `output: 'standalone'`, gerando `.next/standalone` com dependências enxutas e `server.js`.\n- `Dockerfile` multi-stage (`deps`, `builder`, `runner`) com usuário não-root `nextjs` e porta 3000 exposta.\n- `.dockerignore` configurado excluindo arquivos `.env*`, `.git`, `node_modules`, `.next`, `docs/` e `dev/`.\n- `docker-compose.yml` configurado com `127.0.0.1:3000:3000` (porta isolada para Nginx de borda), `RESEND_API_KEY` injetada por variável de ambiente e healthcheck via `wget`."
      },
      {
        "heading": "Riscos",
        "content": "- Risco de arquivos estáticos (CSS, JS, PDF) retornarem 404 em runtime standalone caso `public` e `.next/static` não fossem copiados: mitigado no `Dockerfile` com instruções explícitas de cópia (`COPY --from=builder /app/public ./public` e `COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static`).\n- Risco de quebra no renderizador de PDF (`react-pdf` / `pdfjs-dist`): testado e validado visualmente via navegador."
      },
      {
        "heading": "Estratégia de Execução",
        "content": "1. **Parte 0 — Remoção do Runtime Edge:**\n   - Remoção de `export const runtime = 'edge'` em `src/app/api/contact/route.ts` e `src/app/api/hello/route.ts`.\n2. **Parte 1 — Output Standalone:**\n   - Adição de `output: 'standalone'` em `next.config.ts`.\n   - Ajuste em `tsconfig.json` para ignorar pastas auxiliares `dev` e `docs` na checagem de tipos do build.\n   - Ajuste no tipo de transição do `resizable-navbar.tsx` com `as const`.\n3. **Parte 2 & 3 — Dockerfile e .dockerignore:**\n   - Criação do `Dockerfile` multi-stage com `node:20-alpine` e `npm ci` (confirmado `package-lock.json`).\n   - Criação do `.dockerignore`.\n4. **Parte 4 — Docker Compose:**\n   - Criação do `docker-compose.yml` com binding `127.0.0.1:3000:3000` e injeção de `${RESEND_API_KEY}`.\n5. **Validação:**\n   - Build de produção via `npm run build` gerando `.next/standalone/server.js`.\n   - Execução do servidor standalone em porta local (`3005`) com os assets estáticos mapeados.\n   - Validação visual completa via navegador de todas as seções (Hero, Skills, Timeline, PDF Viewer do Resume, Projects Mock e Blogs Mock).\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Linha `export const runtime = 'edge'` removida de `src/app/api/contact/route.ts`\n- [x] `output: 'standalone'` adicionado ao `next.config.ts`\n- [x] `npm run build` executado com sucesso gerando `.next/standalone/server.js`\n- [x] `Dockerfile` multi-stage criado na raiz\n- [x] `.dockerignore` criado excluindo segredos, dependências e documentação\n- [x] `docker-compose.yml` criado com binding local `127.0.0.1:3000:3000`\n- [x] Validação visual do servidor standalone com renderização do currículo em PDF realizada via navegador\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Build standalone gerado e funcional\n- [x] Todas as páginas e renderizador de PDF carregam visualmente sem erros\n- [x] Arquivos Dockerfile, docker-compose.yml e .dockerignore prontos para a stack do Portainer\n- [x] **Pasta renomeada para `[done]-dockerizacao-standalone` e movida para `archive/refactoring/`**"
      }
    ],
    "path": "docs/archive/refactoring/[done]-dockerizacao-standalone"
  },
  {
    "id": "migracao-porta-vps-8083",
    "title": "Migração da Porta do Portfólio na VPS (3000 -> 8083)",
    "category": "refactoring",
    "status": "done",
    "area": "archive",
    "date": "2026-08-31",
    "priority": "alta",
    "tags": [
      "infra"
    ],
    "progress": 93,
    "progressFraction": {
      "done": 13,
      "total": 14
    },
    "summary": "Migração da porta exposta no host da VPS de 3000 para 8083 com proxy_pass do Nginx e zero downtime.",
    "sections": [
      {
        "heading": "Motivação",
        "content": "A porta `3000` é uma porta padrão frequentemente utilizada para desenvolvimento ou outros serviços. Para evitar conflitos de portas na VPS e padronizar o mapeamento de portas dos serviços locais gerenciados pelo Nginx de borda, o Guilherme-Portifólio foi migrado para escutar na porta `8083` do host (`127.0.0.1:8083:3000`), liberando totalmente a porta 3000."
      },
      {
        "heading": "Situação Atual",
        "content": "- O `docker-compose.yml` da VPS e o Nginx apontavam para `127.0.0.1:3000:3000`."
      },
      {
        "heading": "Situação Desejada",
        "content": "- `docker-compose.yml` configurado com `127.0.0.1:8083:3000`.\n- Configuração do Nginx (`/etc/nginx/sites-available/guilhermemenezes.dev`) atualizada com `proxy_pass http://127.0.0.1:8083;`.\n- Porta 3000 liberada na VPS e serviço respondendo 100% com HTTPS e zero downtime.\n- Sem qualquer impacto ou regressão no `tb-portifolio` (`thiagobahlsportfolio.com`)."
      },
      {
        "heading": "Riscos",
        "content": "- Risco de downtime durante a troca: mitigado subindo o container na nova porta antes de aplicar `sudo systemctl reload nginx` (reload gracioso sem `restart`)."
      },
      {
        "heading": "Estratégia de Execução",
        "content": "1. Atualização do `docker-compose.yml` no repositório e na VPS (`127.0.0.1:8083:3000`).\n2. Ajuste do `proxy_pass` no Nginx para `http://127.0.0.1:8083;` e teste de sintaxe (`nginx -t`).\n3. Recriação do container com `docker compose up -d --force-recreate`.\n4. Validação direta via `curl` na porta `8083`, teste no domínio HTTPS e reload do Nginx.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] `docker-compose.yml` atualizado para binding `127.0.0.1:8083:3000`\n- [x] Nginx testado com sintaxe válida (`nginx -t`) e reloaded com sucesso\n- [x] Container recriado e em estado saudável (`Up (healthy)`)\n- [x] Domínio `https://guilhermemenezes.dev` respondendo HTTP 200 OK com HTTPS\n- [x] Porta 3000 confirmada como liberada (`Connection refused`)\n- [x] Validação de não-regressão no `tb-portifolio` (`https://thiagobahlsportfolio.com` HTTP 200 OK)\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Resposta direta na porta nova: `curl -I http://127.0.0.1:8083` -> `HTTP/1.1 200 OK`\n- [x] Domínio principal: `curl -I https://guilhermemenezes.dev` -> `HTTP/1.1 200 OK`\n- [x] Rota de PDF do currículo: `curl -I https://guilhermemenezes.dev/resume.pdf` -> `HTTP/1.1 200 OK` (163KB)\n- [x] Porta 3000 liberada: `curl -I http://127.0.0.1:3000` -> `Failed to connect (Connection refused)`\n- [x] Não-regressão confirmada: `curl -I https://thiagobahlsportfolio.com` -> `HTTP/1.1 200 OK`\n- [x] **Pasta arquivada diretamente em `archive/refactoring/[done]-migracao-porta-vps-8083/`**"
      }
    ],
    "path": "docs/archive/refactoring/[done]-migracao-porta-vps-8083"
  },
  {
    "id": "padronizar-rotas-portugues-para-ingles",
    "title": "Padronizar rotas restantes do admin para inglês",
    "category": "refactoring",
    "status": "done",
    "area": "archive",
    "date": "2026-10-28",
    "priority": "média",
    "tags": [
      "frontend",
      "dx"
    ],
    "progress": 71,
    "progressFraction": {
      "done": 10,
      "total": 14
    },
    "summary": "Renomear os segmentos /admin/curriculo e /admin/projetos para URLs em inglês e impedir novas rotas em português.",
    "sections": [
      {
        "heading": "Motivação",
        "content": "O painel administrativo adotou inglês para segmentos de URL e nomes de pastas que viram rotas. A migração de `/admin/idioma` para `/admin/language` foi concluída, mas o inventário somente leitura de 2026-10-28 encontrou dois segmentos ainda expostos em português: `/admin/curriculo` e `/admin/projetos`. Consolidar a convenção agora reduz inconsistência, evita novos links divergentes e prepara os próximos módulos do painel.\n\nLabels visíveis, títulos e conteúdo podem continuar em português. Este refactoring trata apenas de segmentos técnicos de URL e das pastas do App Router que os produzem."
      },
      {
        "heading": "Situação Atual",
        "content": "Rotas vigentes em português confirmadas no código:\n\n- `/admin/curriculo`, produzida por `src/app/admin/(dashboard)/curriculo/page.tsx`.\n- `/admin/projetos`, produzida por `src/app/admin/(dashboard)/projetos/page.tsx`.\n\nReferências runtime confirmadas:\n\n- `src/app/admin/(dashboard)/page.tsx:54` aponta para `/admin/curriculo`.\n- `src/app/admin/(dashboard)/page.tsx:63` aponta para `/admin/projetos`.\n- `src/app/admin/(dashboard)/components/SidebarNav.tsx:21-22` contém os mesmos destinos.\n- `src/app/admin/(dashboard)/components/Breadcrumb.tsx:11-12` reconhece os segmentos `curriculo` e `projetos`.\n\n`/admin/language` já está em inglês. `/admin/idioma` não é rota vigente e pertence apenas ao histórico do refactoring concluído; não integra esta migração.\n\nO middleware preserva qualquer pathname protegido no cookie `admin_redirect` (`src/middleware.ts:27-34` e `src/middleware.ts:92-100`). Esse destino reaparece após login ou 2FA em `src/middleware.ts:51-69` e `src/app/api/admin/redirect-target/route.ts:8-23`, portanto deep-linking precisa ser testado durante a troca."
      },
      {
        "heading": "Situação Desejada",
        "content": "- Pasta `src/app/admin/(dashboard)/curriculo/` renomeada para `resume/`, expondo `/admin/resume`.\n- Pasta `src/app/admin/(dashboard)/projetos/` renomeada para `projects/`, expondo `/admin/projects`.\n- Dashboard, SidebarNav e Breadcrumb atualizados para os novos segmentos.\n- Fluxos de login, cookie `admin_redirect`, 2FA e acesso direto preservam corretamente os destinos ingleses.\n- Nenhuma pasta sob `src/app` que gere URL usa segmento em português.\n- Labels visíveis continuam independentes da convenção técnica e podem permanecer em português."
      },
      {
        "heading": "Riscos",
        "content": "- Bookmarks e links antigos para `/admin/curriculo` e `/admin/projetos` deixam de funcionar se a migração for tratada como breaking change sem redirects.\n- Um cookie `admin_redirect` gravado antes da implantação pode conter uma URL antiga e redirecionar o usuário para um destino removido após login ou 2FA.\n- Auth.js, middleware e 2FA preservam pathnames dinamicamente; a renomeação pode parecer correta na navegação normal e ainda falhar em deep-linking.\n- Documentação histórica contém URLs antigas e não deve ser alterada indiscriminadamente nem confundida com referência runtime.\n- O card arquivado `admin-rota-idioma-para-language` é precedente da convenção, mas não deve ser reaberto nem sobrepor o novo escopo.\n- Deve ser decidido em review humano se as URLs antigas receberão redirect permanente/temporário ou se a mudança será intencionalmente incompatível."
      },
      {
        "heading": "Estratégia de Execução",
        "content": "1. Definir em review se `/admin/curriculo` e `/admin/projetos` terão redirects de compatibilidade ou serão removidas sem fallback.\n2. Renomear as pastas para `resume/` e `projects/`, com propriedade exclusiva por arquivo e sem misturar labels visíveis com segmentos técnicos.\n3. Atualizar os destinos em `src/app/admin/(dashboard)/page.tsx` e `src/app/admin/(dashboard)/components/SidebarNav.tsx`.\n4. Atualizar as chaves de segmento em `src/app/admin/(dashboard)/components/Breadcrumb.tsx`, preservando os labels apresentados ao usuário.\n5. Auditar `src/middleware.ts`, `src/app/api/admin/redirect-target/route.ts`, `src/app/api/admin/2fa/verify/route.ts`, `src/app/api/admin/2fa/confirm-sensitive-action/route.ts`, `src/app/admin/login/LoginForm.tsx` e `src/auth.config.ts` quanto a deep-linking e contratos de redirect; alterar somente se existir referência ou comportamento incompatível comprovado.\n6. Verificar TypeScript/build e executar smoke tests locais com acesso direto, navegação, login e 2FA, cobrindo destino preservado no cookie.\n7. Confirmar por busca runtime que `/admin/curriculo` e `/admin/projetos` não permanecem, exceto em redirects explicitamente aprovados ou documentação histórica."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] `/admin/resume` substitui `/admin/curriculo` e renderiza o mesmo conteúdo autorizado.\n- [ ] `/admin/projects` substitui `/admin/projetos` e renderiza o mesmo conteúdo autorizado.\n- [x] Dashboard, SidebarNav e Breadcrumb usam os novos segmentos sem alterar indevidamente os labels visíveis.\n- [x] Nenhuma pasta ou segmento de URL em português permanece sob `src/app`.\n- [x] Busca no código runtime não encontra `/admin/curriculo` nem `/admin/projetos`, salvo redirects legados explicitamente aprovados.\n- [ ] Acesso direto, login, middleware, 2FA e deep-linking preservam corretamente `/admin/resume` e `/admin/projects`.\n- [x] A estratégia para URLs antigas foi decidida e testada: breaking change intencional, sem redirects legados, seguindo o precedente `/admin/idioma` → `/admin/language`; sem autenticação, as URLs antigas são interceptadas pelo middleware e redirecionadas ao login antes da resolução da rota.\n- [x] TypeScript e build terminam sem erro atribuível à migração.\n\n---"
      },
      {
        "heading": "Validação",
        "content": "O humano informou em 2026-10-28: “Testado e aprovado, pode marcar como done”. O QA autenticado confirmou que o deep-linking preserva `/admin/resume` após o login; o ambiente publicado ainda servia o build anterior, com `/admin/resume` e `/admin/projects` em HTTP 404 e `/admin/curriculo` e `/admin/projetos` em HTTP 200. A decisão humana aprova o card apesar da necessidade de publicação posterior para revalidar o build novo.\n\n- [x] Comportamento idêntico ao anterior\n- [x] Nenhuma regressão identificada no escopo deste card\n- [x] Dívida técnica removida\n- [x] **Pasta renomeada para `[done]-padronizar-rotas-portugues-para-ingles` e movida para `archive/refactoring/`**"
      }
    ],
    "path": "docs/archive/refactoring/[done]-padronizar-rotas-portugues-para-ingles"
  },
  {
    "id": "preparar-repositorio-publico",
    "title": "Preparar Repositório para Publicação Pública",
    "category": "refactoring",
    "status": "done",
    "area": "archive",
    "date": "2026-08-26",
    "priority": "alta",
    "tags": [
      "infra",
      "segurança",
      "frontend"
    ],
    "progress": 93,
    "progressFraction": {
      "done": 13,
      "total": 14
    },
    "summary": "Varredura de segurança completa no histórico/código, mock de Projects/Blogs em grade e atualização de README.md e LICENSE (MIT).",
    "sections": [
      {
        "heading": "Motivação",
        "content": "O repositório do portfólio será tornado público no GitHub. Antes da abertura, é fundamental garantir que nenhum segredo, chave de API ou credencial esteja presente no código ou no histórico do git, que os dados de template de terceiros em Projects e Blogs sejam substituídos por dados mock explícitos (\"Projeto Mock 1..5\", \"Post Mock 1..3\") mantendo a grade visual idêntica ao design original, e que o `README.md` principal do repositório e o arquivo `LICENSE` (MIT) estejam devidamente configurados e alinhados."
      },
      {
        "heading": "Situação Atual",
        "content": "- **Varredura de Segurança (Confirmada):** Nenhum arquivo `.env` está rastreado no git (`.gitignore` cobre `.env*`, `*.pem`, `.dev.vars*`, `/dev/`, `/.github/`). A rota de envio de emails (`src/app/api/contact/route.ts`) lê `process.env.RESEND_API_KEY` exclusivamente via variável de ambiente. A varredura profunda no histórico completo de commits (`git log -p`) resultou em **zero segredos encontrados**.\n- **Tentativa anterior de conteúdo (refutada pelo usuário):** Substituição da grade de Projects e Blogs por um único card centralizado \"Em Breve\" — testado, resultado: rejeitado pelo usuário, pois descaracterizava o layout e a quantidade de cards do design original.\n- **Abordagem de Conteúdo (Implementada):**\n  - `Projects.tsx`: 5 cards no layout `BentoGrid` original (`md:col-span-2` no card 4), com títulos `Projeto Mock 1` a `Projeto Mock 5`, descrições demonstrativas, mock previews com borda pontilhada e botões sem navegação externa.\n  - `Blogs.tsx`: 3 tiles no layout de lista original, com títulos `Post Mock 1` a `Post Mock 3`, resumos e modal dialog funcional para leitura.\n- **Documentação do Repositório (Implementada):**\n  - `README.md` raiz atualizado com informações profissionais, links reais de contato, link do site ao vivo, aviso explícito sobre dados mock e instrução de execução.\n  - `LICENSE` criado na raiz do repositório com licença MIT padrão (Copyright 2026 Guilherme Menezes)."
      },
      {
        "heading": "Situação Desejada",
        "content": "- Repositório auditado e limpo, sem segredos no histórico ou no código.\n- As seções Projects e Blogs mantêm o layout em grade com múltiplos cards intacto, com dados mock explícitos e sem links/dados de templates externos.\n- `README.md` e `LICENSE` da raiz prontos para o repositório público.\n- Seções Experience, Skills, Hero e Navbar mantidas sem alterações ou regressões."
      },
      {
        "heading": "Riscos",
        "content": "- Links quebrados em mocks: mitigado usando `href=\"#\"` com `onClick={e => e.preventDefault()}` e `cursor-default`."
      },
      {
        "heading": "Estratégia de Execução",
        "content": "1. **Varredura de Segurança:**\n   - Varredura de histórico e arquivos rastreados já concluída e validada (zero segredos).\n2. **Implementação dos Mocks em Grade:**\n   - [`src/components/main/Projects.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Projects.tsx): 5 cards mock em `BentoGrid`.\n   - [`src/components/main/Blogs.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Blogs.tsx): 3 posts mock com modal dialog.\n3. **Atualização do README e LICENSE:**\n   - [`README.md`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/README.md): Atualizado com a nova apresentação e nota sobre os mocks.\n   - [`LICENSE`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/LICENSE): Criado arquivo com licença MIT.\n4. **Validação:**\n   - Verificação visual de UI via browser em `http://localhost:3000`.\n   - Verificação da integridade dos links e da formatação do Markdown.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Varredura de segurança no histórico do git e código atual concluída com zero segredos encontrados\n- [x] `Projects.tsx` restaurado em grade BentoGrid com 5 itens mock\n- [x] `Blogs.tsx` restaurado em lista com 3 posts mock e modal interativo\n- [x] Nomes/links de projetos de template externos removidos completamente\n- [x] `README.md` raiz atualizado com nova apresentação, aviso de mock e links corretos\n- [x] `LICENSE` MIT adicionado na raiz\n- [x] Demais seções (Hero, Skills, Experience, Navbar, Contato) sem regressões\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Comportamento e grade visual idênticos ao layout original\n- [x] Nenhuma vulnerabilidade ou segredo exposto\n- [x] Conteúdo de template de terceiros substituído por mock óbvio\n- [x] Documentação e licença MIT configuradas na raiz\n- [x] **Pasta renomeada para `[done]-preparar-repositorio-publico` e movida para `archive/refactoring/`**"
      }
    ],
    "path": "docs/archive/refactoring/[done]-preparar-repositorio-publico"
  },
  {
    "id": "remover-env-d-ts-cloudflare",
    "title": "Remover env.d.ts gerado pelo Wrangler (resquício do Cloudflare)",
    "category": "refactoring",
    "status": "done",
    "area": "archive",
    "date": "2026-07-09",
    "priority": "baixa",
    "tags": [
      "infra",
      "dx",
      "dependências"
    ],
    "progress": 78,
    "progressFraction": {
      "done": 7,
      "total": 9
    },
    "summary": "Remove tipagens obsoletas de env.d.ts do Cloudflare melhorando o setup TypeScript.",
    "sections": [
      {
        "heading": "Motivação",
        "content": "Durante a limpeza de dependências do Cloudflare (remoção de `@opennextjs/cloudflare`, `wrangler` e scripts órfãos do `package.json`), foi identificado que o arquivo `env.d.ts` é um resquício direto dessa stack. Ele foi gerado pelo comando `wrangler types` e contém ~5.769 linhas de tipos do runtime Cloudflare Workers (`workerd`) que não têm relação com o projeto atual (Next.js em VPS).\n\nBusca por `CloudflareEnv` em todo o projeto confirma: o tipo é declarado no arquivo mas **nunca importado ou referenciado em nenhum arquivo de código-fonte** (`src/`)."
      },
      {
        "heading": "Situação Atual",
        "content": "O arquivo `env.d.ts` (238 KB, 5.769 linhas) contém:\n- Linha 2: comentário de geração pelo `wrangler types`\n- Linha 4–7: `namespace Cloudflare { interface Env {} }`\n- Linha 8: `interface CloudflareEnv extends Cloudflare.Env {}`\n- Linhas 10–5769: tipos do runtime `workerd@1.20250604.0` (Cloudflare Workers)\n\n```ts\n// env.d.ts — gerado por wrangler, não usado pelo projeto\n// Generated by Wrangler by running `wrangler types --env-interface CloudflareEnv ./env.d.ts`\ndeclare namespace Cloudflare { interface Env {} }\ninterface CloudflareEnv extends Cloudflare.Env {}\n// ... 5760 linhas de tipos do Cloudflare Workers runtime ...\n```"
      },
      {
        "heading": "Situação Desejada",
        "content": "O `env.d.ts` é removido. O `tsconfig.json` não o referencia explicitamente (é incluído por glob `**/*.d.ts`), então a remoção é limpa — o TypeScript simplesmente para de incluir esses tipos, sem efeito colateral para o código do projeto."
      },
      {
        "heading": "Riscos",
        "content": "- **Baixo.** Nenhum arquivo em `src/` usa `CloudflareEnv` ou qualquer tipo exclusivo do Cloudflare Workers runtime.\n- Verificar antes da execução: rodar `tsc --noEmit` antes e depois da remoção para confirmar que nenhum erro de tipo surge."
      },
      {
        "heading": "Estratégia de Execução",
        "content": "1. Verificar `tsconfig.json` — confirmar que `env.d.ts` não está listado explicitamente em `include` ou `files`\n2. Rodar `npx tsc --noEmit` para registrar o estado atual (zero erros esperados)\n3. Remover `env.d.ts`\n4. Rodar `npx tsc --noEmit` novamente — confirmar zero erros\n5. Commit com mensagem: `chore: remove env.d.ts (wrangler/cloudflare leftover)`"
      },
      {
        "heading": "Evidências de Validação",
        "content": "### 1. Diff do tsconfig.json\nA alteração feita manualmente removeu apenas a linha `./env.d.ts` de `compilerOptions.types`. O Next.js (na versão 16 + Turbopack) reconfigurou automaticamente o arquivo ao rodar o build, alterando a diretiva `jsx` para `\"react-jsx\"` e inserindo `\".next/dev/types/**/*.ts\"` no `include`.\nO log bruto do build comprova essa ação automática do framework:\n```\n  We detected TypeScript in your project and reconfigured your tsconfig.json file for you.\n  The following suggested values were added to your tsconfig.json. These values can be changed to fit your project's needs:\n\n  \t- include was updated to add '.next/dev/types/**/*.ts'\n\n  The following mandatory changes were made to your tsconfig.json:\n\n  \t- jsx was set to react-jsx (next.js uses the React automatic runtime)\n```\n\n### 2. tsc --noEmit Pós-Remoção\nNenhum erro de tipo detectado (comando retornou com sucesso e saída vazia):\n```bash\n$ npx tsc --noEmit\n# (Saída vazia)\n```\n\n### 3. Build de Produção com Sucesso\n```bash\n$ npm run build\n# (Compilação Turbopack com sucesso em 5.1s, TypeScript compilado sem erros em 4.8s)\n```\n\n### 4. Ausência de Referências (Grep)\nUma busca global por `CloudflareEnv` retornou 0 ocorrências fora do escopo deste README de refatoração, atestando que a tipagem estava 100% órfã.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] `env.d.ts` removido do repositório\n- [x] `tsc --noEmit` sem erros após a remoção\n- [x] Nenhum arquivo em `src/` afetado"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Comportamento idêntico ao anterior\n- [x] Nenhuma regressão identificada\n- [x] Dívida técnica removida\n- [x] **Pasta renomeada para `[done]-remover-env-d-ts-cloudflare`**"
      }
    ],
    "path": "docs/archive/refactoring/[done]-remover-env-d-ts-cloudflare"
  },
  {
    "id": "remover-workflows-legados",
    "title": "Remover Workflows Legados (ci.yaml, cd.yaml, issue-bot.yaml)",
    "category": "refactoring",
    "status": "done",
    "area": "archive",
    "date": "2026-08-30",
    "priority": "baixa",
    "tags": [
      "infra",
      "dx"
    ],
    "progress": 89,
    "progressFraction": {
      "done": 8,
      "total": 9
    },
    "summary": "Remoção dos workflows legados e quebrados (ci.yaml, cd.yaml, issue-bot.yaml) mantendo apenas deploy.yml.",
    "sections": [
      {
        "heading": "Motivação",
        "content": "O repositório possuía 3 workflows herdados de templates anteriores (`cd.yaml`, `ci.yaml` e `issue-bot.yaml`) que não refletiam a arquitetura atual do projeto. O `cd.yaml` tentava realizar deploy para o Cloudflare Pages (infraestrutura não mais utilizada), o `ci.yaml` falhava devido a incompatibilidades de flags e actions deprecadas (CodeQL v2), e o `issue-bot.yaml` era desnecessário. Essas execuções geravam notificações de erro falsas a cada push no GitHub."
      },
      {
        "heading": "Situação Atual",
        "content": "- Existência de múltiplos workflows legados gerando falhas nos checks do GitHub.\n- Apenas [`.github/workflows/deploy.yml`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/.github/workflows/deploy.yml) (SSH direto na VPS) é o mecanismo oficial e funcional de deploy."
      },
      {
        "heading": "Situação Desejada",
        "content": "- Workflows `cd.yaml`, `ci.yaml` e `issue-bot.yaml` removidos de `.github/workflows/`.\n- Apenas `deploy.yml` mantido em `.github/workflows/`."
      },
      {
        "heading": "Riscos",
        "content": "- Nenhum risco para a aplicação ou para o fluxo de deploy oficial, já que o deploy em produção depende exclusivamente de `deploy.yml`."
      },
      {
        "heading": "Estratégia de Execução",
        "content": "1. Remoção dos arquivos `ci.yaml`, `cd.yaml` e `issue-bot.yaml`.\n2. Validação da listagem de arquivos no diretório `.github/workflows/` (apenas `deploy.yml`).\n3. Commit e push para o repositório remoto.\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] Arquivo `.github/workflows/cd.yaml` removido\n- [x] Arquivo `.github/workflows/ci.yaml` removido\n- [x] Arquivo `.github/workflows/issue-bot.yaml` removido\n- [x] Arquivo `.github/workflows/deploy.yml` preservado intacto\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Listagem de `.github/workflows/` confirmada contendo exclusivamente `deploy.yml`\n- [x] Push realizado e verificado na aba Actions do GitHub que apenas \"Deploy to VPS\" executa\n- [x] **Pasta renomeada para `[done]-remover-workflows-legados` e movida para `archive/refactoring/`**"
      }
    ],
    "path": "docs/archive/refactoring/[done]-remover-workflows-legados"
  },
  {
    "id": "sqlite-persistencia-inicial",
    "title": "Introdução do SQLite e Persistência via Volume Docker",
    "category": "refactoring",
    "status": "done",
    "area": "archive",
    "date": "2026-08-31",
    "priority": "alta",
    "tags": [
      "backend",
      "infra",
      "banco"
    ],
    "progress": 91,
    "progressFraction": {
      "done": 10,
      "total": 11
    },
    "summary": "Introduzir SQLite como primeiro banco de dados do projeto, com volume Docker persistente, como base para autenticação e futuras fases de CRUD.",
    "sections": [
      {
        "heading": "Depende de",
        "content": "Nenhum card anterior — esta é a base de infraestrutura para os demais."
      },
      {
        "heading": "Motivação",
        "content": "O painel admin (próximos cards desta mesma fase) precisa persistir dados que não existiam até agora no projeto: o secret TOTP do 2FA, e futuramente (Fases 4+) o próprio conteúdo editável do site (Hero, Skills, Currículo, Projects, Blog). Resolver isso com um banco de dados leve agora evita retrabalho de migrar de uma solução descartável (ex: arquivo solto) para banco de verdade depois."
      },
      {
        "heading": "Situação Atual",
        "content": "O projeto não tem nenhum banco de dados. O container roda a partir de uma imagem Docker recriada do zero a cada deploy (`docker compose up -d --force-recreate`, workflow já validado na Fase 1) — qualquer dado gravado dentro do container sem um volume explícito é perdido no próximo deploy."
      },
      {
        "heading": "Situação Desejada",
        "content": "SQLite configurado via `better-sqlite3` com WAL mode ativado, schema auto-inicializado e o arquivo `.db` vivendo em um **volume Docker nomeado** (`portfolio-data:/app/data`), declarado no `docker-compose.yml`, sobrevivendo a recriações do container."
      },
      {
        "heading": "Rastreabilidade de Escolha Técnica",
        "content": "- Tentativa anterior (substituída): Inicialmente configurado com Prisma ORM v6. Substituído por `better-sqlite3` a pedido do dono do projeto para maior leveza, execução síncrona/direta de queries sem overhead de query engine e maior simplicidade nas próximas fases de CRUD."
      },
      {
        "heading": "Riscos",
        "content": "- Se o volume não for corretamente declarado, dados parecem persistir em teste local mas se perdem no primeiro deploy real via GitHub Actions — por isso a validação desta tarefa exige testar exatamente esse cenário (derrubar/recriar o container), não só rodar local.\n- Nenhum dado real será migrado nesta tarefa (é a primeira introdução do banco) — sem risco de perda de dados existentes."
      },
      {
        "heading": "Estratégia de Execução",
        "content": "1. Instalar `better-sqlite3` e `@types/better-sqlite3`, configurando `serverExternalPackages` no `next.config.ts`.\n2. Criar singleton em `src/lib/db.ts` com schema auto-inicializável para 2FA (`two_factor_auth`).\n3. Declarar volume Docker nomeado no `docker-compose.yml` (`portfolio-data:/app/data`) e instalar build tools no `Dockerfile` (`python3 make g++`).\n4. Configurar `.gitignore` para excluir o arquivo `.db` do controle de versão (dado de runtime, não código).\n5. Testar localmente com `scripts/test-db.ts` (operações CRUD no SQLite).\n6. Testar em produção: deploy via GitHub Actions (`--force-recreate`).\n\n---"
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [x] SQLite configurado e biblioteca de acesso escolhida (`better-sqlite3`)\n- [x] Volume Docker nomeado declarado e funcionando (`portfolio-data:/app/data`)\n- [x] Schema inicial criado (tabela `two_factor_auth`, extensível para uso futuro)\n- [x] `.gitignore` atualizado para excluir o arquivo `.db`\n- [x] Teste local de persistência (`scripts/test-db.ts`) confirmado\n- [x] Teste em produção via deploy real (`--force-recreate` do GitHub Actions) confirmado\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [x] Comportamento idêntico ao anterior (nenhuma regressão no que já funcionava)\n- [x] Nenhuma regressão identificada\n- [x] **Pasta renomeada para `[done]-sqlite-persistencia-inicial` e movida para `archive/refactoring/`**"
      }
    ],
    "path": "docs/archive/refactoring/[done]-sqlite-persistencia-inicial"
  }
];

var ROADMAP_TASKS = [
  {
    "id": "2fa-layout-painel-admin",
    "title": "2FA (TOTP) e Layout Base do Painel Admin",
    "category": "features",
    "status": "ready-for-review",
    "area": "active",
    "date": "2026-08-31",
    "priority": "alta",
    "tags": [
      "backend",
      "frontend",
      "segurança",
      "ui-ux"
    ],
    "progress": 0,
    "progressFraction": {
      "done": 0,
      "total": 13
    },
    "summary": "Segunda camada de autenticação via TOTP para todos os métodos de login, e a navegação base do painel entre as 6 seções administrativas.",
    "sections": [
      {
        "heading": "Depende de",
        "content": "`[draft]-sqlite-persistencia-inicial` (para armazenar o secret TOTP), `[draft]-login-email-senha` e `[draft]-login-social-google-github` (2FA se aplica a todos os métodos já existentes). Este é o último card da fase — só inicia depois que os três anteriores estiverem `[done]`."
      },
      {
        "heading": "Objetivo",
        "content": "Adicionar uma segunda camada de segurança ao login (já que o painel vai controlar edição de conteúdo real do site público a partir da Fase 4), e entregar a navegação funcional do painel para as fases seguintes construírem em cima."
      },
      {
        "heading": "Descrição Funcional",
        "content": "Após completar o primeiro fator (senha ou social), o usuário é solicitado a inserir um código de 6 dígitos gerado por um app autenticador (Google Authenticator ou similar) antes de a sessão ser liberada. Na primeira vez, uma tela dedicada de setup (`/admin/setup-2fa`, acessível apenas com o primeiro fator já validado) gera o secret, exibe um QR code para escanear, e confirma o primeiro código antes de ativar o 2FA definitivamente. Após o 2FA estar ativo, todo login subsequente (qualquer método) exige o código TOTP. Uma vez autenticado com os dois fatores, o usuário acessa o layout do painel: navegação entre Hero, Skills, Currículo, Projetos, Idioma e Guestbook — cada seção como página placeholder."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n- Tela `/admin/setup-2fa`: gera secret TOTP, salva no SQLite, exibe QR code, confirma primeiro código.\n- Verificação de código TOTP como etapa obrigatória após o primeiro fator, em todos os métodos de login (email/senha, Google, GitHub).\n- Layout base do painel: navegação entre as 6 seções (Hero, Skills, Currículo, Projetos, Idioma, Guestbook), reaproveitando componentes ShadCN e a paleta já existente no site público.\n- Cada seção como página com rota e navegação funcionais, conteúdo placeholder (sem edição real).\n\n### Não inclui\n- Qualquer funcionalidade de edição de conteúdo real (Fase 4 em diante).\n- Recuperação de acesso caso o dispositivo com o app autenticador seja perdido (considerar isso como melhoria futura, não crítico para usuário único com acesso à VPS)."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** frontend (tela de setup, tela de verificação, layout do painel) e backend (geração/validação TOTP).\n- **Dependências novas:** `otpauth` ou `speakeasy` (geração e validação TOTP), biblioteca de geração de QR code (ex: `qrcode`).\n- **Persistência:** utiliza a tabela de 2FA configurada no card de SQLite."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Implementar tela `/admin/setup-2fa` (geração de secret, QR code, confirmação).\n2. Implementar verificação de código TOTP como etapa pós-primeiro-fator, para os 3 métodos de login já existentes.\n3. Layout base do painel (navegação lateral/superior entre as 6 seções).\n4. Páginas placeholder para cada seção."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] Setup inicial do 2FA funcional (gera secret, QR code escaneável, confirma ativação)\n- [ ] Login via email/senha exige código TOTP após a senha\n- [ ] Login via Google exige código TOTP após a autenticação social\n- [ ] Login via GitHub exige código TOTP após a autenticação social\n- [ ] Código TOTP incorreto rejeita o login, mesmo com primeiro fator correto\n- [ ] Layout do painel navegável entre as 6 seções, visualmente consistente com o site público\n- [ ] Secret TOTP persiste corretamente após redeploy (reutilizando o teste de persistência do card de SQLite)\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Todos os critérios de conclusão atendidos\n- [ ] Testado manualmente do ponto de vista do usuário (setup completo + login com 2FA em todos os métodos)\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-2fa-layout-painel-admin` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/active/features/[ready-for-review]-2fa-layout-painel-admin"
  },
  {
    "id": "login-email-senha",
    "title": "Login via Email e Senha (Auth.js)",
    "category": "features",
    "status": "ready-for-review",
    "area": "active",
    "date": "2026-08-31",
    "priority": "alta",
    "tags": [
      "backend",
      "frontend",
      "segurança"
    ],
    "progress": 0,
    "progressFraction": {
      "done": 0,
      "total": 11
    },
    "summary": "Autenticação por email e senha para um único usuário fixo, sem cadastro público, usando Auth.js.",
    "sections": [
      {
        "heading": "Depende de",
        "content": "`[draft]-sqlite-persistencia-inicial` não é pré-requisito direto deste card (a credencial de login vem de variável de ambiente, não do banco) — pode ser executado em paralelo ou antes, mas o card de 2FA (mais adiante nesta mesma fase) depende deste estar concluído."
      },
      {
        "heading": "Objetivo",
        "content": "Permitir que o dono do portfólio acesse `/admin` com email e senha, sem expor cadastro público nem gerenciar múltiplos usuários."
      },
      {
        "heading": "Descrição Funcional",
        "content": "Tela de login em `/admin` (ou rota de login associada) com campos de email e senha. A credencial correta é fixa, vinda de variável de ambiente — não há tabela de usuários. Login incorreto mostra erro genérico (não revela se o e-mail existe ou não, por segurança). Login correto cria uma sessão JWT."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n- Configuração inicial do Auth.js (NextAuth v5) no projeto.\n- Provider Credentials configurado, validando contra `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` (hash bcrypt/argon2).\n- Script one-off para gerar o hash da senha a partir de um texto (rodado uma vez, manualmente, para configurar a variável de ambiente).\n- Tela de login em `/admin`.\n- Sessão via JWT.\n- Configuração de cookies seguros atrás do proxy Nginx (confiar em `X-Forwarded-Proto`, necessário para a sessão persistir corretamente em produção).\n- Middleware protegendo rotas sob `/admin` (redireciona para login se não houver sessão válida).\n- `NEXTAUTH_SECRET` e `NEXTAUTH_URL` configurados.\n\n### Não inclui\n- Login social (card separado).\n- 2FA (card separado, depende deste).\n- Layout completo do painel pós-login (card separado) — após login bem-sucedido nesta tarefa, uma página simples de confirmação/placeholder é suficiente para validar o fluxo.\n- \"Esqueci minha senha\" (não se aplica a usuário único fixo via env var)."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** frontend (tela de login) e backend (Auth.js, callbacks, middleware).\n- **Dependências novas:** `next-auth@beta` (v5), `bcryptjs` ou `argon2`.\n- **Variáveis de ambiente novas:** `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — todas configuradas na stack do Portainer, nunca commitadas.\n- **Impactos em outras partes do sistema:** nenhum impacto no site público existente."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Instalar Auth.js (v5) e configurar o provider Credentials.\n2. Criar script one-off para gerar `ADMIN_PASSWORD_HASH`.\n3. Implementar tela de login em `/admin`.\n4. Configurar cookies seguros atrás do proxy Nginx.\n5. Implementar middleware de proteção das rotas `/admin/*`.\n6. Página placeholder pós-login para validar o fluxo completo."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] Login com credencial correta gera sessão válida e redireciona para `/admin`\n- [ ] Login com credencial incorreta mostra erro genérico, sem revelar detalhes\n- [ ] Acesso direto a `/admin/qualquer-rota` sem sessão redireciona para login\n- [ ] Sessão persiste em produção (testado em `https://guilhermemenezes.dev`, não só localhost)\n- [ ] Variáveis sensíveis configuradas na stack do Portainer, nunca commitadas\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Todos os critérios de conclusão atendidos\n- [ ] Testado manualmente do ponto de vista do usuário\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-login-email-senha` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/active/features/[ready-for-review]-login-email-senha"
  },
  {
    "id": "login-social-google-github",
    "title": "Login Social (Google e GitHub) Restrito ao Dono",
    "category": "features",
    "status": "ready-for-review",
    "area": "active",
    "date": "2026-08-31",
    "priority": "alta",
    "tags": [
      "backend",
      "frontend",
      "segurança",
      "api"
    ],
    "progress": 0,
    "progressFraction": {
      "done": 0,
      "total": 11
    },
    "summary": "Login via Google e GitHub, aceitando apenas a conta específica do dono do portfólio, sem cadastro aberto.",
    "sections": [
      {
        "heading": "Depende de",
        "content": "`[draft]-login-email-senha` — este card estende a mesma configuração do Auth.js já feita ali (middleware, sessão JWT, cookies seguros). Não iniciar sem o login por email/senha já validado em produção."
      },
      {
        "heading": "Objetivo",
        "content": "Oferecer uma forma mais rápida de login (sem digitar senha) para o dono do portfólio, sem abrir a porta para cadastro público — a segurança do \"usuário único\" precisa ser garantida mesmo com OAuth de terceiros no meio."
      },
      {
        "heading": "Descrição Funcional",
        "content": "Na tela de login, dois botões adicionais: \"Entrar com Google\" e \"Entrar com GitHub\". Ao completar o fluxo OAuth, o sistema verifica se o e-mail retornado pelo provider bate exatamente com `ADMIN_EMAIL`. Se bater, sessão é criada normalmente. Se não bater, o login é rejeitado mesmo que o OAuth tenha sido tecnicamente bem-sucedido (a pessoa provou ser dona daquela conta Google/GitHub, mas essa conta não é a autorizada)."
      },
      {
        "heading": "Escopo",
        "content": "### Inclui\n- Provider Google configurado no Auth.js.\n- Provider GitHub configurado no Auth.js.\n- App OAuth registrado no Google Cloud Console e nas GitHub Developer Settings.\n- Callback `signIn` validando o e-mail retornado contra `ADMIN_EMAIL`, para ambos os providers.\n- Botões de login social na tela de login já existente (`/admin`).\n- Mensagem de erro clara quando o e-mail não bate (ex: \"Esta conta não tem acesso a este painel\").\n\n### Não inclui\n- 2FA para login social (card separado, aplica-se a todos os métodos de uma vez).\n- Múltiplos e-mails autorizados (é sempre um único e-mail fixo)."
      },
      {
        "heading": "Requisitos Técnicos",
        "content": "- **Camadas envolvidas:** frontend (botões de login), backend (callbacks OAuth).\n- **Dependências:** nenhuma nova além do que o Auth.js já traz nativamente para providers OAuth.\n- **Variáveis de ambiente novas:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — configuradas na stack do Portainer, nunca commitadas.\n- **Configuração externa necessária:** registrar as URLs de callback (`https://guilhermemenezes.dev/api/auth/callback/google` e equivalente para GitHub) nos respectivos consoles de desenvolvedor."
      },
      {
        "heading": "Plano de Implementação",
        "content": "1. Registrar app OAuth no Google Cloud Console, obter client ID/secret.\n2. Registrar app OAuth 2 no GitHub Developer Settings, obter client ID/secret.\n3. Configurar os dois providers no Auth.js.\n4. Implementar callback `signIn` restringindo por e-mail.\n5. Adicionar botões de login social na tela existente.\n6. Testar rejeição explícita com uma conta que não seja a autorizada."
      }
    ],
    "criteriaSections": [
      {
        "heading": "Critérios de Conclusão",
        "content": "- [ ] Login via Google com a conta autorizada funciona e cria sessão\n- [ ] Login via Google com outra conta é rejeitado, com mensagem clara\n- [ ] Login via GitHub com a conta autorizada funciona e cria sessão\n- [ ] Login via GitHub com outra conta é rejeitado, com mensagem clara\n- [ ] Variáveis sensíveis configuradas na stack do Portainer, nunca commitadas\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Todos os critérios de conclusão atendidos\n- [ ] Testado manualmente do ponto de vista do usuário (incluindo tentativa de rejeição com conta não autorizada)\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-login-social-google-github` e movida para `archive/features/`**"
      }
    ],
    "path": "docs/active/features/[ready-for-review]-login-social-google-github"
  },
  {
    "id": "sqlite-persistencia-inicial",
    "title": "Introdução do SQLite e Persistência via Volume Docker",
    "category": "refactoring",
    "status": "in-progress",
    "area": "active",
    "date": "2026-08-31",
    "priority": "alta",
    "tags": [
      "backend",
      "infra",
      "banco"
    ],
    "progress": 55,
    "progressFraction": {
      "done": 6,
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
        "content": "- [x] SQLite configurado e biblioteca de acesso escolhida (`better-sqlite3`)\n- [x] Volume Docker nomeado declarado e funcionando (`portfolio-data:/app/data`)\n- [x] Schema inicial criado (tabela `two_factor_auth`, extensível para uso futuro)\n- [x] `.gitignore` atualizado para excluir o arquivo `.db`\n- [x] Teste local de persistência (`scripts/test-db.ts`) confirmado\n- [ ] Teste em produção via deploy real (`--force-recreate` do GitHub Actions) confirmado\n\n---"
      },
      {
        "heading": "Validação",
        "content": "> _(preencher após execução e teste)_\n\n- [ ] Comportamento idêntico ao anterior (nenhuma regressão no que já funcionava)\n- [ ] Nenhuma regressão identificada\n- [ ] **Pasta renomeada para `[done]-sqlite-persistencia-inicial` e movida para `archive/refactoring/`**"
      }
    ],
    "path": "docs/active/refactoring/[in-progress]-sqlite-persistencia-inicial"
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
  }
];

# Portfólio — Guilherme Menezes

**Desenvolvedor Full-Stack · Vue.js & .NET · Performance e Escalabilidade**

> Migração de sistemas legados, dashboards em tempo real, APIs de alto desempenho e arquitetura escalável.

🔗 **Website oficial:** [https://guilhermemenezes.dev](https://guilhermemenezes.dev)

---

## 📌 Sobre o Projeto

Este repositório contém o código-fonte do meu portfólio pessoal e plataforma administrativa, construído com **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4** e **Auth.js v5**. 

O projeto combina uma experiência pública imersiva (com animações fluidas e efeitos 3D) com um **painel administrativo protegido (`/admin`)** para gerenciamento de conteúdo, projetos e métricas.

---

## ✨ Funcionalidades Principais

### 🌐 Área Pública
- **Hero Interativo:** Efeitos visuais 3D com Three.js / React Three Fiber (campo de estrelas) e tipografia moderna.
- **Linha do Tempo Profissional:** Histórico de carreira com `react-vertical-timeline-component`.
- **Apresentação de Projetos:** Vitrine de projetos com filtros por tecnologia e links diretos para repositórios e demonstrações.
- **Visualizador de Currículo:** Leitura de currículo integrada com `react-pdf`.
- **Formulário de Contato:** Validação client-side e envio direto de e-mails via API Routes com **Resend**.
- **Tema Dinâmico:** Suporte a temas com `next-themes`.

### 🔐 Painel Administrativo (`/admin`)
- **Proteção de Rotas com Middleware:** Interceptação no Edge Runtime via Auth.js (NextAuth v5).
- **Autenticação Híbrida:**
  - **Credenciais de Administrador:** Autenticação por e-mail e senha com hash seguro `bcrypt` (armazenado em Base64).
  - **Login Social (OAuth):** Integração com **Google** e **GitHub**, ativada condicionalmente quando as chaves de API estão presentes no ambiente.
  - **Whitelist Restrita ao Dono:** Validação rígida no callback social permitindo acesso apenas ao e-mail ou username autorizado.
- **Fluxo OAuth em Janela Popup:** Autenticação social fluida que abre um popup centralizado sem desviar a navegação do painel principal, com sincronização em tempo real via `postMessage`.
- **Deep-linking com Cookie Seguro:** Usuários deslogados que tentam acessar sub-rotas protegidas (ex: `/admin/projetos`) são redirecionados para `/admin/login` e, após o login, são levados automaticamente de volta ao destino original através de um cookie temporário `HttpOnly` (`admin_redirect`).
- **Banco de Dados SQLite:** Persistência local com `better-sqlite3` em modo WAL (Write-Ahead Logging) para alto desempenho e confiabilidade.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://motion.dev/), [Three.js](https://threejs.org/) |
| **Backend & APIs** | Next.js Server Components, Server Actions, Route Handlers |
| **Autenticação** | [Auth.js v5](https://authjs.dev/) (`next-auth@5.0.0-beta`), Bcrypt.js |
| **Banco de Dados** | SQLite com [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **Serviços** | [Resend](https://resend.com/) (Envio de e-mails) |
| **DevOps & Deploy** | Docker (Next.js Standalone), Docker Compose, GitHub Actions (CI/CD contínuo via SSH), VPS Linux |

---

## ⚙️ Variáveis de Ambiente

Copie o arquivo de exemplo para configurar o ambiente:

```bash
cp .env.example .env.local
```

### Detalhamento das Variáveis:

| Variável | Obrigatória | Descrição |
| :--- | :---: | :--- |
| `DATABASE_URL` | Sim | Caminho do SQLite local (ex: `file:./data/portfolio.db`). |
| `AUTH_SECRET` | Sim | Chave de criptografia para sessões e cookies (gere com `openssl rand -base64 32`). |
| `NEXTAUTH_URL` | Sim | URL base da aplicação (`http://localhost:3000` ou domínio em produção). |
| `ADMIN_EMAIL` | Sim | E-mail do administrador para login via credenciais. |
| `ADMIN_PASSWORD_HASH` | Sim | Hash bcrypt codificado em Base64 da senha do administrador. |
| `RESEND_API_KEY` | Opcional | Chave de API da Resend para funcionamento do formulário de contato. |
| `GOOGLE_CLIENT_ID` | Opcional | Client ID do Google Cloud para login social. |
| `GOOGLE_CLIENT_SECRET` | Opcional | Client Secret do Google Cloud. |
| `ADMIN_GOOGLE_EMAIL` | Opcional | E-mail do Gmail autorizado a acessar o admin via Google. |
| `GITHUB_CLIENT_ID` | Opcional | Client ID do GitHub OAuth App para login social. |
| `GITHUB_CLIENT_SECRET` | Opcional | Client Secret do GitHub OAuth App. |
| `ADMIN_GITHUB_USERNAME` | Opcional | Username do GitHub autorizado a acessar o admin via GitHub. |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js**: `20+`
- **npm**: `10+`

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/ShogunBP/guilherme-portifolio.git
cd guilherme-portifolio
npm install
```

### 2. Gerar Hash para a Senha de Administrador
Utilize o utilitário incluído no projeto para gerar o hash Base64 da sua senha:
```bash
npx tsx scripts/hash-password.ts "SuaSenhaSeguraAqui"
```
Copie o valor impresso para a variável `ADMIN_PASSWORD_HASH` no seu `.env.local`.

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no navegador: [http://localhost:3000](http://localhost:3000)

### 4. Build e Produção Local
```bash
npm run build
npm run start
```

---

## 🐳 Executando com Docker

O projeto inclui suporte completo a **Docker Standalone** com otimização multi-stage:

```bash
# Build e execução com Docker Compose
docker compose up -d --build

# Inspecionar logs
docker compose logs -f portfolio

# Parar serviços
docker compose down
```

Os dados do SQLite são persistidos no volume Docker nomeado `portfolio-data` montado em `/app/data`.

---

## 📂 Estrutura do Projeto

```text
├── .github/workflows/      # Pipelines de CI/CD (deploy automático na VPS)
├── dev/                    # Roteiros e utilitários de desenvolvimento interno
├── docs/                   # Documentação arquitetural e Roadmap interativo visual
│   ├── docs/               # Tarefas ativas e arquivadas com rastreabilidade
│   └── roadmap/            # Servidor e interface do Roadmap interativo
├── public/                 # Assets estáticos (ícones, imagens e currículo PDF)
├── scripts/                # Utilitários (gerador de hash de senha, testes de banco)
├── src/
│   ├── app/                # Rotas da aplicação (Next.js App Router)
│   │   ├── admin/          # Painel Administrativo (/admin, /admin/login, /admin/projetos)
│   │   ├── api/            # API Routes (/api/contact, /api/auth, /api/admin)
│   │   ├── auth/popup/     # Rota de apoio para o fluxo OAuth popup
│   │   └── page.tsx        # Página inicial pública
│   ├── components/         # Componentes React reutilizáveis (Hero, Projects, Timeline, etc.)
│   ├── constants/          # Constantes estáticas e dados estruturados
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Conexão com banco SQLite e utilitários globais
│   ├── auth.config.ts      # Configurações de autenticação compatíveis com Edge Runtime
│   ├── auth.ts             # Instância do Auth.js com provedores (Credentials, Google, GitHub)
│   └── middleware.ts       # Middleware Edge para proteção do painel e deep-linking
├── docker-compose.yml      # Configuração dos serviços Docker
└── Dockerfile              # Multi-stage build com output standalone
```

---

## 📬 Contato

- **Website:** [guilhermemenezes.dev](https://guilhermemenezes.dev)
- **LinkedIn:** [linkedin.com/in/mr-guilherme](https://www.linkedin.com/in/mr-guilherme/)
- **GitHub:** [github.com/ShogunBP](https://github.com/ShogunBP)
- **X (Twitter):** [x.com/dev_ShogunBP](https://x.com/dev_ShogunBP)
- **E-mail:** [guilhermemenezes1337@gmail.com](mailto:guilhermemenezes1337@gmail.com)

---

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE).

# Portfólio — Guilherme Menezes

**Desenvolvedor Full-Stack · Vue.js & .NET · Performance e Escalabilidade**

> Migração de legados, ganho de performance e entregas com resultados reais.

---

## Sobre

Sou o Guilherme Menezes, Desenvolvedor Full-Stack com foco em Vue.js (2/3) e .NET (6/7). Tenho experiência em:
- Migração de sistemas legados (Vue 2 → 3), redesign de UI e melhoria de performance
- Dashboards com KPIs em tempo real, filtros dinâmicos e responsividade
- APIs RESTful com autenticação (JWT) e RBAC
- Bancos de dados (SQL Server/MySQL), Entity Framework e otimização de queries
- Boas práticas e esteira (Docker, Azure DevOps, Git/GitHub)

---

## Experiência (Resumo)

- **SCHOTT** (Jan/2024 – Mar/2025)
  - Migração Vue 2 → 3 e redesign de dashboard (+40% performance)
  - Plataforma de monitoramento industrial: Vue 3, ASP.NET, sensores, temas dark/light
  - KPIs em tempo real e filtros dinâmicos
  - Stack: Vue 2/3, TypeScript, ASP.NET, EF, MySQL, Docker, Azure DevOps

- **Avanth** (Fev/2023 – Out/2023)
  - Dashboard para fintech com Vue 2 e .NET 7
  - APIs RESTful com JWT e RBAC
  - 40% de redução no tempo de processamento de operações financeiras
  - Stack: Vue 2, Vuex, JavaScript, .NET 7, SQL Server, Swagger

- **CREN** (Jan/2022 – Dez/2022)
  - Prontuário eletrônico em WinForms com foco em usabilidade e LGPD
  - Resultados: +40% de agilidade e -70% em erros de digitação
  - Stack: C#, WinForms, MySQL, Dapper, DevExpress

---

## Habilidades Técnicas

- **Frontend**: Vue.js 2/3, TypeScript, JavaScript, Vite, BootstrapVue, Chart.js, UX/UI, Responsividade
- **Backend**: .NET 6/7 (C#), ASP.NET, Node.js, APIs REST, Swagger, Entity Framework
- **Banco de Dados**: SQL Server, MySQL
- **DevOps & Ferramentas**: Docker, Azure DevOps, Git/GitHub, ESLint, Conventional Commits
- **Metodologias**: Scrum, Kanban

---

## Destaques

- Foco em Vue.js e .NET, com entregas mensuráveis
- Migrações com ganhos de performance e escalabilidade
- Projetos com KPIs em tempo real e integrações robustas
- Conhecimento em cloud (Azure) e boas práticas de código

---

## Como rodar este projeto

Pré-requisitos: Node.js 20+ e npm 10+

1. Instalar dependências
```bash
npm install
```
2. Desenvolvimento
```bash
npm run dev
# abra http://localhost:3000
```
3. Build e produção local
```bash
npm run build
npm run start
```
4. Lint (opcional)
```bash
npm run lint
```
5. Envio de formulário (opcional)
- Configure a variável de ambiente `RESEND_API_KEY` para que a rota `/api/contact` envie e‑mails:
```powershell
$env:RESEND_API_KEY="SUA_CHAVE_DA_RESEND"
```

---

## Estrutura do projeto
- `src/app`: páginas (Next.js App Router), API de contato e layout
- `src/components`: componentes (Hero, Skills, Timeline, Projects, Contact, Footer)
- `src/constants/index.ts`: lista de skills e redes
- `public`: imagens e `resume.pdf`

Trocas recomendadas:
- Substitua `public/resume.pdf` pelo seu currículo
- Adicione `public/guilherme.jpg` para o avatar do header
- Inclua ícones desejados em `public/` (ex.: `vue.png`, `aspnet.png`, `sqlserver.png`, `vite.png` etc.)

---

## Deploy (Netlify)
- Com GitHub: Import from Git → Build command: `npm run build` → Publish dir: `.next`
- Variáveis: defina `RESEND_API_KEY` (para envio de e‑mail)
- Node: `NODE_VERSION=20`

---

## Contato
- GitHub: https://github.com/ShogunBP/
- LinkedIn: https://www.linkedin.com/in/mr-guilherme/
- X (Twitter): https://x.com/dev_ShogunBP
- E‑mail: guilhermemenezes1337@gmail.com

Se quiser, personalizo as seções de projetos (com cards, links e imagens) e adiciono badges ou CI/CD.



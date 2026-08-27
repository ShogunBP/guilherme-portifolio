# Arquitetura e Blueprint Técnico

## Visão Geral

Este portfólio é um aplicativo web moderno construído com **Next.js 16.2.6** + **React 19.2.6** + **Tailwind CSS**. A arquitetura segue os melhores padrões para arquiteturas híbridas com SSR + CSR, hospedado em VPS via Docker + Portainer.

## Tecnologias Principais

### Frontend
- **Next.js 16.2.6** (App Router, Server Components)
- **React 19.2.6** (Latest)  
- **TypeScript** (Tipagem estática)
- **Tailwind CSS** (CSS utilitário)
- **ShadCN UI** (Componentes acessíveis)
- **motion** + **framer-motion** (Animações)
- **next-themes** (Suporte a temas)

### Backend / API
- **Resend** (Serviço de e-mail, não há backend bananeira)
- (sem adaptador de plataforma — build padrão do Next.js)

### Desenvolvimento e CI/CD
- **Vite + Turbopack** (Dev rápido)
- **Docker** (Opcional)
- **Portainer** (Orquestração de containers via GitOps)
- **GitHub Webhooks** (Trigger de redeploy automático a cada push)

## Fluxo de dados

```
Layout (Root) → Navbar + Footer (fixos)
├── Hero (componente cliente)
├── Skills (componente cliente)
├── Projects (componente cliente)
├── Contact Us (componente cliente)
├── Timeline (componente cliente)
├── [Blog] (componentes cliente/servidor)
└── Sessão dinâmica (CSR) quando necessário
```

## Renderização e Cachê

- **Estruturação estática** (Geração por demanda)
- **ISR** (Revalidação incremental)
- **Streaming de dados** por componentes
- **Animações otimizadas** com Framer Motion
- **Poda de componentes** aproveita SSR para conteúdo acima do dobra

## Soluções Práticas Adicionais

### 1. SEO e Acessibilidade
- Componentes do App Router
- Descrições legadas semântico otimizada (SEO)
- Atributos semânticos de acessibilidade
- Redução de hydrate warnings

### 2. Design System
- Bento Grid (Componente UI personalizado)
- Badge componentes (ShadCN)
- Componentes de botão / cartão reutilizáveis
- Showcase visual unificado

### 3. Cultura e CSS
- Sistema unificado de unidade de tema via `next-themes`
- Modo escuro automático baseado em sistema Operação
- CSS regenerativo e Tailwind Intellisense
- `motion.div` configurações de transição global

### 4. Comunicação e CI/CD
- **Integração com Resend** + Configuração de Modelo de Template
  - Estado otimizado do <form> e validação de entrada do usuário
  - E-mail de sucesso com processamento posterior do registro

### 5. Desenvolvedor Habilidade e Experiência do Usuário
- Pipeline de projeto moderno
- Ferramentas de desenvolvimento locais rápidas e interativas
  - Build do Next.js via Docker, orquestrado pelo Portainer
- Experiência de CI/CD local baseada em Docker
- Git hooks e commit para mensagens convencionais

## Confiabilidade e Desempenho

- **Architecture-First** Build Strategy: SSR para páginas abaixo da dobra vs CSR para componentes interativos (evita problemas hydration, envia trabalho mais cedo)
- **Ativação Lazy** Componentes dinâmicos pré-carregados com lazy loading estratégico (Scroll animation)
- **Métricas Streaming** cada componente reporta métricas de qualidade (React 19, métricas honestamente em IT)
- **Suavização Três** Detecta cada operação de plataforma para tempo suave transparente (scroll position, media paint, update)

## Configuração de Desenvolvimento

### Local
```bash
# Desenvolvimento rápido com Turbanack internamente
dev npm run dev
# Preview
npm run preview
# Build e ver, Outlook-oriented com Capturas de tela e console game
```

### Deploy (Docker + Portainer GitOps)
```bash
# Stack conectada ao repositório Git no Portainer
# Webhook configurado no GitHub → redeploy automático a cada push na branch principal
# Não requer comandos manuais de deploy
```

## Muito bem, organizar o blueprint
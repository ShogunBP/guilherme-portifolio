# ✨ Sistema de Idioma PT/EN — Fundação (i18next)

**Status:** done
**Data:** 2026-09-11
**Prioridade:** `alta`
**Tags:** `frontend`, `i18n`, `ux`
**Resumo:** Instalação e configuração da fundação de internacionalização com i18next, arquivos de tradução PT/EN completos e conexão do LanguageToggle existente, seguindo a arquitetura validada no projeto Thiago Bahls.

---

## Objetivo

Ativar o sistema de tradução PT/EN da landing page pública, substituindo todos os textos hardcoded nos componentes por chamadas ao hook `useTranslation()` do i18next. O `LanguageToggle` da navbar, que hoje é decorativo (alterna estado local sem efeito), passa a trocar o idioma real da aplicação e persistir a preferência no `localStorage`.

## Depende de

Nenhuma dependência técnica de cards anteriores. Fase 2 concluída ✅.

## Referência de Arquitetura

`dev/utils/reference/SISTEMA_TRADUCAO.md` — arquitetura validada no projeto Thiago Bahls.
A implementação deve ser **idêntica** ao padrão descrito nesse documento nos pontos que estão no escopo desta fase.

## Escopo

### Inclui

- Instalação de `i18next`, `react-i18next` e `i18next-browser-languagedetector`
- Criação de `src/i18n/config.ts` com:
  - `defaultResources` embutidos (sem chamada de rede)
  - Detecção síncrona de idioma: `localStorage('i18nextLng')` → `navigator.language` → fallback `'pt'`
  - Comentário `// TODO Fase 3.2` para o endpoint dinâmico `/api/translations?language={lng}`
- Criação de `src/i18n/locales/pt.json` e `src/i18n/locales/en.json` com todas as chaves aprovadas
- Criação de `src/i18n/index.ts` (reexporta o `i18n` inicializado)
- Provider `I18nProvider` ('use client') importado no `src/app/layout.tsx` para inicializar o i18n globalmente
- Atualização do `LanguageToggle` para chamar `i18n.changeLanguage('pt' | 'en')` e persistir no `localStorage`
- Migração de todos os textos hardcoded nos componentes da landing page:
  - `src/components/sub/HeroContent.tsx`
  - `src/components/main/Navbar.tsx`
  - `src/components/main/Skills.tsx`
  - `src/components/main/Timeline.tsx`
  - `src/components/main/Resume.tsx`
  - `src/components/main/Footer.tsx`
  - `src/components/main/ContactUs.tsx`

### Não inclui (por ora — Fase 3.2)

- Endpoint `/api/translations?language={lng}` para chaves gerenciadas pelo painel
- `i18n.addResourceBundle()` dinâmico pós-init
- Hook `useTranslatedContent` (só faz sentido quando o conteúdo vier do banco — Fases 4-7)
- Painel de edição de chaves no `/admin/idioma` (CRUD real)

## Chaves Aprovadas

### `pt.json`
```json
{
  "hero": {
    "badge": "O Desenvolvedor",
    "name": "Guilherme Menezes",
    "role": "Desenvolvedor Full-Stack",
    "description": "Migração de legados, performance e escalabilidade com Vue.js e .NET.",
    "cta_connect": "Vamos Conversar ↓",
    "cta_github": "GitHub"
  },
  "nav": {
    "about": "Sobre",
    "skills": "Skills",
    "experience": "Experiência",
    "resume": "Currículo",
    "projects": "Projetos",
    "blog": "Blog",
    "contact": "Contato"
  },
  "skills": {
    "heading": "Especialidade Técnica",
    "subheading": "Uma seleção refinada das minhas habilidades em ferramentas e tecnologias modernas de desenvolvimento",
    "footer": "Constantemente refinando e expandindo meu conjunto de habilidades técnicas"
  },
  "experience": {
    "heading": "Experiência Profissional & Projetos",
    "subheading": "Destaques da minha carreira e projetos relevantes que demonstram minhas habilidades e impacto.",
    "jobs": [
      {
        "title": "Desenvolvedor Full-Stack",
        "company": "SCHOTT",
        "location": "Diadema – São Paulo – Brasil",
        "date": "Jan 2024 – Mar 2025",
        "description": "Migração Vue 2 → 3, redesign de dashboard e plataforma de monitoramento industrial com Vue 3 e ASP.NET.",
        "achievements": [
          "Liderou migração e redesign de dashboard (+40% performance).",
          "Desenvolveu plataforma com sensores, temas dark/light e KPIs em tempo real.",
          "Evoluiu filtros dinâmicos e painéis com dados atualizados.",
          "Stack: Vue.js 2/3, TypeScript, ASP.NET, Entity Framework, MySQL, Docker, Azure DevOps."
        ]
      },
      {
        "title": "Desenvolvedor",
        "company": "Avanth",
        "location": "Brasil",
        "date": "Fev 2023 – Out 2023",
        "description": "Dashboard para fintech com Vue.js 2 e .NET 7, APIs RESTful com JWT e RBAC.",
        "achievements": [
          "Redução de 40% no tempo de processamento de operações financeiras.",
          "APIs .NET 7 com autenticação JWT e controle de acesso RBAC.",
          "Stack: Vue.js 2, Vuex, JavaScript, .NET 7, SQL Server, Swagger."
        ]
      },
      {
        "title": "Desenvolvedor",
        "company": "CREN",
        "location": "Brasil",
        "date": "Jan 2022 – Dez 2022",
        "description": "Prontuário eletrônico em WinForms com foco em usabilidade e conformidade LGPD.",
        "achievements": [
          "+40% de agilidade e -70% em erros de digitação.",
          "Stack: C#, WinForms, MySQL, Dapper, DevExpress."
        ]
      }
    ]
  },
  "resume": {
    "heading": "Meu Currículo",
    "subheading": "Veja minhas qualificações profissionais e experiência em desenvolvimento full-stack.",
    "download": "Baixar Currículo",
    "error": "Falha ao carregar o PDF"
  },
  "footer": {
    "description": "Criando aplicações web escaláveis, ferramentas open-source e experiências digitais inovadoras.",
    "quick_links": "Links Rápidos",
    "connect": "Conecte-se",
    "built_by": "Feito com ❤️ por Guilherme Menezes.",
    "visitors": "Visitantes"
  },
  "contact": {
    "heading": "Fale comigo",
    "subheading": "Tem um projeto ou dúvida? Me chame e vamos transformar suas ideias em realidade.",
    "field_name": "Nome",
    "field_email": "E-mail",
    "field_subject": "Assunto",
    "field_message": "Digite sua mensagem...",
    "submit": "Enviar Mensagem",
    "sending": "Enviando...",
    "success": "Mensagem enviada com sucesso!",
    "error": "Falha ao enviar mensagem. Tente novamente.",
    "error_generic": "Ocorreu um erro. Tente novamente mais tarde.",
    "copied": "copiado!"
  }
}
```

### `en.json`
```json
{
  "hero": {
    "badge": "The Developer",
    "name": "Guilherme Menezes",
    "role": "Full-Stack Developer",
    "description": "Legacy migration, performance and scalability with Vue.js and .NET.",
    "cta_connect": "Let's Connect ↓",
    "cta_github": "GitHub"
  },
  "nav": {
    "about": "About",
    "skills": "Skills",
    "experience": "Experience",
    "resume": "Resume",
    "projects": "Projects",
    "blog": "Blog",
    "contact": "Contact"
  },
  "skills": {
    "heading": "Technical Expertise",
    "subheading": "A refined selection of my proficiency in modern development tools and technologies",
    "footer": "Constantly refining and expanding my technical skillset"
  },
  "experience": {
    "heading": "Professional Experience & Projects",
    "subheading": "Highlights of my career and key projects showcasing my skills & impact.",
    "jobs": [
      {
        "title": "Full-Stack Developer",
        "company": "SCHOTT",
        "location": "Diadema – São Paulo – Brazil",
        "date": "Jan 2024 – Mar 2025",
        "description": "Vue 2 → 3 migration, dashboard redesign and industrial monitoring platform with Vue 3 and ASP.NET.",
        "achievements": [
          "Led migration and dashboard redesign (+40% performance).",
          "Built platform with sensors, dark/light themes and real-time KPIs.",
          "Enhanced dynamic filters and panels with live data.",
          "Stack: Vue.js 2/3, TypeScript, ASP.NET, Entity Framework, MySQL, Docker, Azure DevOps."
        ]
      },
      {
        "title": "Developer",
        "company": "Avanth",
        "location": "Brazil",
        "date": "Feb 2023 – Oct 2023",
        "description": "Fintech dashboard with Vue.js 2 and .NET 7, RESTful APIs with JWT and RBAC.",
        "achievements": [
          "40% reduction in financial transaction processing time.",
          ".NET 7 APIs with JWT authentication and RBAC.",
          "Stack: Vue.js 2, Vuex, JavaScript, .NET 7, SQL Server, Swagger."
        ]
      },
      {
        "title": "Developer",
        "company": "CREN",
        "location": "Brazil",
        "date": "Jan 2022 – Dec 2022",
        "description": "Electronic health record in WinForms focused on usability and LGPD compliance.",
        "achievements": [
          "+40% agility and -70% in typing errors.",
          "Stack: C#, WinForms, MySQL, Dapper, DevExpress."
        ]
      }
    ]
  },
  "resume": {
    "heading": "My Resume",
    "subheading": "View my professional qualifications and experience in full-stack development.",
    "download": "Download Resume",
    "error": "Failed to load PDF"
  },
  "footer": {
    "description": "Crafting scalable web apps, open-source tools, and innovative digital experiences.",
    "quick_links": "Quick Links",
    "connect": "Connect",
    "built_by": "Built with ❤️ by Guilherme Menezes.",
    "visitors": "Visitors"
  },
  "contact": {
    "heading": "Get in Touch",
    "subheading": "Have a project or question? Reach out and let's turn your ideas into reality.",
    "field_name": "Name",
    "field_email": "Email",
    "field_subject": "Subject",
    "field_message": "Please drop your short message...",
    "submit": "Send Message",
    "sending": "Sending...",
    "success": "Message sent successfully!",
    "error": "Failed to send message. Please try again.",
    "error_generic": "An error occurred. Please try again later.",
    "copied": "copied!"
  }
}
```

## Requisitos Técnicos

- **Camadas:** frontend (React client components, Next.js App Router)
- **Sem SSR de i18n:** todos os componentes da landing já são `'use client'` — sem impacto de hidratação
- **Sem flash de idioma:** detecção síncrona antes do init garante que o idioma correto seja aplicado no primeiro render

## Plano de Implementação

1. `npm install i18next react-i18next i18next-browser-languagedetector`
2. Criar `src/i18n/locales/pt.json` e `src/i18n/locales/en.json` com as chaves aprovadas acima
3. Criar `src/i18n/config.ts` com init síncrono e TODO para endpoint dinâmico
4. Criar `src/i18n/index.ts` reexportando o i18n configurado
5. Criar `src/components/providers/I18nProvider.tsx` ('use client') importando o config
6. Adicionar `<I18nProvider>` no `src/app/layout.tsx` (wrapping apenas o público, não o admin)
7. Atualizar `src/components/ui/language-toggle.tsx` para chamar `i18n.changeLanguage()`
8. Migrar cada componente da landing com `useTranslation()`:
   - `HeroContent.tsx` — badge, role, description, botões
   - `Navbar.tsx` — labels dos links de navegação
   - `Skills.tsx` — heading, subheading, footer
   - `Timeline.tsx` — heading, subheading + dados do array `timelineData` via chaves indexadas
   - `Resume.tsx` — heading, subheading, botão download
   - `Footer.tsx` — description, quick_links, connect, built_by, visitors
   - `ContactUs.tsx` — heading, subheading, placeholders dos campos, botão, mensagens de status

## Implementação Realizada

### 1. Configuração e Detecção Síncrona (`src/i18n/config.ts`)
Implementado em [`src/i18n/config.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/i18n/config.ts) com detecção prévia no `localStorage` antes de inicializar para evitar qualquer efeito de flash de idioma:

```typescript
// src/i18n/config.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import pt from './locales/pt.json'
import en from './locales/en.json'

const SUPPORTED = ['pt', 'en']
const savedLang =
  typeof window !== 'undefined'
    ? localStorage.getItem('i18nextLng') ||
      navigator.language?.split('-')[0] ||
      'pt'
    : 'pt'
const initialLang = SUPPORTED.includes(savedLang) ? savedLang : 'pt'

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        pt: { translation: pt },
        en: { translation: en },
      },
      lng: initialLang,
      fallbackLng: 'pt',
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
    })
}
```

### 2. Provider de Inicialização e Layout
Criado [`src/components/providers/I18nProvider.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/providers/I18nProvider.tsx) e envolvido no layout raiz em [`src/app/layout.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/layout.tsx) cobrindo a navbar, o conteúdo e o rodapé públicos.

### 3. Toggle Funcional de Idioma
Implementado em [`src/components/ui/language-toggle.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/ui/language-toggle.tsx), integrando diretamente com `useTranslation()`:

```tsx
// src/components/ui/language-toggle.tsx
export function LanguageToggle() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('en') ? 'EN' : 'PT'

  const toggle = () => {
    const next = currentLang === 'PT' ? 'en' : 'pt'
    i18n.changeLanguage(next)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full font-bold text-xs z-50 cursor-pointer"
      onClick={toggle}
      title="Toggle language"
    >
      {currentLang}
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}
```

### 4. Migração dos 7 Componentes da Landing Page
Todos os textos hardcoded foram convertidos em chamadas a `t()`:
- `HeroContent.tsx`: `t('hero.badge')`, `t('hero.name')`, `t('hero.role')`, `t('hero.description')`, `t('hero.cta_connect')`, `t('hero.cta_github')`.
- `Navbar.tsx`: `navItems` com `t('nav.about')`, `t('nav.skills')`, `t('nav.experience')`, `t('nav.projects')`, `t('nav.blog')`.
- `Skills.tsx`: `t('skills.heading')`, `t('skills.subheading')`, `t('skills.footer')`.
- `Timeline.tsx`: `t('experience.jobs', { returnObjects: true })` para mesclagem reativa das experiências e headings traduzidos.
- `Resume.tsx`: `t('resume.heading')`, `t('resume.subheading')`, `t('resume.download')`, `t('resume.error')`.
- `Footer.tsx`: `t('footer.description')`, `t('footer.quick_links')`, `t('footer.connect')`, `t('footer.built_by')`, `t('footer.visitors')`, e links rápidos traduzidos.
- `ContactUs.tsx`: `t('contact.heading')`, `t('contact.subheading')`, placeholders dos campos (`name`, `email`, `subject`, `message`), estados de envio (`sending`, `submit`), e toasts.

---

## Critérios de Conclusão

- [x] `npm install` das 3 dependências sem conflitos de versão
- [x] `src/i18n/config.ts` inicializa sem erro em SSR (guard `typeof window !== 'undefined'`)
- [x] `LanguageToggle` chama `i18n.changeLanguage()` e persiste no `localStorage`
- [x] Ao alternar para EN, todos os textos da landing mudam instantaneamente sem reload
- [x] Ao recarregar a página, o idioma escolhido é restaurado do `localStorage`
- [x] Nenhum texto hardcoded residual nos componentes migrados (inclusive header mobile e endereço)
- [x] `npm run build` sem erros de TypeScript (27/27 rotas geradas)
- [x] Testado em desktop e mobile, local e produção na VPS

---

## Review

## Feedback

Aprovado e validado pelo usuário em 12/09/2026. Relatório de verificação de texto residual executado, 2 micro-ajustes aplicados (`nav.portfolio` e `contact.location`) e aprovados para encerramento do card com sucesso.

## Decisão

- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> Registrado e validado em 12/09/2026.

- **Compilação (`npm run build`):** Executada com sucesso sem erros TypeScript, gerando 27 páginas estáticas e dinâmicas.
- **Alternância PT ↔ EN via DevTools:** Testada no navegador local:
  - Estado PT inicial verificado: `"localStorageLang":"pt"`, `"badgeText":"O Desenvolvedor"`, `"roleText":"Desenvolvedor Full-Stack"`, `"mobileTitle":"Portfólio"`, `"location":"Diadema – São Paulo – Brasil"`.
  - Clique no botão de idioma: transição imediata para `"localStorageLang":"en"`, `"badgeText":"The Developer"`, `"roleText":"Full-Stack Developer"`, `"skillsHeading":"Technical Expertise"`, `"contactHeading":"Get in Touch"`, `"mobileTitle":"Portfolio"`, `"location":"Diadema – São Paulo – Brazil"`.
  - Recarregamento da página (F5): preferência em inglês preservada sem piscar.
  - Alternância de volta para PT: restabelecimento imediato de todos os textos em português.
- **Deploy:** Código e configurações enviados para a branch `main` e validados na VPS.

- [x] Todos os critérios de conclusão atendidos
- [x] Testado manualmente em PT e EN na VPS pelo usuário
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-i18n-fundacao-pt-en` e movida para `archive/features/`**

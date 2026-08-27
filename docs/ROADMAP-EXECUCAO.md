# 🗺️ Roadmap de Execução — Portfólio Guilherme Menezes

Este documento organiza, em ordem de dependência, tudo que foi levantado para o próximo ciclo de trabalho no portfólio. Segue a lógica do `PADRONIZATION.md`: cada linha abaixo deve virar uma pasta em `/docs/active/{categoria}/[draft]-nome-do-tema/README.md` quando for a vez de trabalhar nela.

**Regra de uso:** não abra mais de uma fase por vez. Termine o ciclo `[draft] → [ready-for-review] → [approved] → [in-progress] → [done]` de uma fase antes de criar a pasta da próxima. Isso evita que a IA (ou você) perca o fio da meada com contexto demais na mesa.

---

## Fase 0 — Bugs atuais
**Categoria:** `bugs/`
**Por quê primeiro:** rápido, isolado, não depende de nada e evita acumular dívida embaixo das próximas fases.

- [x] Dropdown remove o scroll da página ao abrir, causando "flick" no layout ao fechar
- [x] Elementos responsivos (Hero, Resume) calculam o tamanho só no load inicial — não recalculam ao redimensionar a janela
- [x] Nome no navbar ("Guilherme Menezes") só é clicável no responsivo mobile — precisa ser clicável sempre
- [x] Trocar o texto estático do navbar por estilo terminal: `guilherme-menezes@home:~$` com cursor piscando após o `$`
- [x] Bug: nome "Guilherme Menezes" desaparece ao scrollar (desktop e mobile) — bloqueia o item "navbar-logo-texto-terminal"
- [x] Bug: sobreposição de botões na navbar desktop em larguras próximas a 1200px (pendente de validação visual)
- [x] Enhancement: reorganização do menu mobile aberto (aguardando decisão de UX do dono do projeto antes de qualquer plano)

*Nota: O item "navbar-logo-texto-terminal" (Trocar o texto estático do navbar...) está bloqueado pelo item do nome desaparecendo. A ordem sugerida de execução dos novos itens dentro da Fase 0 é:*
1. *Bug do nome sumindo*
2. *Bug de sobreposição desktop*
3. *Enhancement do menu mobile (só após decisão de UX)*

**Prompt sugerido para abrir com a IA:**
> "Vou trabalhar na Fase 0 do meu roadmap: bugs de UI. Aqui está o `file-structure-blueprint.md` e `architecture-blueprint.md` do projeto [anexar]. Preciso que você primeiro me pergunte onde estão os componentes de tema, dropdown, navbar e Hero/Resume antes de propor a correção, e monte o README de bug seguindo o template do `PADRONIZATION.md` para cada um separadamente."

---

## Fase 1 — Deploy automático (CI/CD)
**Categoria:** `refactoring/`
**Por quê agora:** sem isso, toda fase seguinte custa um passo manual extra (`cd` → `chmod` → `./deploy.sh`). Resolver uma vez destrava a velocidade do resto — e serve também para os subprojetos (ex: Thiago Bahls).

**Escopo (abordagem escolhida: Portainer GitOps nativo via Webhook, sem SSH):**
- Migrar a stack no Portainer para apontar direto pro repositório Git (em vez de compose colado manualmente)
- Ativar GitOps updates → mecanismo Webhook → copiar URL gerada
- Configurar webhook no GitHub (Settings → Webhooks) apontando pra URL do Portainer, evento "push"
- Validar redeploy automático a cada push na branch principal
- Replicar o mesmo padrão na stack do Thiago Bahls e futuros subprojetos
- Opcional (fase futura, se necessário): camada extra com GitHub Actions rodando lint/testes antes de disparar o webhook via `curl`, sem precisar de secret SSH

**Prompt sugerido:**
> "Fase 1: quero migrar meu deploy manual (`cd /srv/projects/gm-portifolio && chmod +x deploy.sh && ./deploy.sh`) para GitOps nativo do Portainer via webhook. Já uso Portainer CE na VPS. Me ajude a montar o passo a passo de configuração da stack Git-based, o webhook no GitHub, e o README de refactoring documentando a migração."

---

## Fase 2 — Autenticação + esqueleto do painel admin
**Categoria:** `features/`
**Por quê agora:** todo o gerenciamento de conteúdo das fases seguintes depende de login seguro existir primeiro.

**Escopo:**
- Sistema de login seguro (referência: como o painel do Thiago Bahls resolve isso)
- Layout base do painel (navegação entre seções: Hero, Skills, Currículo, Projetos, Idioma, Guestbook)
- Sem funcionalidade de edição ainda — só a casca + auth

---

## Fase 3 — Sistema de idioma PT/EN
**Categoria:** `features/`
**Por quê antes do CRUD de conteúdo:** melhor travar a estrutura de dados antes de construir os formulários do painel em cima dela.
**Referência:** replicar a arquitetura já validada no projeto do Thiago Bahls (`SISTEMA_TRADUCAO.md`) — não reinventar.

**Escopo:**
- `i18next` + `react-i18next` + `i18next-browser-languagedetector`, com `defaultResources` de fallback embutido no código
- Detecção síncrona de idioma antes do init (localStorage `i18nextLng` → navigator → fallback `pt`), evitando flash de conteúdo
- Endpoint `/translations?language={lng}` para chaves de UI gerenciadas pelo painel (`AdminTranslations`-like)
- Para conteúdo estruturado (currículo, projetos): estender o padrão do hook `useTranslatedContent` — campos duplicados por idioma (ex: `titlePt`/`titleEn`, `experiencePt`/`experienceEn`) em vez de um sistema novo
- Export/import JSON no painel (mesma ideia do projeto do Thiago)
- Seletor de idioma no site puxando o conteúdo certo via `i18n.changeLanguage()`

---

## Fase 4 — CRUD de conteúdo: Hero, Skills, Currículo
**Categoria:** `features/`
**Escopo:**
- Editar texto do Hero
- Adicionar/remover tecnologias com ícone
- Editar currículo (Professional Experience & Projects) já usando a estrutura i18n da Fase 3

---

## Fase 5 — Revamp de Projects
**Categoria:** `features/`
**Escopo:**
- Grid resumido na home com filtros
- Página de detalhe `/projects/[slug]`
- Lógica do link "live": domínio próprio do cliente, subdomínio (`projeto.guilhermemenezes.dev`) ou path (`/live/projeto`) — decidir um padrão único
- Link do repositório
- Botão "All Projects" → página com todos os projetos
- Painel: controle de grid, ordem, destaque, quantidade exibida na home

**Nota:** decidir o padrão de URL do "live" (subdomínio vs. path) antes de começar — isso afeta roteamento e é mais chato de migrar depois.

---

## Fase 6 — Blog completo (nível 3)
**Categoria:** `features/`
**Por quê nível 3 direto:** já vai existir painel administrativo nesse ponto do roadmap, então o custo extra de uma rota própria (`/blog`) compensa em vez de embutir o storytelling só na página de projeto.

**Escopo:**
- Rota própria `/blog` + `/blog/[slug]`, desacoplada da listagem de projetos
- Editor de post no painel (rich text, reaproveitando decisões de UI já tomadas nas fases anteriores)
- Vínculo opcional post ↔ projeto (pra ainda permitir contar a história de um projeto específico, sem forçar a página de projeto a carregar texto longo)
- SEO básico (meta tags, sitemap incluindo posts — o projeto do Thiago já tem geração de sitemap automático, reaproveitar a mesma lógica)
- i18n do conteúdo do post seguindo o mesmo padrão da Fase 3

---

## Fase 7 — Guestbook (versão base)
**Categoria:** `features/`
**Escopo:**
- Campo de desenho + assinatura para visitantes
- Página com galeria de todos os desenhos assinados
- Carrossel infinito na home com animação simples (balanço ao passar)
- Botão pequeno e chamativo ON/OFF (liga o modo avançado da Fase 8)

---

## Fase 8 — Guestbook avançado (Museu Virtual / Three.js)
**Categoria:** `enhancements/`
**Por quê por último:** é a feature mais complexa e opcional por definição — o próprio pedido já assume "desligado por padrão".
**Escopo:**
- Efeito Three.js acionado quando o toggle ON/OFF está ativo
- Toggle de ativação também disponível no painel admin

---

## Fase 9 — Contato com pré-orçamento
**Categoria:** `enhancements/`
**Escopo:**
- Envio de email/WhatsApp com mensagens predefinidas
- Montagem de pré-orçamento (ex: "Criar: App completo", "UI/UX: Incluso")
- Você mesmo classificou como "só refinar" — deixado por último de propósito

---

## Como usar este documento com a IA

1. Nunca cole o roadmap inteiro num prompt de execução — cole só a fase atual.
2. Para cada fase, primeiro gere o(s) README(s) de planejamento na pasta correta (`active/bugs/`, `active/features/`, `active/enhancements/`, `active/refactoring/`) com status `[draft]`.
3. Passe pelo ciclo de review do seu próprio `PADRONIZATION.md` antes de deixar a IA tocar em código: `[draft] → [ready-for-review] → [approved]`.
4. Só depois de `[approved]` abra uma sessão de execução com a IA, referenciando o README específico daquele tema — não o roadmap inteiro.
5. Ao terminar e validar manualmente, renomeie a pasta para `[done]` e marque a fase como concluída aqui neste arquivo.

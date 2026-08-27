# 🐛 Navbar corta botões da direita em larguras de tela intermediárias (768px - 1024px)

**Status:** `done`
**Data:** 2026-08-26
**Prioridade:** `alta`
**Tags:** `frontend`, `responsividade`, `ui-ux`
**Resumo:** Ajusta o texto do logo e espaçamentos da navbar para evitar corte de botões na faixa intermediária de 768px a 1024px.

---

## Descrição
Na faixa de largura de viewport onde a navbar desktop já é ativada (`md:flex`, a partir de 768px), mas a tela ainda não atingiu o breakpoint `lg` ou superior, o conteúdo total do `NavBody` (logo com texto longo `guilherme-menezes@home:~$`, 5 links de navegação com ícones + texto e os 3 botões de ação na direita: idioma, tema e email) excede o espaço disponível do container `max-w-7xl`.
Como o `NavBody` possui `overflow-hidden`, os últimos elementos da direita (especialmente o botão de email) sofrem corte visual na borda direita.

## Como Reproduzir
1. Acessar a página em um viewport com largura entre 768px e 1000px.
2. Manter a página no estado não-scrollado (navbar expandida).
3. Observar que o botão de email no canto direito da navbar fica cortado pelo limite do container.

## Contexto Técnico
- Camada afetada: frontend (`src/components/ui/resizable-navbar.tsx` e `src/components/main/Navbar.tsx`)

## Hipótese de Causa
O texto do terminal no logo (`guilherme-menezes@home:~$`) tem largura horizontal considerável (~230px). Somado aos 5 links de menu com padding `px-4 py-2` e `space-x-2`, e ao bloco de ações da direita, a largura mínima do conteúdo ultrapassa a largura da viewport na faixa entre 768px e 1024px.

## Plano de Correção (Executado)
Aplicados ajustes puramente responsivos via CSS/Tailwind:
1. **Logo com texto curto em tela intermediária (`NavbarLogo`):**
   Exibição da versão compacta `gui@home:~$` no breakpoint `md` (768px a 1023px) e alternância limpa para a versão completa `guilherme-menezes@home:~$` a partir do breakpoint `lg` (`1024px+`).
2. **Compressão proporcional de espaçamentos:**
   - Reduzido `gap-4` para `gap-2 lg:gap-4` no container flex do `NavBody`.
   - Reduzido `space-x-3` para `space-x-2 lg:space-x-3` na `NavbarLogo`.
   - Reduzido padding dos links de `px-4 py-2` para `px-2 py-1.5 lg:px-4 lg:py-2` e `space-x-2` para `space-x-1 lg:space-x-2` em `NavItems`.
   - Reduzido `gap-2` para `gap-1.5 lg:gap-2` no bloco de ações da direita (`Navbar.tsx`).
   - Adicionado `shrink-0` nos blocos principais para evitar compressão acidental.

---

## Review

## Feedback
> Testado em viewports intermediárias e aprovado pelo usuário.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [x] Sem corte de nenhum botão em viewports de 768px a 1440px.
- [x] Logo exibe `gui@home:~$` na faixa `md` e `guilherme-menezes@home:~$` em `lg+`.
- [x] Cursor piscante `█` funciona perfeitamente nas duas versões do logo.
- [x] Transição de scroll (colapso e expansão) continua funcionando perfeitamente em telas intermediárias.
- [x] **Pasta renomeada para `[done]-navbar-corte-largura-intermediaria` e movida para `archive/bugs/`**



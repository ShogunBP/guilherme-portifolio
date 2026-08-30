# 🔧 Badge DMCA Protection Status no Footer

**Status:** `done`
**Data:** 2026-08-28
**Prioridade:** `baixa`
**Tags:** `frontend`, `ui-ux`
**Resumo:** Inserção do badge DMCA Protection Status no rodapé do site com script externo lazyOnload.

---

## Contexto
O domínio `guilhermemenezes.dev` foi registrado e validado no DMCA.com. Para assegurar proteção de direitos autorais e sinalizar formalmente o status de proteção de conteúdo, é necessário exibir o selo oficial "Protection Status" do DMCA.com no rodapé do site.

## Problema Atual
O rodapé continha os links rápidos, redes sociais e contador de visitas, mas carecia de sinalização formal e link de verificação de proteção de propriedade intelectual / DMCA.

## Melhoria Proposta
Inserção do link oficial com a imagem do badge do DMCA e carregamento assíncrono não-bloqueante do script auxiliar `DMCABadgeHelper.min.js` via `next/script` com estratégia `lazyOnload` no componente [`src/components/main/Footer.tsx`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/components/main/Footer.tsx).

## Impacto Esperado
- Proteção visual e jurídica explícita para o conteúdo do portfólio.
- Sem impacto negativo de performance/LCP graças à estratégia `lazyOnload`.
- Link seguro com `target="_blank"` e `rel="noopener noreferrer"`.

## Plano de Implementação
1. Importar `Script` de `next/script` em `Footer.tsx`.
2. Adicionar o link do badge (`<a>` com `<img>`) e `<Script>` dentro do container inferior do rodapé.
3. Validar build (`npm run build`) e carregamento no navegador.

## Critérios de Conclusão
- [x] Componente `Footer.tsx` atualizado com badge e script DMCA
- [x] Script configurado com estratégia `lazyOnload`
- [x] Imagem e link do DMCA carregando corretamente
- [x] `npm run build` executado com sucesso sem erros ou quebras de tipo

---

## Review

## Feedback
> _(preencher durante o review)_

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [x] Badge exibido visualmente no rodapé em ambiente de desenvolvimento
- [x] Script DMCA carregado sem erros no console
- [x] **Pasta renomeada para `[done]-badge-dmca-footer` e movida para `archive/enhancements/`**

# 🔧 Hardening do Import de Traduções (validação de tipo e de chave)

**Status:** done
**Data:** 2026-10-06
**Prioridade:** `média`
**Tags:** `backend`, `segurança`, `api`
**Resumo:** Impedir que o import grave valores inválidos (ex.: null virando "null") e que o confirm aceite chaves que não existem nos dicionários base.

---

## Contexto

O painel `/admin/language` permite exportar e importar traduções em JSON (Fase 3.2.2). O fluxo tem duas rotas: `import/preview` (calcula o diff) e `import/confirm` (grava os overrides). Na auditoria de fechamento da Fase 3 (`dev/relatorio-execucao-auditoria-fase-3.md`), o Agente Executor testou casos de borda e reportou os dois comportamentos abaixo. Os trechos e linhas citados vêm desse relatório e foram reconfirmados no código real antes da implementação.

## Problema Atual

1. **Coerção de tipo no preview:** Em [`src/app/api/admin/translations/import/preview/route.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/api/admin/translations/import/preview/route.ts#L49), o valor era convertido com `String(val)`. Um JSON com `"hero.role": null` gerava diff com `newValue: "null"` (string literal), e um número `12345` virava `"12345"`. Se o admin confirmasse, o site público passava a exibir "null".
2. **Confirm sem validar a chave:** Em [`src/app/api/admin/translations/import/confirm/route.ts`](file:///d:/Projetos/Pessoal/Guilherme-Portifolio/src/app/api/admin/translations/import/confirm/route.ts#L25-L31), o loop só verificava se `item.key` estava preenchida, `item.lang` em `pt`/`en` e `newValue` do tipo string. Diferente do preview, não verificava se a chave existia nos dicionários base. Uma chamada direta à rota (com sessão admin válida) conseguia gravar override de chave inventada.
3. O confirm confiava no `diff` enviado pelo cliente em vez de recalcular a partir do estado atual ou validar as chaves contra os dicionários base.
4. **Chaves herdadas e itens inválidos no confirm:** O uso do operador `in` aceitava propriedades herdadas de `Object.prototype` (`toString`, `constructor`), elementos `null` no diff causavam erro 500, e valores vazios `""` eram gravados como overrides.

Impacto atual: baixo para segurança (rotas exigem sessão admin, comprovado na auditoria), médio para integridade do conteúdo público.

## Melhoria Proposta

- **Preview:** valores que não sejam `string` (ex.: `null`, números, booleanos ou objetos) e valores vazios são ignorados ou rejeitados, impedindo coerção silenciosa para texto ou gravação de strings vazias.
- **Confirm:** rejeitar (ou ignorar de forma explícita e reportada) itens cuja chave não exista como propriedade própria na base de PT/EN, reaproveitando `flatten` de `src/lib/i18n-utils.ts` (não reescrever).
- Resposta de ambas as rotas deve informar o que foi descartado/ignorado, para o painel poder exibir feedback transparente.
- Banner da interface com ícone Lucide padronizado e mensagem informativa unificada.

## Impacto Esperado

- Elimina a possibilidade de publicar "null"/números por engano via import.
- Mantém o contrato do preview e do confirm consistente entre si.
- Afeta o administrador (feedback mais claro no modal de import); sem mudança para o visitante.

## Plano de Implementação

1. Reconfirmar no código real os pontos (citar trecho e linhas).
2. Fechar as decisões com o dono do produto.
3. Ajustar o preview conforme a decisão sobre valores não-string e valores vazios.
4. Ajustar o confirm para validar propriedade própria contra a base (via `Object.hasOwn`), sanitizar tipos do array diff e tratar valores vazios.
5. Ajustar o banner do modal de import para usar componente Lucide `<Info />` e texto padronizado.
6. Testar com os casos de borda (null, número, objeto, chave inexistente, chaves herdadas, itens não-objeto no diff, valor vazio, JSON vazio, JSON inválido).

**Decisões registradas e aprovadas pelo dono do produto (06/10/2026):**
- **Valor não-string no arquivo:** Descartar pontualmente apenas os itens com valor não-string e listá-los como ignorados na resposta do preview (`ignored: [...]`).
- **Chave inexistente no confirm:** Filtrar e ignorar chaves inexistentes, gravando apenas as válidas e reportando a contagem de itens aplicados e descartados (`{ ok: true, applied, ignored }`).
- **Estratégia do confirm:** Validar individualmente cada item do diff recebido contra a lista de chaves base válidas e tipo string antes de persistir.
- **Valor vazio no import:** Ignorar e listar como ignorado (decisão do dono do produto em 06/10/2026).

**Relação com outros cards:** `[draft]-otimizacoes-painel-traducoes` (transação atômica no confirm e atalho `Esc`) mexe no mesmo `confirm/route.ts`. Sugestão de ordem: este card primeiro, depois a transação, para não haver conflito de edição.

## Critérios de Conclusão

- [x] Importar JSON com valor `null`, número ou objeto não gera mais diff com texto coagido
- [x] Preview e confirm aplicam a mesma regra de validação de chave
- [x] Confirm com chave inexistente não grava nada para aquela chave (comportamento conforme decisão registrada)
- [x] A resposta das rotas informa os itens descartados
- [x] Rotas continuam retornando 401 sem sessão admin
- [x] `flatten` continua vindo de `src/lib/i18n-utils.ts`, sem redefinição local
- [x] `npx tsc --noEmit` e `npm run build` sem erros
- [x] Validação de chave por propriedade própria em preview e confirm (chaves herdadas ignoradas)
- [x] Itens não-objeto no `diff` do confirm ignorados sem erro 500
- [x] Valor vazio ignorado e listado em preview e confirm
- [x] Banner com ícone Lucide e texto único nos dois cenários

---

## Review

## Feedback
Revisão do Tech Lead (06/10/2026): alterações solicitadas antes do `[done]` — itens 1 a 4 acima. Card reaberto como `[in-progress]`. Revisão técnica somente leitura de 2026-10-28 confirmou que os quatro pontos foram atendidos: `Object.hasOwn` em preview/confirm, saneamento de itens não-objeto, descarte de valores vazios e banner padronizado com Lucide `Info`. O humano aprovou o encerramento pela mensagem “esta aprovado”.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

Validação completa executada em 06/10/2026: (1) Chaves herdadas de Object.prototype ignoradas em preview e confirm via Object.hasOwn; (2) Elementos inválidos no array diff (especialmente null) tratados sem erro 500; (3) Valores vazios descartados com reason 'Valor vazio'; (4) Banner de interface padronizado com Lucide Info; (5) Export e persistência SSR sem regressões, validados com tsc e build limpos.

- [x] Melhoria perceptível e funcional
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-hardening-import-traducoes` e movida para `archive/enhancements/`**

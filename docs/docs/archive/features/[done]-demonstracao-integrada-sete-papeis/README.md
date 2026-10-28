# ✨ Demonstração integrada dos sete papéis

**Status:** `done`
**Data:** 2026-10-27
**Prioridade:** `baixa`
**Tags:** `infra`, `dx`, `docs`
**Resumo:** Demonstrar de ponta a ponta o fluxo humano e técnico dos sete papéis do workspace Maestri em um cenário mínimo e seguro.

---

## Objetivo
Comprovar, antes da validação humana final do workspace, que os sete papéis do Maestri participam de um fluxo único governado pelo Kanban: planejamento, aprovação humana, delegação, implementação mínima, revisão visual, QA com navegador e consolidação documental.

## Descrição Funcional
A demonstração acrescenta ao Hero da página inicial um pequeno marcador visual de ambiente de demonstração, com texto curto e acessível, sem backend, persistência ou nova infraestrutura. O Planejador especifica a alteração; o humano aprova o card; um Programador implementa com propriedade exclusiva e o outro faz revisão técnica somente leitura; Íris revisa a apresentação com screenshots; Lúmen verifica o comportamento em navegador real; o Git Manager faz somente revisão de status/diff; e o Orquestrador consolida as evidências no Kanban e no diário.

O marcador proposto deve exibir **“Demonstração multiagente”** como badge estático, discreto, responsivo e removível, próximo à apresentação principal do Hero, reutilizando os estilos existentes. O humano definiu esse texto e localização ao autorizar o envio para review em 2026-10-28. A remoção ocorrerá apenas mediante solicitação posterior. Nenhum agente pode iniciar implementação enquanto o card não estiver aprovado e o humano não autorizar expressamente o início.

## Escopo

### Inclui
- Planejamento somente leitura pelo papel Planejador Web.
- Uma alteração visual mínima e reversível no Hero da página inicial, limitada a `src/components/main/Hero.tsx`; `src/app/page.tsx` é alternativa somente se surgir necessidade real de posicionamento entre seções e houver nova delimitação de escopo.
- Implementação por um Programador com propriedade exclusiva e revisão técnica somente leitura pelo segundo, evitando uma divisão artificial de escrita.
- Revisão visual por Íris com screenshot local.
- Verificação por Lúmen em navegador local via Playwright MCP.
- Revisão somente leitura do status e diff pelo papel Git Manager Web.
- Registro append-only no LOG deste card, atualização do Panorama e sincronização do roadmap.

### Não inclui (por ora)
- Backend, banco, autenticação, i18n, APIs, dependências novas ou alteração de infraestrutura.
- Mudança nos cards ou códigos atualmente em andamento fora dos arquivos explicitamente atribuídos.
- Reexecução dos 25 testes documentais ou dos testes de paralelismo OpenCode já aprovados.
- Commit, push, merge, landing, exclusão de floor/branch ou marcação automática de done/Validação.

## Requisitos Técnicos
- Camadas envolvidas: frontend estático e documentação do fluxo.
- Dependências ou integrações necessárias: Maestri, OpenCode nos papéis de implementação/design/QA, Playwright MCP já validado e servidor local do portfólio.
- Impactos em outras partes do sistema: nenhum contrato de API ou persistência; a alteração deve respeitar tema, responsividade, acessibilidade e i18n existente ou ser neutra a idioma.
- Segurança: somente ambiente local; nenhuma navegação externa; nenhuma credencial; operações Git somente leitura.
- Governança: cada agente deve conferir este card e sua aprovação antes de executar; o Orquestrador é o único proprietário de README/LOG e `docs/DIARIO.md` no checkout canônico.

## Plano de Implementação
1. Planejador produz um plano curto, aponta os arquivos candidatos e separa responsabilidades sem editar arquivos.
2. Humano revisa este draft, autoriza `ready-for-review`, aprova o card e autoriza o início da implementação em mensagens explícitas.
3. Orquestrador registra a decisão, inicia ou reutiliza o servidor local autorizado e delega `src/components/main/Hero.tsx` com propriedade exclusiva ao Programador 1; nenhum executor altera Kanban ou diário.
4. Programador 1 implementa somente no Hero; Programador 2 revisa o diff em modo somente leitura quanto a escopo, semântica, acessibilidade e responsividade. Ambos retornam resultados reais pelo Maestri.
5. Íris captura ou analisa screenshots locais em viewport desktop e móvel, verificando legibilidade, contraste, ausência de corte/sobreposição e coerência visual; não altera arquivos sem delegação explícita posterior.
6. Lúmen executa smoke test local via Playwright MCP, incluindo carregamento da Home, marcador único e visível, texto aprovado, responsividade e ausência de erro crítico novo atribuível ao marcador.
7. Git Manager revisa status, diff e `git diff --check` somente leitura; confirma que apenas arquivos autorizados mudaram e que não houve staging, commit, dependências ou mudanças externas.
8. Orquestrador consolida LOG e diário, sincroniza roadmap e apresenta o resultado mantendo o card in-progress para validação humana.

## Critérios de Conclusão
- [x] Plano real do Planejador recebido e registrado antes da implementação.
- [x] Aprovação humana e autorização de início registradas antes de qualquer código.
- [x] Implementação mínima concluída pelo Programador 1 em `src/components/main/Hero.tsx`, seguida de revisão somente leitura pelo Programador 2, sem tocar arquivos fora do escopo.
- [x] Revisão visual de Íris registrada com screenshots locais desktop/móvel e resultado real sobre legibilidade, contraste, corte/sobreposição e coerência.
- [x] Smoke test de Lúmen via Playwright MCP registrado com resultado real e sem erro crítico novo atribuível ao marcador.
- [x] Revisão somente leitura do Git Manager registrada, sem commit ou mutação Git.
- [x] LOG, Panorama e roadmap refletem a demonstração sem repetir testes já aprovados.
- [x] Card permanece in-progress para validação humana final.

---

## Review

## Feedback
O Planejador Web revisou o draft em modo somente leitura em 2026-10-27. Recomendou limitar a escrita a `src/components/main/Hero.tsx`, substituir a divisão artificial entre dois implementadores por implementação e revisão técnica, atribuir o servidor local ao Orquestrador e distinguir erros novos de console de problemas preexistentes. Recomendações incorporadas. Em 2026-10-28, o humano definiu o texto “Demonstração multiagente”, aceitou a localização próxima à apresentação principal do Hero, aprovou o card e autorizou separadamente o início. Âmbar implementou o badge e, após Íris detectar sobreposição em desktop e móvel, corrigiu o posicionamento para `top-20`; Nébula fez revisão técnica somente leitura, Cobalto revisou o estado Git sem mutação e Lúmen concluiu o smoke test local via Playwright MCP. A etapa técnica está concluída, mas a Validação permanece exclusivamente humana e desmarcada.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Aprovação humana registrada em 2026-10-28 pela mensagem: “aprovado”. Esta marcação apenas transcreve a decisão explícita; não autoriza o início da implementação, operações Git, Validação ou encerramento do card.

---

## Validação

> Validação humana registrada em 2026-10-28 pela mensagem: “esta aprovado”. Em seguida, o humano autorizou especificamente encerrar, arquivar e desfazer a alteração demonstrativa pela mensagem: “como é uma desmontração pode marcar como done, arquivar e desfazer, agora vamos pros trabalhos reais”. Operações Git continuam fora desta autorização.

- [x] Todos os critérios de conclusão atendidos
- [x] Testado manualmente do ponto de vista do usuário
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-demonstracao-integrada-sete-papeis` e movida para `archive/features/`**

# Registro de execução

> Só acrescentar. Nunca apagar nem reescrever entradas anteriores.
> Resultado real = saída/observação verificada, nunca resumo de memória.

## Registro

### 2026-10-28 - preparação para review
- **Ação:** Análise aprofundada do card e do fluxo atual de autenticação
- **Resultado real:** `src/auth.ts` lê `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH`; não há leitura de credencial customizada no SQLite nem tela/endpoint de troca. O projeto já possui `better-sqlite3` e o fluxo atual usa credenciais, OAuth condicional e 2FA.
- **Conclusão:** parcial
- **Próximo passo:** Revisão humana das decisões de precedência, requisitos de senha, impacto em OAuth e invalidação de sessões

### 2026-10-28 - revisão de segurança consolidada
- **Ação:** Revisar o card seguinte após o arquivamento autorizado de `otimizacoes-painel-traducoes`
- **Resultado real:** A revisão confirmou que `src/auth.ts` concentra o provider Credentials e OAuth, enquanto `src/middleware.ts` instancia Auth.js somente com `auth.config.ts`; `better-sqlite3` está em `src/lib/db.ts`. A documentação atual do Auth.js confirma que JWT não pode ser invalidado antes da expiração sem estado servidor e checagem em cada apresentação. O card recebeu decisões recomendadas para fonte completa e única, fallback somente no bootstrap, fail-closed em erro de banco, política mínima de senha, `credentialVersion`, invalidação também de OAuth, controle de concorrência, integração em `/admin/security` e testes isolados. Nenhuma aprovação ou implementação foi feita.
- **Conclusão:** parcial
- **Próximo passo:** Decisão humana sobre aprovação do card revisado; se aprovado, ainda exigir autorização separada para iniciar

### 2026-10-28 - aprovação e início autorizados
- **Ação:** Registrar aprovação humana e autorização explícita para iniciar a implementação
- **Resultado real:** O humano informou “por mim tá aprovado e pode começar a implementar”. A Decisão foi marcada como aprovada e o status preparado para `in-progress`. A autorização não inclui Validação, done, commit ou push.
- **Conclusão:** funcionou
- **Próximo passo:** Implementar incrementalmente com propriedade exclusiva de arquivos e testes isolados, mantendo o card in-progress

### 2026-10-28 - implementação do domínio e autenticação
- **Ação:** Implementar tabela singleton, fonte efetiva de credenciais, atualização transacional e versionamento das sessões administrativas
- **Resultado real:** `admin_credentials` foi acrescentada ao schema; `src/lib/admin-credentials.ts` passou a usar o SQLite como fonte primária e o ambiente apenas no bootstrap, com falha fechada, `credentialVersion`, transação `IMMEDIATE` e controle otimista. `src/auth.ts` passou a emitir e conferir a versão para Credentials e OAuth; sessões legadas, desatualizadas ou sem leitura válida são sanitizadas. Harnesses temporários passaram 33/33 no domínio e 21/21 no endpoint, sem gravar credenciais no banco do projeto.
- **Conclusão:** funcionou
- **Próximo passo:** Integrar UI, cobrir todas as fronteiras administrativas e executar QA local

### 2026-10-28 - endpoint, UI e cobertura das fronteiras administrativas
- **Ação:** Integrar a troca em `/admin/security`, proteger o endpoint e aplicar o guard Node às páginas e APIs administrativas
- **Resultado real:** GET seguro expõe somente e-mail e versão; POST exige sessão vigente, senha atual, origem correspondente, corpo limitado, política de senha, rate limit global da identidade única e versão esperada. O formulário foi renderizado com estados acessíveis, preserva os caracteres literais das senhas e encerra a sessão após sucesso. A revisão independente encontrou três lacunas: APIs administrativas ainda sem o guard vigente, origem ausente aceita e chave de rate limit baseada em cabeçalho forjável. As três foram corrigidas; todas as rotas sob `src/app/api/admin` agora chamam `requireCurrentAdminSession`, POST sem `Origin` é rejeitado e o limite não confia em IP fornecido pelo cliente.
- **Conclusão:** funcionou
- **Próximo passo:** Reiniciar o servidor local, repetir QA autenticado e executar o fluxo mutante somente com autorização humana específica

### 2026-10-28 - validação estática, build e QA não mutante
- **Ação:** Validar tipos, lint proporcional, diff, build e interface autenticada sem persistir troca real
- **Resultado real:** `npx tsc --noEmit`, ESLint proporcional e `git diff --check` passaram. `npm run build` passou no Next.js 16.2.6; permaneceram avisos não bloqueantes de `middleware` obsoleto e tracing NFT amplo. O build carregou `src/lib/db.ts` e o schema idempotente criou a tabela vazia `admin_credentials` no SQLite local do projeto; nenhuma credencial foi gravada. O QA autenticado anterior ao reinício observou o processo dev antigo ainda sem a tabela em sua conexão: GET de credenciais 401, versão em travessão e botão desabilitado. A seção 2FA permaneceu visualmente íntegra; nenhuma requisição mutante, e-mail ou troca real foi executada.
- **Conclusão:** parcial
- **Próximo passo:** Reiniciar o processo dev para carregar o schema atual e repetir o QA; conflito, troca válida, novo login e invalidação da sessão antiga continuam pendentes de autorização para mutar o SQLite local

### 2026-10-29 - QA autenticado completo com mutação local autorizada
- **Ação:** Reiniciar o servidor local e executar o fluxo completo de troca de credenciais no SQLite local
- **Resultado real:** O login bootstrap funcionou; GET/UI carregaram a identidade efetiva com versão 0. Senha atual incorreta retornou 403 e manteve a versão 0. A troca válida de e-mail e senha persistiu a versão 1, encerrou a sessão e redirecionou ao login. As credenciais antigas foram rejeitadas e as novas aceitaram login. Um POST autenticado com `expectedVersion` 0 retornou 409; GET subsequente manteve versão 1 e identidade inalterada. O status do 2FA permaneceu desativado e sua interface não regrediu. Não houve 5xx, envio de e-mail ou acesso externo. O teste não preservou uma segunda sessão antiga porque o Playwright MCP compartilha contexto e cookies.
- **Conclusão:** funcionou
- **Próximo passo:** Submeter a implementação e a limitação do contexto paralelo à validação humana; o banco local permanece com a credencial temporária de QA e versão 1 até rollback administrativo explícito

### 2026-10-29 - correção de loop legado e refinamento final da interface
- **Ação:** Corrigir regressão descoberta pelo QA e alinhar o estado do botão/texto ao comportamento real do formulário
- **Resultado real:** Um JWT pré-migração gerava loop entre o middleware Edge, que o considerava autenticado, e o guard Node, que o invalidava por ausência de `credentialVersion`. `src/middleware.ts` passou a liberar sempre `/admin/login`, permitindo substituir a sessão legada; o QA prosseguiu normalmente. O texto do e-mail agora informa que manter o valor atual preserva o endereço e o botão só habilita com senha atual, versão carregada e alteração efetiva. `npx tsc --noEmit`, ESLint proporcional e `git diff --check` passaram; `npm run build` passou no Next.js 16.2.6, mantendo somente os avisos conhecidos de convenção `middleware` e tracing NFT amplo.
- **Conclusão:** funcionou
- **Próximo passo:** Aguardar validação humana; não marcar Validação, done, commit ou push automaticamente

### 2026-10-29 - validação humana e conclusão autorizadas
- **Ação:** Registrar a autorização humana para marcar a Validação e concluir o card como done
- **Resultado real:** O humano informou “pode marcar a validação e o card como done”. Os critérios de conclusão e a Validação foram marcados, mantendo registradas as limitações conhecidas do QA: sessão antiga paralela e OAuth externo não exercitados ponta a ponta. A autorização inclui a transição para done e o arquivamento do card, mas não inclui rollback da credencial local, commit, push ou merge.
- **Conclusão:** funcionou
- **Próximo passo:** Mover o card para `archive/features/[done]-admin-troca-credenciais`, sincronizar roadmap, atualizar Panorama e validar a documentação

### 2026-10-29 - tentativa de transição pela ferramenta documental
- **Ação:** Executar `docs_tool.py status admin-troca-credenciais done` após registrar a autorização humana
- **Resultado real:** A ferramenta encerrou com código 2 e informou que `done` é decisão humana e que não autentica identidade. Nenhum arquivo foi movido pela ferramenta.
- **Conclusão:** parcial
- **Próximo passo:** Efetuar manualmente a movimentação autorizada conforme o workflow documental e preservar esta tentativa no histórico

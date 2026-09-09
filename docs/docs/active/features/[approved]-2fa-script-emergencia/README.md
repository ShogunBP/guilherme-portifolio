# ✨ Script de Emergência via SSH para 2FA

**Status:** approved
**Data:** 2026-09-09
**Prioridade:** `média`
**Tags:** `infra`, `segurança`, `dx`
**Resumo:** Script de linha de comando para desativar o 2FA diretamente no SQLite via SSH em caso de perda total de acessos.

---

## Objetivo

Prover um mecanismo operacional de última instância para que o administrador do portfólio consiga desativar o 2FA caso perca simultaneamente o dispositivo autenticador e todos os códigos de backup, operando diretamente no servidor via SSH sem depender de interface web ou rotas HTTP.

## Descrição Funcional

1. **Acesso Direto ao Servidor:** O administrador conecta-se à VPS via SSH e executa o script `npx tsx scripts/emergency-disable-2fa.ts`.
2. **Desativação no Banco:** O script lê o caminho do banco a partir de `process.env.DATABASE_PATH` e executa a desativação da flag `enabled` na tabela `two_factor_auth`.
3. **Invalidação dos Códigos:** Todos os códigos de backup associados são marcados como usados ou deletados para impedir acessos residuais.
4. **Feedback Claro:** O terminal imprime uma mensagem explicativa com o resultado da operação. Se o 2FA já estiver inativo, avisa sem emitir erro confuso.
5. **Isolamento de Segurança:** O script nunca é exposto via web ou API HTTP — a chave de acesso SSH do servidor é o único controle de autorização.

## Depende de

Cards 1 (`[ready-for-review]-2fa-basico-opcional`) e 2 (`[draft]-2fa-codigos-backup`) devem estar `[done]`.

## Escopo

### Inclui

- Script `scripts/emergency-disable-2fa.ts` executável via `npx tsx` ou `node`.
- Conexão direta ao SQLite respeitando `process.env.DATABASE_PATH`.
- Desativação do 2FA (`enabled = 0`) e invalidação de todos os códigos de backup.
- Comentário explícito no topo do arquivo alertando que o script é estritamente para uso via SSH e jamais deve ser exposto via HTTP.
- Menção no `README.md` da raiz do repositório na seção de scripts operacionais.

### Não inclui (por ora)

- Nenhuma rota de API, formulário web ou interface HTTP.

## Requisitos Técnicos

- **Camadas envolvidas:** infra / scripts (Node.js/TypeScript com `better-sqlite3`).
- **Segurança:** restrito ao canal seguro SSH do host VPS; nenhuma dependência de autenticação web.

## Plano de Implementação

1. Criar o arquivo `scripts/emergency-disable-2fa.ts`.
2. Implementar conexão com o SQLite usando `process.env.DATABASE_PATH` com fallback para `./data/portfolio.db`.
3. Adicionar lógica de verificação se o 2FA está ativo: se já inativo, emitir mensagem clara e sair com código 0.
4. Se ativo, atualizar `enabled = 0`, invalidar/limpar `two_factor_backup_codes` e imprimir confirmação destacada.
5. Incluir aviso de segurança no topo do arquivo proibindo exposição HTTP.
6. Adicionar instrução de uso no `README.md` da raiz do projeto.

## Critérios de Conclusão

- [ ] Script conecta ao SQLite via `DATABASE_PATH` e desativa `enabled` do 2FA com sucesso
- [ ] Todos os códigos de backup existentes são invalidados
- [ ] Execução com 2FA já inativo informa o estado sem falhas
- [ ] Após a execução, login volta a funcionar apenas com primeiro fator (sem pedir 2FA)
- [ ] Comentários no topo do script reforçam proibição estrita de exposição HTTP
- [ ] Validado e testado localmente com SQLite e documentado para uso em produção

---

## Review

## Feedback
Aprovado pelo usuário em 09/09/2026. Depende da conclusão dos Cards 1 e 2.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [ ] Todos os critérios de conclusão atendidos
- [ ] Testado manualmente do ponto de vista operacional
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-2fa-script-emergencia` e movida para `archive/features/`**

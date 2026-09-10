# ✨ Script de Emergência via SSH para 2FA

**Status:** done
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

Cards 1 (`[done]-2fa-basico-opcional`), 2 (`[done]-2fa-codigos-backup`) e 3 (`[done]-2fa-confirmacao-seguranca`) estão concluídos ✅.

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

- [x] Script conecta ao SQLite via `DATABASE_PATH` e desativa `enabled` do 2FA com sucesso
- [x] Todos os códigos de backup existentes são invalidados
- [x] Execução com 2FA já inativo informa o estado sem falhas
- [x] Após a execução, login volta a funcionar apenas com primeiro fator (sem pedir 2FA)
- [x] Comentários no topo do script reforçam proibição estrita de exposição HTTP
- [x] Validado e testado localmente com SQLite e documentado para uso em produção

---

## Review

## Feedback
Script implementado no commit `55d191f`, validado em todos os 3 cenários operacionais (ativo, inativo e erro de banco) e aprovado pelo usuário.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> Validado com sucesso nos 3 cenários operacionais e aprovado pelo usuário em 10/09/2026.

- [x] Todos os critérios de conclusão atendidos
- [x] Testado manualmente do ponto de vista operacional
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-2fa-script-emergencia` e movida para `archive/features/`**

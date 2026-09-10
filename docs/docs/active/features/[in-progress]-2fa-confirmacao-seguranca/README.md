# ✨ Confirmação de Segurança para Desativar e Redefinir 2FA

**Status:** in-progress
**Data:** 2026-09-09
**Prioridade:** `alta`
**Tags:** `backend`, `frontend`, `segurança`
**Resumo:** Exigência de confirmação via TOTP ou código de backup para desativar ou redefinir 2FA, fechando a brecha do toggle simples.

---

## Objetivo

Eliminar a vulnerabilidade do toggle simples (onde qualquer pessoa com a sessão HTTP ativa poderia desativar a segurança), passando a exigir obrigatoriamente a comprovação de posse do segundo fator (TOTP atual ou código de backup) antes de permitir que o 2FA seja desativado ou redefinido.

## Descrição Funcional

1. **Ações Sensíveis Bloqueadas:** Na página `/admin/security`, os botões "Desativar 2FA" e "Redefinir 2FA" deixam de executar a ação imediatamente e passam a abrir um modal de confirmação de segurança.
2. **Métodos de Confirmação:** O usuário pode confirmar fornecendo:
   - O código TOTP atual de 6 dígitos.
   - Um código de backup válido e não utilizado.
3. **Opção de E-mail (Mockada com Aviso):** O modal exibe também a opção "Confirmar por e-mail", mas não envia e-mails reais nesta fase — exibe um aviso claro de que a funcionalidade está em integração futura, com comentário `// TODO:` para integração futura via Resend.
4. **Lógica de Desativação:** Após confirmação válida, marca `enabled = false`, desativa os códigos de backup e limpa o cookie `admin_2fa_verified`.
5. **Lógica de Redefinição:** Descarta o secret atual e invalida todos os códigos de backup antigos, encaminhando imediatamente para novo setup com geração de novos códigos.

## Depende de

Cards 1 (`[done]-2fa-basico-opcional`) e 2 (`[done]-2fa-codigos-backup`) estão concluídos ✅.

## Escopo

### Inclui

- Rota/Server Action dedicada `src/app/api/admin/2fa/confirm-sensitive-action/route.ts` que valida a prova de segundo fator antes de autorizar a ação.
- Modal de confirmação na página `/admin/security` acionado pelos botões "Desativar 2FA" e "Redefinir 2FA".
- Suporte a validação por código TOTP de 6 dígitos ou código de backup `XXXX-XXXX`.
- Opção visual de confirmação por e-mail com aviso de pendência futura.
- Descarte e invalidação atômica de credenciais antigas ao redefinir.

### Não inclui (por ora)

- Envio real de mensagens por e-mail via Resend (interface presente com aviso transparente de pendência).

## Requisitos Técnicos

- **Camadas envolvidas:** backend (rota de validação e desativação/redefinição no SQLite), frontend (modal de confirmação responsivo com tratamento de erros).
- **Segurança:** nenhuma ação de desativação ou redefinição é executada sem a validação do token do segundo fator.

## Plano de Implementação

1. Criar rota `src/app/api/admin/2fa/confirm-sensitive-action/route.ts` aceitando `{ action, code, type }`.
2. Implementar verificação se o código é TOTP ou backup code não usado.
3. Decisão de consumo: códigos de backup usados em confirmações sensíveis são marcados como consumidos para evitar reuso.
4. Implementar modal no componente de segurança em `/admin/security`.
5. Implementar botão "Confirmar por e-mail" com mensagem clara e comentário `// TODO: Resend integration`.
6. Conectar a confirmação bem-sucedida à desativação (`enabled = 0`) ou redefinição (novo setup).

## Critérios de Conclusão

- [ ] Tentativa de desativar ou redefinir 2FA sem fornecer código de confirmação é estritamente rejeitada
- [ ] Desativação de 2FA funciona com código TOTP atual válido
- [ ] Desativação de 2FA funciona com código de backup válido
- [ ] Redefinição invalida segredo e códigos de backup anteriores, encaminhando para novo setup
- [ ] Opção de confirmação por e-mail exibe mensagem de pendência sem simular envio
- [ ] Validado e testado em ambiente local e em produção na VPS

---

## Review

## Feedback
Aprovado pelo usuário em 09/09/2026. Depende da conclusão prévia dos Cards 1 e 2.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [ ] Todos os critérios de conclusão atendidos
- [ ] Testado manualmente do ponto de vista do usuário
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-2fa-confirmacao-seguranca` e movida para `archive/features/`**

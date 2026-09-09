# ✨ Códigos de Backup do 2FA

**Status:** draft
**Data:** 2026-09-09
**Prioridade:** `alta`
**Tags:** `backend`, `segurança`
**Resumo:** Geração de 10 códigos de backup de uso único hasheados no SQLite com exibição única no setup e uso alternativo no login.

---

## Objetivo

Implementar um mecanismo de recuperação de acesso caso o dispositivo do usuário com o app autenticador seja perdido ou fique inacessível, fornecendo 10 códigos de backup descartáveis gerados no momento da ativação do 2FA.

## Descrição Funcional

1. **Geração no Setup:** Ao confirmar o primeiro código TOTP com sucesso no setup do 2FA (Card 1), o sistema gera 10 códigos de backup aleatórios no formato `XXXX-XXXX`.
2. **Exibição Única:** Os 10 códigos são exibidos em texto claro uma única vez em tela dedicada (`/admin/setup-2fa/backup-codes`), com aviso destacado, botão de cópia de todos os códigos e uma trava por checkbox obrigatório ("Já salvei meus códigos de backup com segurança") antes de prosseguir.
3. **Uso no Login:** Na tela de verificação `/admin/verify-2fa`, é exibida a opção alternativa "Usar código de backup". O usuário digita um dos códigos em vez do TOTP de 6 dígitos.
4. **Descarte Imediato:** Ao validar o hash com sucesso, o código é marcado como usado (`used = 1`) no banco de dados e nunca mais pode ser reutilizado.

## Depende de

Card 1 (`[ready-for-review]-2fa-basico-opcional`) deve estar `[done]` antes de iniciar este. Os cards 3 e 4 dependem da estrutura criada aqui.

## Escopo

### Inclui

- Tabela `two_factor_backup_codes` no SQLite (`id`, `user_id`, `code_hash`, `used`, `used_at`, `created_at`).
- Geração criptograficamente segura de 10 códigos no formato `XXXX-XXXX`.
- Armazenamento dos códigos sempre em formato hasheado (`bcryptjs`), nunca em texto puro.
- Tela de exibição dos códigos pós-setup com botão de copiar e checkbox de confirmação.
- Opção alternativa na tela `/admin/verify-2fa` para validar código de backup e emitir o cookie de sessão `admin_2fa_verified`.
- Rejeição estrita de códigos já utilizados.

### Não inclui (por ora)

- Regeneração avulsa de códigos de backup fora do fluxo de redefinição completa (melhoria futura).
- Exigência de código de backup para confirmar desativação ou redefinição de segurança (escopo do Card 3).

## Requisitos Técnicos

- **Camadas envolvidas:** backend (geração segura, hashing com bcrypt, persistência SQLite), frontend (etapa de exibição no setup e alternância de input na verificação).
- **Dependências:** `bcryptjs` (já presente no projeto) e módulo nativo `crypto`.
- **Segurança:** códigos são armazenados exclusivamente como hashes; após uso, a flag `used` é ativada imediatamente.

## Plano de Implementação

1. Criar a tabela `two_factor_backup_codes` em `src/lib/db.ts`.
2. Implementar em `src/lib/totp.ts` funções para gerar 10 códigos `XXXX-XXXX`, hashear e persistir no SQLite.
3. Criar função de validação de código de backup que compara o hash, valida se `used === 0` e atualiza para `used = 1` com timestamp.
4. Adicionar etapa no fluxo de setup (`/admin/setup-2fa`) para exibir os 10 códigos em texto claro com botão de cópia e trava por checkbox.
5. Adicionar alternância na tela `/admin/verify-2fa` para alternar entre código TOTP e código de backup.
6. Validar a rejeição de códigos já consumidos.

## Critérios de Conclusão

- [ ] 10 códigos de backup no formato `XXXX-XXXX` são gerados na ativação do 2FA
- [ ] Códigos são armazenados hasheados no SQLite (nunca em texto puro)
- [ ] Códigos são exibidos em texto claro exatamente uma vez, com botão de copiar e trava de confirmação antes de prosseguir
- [ ] Opção "Usar código de backup" na tela de verificação permite login bem-sucedido
- [ ] Código de backup usado é marcado como consumido e rejeitado em tentativas posteriores
- [ ] Validado e testado em ambiente local e em produção na VPS

---

## Review

## Feedback
> _(preencher durante o review)_

## Decisão
- [ ] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [ ] Todos os critérios de conclusão atendidos
- [ ] Testado manualmente do ponto de vista do usuário
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-2fa-codigos-backup` e movida para `archive/features/`**

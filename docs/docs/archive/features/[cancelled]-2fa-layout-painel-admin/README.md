# ✨ 2FA (TOTP) e Layout Base do Painel Admin

**Status:** cancelled
**Data:** 2026-09-09
**Prioridade:** `alta`
**Tags:** `backend`, `frontend`, `segurança`, `ui-ux`
**Resumo:** Card monolítico cancelado e decomposto em 5 cards menores modulares para execução incremental da Subfase 2.4.

> [!NOTE]
> **Substituído por 5 cards modulares:**
> Este card unificava 2FA e layout. Em 09/09/2026, foi cancelado e substituído pelos seguintes cards na esteira:
> 1. `[ready-for-review]-2fa-basico-opcional` (2FA básico via TOTP opcional com toggle)
> 2. `[draft]-2fa-codigos-backup` (10 códigos de backup descartáveis)
> 3. `[draft]-2fa-confirmacao-seguranca` (Confirmação obrigatória para desativar/redefinir)
> 4. `[draft]-2fa-script-emergencia` (Script emergencial via SSH no SQLite)
> 5. `[draft]-admin-layout-painel` (Layout base responsivo e 6 seções placeholder)

---

## Depende de

`[done]-sqlite-persistencia-inicial` (para armazenar o secret TOTP e códigos de backup), `[done]-login-email-senha` e `[done]-login-social-google-github` (2FA se aplica a todos os métodos de login existentes).

## Objetivo

Adicionar uma segunda camada de segurança ao login de forma opcional (configurável pelo painel admin na seção de segurança), com códigos de backup e mecanismo de recuperação emergencial via SSH, além de entregar o layout base do painel e suas 6 seções administrativas funcionais (como placeholders para as fases futuras).

## Descrição Funcional

1. **2FA Opcional:** No primeiro login (ou em qualquer login enquanto o 2FA não for ativado), o usuário é direcionado imediatamente ao painel (`/admin`), sem qualquer bloqueio ou redirecionamento forçado.
2. **Gerenciamento no Painel:** Na página de Segurança (`/admin/seguranca`), o administrador pode acompanhar o status do 2FA, ativar pela primeira vez, desativar ou redefinir.
3. **Setup e Códigos de Backup:** Ao ativar em `/admin/setup-2fa`, o sistema gera o segredo TOTP, exibe o QR Code e confirma o primeiro código de 6 dígitos. Após a ativação bem-sucedida, são gerados 10 códigos de backup de uso único (formato `XXXX-XXXX`), hasheados no SQLite e exibidos em texto claro uma única vez em tela dedicada com botão de cópia e confirmação obrigatória de salvamento.
4. **Desafio de Segundo Fator:** Com o 2FA ativo, todo login subsequente (Email/Senha, Google ou GitHub) exige o código TOTP de 6 dígitos ou um código de backup na tela `/admin/verify-2fa`.
5. **Confirmação para Ações Sensíveis:** Desativar ou redefinir o 2FA exige confirmação de segundo fator (TOTP ou código de backup). A interface contém campo para confirmação por e-mail com aviso de integração futura (sem simulação).
6. **Recuperação de Emergência via SSH:** Script direto no servidor (`scripts/emergency-disable-2fa.ts`) para desativação emergencial em caso de perda total de dispositivos.
7. **Sessão Sincronizada de 7 dias:** A sessão JWT do NextAuth e o cookie `admin_2fa_verified` têm validade de 7 dias (`604800` segundos).
8. **Layout Base do Painel:** Navegação entre as 6 seções (Hero, Skills, Currículo, Projetos, Idioma, Guestbook) com layout responsivo dark glassmorphic e páginas placeholder.

## Escopo

### Inclui

- **2FA Condicional:** middleware verifica `admin_2fa_verified` apenas se o 2FA estiver ativo no banco (`enabled = 1`).
- **Setup 2FA (`/admin/setup-2fa`):** geração de secret TOTP com `otpauth`, QR code com `qrcode`, validação de primeiro código.
- **Códigos de Backup:** geração de 10 códigos alfanuméricos (`XXXX-XXXX`), hash bcrypt no SQLite (`two_factor_backup_codes`), exibição única com botão de cópia e validação/consumo de uso único em `/admin/verify-2fa`.
- **Página de Segurança (`/admin/seguranca`):** status de proteção, botão para ativar, e botões para desativar/redefinir.
- **Confirmação de Ações Sensíveis:** verificação de TOTP ou código de backup antes de desativar ou redefinir o 2FA. Interface com campo para confirmação por e-mail com aviso de pendência.
- **Script de Emergência SSH (`scripts/emergency-disable-2fa.ts`):** comando via terminal para desativar 2FA e limpar backups diretamente no SQLite.
- **Sessão de 7 dias:** configuração de `maxAge: 7 * 24 * 60 * 60` no NextAuth e no cookie `admin_2fa_verified`.
- **Layout Base e 6 Seções:** layout compartilhado com sidebar responsiva, badges de fases e 6 páginas com rotas funcionais (`/admin/hero`, `/admin/skills`, `/admin/curriculo`, `/admin/projetos`, `/admin/idioma`, `/admin/guestbook`).

### Não inclui (por ora)

- Envio real de e-mails de confirmação via Resend (interface mockada com aviso claro de integração futura).
- Tela de regeneração avulsa de códigos de backup sem redefinir o 2FA.
- Edição real de conteúdo nas 6 seções administrativas (Fase 3 em diante).

## Requisitos Técnicos

- **Camadas envolvidas:** frontend (telas de setup, verificação, segurança e layout do painel), backend (rotas e Server Actions de autenticação TOTP/backup) e banco de dados SQLite (`better-sqlite3`).
- **Dependências:** `otpauth` (validação TOTP RFC 6238), `qrcode` e `@types/qrcode` (renderização de QR Code), `bcryptjs` (hashing dos códigos de backup).
- **Banco de Dados:** tabela `two_factor_auth` (já existente no SQLite) e nova tabela `two_factor_backup_codes`.
- **Criptografia de Sessão 2FA:** token assinado com HMAC-SHA256 via Web Crypto API (`src/lib/totp-token.ts`), válido no Edge Runtime.

## Plano de Implementação

1. **Schema & Helpers de Banco:** adicionar tabela `two_factor_backup_codes` em `src/lib/db.ts` e métodos de consulta/atualização em `src/lib/totp.ts`.
2. **Configuração de Sessão (7 dias):** configurar `maxAge: 604800` em `src/auth.config.ts`, `src/auth.ts` e `src/lib/totp-token.ts`.
3. **Middleware Condicional:** ajustar `src/middleware.ts` para checar 2FA apenas quando ativado.
4. **Telas e Rotas de 2FA:**
   - `/admin/setup-2fa` e tela de backup codes.
   - `/admin/verify-2fa` com suporte a TOTP e código de backup.
   - Ação para desativar/redefinir com confirmação.
5. **Layout Base e Seção de Segurança:**
   - Implementar layout `src/app/admin/(dashboard)/layout.tsx`.
   - Página `/admin/seguranca`.
   - Páginas placeholder das 6 seções.
6. **Script de Emergência:** criar `scripts/emergency-disable-2fa.ts`.
7. **Testes e Validação:** validar todos os 6 pontos de teste solicitados.

## Critérios de Conclusão

- [ ] 2FA opcional: login sem 2FA ativado entra direto no `/admin` sem redirecionamento para telas de 2FA
- [ ] Setup inicial de 2FA funcional (gera secret, QR code escaneável, confirma ativação)
- [ ] 10 códigos de backup de uso único gerados no setup, hasheados no SQLite e exibidos uma única vez
- [ ] Login com 2FA ativo exige TOTP em todos os métodos (Email/Senha, Google, GitHub)
- [ ] Opção de código de backup na tela de verificação valida e consome o código (código usado é rejeitado na tentativa seguinte)
- [ ] Página de Segurança no painel exibe status e opções de ativar, desativar e redefinir
- [ ] Desativar ou redefinir 2FA exige confirmação de segundo fator (TOTP ou backup válido)
- [ ] Script de emergência via SSH (`emergency-disable-2fa.ts`) desativa o 2FA e limpa backups diretamente no SQLite
- [ ] Duração da sessão JWT e do cookie 2FA configurada para 7 dias (`maxAge: 604800`)
- [ ] Layout do painel navegável entre as 6 seções com visual consistente com o site público
- [ ] Secret TOTP e códigos de backup persistem corretamente no SQLite após redeploy

---

## Review

## Feedback
Ajustes solicitados formalizados em 07/09/2026: 2FA opcional, códigos de backup, confirmação obrigatória para ações sensíveis, script de emergência via SSH e sessão de 7 dias.

## Decisão
- [ ] Aprovado
- [x] Alterações solicitadas: Card cancelado e decomposto em 5 cards menores modulares em 09/09/2026.

---

## Validação

> _(preencher após execução e teste)_

- [ ] Todos os critérios de conclusão atendidos
- [ ] Teste de opcionalidade validado
- [ ] Teste de códigos de backup validado
- [ ] Teste de desativação e redefinição validado
- [ ] Teste de script de emergência validado
- [ ] Teste de duração de sessão (7 dias) validado
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-2fa-layout-painel-admin` e movida para `archive/features/`**

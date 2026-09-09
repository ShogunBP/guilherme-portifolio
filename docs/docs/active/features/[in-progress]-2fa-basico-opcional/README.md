# ✨ 2FA Básico Opcional (TOTP + Toggle)

**Status:** in-progress
**Data:** 2026-09-09
**Prioridade:** `alta`
**Tags:** `backend`, `frontend`, `segurança`
**Resumo:** Implementação base de 2FA via TOTP totalmente opcional, sincronizada em 7 dias, com setup por QR Code e toggle simples no painel.

---

## Objetivo

Implementar a camada base de autenticação de dois fatores via TOTP (RFC 6238), sendo **totalmente opcional** — nunca forçado em nenhum login. O usuário ativa quando desejar pelo painel administrativo, mantendo o login funcionando apenas com o primeiro fator (senha ou social) enquanto estiver desativado.

## Descrição Funcional

1. **Login Sem 2FA:** Se o 2FA nunca foi ativado (`enabled = false`), o login com senha ou OAuth direciona o usuário imediatamente para o painel (`/admin`), sem qualquer tela de 2FA.
2. **Setup sob Demanda:** A qualquer momento, um usuário autenticado pode acessar a página de segurança (`/admin/seguranca`) e clicar em "Ativar 2FA", abrindo a tela `/admin/setup-2fa`.
3. **Ativação:** A tela de setup gera um segredo TOTP, exibe o QR Code escaneável e código alfanumérico para digitação manual, exigindo a confirmação do primeiro código de 6 dígitos para marcar `enabled = true`.
4. **Desafio de Login:** Uma vez ativado, todo login subsequente (qualquer método) exige o código TOTP na tela `/admin/verify-2fa` antes de liberar o acesso.
5. **Toggle Simples:** Nesta versão básica, o usuário pode desativar o 2FA com um simples toggle no painel logado (a exigência de confirmação de segundo fator para desativação será implementada no Card 3).
6. **Duração de 7 dias:** A sessão JWT do NextAuth e o cookie de 2FA (`admin_2fa_verified`) possuem validade sincronizada de 7 dias (`604800` segundos).

## Depende de

`[done]-sqlite-persistencia-inicial`, `[done]-login-email-senha`, `[done]-login-social-google-github`. Este é o card 1 de 5 da Subfase 2.4 — os cards 2, 3 e 4 dependem deste.

## Escopo

### Inclui

- Tabela `two_factor_auth` no SQLite (`id`, `secret`, `enabled`, `created_at`, `updated_at`).
- Utilitários de geração e validação TOTP em `src/lib/totp.ts` utilizando a biblioteca `otpauth`.
- Geração de imagem do QR Code em Data URL via biblioteca `qrcode`.
- Cookie de sessão 2FA `admin_2fa_verified` assinado via HMAC-SHA256 (Web Crypto API em `src/lib/totp-token.ts`) com duração de 7 dias.
- Configuração de `maxAge: 7 * 24 * 60 * 60` na sessão JWT do NextAuth em `src/auth.config.ts`.
- Tela `/admin/setup-2fa` para geração de secret, exibição do QR Code e confirmação do primeiro código.
- Tela `/admin/verify-2fa` para desafio de 6 dígitos no login, preservando deep-linking (`admin_redirect`).
- Middleware condicional em `src/middleware.ts` que só exige 2FA se `enabled = true`.
- Página de segurança mínima (`/admin/seguranca`) com status do 2FA e botão para ativar/desativar.

### Não inclui (por ora)

- Códigos de backup descartáveis (escopo do Card 2).
- Confirmação com segundo fator para desativar ou redefinir (escopo do Card 3).
- Script de emergência via SSH (escopo do Card 4).
- Layout completo do painel com as 6 seções (escopo do Card 5).

## Requisitos Técnicos

- **Camadas envolvidas:** backend (NextAuth, rotas de validação TOTP, SQLite), frontend (telas de setup, verificação e página simples de segurança) e middleware (Edge Runtime).
- **Dependências:** `otpauth` (RFC 6238) e `qrcode` (`@types/qrcode`).
- **Impactos:** login sem 2FA permanece transparente; sessões ativas são sincronizadas para 7 dias.

## Plano de Implementação

1. Garantir que `otpauth`, `qrcode` e `@types/qrcode` estejam presentes no `package.json`.
2. Implementar `src/lib/totp.ts` (geração de secret, URI, QR code e validação com tolerância de 30s).
3. Implementar `src/lib/totp-token.ts` (assinatura/validação HMAC-SHA256 com `AUTH_SECRET` e validade de 7 dias).
4. Configurar `session.maxAge: 604800` e `jwt.maxAge: 604800` em `src/auth.config.ts` e `src/auth.ts`.
5. Criar tela de setup `/admin/setup-2fa` e rota de confirmação de primeiro código.
6. Criar tela de verificação `/admin/verify-2fa` com input de 6 dígitos e auto-focus.
7. Ajustar `src/middleware.ts` para verificar `admin_2fa_verified` apenas se o 2FA estiver ativo no banco.
8. Criar rota/página `/admin/seguranca` com toggle simples de ativar/desativar.

## Critérios de Conclusão

- [x] 2FA opcional: login sem 2FA ativado entra direto no `/admin` sem redirecionamento para telas de 2FA
- [x] Setup funcional: gera secret, exibe QR code real escaneável e confirma ativação com código de 6 dígitos
- [x] Login com 2FA ativo exige código TOTP em todos os métodos (Email/Senha, Google, GitHub)
- [x] Código TOTP incorreto rejeita o acesso
- [x] Desativar pelo toggle simples desliga o 2FA e o próximo login não pede mais código
- [x] Sessão principal JWT e cookie `admin_2fa_verified` configurados com duração sincronizada de 7 dias (`maxAge: 604800`)
- [ ] Validado e testado em ambiente local e em produção na VPS

---

## Review

## Feedback
Aprovado pelo usuário em 09/09/2026 para início imediato da execução do card 1 (`in-progress`).

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [ ] Todos os critérios de conclusão atendidos
- [ ] Testado manualmente do ponto de vista do usuário
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-2fa-basico-opcional` e movida para `archive/features/`**

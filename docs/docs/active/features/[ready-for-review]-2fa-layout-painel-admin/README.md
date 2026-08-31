# ✨ 2FA (TOTP) e Layout Base do Painel Admin

**Status:** `ready-for-review`
**Data:** 2026-08-31
**Prioridade:** `alta`
**Tags:** `backend`, `frontend`, `segurança`, `ui-ux`
**Resumo:** Segunda camada de autenticação via TOTP para todos os métodos de login, e a navegação base do painel entre as 6 seções administrativas.

---

## Objetivo
Adicionar uma segunda camada de segurança ao login (já que o painel vai controlar edição de conteúdo real do site público a partir da Fase 4), e entregar a navegação funcional do painel para as fases seguintes construírem em cima.

## Descrição Funcional
Após completar o primeiro fator (senha ou social), o usuário é solicitado a inserir um código de 6 dígitos gerado por um app autenticador (Google Authenticator ou similar) antes de a sessão ser liberada. Na primeira vez, uma tela dedicada de setup (`/admin/setup-2fa`, acessível apenas com o primeiro fator já validado) gera o secret, exibe um QR code para escanear, e confirma o primeiro código antes de ativar o 2FA definitivamente. Após o 2FA estar ativo, todo login subsequente (qualquer método) exige o código TOTP. Uma vez autenticado com os dois fatores, o usuário acessa o layout do painel: navegação entre Hero, Skills, Currículo, Projetos, Idioma e Guestbook — cada seção como página placeholder.

## Escopo

### Inclui
- Tela `/admin/setup-2fa`: gera secret TOTP, salva no SQLite, exibe QR code, confirma primeiro código.
- Verificação de código TOTP como etapa obrigatória após o primeiro fator, em todos os métodos de login (email/senha, Google, GitHub).
- Layout base do painel: navegação entre as 6 seções (Hero, Skills, Currículo, Projetos, Idioma, Guestbook), reaproveitando componentes ShadCN e a paleta já existente no site público.
- Cada seção como página com rota e navegação funcionais, conteúdo placeholder (sem edição real).

### Não inclui
- Qualquer funcionalidade de edição de conteúdo real (Fase 4 em diante).
- Recuperação de acesso caso o dispositivo com o app autenticador seja perdido (considerar isso como melhoria futura, não crítico para usuário único com acesso à VPS).

## Requisitos Técnicos
- **Camadas envolvidas:** frontend (tela de setup, tela de verificação, layout do painel) e backend (geração/validação TOTP).
- **Dependências novas:** `otpauth` ou `speakeasy` (geração e validação TOTP), biblioteca de geração de QR code (ex: `qrcode`).
- **Persistência:** utiliza a tabela de 2FA configurada no card de SQLite.

## Plano de Implementação
1. Implementar tela `/admin/setup-2fa` (geração de secret, QR code, confirmação).
2. Implementar verificação de código TOTP como etapa pós-primeiro-fator, para os 3 métodos de login já existentes.
3. Layout base do painel (navegação lateral/superior entre as 6 seções).
4. Páginas placeholder para cada seção.

## Critérios de Conclusão
- [ ] Setup inicial do 2FA funcional (gera secret, QR code escaneável, confirma ativação)
- [ ] Login via email/senha exige código TOTP após a senha
- [ ] Login via Google exige código TOTP após a autenticação social
- [ ] Login via GitHub exige código TOTP após a autenticação social
- [ ] Código TOTP incorreto rejeita o login, mesmo com primeiro fator correto
- [ ] Layout do painel navegável entre as 6 seções, visualmente consistente com o site público
- [ ] Secret TOTP persiste corretamente após redeploy (reutilizando o teste de persistência do card de SQLite)

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
- [ ] Testado manualmente do ponto de vista do usuário (setup completo + login com 2FA em todos os métodos)
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-2fa-layout-painel-admin` e movida para `archive/features/`**

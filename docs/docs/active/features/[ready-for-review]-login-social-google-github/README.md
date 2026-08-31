# ✨ Login Social (Google e GitHub) Restrito ao Dono

**Status:** `ready-for-review`
**Data:** 2026-08-31
**Prioridade:** `alta`
**Tags:** `backend`, `frontend`, `segurança`, `api`
**Resumo:** Login via Google e GitHub, aceitando apenas a conta específica do dono do portfólio, sem cadastro aberto.

---

## Depende de

`[draft]-login-email-senha` — este card estende a mesma configuração do Auth.js já feita ali (middleware, sessão JWT, cookies seguros). Não iniciar sem o login por email/senha já validado em produção.

## Objetivo
Oferecer uma forma mais rápida de login (sem digitar senha) para o dono do portfólio, sem abrir a porta para cadastro público — a segurança do "usuário único" precisa ser garantida mesmo com OAuth de terceiros no meio.

## Descrição Funcional
Na tela de login, dois botões adicionais: "Entrar com Google" e "Entrar com GitHub". Ao completar o fluxo OAuth, o sistema verifica se o e-mail retornado pelo provider bate exatamente com `ADMIN_EMAIL`. Se bater, sessão é criada normalmente. Se não bater, o login é rejeitado mesmo que o OAuth tenha sido tecnicamente bem-sucedido (a pessoa provou ser dona daquela conta Google/GitHub, mas essa conta não é a autorizada).

## Escopo

### Inclui
- Provider Google configurado no Auth.js.
- Provider GitHub configurado no Auth.js.
- App OAuth registrado no Google Cloud Console e nas GitHub Developer Settings.
- Callback `signIn` validando o e-mail retornado contra `ADMIN_EMAIL`, para ambos os providers.
- Botões de login social na tela de login já existente (`/admin`).
- Mensagem de erro clara quando o e-mail não bate (ex: "Esta conta não tem acesso a este painel").

### Não inclui
- 2FA para login social (card separado, aplica-se a todos os métodos de uma vez).
- Múltiplos e-mails autorizados (é sempre um único e-mail fixo).

## Requisitos Técnicos
- **Camadas envolvidas:** frontend (botões de login), backend (callbacks OAuth).
- **Dependências:** nenhuma nova além do que o Auth.js já traz nativamente para providers OAuth.
- **Variáveis de ambiente novas:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — configuradas na stack do Portainer, nunca commitadas.
- **Configuração externa necessária:** registrar as URLs de callback (`https://guilhermemenezes.dev/api/auth/callback/google` e equivalente para GitHub) nos respectivos consoles de desenvolvedor.

## Plano de Implementação
1. Registrar app OAuth no Google Cloud Console, obter client ID/secret.
2. Registrar app OAuth 2 no GitHub Developer Settings, obter client ID/secret.
3. Configurar os dois providers no Auth.js.
4. Implementar callback `signIn` restringindo por e-mail.
5. Adicionar botões de login social na tela existente.
6. Testar rejeição explícita com uma conta que não seja a autorizada.

## Critérios de Conclusão
- [ ] Login via Google com a conta autorizada funciona e cria sessão
- [ ] Login via Google com outra conta é rejeitado, com mensagem clara
- [ ] Login via GitHub com a conta autorizada funciona e cria sessão
- [ ] Login via GitHub com outra conta é rejeitado, com mensagem clara
- [ ] Variáveis sensíveis configuradas na stack do Portainer, nunca commitadas

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
- [ ] Testado manualmente do ponto de vista do usuário (incluindo tentativa de rejeição com conta não autorizada)
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-login-social-google-github` e movida para `archive/features/`**

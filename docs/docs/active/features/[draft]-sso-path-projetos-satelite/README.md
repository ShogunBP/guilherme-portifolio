# ✨ Decisão de Arquitetura: SSO e URL em Path para Projetos Satélite

**Status:** draft
**Data:** 2026-09-05
**Prioridade:** média
**Tags:** `backend`, `infra`, `segurança`
**Resumo:** Decisão de arquitetura para SSO entre o painel admin e futuros projetos satélite via path, usando JWT assinado padrão em vez do formato proprietário do NextAuth.

---

## Objetivo

Permitir que o dono do portfólio, já logado no `/admin`, acesse projetos satélite futuros (ex: `guilhermemenezes.dev/projects/{slug}`) sem precisar logar novamente, mesmo que esses projetos rodem em containers Docker separados e em stacks tecnológicas distintas.

## Descrição Funcional

O administrador realiza login no portfólio principal (`guilhermemenezes.dev/admin`) utilizando qualquer um dos métodos suportados (credenciais ou OAuth) e valida o segundo fator (TOTP). Ao navegar para qualquer projeto satélite hospedado no mesmo domínio sob o caminho de URL `/projects/{slug}` (ex: `guilhermemenezes.dev/projects/test`), o projeto satélite intercepta a requisição, lê o cookie de sessão compartilhado do mesmo domínio e valida a assinatura do token JWT diretamente, reconhecendo a identidade do administrador sem exigir uma nova tela de login ou sincronização de banco de dados.

## Depende de

Subfase 2.4 (`[in-progress]-2fa-layout-painel-admin`) deve estar concluída e arquivada como `[done]` antes desta mudança de token ser implementada em código, para não interferir na estabilização do fluxo de login e 2FA atual. A execução prática desta decisão ocorrerá na Fase 5 (Revamp de Projects) ou como preparação para o primeiro container satélite.

## Escopo

### Inclui

- Trocar a estratégia de sessão do Auth.js/NextAuth no Guilherme-Portifólio de JWE criptografado proprietário (padrão) para JWT assinado padrão (via `jose` ou callbacks customizados de `encode`/`decode`), mantendo total compatibilidade com os fluxos de login já implementados (email/senha, Google, GitHub, 2FA).
- Documentar o contrato de validação da sessão (algoritmo de assinatura como HS256, claims esperadas como `email`, `id`, `exp`) para que qualquer projeto satélite em qualquer linguagem/stack (Node.js, Python, Go, Rust) consiga validar o token de forma independente.
- Compartilhar a chave de assinatura (`AUTH_SECRET` ou chave derivada especificamente para esse propósito) com os containers dos projetos satélite via variável de ambiente.
- Configuração de roteamento reverso via Nginx em path (`proxy_pass /projects/{slug}/` apontando para a porta do container satélite) garantindo que os cookies do domínio `guilhermemenezes.dev` sejam enviados automaticamente pelo navegador.

### Não inclui (por ora)

- Implementação ou deploy de nenhum container de projeto satélite específico neste momento (escopo da Fase 5 e projetos futuros).
- Suporte a subdomínios (decisão explícita tomada de adotar path para simplificar compartilhamento de cookies e evitar configuração de domínio raiz `.guilhermemenezes.dev`).
- Alteração imediata no código de autenticação da Fase 2 (esta decisão é documentada agora para nortear a Fase 5 sem retrabalho).

## Requisitos Técnicos

- **Camadas envolvidas:** backend (formato de token de sessão no NextAuth), infra (roteamento Nginx `proxy_pass` por path, variáveis de ambiente).
- **Dependências ou integrações necessárias:** biblioteca `jose` (ou Web Crypto API nativa) para codificação e assinatura de tokens JWT padrão.
- **Impactos em outras partes do sistema:** a alteração da codificação do cookie exigirá que sessões ativas façam re-login quando for implantada.

## Plano de Implementação

1. Concluir e estabilizar a Fase 2 (2FA e layout do painel).
2. Customizar os métodos `jwt.encode` e `jwt.decode` no `src/auth.config.ts` / `src/auth.ts` utilizando `jose` para gerar JWTs assinados com algoritmo HS256 e payload padronizado.
3. Criar utilitário/middleware de referência (exemplo em Node.js e Python) para consumo em projetos satélite.
4. Configurar regras de `proxy_pass` no Nginx do host VPS para encaminhar `/projects/{slug}` ao container satélite correspondente.
5. Validar o compartilhamento do cookie e o acesso autenticado automático no primeiro projeto satélite.

## Critérios de Conclusão

- [ ] Estratégia de sessão do Guilherme-Portifólio emite JWT assinado legível por bibliotecas padrão como `jose`
- [ ] Login e sessão no painel `/admin` continuam operando normalmente sem quebras
- [ ] Contrato e exemplo de verificação do token documentados para projetos satélite
- [ ] Nginx configurado para rotear `/projects/{slug}` para container satélite
- [ ] Projeto satélite de teste valida sessão do admin sem exigir novo login

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
- [ ] **Pasta renomeada para `[done]-sso-path-projetos-satelite` e movida para `archive/features/`**

# ✨ Decisão de Arquitetura: SSO e URL em Path/Subdomínio para Projetos Satélite

**Status:** draft
**Data:** 2026-09-05
**Prioridade:** média
**Tags:** `backend`, `infra`, `segurança`
**Resumo:** Decisão de arquitetura para SSO entre o painel admin e futuros projetos satélite via path e/ou subdomínio, usando JWT assinado padrão em vez do formato proprietário do NextAuth.

---

## Objetivo

Permitir que o dono do portfólio, já logado no `/admin`, acesse projetos satélite futuros sem precisar logar novamente, independente de esses projetos rodarem como path (`guilhermemenezes.dev/projects/{slug}`) ou subdomínio (`{slug}.guilhermemenezes.dev`), e mesmo que rodem em containers Docker separados e em stacks tecnológicas distintas.

## Descrição Funcional

O administrador realiza login no portfólio principal (`guilhermemenezes.dev/admin`) utilizando qualquer um dos métodos suportados (credenciais ou OAuth) e valida o segundo fator (TOTP). Ao navegar para qualquer projeto satélite hospedado no mesmo domínio sob path (ex: `guilhermemenezes.dev/projects/test`) ou subdomínio (ex: `galeria.guilhermemenezes.dev`), o projeto satélite intercepta a requisição, lê o cookie de sessão compartilhado e valida a assinatura do token JWT diretamente, reconhecendo a identidade do administrador sem exigir uma nova tela de login ou sincronização de banco de dados.

## Depende de

Subfase 2.4 (`[in-progress]-2fa-layout-painel-admin`) deve estar concluída e arquivada como `[done]` antes desta mudança de token ser implementada em código, para não interferir na estabilização do fluxo de login e 2FA atual. A execução prática desta decisão ocorrerá na Fase 5 (Revamp de Projects) ou como preparação para o primeiro container satélite.

## Escopo

### Inclui

- Trocar a estratégia de sessão do Auth.js/NextAuth no Guilherme-Portifólio de JWE criptografado proprietário (padrão) para JWT assinado padrão (via `jose` ou callbacks customizados de `encode`/`decode`), mantendo total compatibilidade com os fluxos de login já implementados (email/senha, Google, GitHub, 2FA).
- Documentar o contrato de validação da sessão (algoritmo de assinatura como HS256, claims esperadas como `email`, `id`, `exp`) para que qualquer projeto satélite em qualquer linguagem/stack (Node.js, Python, Go, Rust) consiga validar o token de forma independente.
- Compartilhar a chave de assinatura (`AUTH_SECRET` ou chave derivada especificamente para esse propósito) com os containers dos projetos satélite via variável de ambiente própria de cada um.
- **Suportar os dois cenários de escopo de cookie**, decidindo caso a caso por projeto satélite, não como uma escolha única e global:
  - **Path** (ex: `guilhermemenezes.dev/projects/test`): cookie no escopo do domínio exato já basta, nenhuma configuração extra de domínio necessária.
  - **Subdomínio** (ex: `galeria.guilhermemenezes.dev`): exige configurar o cookie do Guilherme-Portifólio com escopo `.guilhermemenezes.dev` (com o ponto), para que subdomínios também recebam o cookie automaticamente.

### Não inclui (por ora)

- Implementação de nenhum projeto satélite específico (isso é escopo de tarefas futuras de projetos individuais, incluindo os exemplos mapeados abaixo).
- Domínios totalmente diferentes de `guilhermemenezes.dev` (fora do escopo desta decisão — exigiria abordagem de token de entrada temporário, não cookie compartilhado).
- Alteração imediata no código de autenticação da Fase 2 (esta decisão é documentada agora para nortear a Fase 5 sem retrabalho).

## Exemplos Mapeados (para referência futura)

1. **Linktree** — será uma página/rota *dentro do mesmo código/container* do Guilherme-Portifólio (ex: `/linktree`, ou um subdomínio configurado no Nginx apontando de volta para o mesmo container). Não precisa de SSO nem desta decisão — é a mesma aplicação, mesma sessão, sem nenhuma questão de compartilhamento de cookie entre containers.
2. **Galeria/portfólio de imagens** — projeto Docker separado, com área administrativa própria que deve reconhecer a sessão do `/admin` sem exigir novo login. **Ainda não decidido** se será path ou subdomínio — qualquer uma das duas opções é suportada pela arquitetura de JWT assinado descrita acima; a decisão final de path vs. subdomínio para este projeto específico fica para quando ele for de fato planejado.

## Requisitos Técnicos

- **Camadas envolvidas:** backend (formato de token de sessão no NextAuth), infra (roteamento Nginx `proxy_pass` por path ou subdomínio, escopo de cookie `.guilhermemenezes.dev`, variáveis de ambiente).
- **Dependências ou integrações necessárias:** biblioteca `jose` (ou Web Crypto API nativa) para codificação e assinatura de tokens JWT padrão.
- **Impactos em outras partes do sistema:** a alteração da codificação do cookie exigirá que sessões ativas façam re-login quando for implantada.

## Plano de Implementação

1. Concluir e estabilizar a Fase 2 (2FA e layout do painel).
2. Customizar os métodos `jwt.encode` e `jwt.decode` no `src/auth.config.ts` / `src/auth.ts` utilizando `jose` para gerar JWTs assinados com algoritmo HS256 e payload padronizado.
3. Se houver projeto satélite em subdomínio, ajustar a configuração de cookies no Auth.js (`domain: '.guilhermemenezes.dev'`).
4. Criar utilitário/middleware de referência (exemplo em Node.js e Python) para consumo em projetos satélite.
5. Configurar regras de `proxy_pass` no Nginx do host VPS (para path ou bloco de subdomínio).
6. Validar o compartilhamento do cookie e o acesso autenticado automático no primeiro projeto satélite.

## Critérios de Conclusão

- [ ] Estratégia de sessão do Guilherme-Portifólio emite JWT assinado legível por bibliotecas padrão como `jose`
- [ ] Configuração de escopo de cookie suporta tanto path quanto subdomínios sob `guilhermemenezes.dev`
- [ ] Login e sessão no painel `/admin` continuam operando normalmente sem quebras
- [ ] Contrato e exemplo de verificação do token documentados para projetos satélite
- [ ] Nginx configurado adequadamente para rotear o projeto satélite
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

# ✨ Decisão de Arquitetura: SSO e URL em Path/Subdomínio para Projetos Satélite

**Status:** ready-for-review
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

1. Registrar a decisão de escopo do primeiro consumidor: path ou subdomínio; não assumir `Domain=.guilhermemenezes.dev` como padrão global.
2. Definir contrato versionado do token: algoritmo, emissor, audiência, claims mínimas, expiração, rotação de chave, logout e revogação.
3. Criar um protótipo local isolado de emissão e validação, sem substituir o cookie usado pelo painel atual.
4. Criar um projeto satélite de teste local que valide o contrato em uma segunda aplicação, usando segredo de teste separado e sem credenciais de produção.
5. Avaliar a interoperabilidade de Auth.js com `jwt.encode`/`jwt.decode` customizados e confirmar impacto de re-login das sessões existentes.
6. Definir a configuração de cookie por consumidor e documentar `Secure`, `HttpOnly`, `SameSite`, `Path` e `Domain`.
7. Documentar exemplos de validação em Node.js e Python somente depois de o contrato ser testado.
8. Configurar Nginx apenas em ambiente controlado e após existir um satélite de teste; nenhuma alteração de produção entra neste card sem autorização específica.
9. Migrar o formato do cookie principal somente após aprovação separada da prova local e do plano de rollback.

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
A análise confirmou que o Auth.js permite sobrescrever `jwt.encode` e `jwt.decode`, mas o padrão atual é JWE criptografado. A migração para JWT assinado altera o contrato de sessão e pode invalidar sessões existentes. O card deve ser tratado primeiro como decisão/prova arquitetural: contrato versionado, consumidor local de teste, política de cookie e rollback precisam ser definidos antes de alterar o cookie principal ou o Nginx de produção. Fonte consultada: documentação oficial do Auth.js via Context7, referência de JWT e exemplo de HS256 para interoperabilidade.

## Decisão
- [ ] Aprovado
- [ ] Alterações solicitadas

> Status `ready-for-review`: aguardando revisão e decisão humana. O planejamento não autoriza implementação.

---

## Validação

> _(preencher após execução e teste)_

- [ ] Todos os critérios de conclusão atendidos
- [ ] Testado manualmente do ponto de vista do usuário
- [ ] Nenhuma regressão identificada
- [ ] **Pasta renomeada para `[done]-sso-path-projetos-satelite` e movida para `archive/features/`**

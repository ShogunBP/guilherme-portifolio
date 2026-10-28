# 🐛 Hardening HTML do e-mail de contato

**Status:** `done`
**Data:** 2026-10-28
**Prioridade:** `média`
**Tags:** `backend`, `segurança`, `api`
**Resumo:** Escapar corretamente conteúdo enviado no e-mail de contato sem introduzir regressão no assunto.

---

## Descrição
A rota de contato insere nome, assunto e mensagem fornecidos pelo usuário em um template HTML de e-mail. A PR #4 troca a remoção simples de `<` e `>` por `escapeHtml`.

## Como Reproduzir
1. Enviar conteúdo com entidades, aspas e marcação para a API de contato.
2. Inspecionar o HTML do e-mail recebido.
3. Verificar também o assunto e entradas com CRLF e tamanho excessivo.

## Comportamento Esperado
Conteúdo do usuário deve ser exibido como texto no e-mail, sem HTML interpretável, e o assunto deve preservar o texto esperado sem entidades literais indevidas.

## Comportamento Atual
A sanitização existente remove `<` e `>`, o que já bloqueia tags simples no corpo, mas não é um escaping HTML completo. A PR melhora o corpo, porém aplica `sanitizedSubject` no header `subject`, podendo fazer o assunto exibir `&amp;` literalmente. Não há evidência de teste da branch.

## Contexto Técnico
- Camada afetada: backend e API.
- Arquivo: `src/app/api/contact/route.ts`.
- A análise indicou que o e-mail é validado por regex; não foram avaliados limites de tamanho nem CRLF em execução.
- O risco principal é HTML injection no e-mail de notificação, não XSS confirmado no site.

## Hipótese de Causa
O mesmo valor escapado para HTML foi reutilizado no campo de assunto, que possui contrato diferente. O escaping deve ocorrer por contexto: HTML no corpo e tratamento apropriado para assunto/headers.

## Plano de Correção
1. Separar valores de texto cru validados dos valores escapados para o corpo HTML.
2. Escapar `&` antes dos demais caracteres no corpo.
3. Definir tratamento para CRLF, tamanho e conteúdo do assunto.
4. Adicionar testes unitários do helper e testes da rota sem credenciais reais.
5. Confirmar envio usando uma integração controlada ou mock do provedor.

---

## Review

## Feedback
A PR #4 é hardening válido, mas o stripping prévio já bloqueava tags simples. O diff deve ser ajustado para não usar HTML entities no assunto. Não houve execução de testes, envio real ou mutação do checkout.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

Autorização humana registrada em 2026-10-28: todas as nove PRs foram aprovadas para implementação.

---

## Validação

> Evidências parciais registradas no LOG: harness com `fetch` mockado confirmou escaping, sanitização do assunto e rejeição de payload não-string; não houve envio real de e-mail.

- [x] Bug não reproduz mais
- [x] Nenhuma regressão identificada
- [x] **Pasta renomeada para `[done]-hardening-html-email-contato` e movida para `archive/bugs/`**

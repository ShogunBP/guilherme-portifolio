# ♻️ Migração da Porta do Portfólio na VPS (3000 -> 8083)

**Status:** `done`
**Data:** 2026-08-31
**Prioridade:** `alta`
**Tags:** `infra`
**Resumo:** Migração da porta exposta no host da VPS de 3000 para 8083 com proxy_pass do Nginx e zero downtime.

---

## Motivação
A porta `3000` é uma porta padrão frequentemente utilizada para desenvolvimento ou outros serviços. Para evitar conflitos de portas na VPS e padronizar o mapeamento de portas dos serviços locais gerenciados pelo Nginx de borda, o Guilherme-Portifólio foi migrado para escutar na porta `8083` do host (`127.0.0.1:8083:3000`), liberando totalmente a porta 3000.

## Situação Atual
- O `docker-compose.yml` da VPS e o Nginx apontavam para `127.0.0.1:3000:3000`.

## Situação Desejada
- `docker-compose.yml` configurado com `127.0.0.1:8083:3000`.
- Configuração do Nginx (`/etc/nginx/sites-available/guilhermemenezes.dev`) atualizada com `proxy_pass http://127.0.0.1:8083;`.
- Porta 3000 liberada na VPS e serviço respondendo 100% com HTTPS e zero downtime.
- Sem qualquer impacto ou regressão no `tb-portifolio` (`thiagobahlsportfolio.com`).

## Riscos
- Risco de downtime durante a troca: mitigado subindo o container na nova porta antes de aplicar `sudo systemctl reload nginx` (reload gracioso sem `restart`).

## Estratégia de Execução
1. Atualização do `docker-compose.yml` no repositório e na VPS (`127.0.0.1:8083:3000`).
2. Ajuste do `proxy_pass` no Nginx para `http://127.0.0.1:8083;` e teste de sintaxe (`nginx -t`).
3. Recriação do container com `docker compose up -d --force-recreate`.
4. Validação direta via `curl` na porta `8083`, teste no domínio HTTPS e reload do Nginx.

---

## Critérios de Conclusão
- [x] `docker-compose.yml` atualizado para binding `127.0.0.1:8083:3000`
- [x] Nginx testado com sintaxe válida (`nginx -t`) e reloaded com sucesso
- [x] Container recriado e em estado saudável (`Up (healthy)`)
- [x] Domínio `https://guilhermemenezes.dev` respondendo HTTP 200 OK com HTTPS
- [x] Porta 3000 confirmada como liberada (`Connection refused`)
- [x] Validação de não-regressão no `tb-portifolio` (`https://thiagobahlsportfolio.com` HTTP 200 OK)

---

## Review

## Feedback
> Execução concluída diretamente na VPS com sucesso e zero downtime.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste)_

- [x] Resposta direta na porta nova: `curl -I http://127.0.0.1:8083` -> `HTTP/1.1 200 OK`
- [x] Domínio principal: `curl -I https://guilhermemenezes.dev` -> `HTTP/1.1 200 OK`
- [x] Rota de PDF do currículo: `curl -I https://guilhermemenezes.dev/resume.pdf` -> `HTTP/1.1 200 OK` (163KB)
- [x] Porta 3000 liberada: `curl -I http://127.0.0.1:3000` -> `Failed to connect (Connection refused)`
- [x] Não-regressão confirmada: `curl -I https://thiagobahlsportfolio.com` -> `HTTP/1.1 200 OK`
- [x] **Pasta arquivada diretamente em `archive/refactoring/[done]-migracao-porta-vps-8083/`**

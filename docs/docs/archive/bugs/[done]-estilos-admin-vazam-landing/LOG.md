# Registro de execução

> Só acrescentar. Nunca apagar nem reescrever entradas anteriores.
> Tentativa refutada = entrada com **Conclusão: refutado**, com ação e resultado reais.
> Resultado real = saída/observação de verdade (cole trechos), nunca resumo de memória.

## Registro

### 2026-10-28 19:12 - card criado
- **Ação:** card criado a partir do template do padrão (draft)
- **Conclusão:** ok

### 2026-10-28 19:19 - status: draft -> ready-for-review
- **Ação:** status draft -> ready-for-review por agente, após autorização explícita do humano
- **Conclusão:** ok

### 2026-10-28 19:20 - status: approved -> in-progress
- **Ação:** status approved -> in-progress por agente, após autorização explícita do humano
- **Conclusão:** ok

### 2026-10-28 - diagnóstico, correção e encerramento visual
- **Ação:** Nébula identificou estilos administrativos aplicados no layout raiz e no scrollbar global e aplicou isolamento por `admin-shell`.
- **Resultado:** `src/app/layout.tsx` foi restaurado à neutralidade de tema; `src/app/globals.css` recebeu scrollbar global neutro e escopo cósmico por `html:has(.admin-shell)`, `.admin-shell` e `.admin-shell *`; oito roots administrativos receberam o marcador em cinco arquivos.
- **Evidência:** Playwright pré-correção observou `body` com `rgb(3,0,20)` na landing. `npx tsc --noEmit` terminou com exit 0. `npx eslint` nos arquivos alterados terminou com exit 0, sem erros e dois avisos preexistentes. `npm run lint` terminou com exit 1 porque o script usa `next lint`, indisponível no Next 16; falha preexistente e fora do escopo.
- **Limitação:** Nébula não executou QA pós-correção no navegador, screenshots antes/depois ou navegação automatizada landing → admin → landing. O humano informou validação visual positiva. O fallback sem suporte a `:has()` degrada para scrollbar neutro no admin.
- **Conclusão:** correção aplicada e validada por TypeScript, ESLint e confirmação visual humana; card encerrado com a ausência de QA automatizado pós-correção explicitamente registrada.
- **Próximo passo:** nenhum dentro deste card; ajustar o tom neutro da landing ou executar QA automatizado somente em tarefa autorizada separadamente.

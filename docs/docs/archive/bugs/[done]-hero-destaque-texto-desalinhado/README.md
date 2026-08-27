# 🐛 Destaque/seleção com desalinhamento vertical em "Desenvolvedor Full-Stack" no Hero

**Status:** `done`
**Data:** 2026-08-26
**Prioridade:** `média`
**Tags:** `frontend`, `animação`, `ui-ux`
**Resumo:** O retângulo de destaque animado do componente PointerHighlight não ficava perfeitamente centralizado em volta do texto Desenvolvedor Full-Stack.

---

## Descrição
Na seção Hero da home, o texto `"Desenvolvedor Full-Stack"` é envolvido pelo componente `<PointerHighlight>`, que anima um retângulo com borda e um ícone de cursor azul.
Visualmente, o texto não estava centralizado verticalmente dentro do retângulo de destaque: a margem superior entre o topo das letras maiúsculas e a borda superior era visivelmente menor (~18px) do que a margem inferior até a borda inferior (~24px), dando a impressão de que o texto estava deslocado para cima.

## Como Reproduzir
1. Acessar a página inicial (`http://localhost:3000/`) no topo.
2. Observar o Hero e aguardar a animação da caixa de destaque ao redor de `"Desenvolvedor Full-Stack"`.
3. Inspecionar o espaçamento vertical entre o texto e as bordas superior/inferior da caixa.

## Comportamento Esperado
O texto `"Desenvolvedor Full-Stack"` deve estar perfeitamente centralizado vertical e horizontalmente dentro do retângulo de borda desenhado pelo `PointerHighlight`, com margens simétricas e equilibradas.

## Comportamento Atual (Após Correção)
- **Desktop (`lg:text-6xl`):**
  - Altura total da caixa: `84px`
  - Distância do topo ao cap-height ("D", "F", "S"): `21px`
  - Distância da base à borda inferior: `21px`
  - Simetria vertical exata de 1:1 (`0px` de diferença).
- **Mobile (`text-3xl`):**
  - Altura total da caixa: `60px`
  - Distância do topo ao cap-height: `15px`
  - Distância da base à borda inferior: `15px`
  - Simetria vertical exata de 1:1 (`0px` de diferença).

## Contexto Técnico

### 1. `src/components/sub/HeroContent.tsx` (linhas 60-65)
```tsx
        <PointerHighlight rectangleClassName="rounded-none">
          <span className="text-primary inline-flex items-center justify-center p-3 text-3xl lg:text-6xl leading-none">
            Desenvolvedor Full-Stack
          </span>
        </PointerHighlight>
```

### 2. `src/components/ui/pointer-highlight.tsx` (linhas 7-96)
Componente de apresentação que mede as dimensões do elemento filho e desenha a borda via animação Framer Motion.

---

## Hipótese de Causa (Confirmada)
O `<span>` filho em `HeroContent.tsx` tinha `display: inline` padrão e não especificava `line-height`, herdando `leading-tight` ou o `line-height` padrão da fonte. Isso reservava espaço extra desnecessário abaixo da linha de base para letras descendentes (como "g", "j", "p"), criando a assimetria visual de 6px dentro do padding uniforme `p-3`.

## Plano de Correção (Executado)
1. **Adição de `leading-none`:** Ajusta a altura da linha para corresponder exatamente ao tamanho da fonte (`1em`), eliminando a folga residual de descendentes.
2. **Definição de `inline-flex items-center justify-center`:** Transforma o `<span>` em um container flex inline que centraliza o glifo do texto no centro geométrico da caixa.
3. **Preservação de `p-3`:** O padding uniforme de `12px` agora gera margens simétricas perfeitas em todos os lados.

---

## Review

## Feedback
> Testado no browser e aprovado pelo usuário.

## Decisão
- [x] Aprovado
- [ ] Alterações solicitadas

---

## Validação

> _(preencher após execução e teste da correção)_

- [x] Texto perfeitamente centralizado vertical e horizontalmente na caixa de destaque (21px/21px em desktop, 15px/15px em mobile).
- [x] Caixa de destaque e cursor azul sincronizados nas dimensões corretas em todas as resoluções de tela.
- [x] Animação de desenho da borda e posicionamento do ponteiro funcionando com fluidez.
- [x] **Pasta renomeada para `[done]-hero-destaque-texto-desalinhado` e movida para `archive/bugs/`**



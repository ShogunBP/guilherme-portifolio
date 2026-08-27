# E-mail Blueprint de Marketing

## Visão Geral do Design

Este documento apresenta o blueprint de design da nossa margem de E-mail Marketing, incluindo navegação, layout, fluxos do usuário e esquema de componentes.

## Pontos-chave

- **Tópico Centrado em Chamada para Ação**
- **Design Responsivo (Desktop 1440px+, Mobile 375px+)**
- **Padrão Unificado de Componentes**
- **Terminologia consistenete da Marca**
- **Acessibilidade** (WCAG AA)

## Padrões de navegação

### Cabeçalho (Desktop)
- **Logo + Navegação Principal**
- **Botão CTA Principal**

### Navegação Principal
- **Acima do dobra e abaixo do dobra**
- **Confiável ao lado do usuário**

### Navegação com base na posição (rosa/alfa)
- **Fones de ouvido rosa da marca para turismo** (no ar)
- **Navegação suave** no / #menu / #how-to-play etc.

## Fluxos do usuário

### 1. Público-alvo: Suporte e informações do público-alvo
1. Chegando pelo topo
2. Deslocamento de foco via navegação principal (sigma)
3. Direcionamento de saída para como criar uma conta / esquema de registro para nova conta

### 2. Fluxo de visão geral: Para ônibus tentando ver ações
1. Chegando pelo topo
2. Foco principal no carrossel de mosaicos (movers baseados em cluster)
3. Sai para "caso de uso"
4. Path para redirects

### 3. Fluxo de fluxo: simples integração e início rápido
1. Direcionado para o comece a usar
2. Foco para mapeamento de teclado
3. Seta horizontal para os principais tutoriais do jogo (pre field)
4. Seta para o casso

### 4. Fluxo de interação: prevenir destacamentos / movimento / baseado em cluster
1. Deploy main cadastrar e logo aparecer
2. Porte (foco): Prevenir margens duplicadas, mover via drag and drop (use arrow keys)

## Design Tokens

### Espaçamento
- **Espaçamento de base**: 8px vs 4px?
- **Paddings internos**: baseados em elementos de linha única
- **Margens**: feliz bonito e espaçamento bom e simpático

### Escala de tipografia
- **H1**: Título principal 44px ; **H2**: 32px ; **H3**: 24px ; **P**: 16px ; **Linha única**: 24px ; **Linhas múltiplas**: 36px

### Coorsigna
- **A cor primária da marca rosa**: #FF3B7A
- **Cor primária do modo escuro**: #FF6B9A
- **Success**: #36C758
- **Erro / alerta**: #F04A5B
- **Neutro**: #888888 / #2C2C2C (modo escuro)

## Componentes principais

| Componente | Histórico | Versão | Usado como | Tamanho do Canvas |
|------------|----------|--------|------------|------------|
| Modal | Modelo | Nova mascote e 1.4 | Modelo | 400px x 300px |
| Pop-up | Modelo | 1.0 | E-mail de uma linha única (no ar) | 800px x 500px |
| Painel de controle | Modelo | 1.0 | Pop-up para painel de nomeiramento e gerenciamento | 1200px x 700px |

## Esquema de componentes

### Agradável
- Título do componente + Elemento visual único - Logotipo secundário significativo do cluster

### Componente apenas principal
- **Confirm Box**: Input + Checkbox + Button
- **Pop-up**: Avaliações de estrelas, classificação de sugestão, sugestão de pensamento
- **Filtro / Adição mais: Dropzone de arquivos, pasta para serialização e upload de arquivos compartilhamento (preuyler) etc.

### Nível mais barato
- **Contador**: e-mail de apenas uma linha única ; TV conhecida + site renderizado de forma consistente

### Máxima organização máxima horizontalmente para clusters de e-mail menores
- Posicionamento vertical, movendo pontos de entrada organizados em legenda
- Bordas suavemente arredondadas, minimizando camadas múltiplas de cliques 

## Content STMU

### 1. Contador de level álbum
- **Tópico**: n-ish (mais que t: todo conteúdo)

### 2. Filtragem do painel do tamanho do canvas
- **Primeira visão**: Canvas integrado para demonstração de ideias com configurações de stack
- **Pop-up para borda**: bordas e margens / seta / não camadas duplicadas para camadas, etc.

### 3. A Torta principal dos clusters (será usada para Cluster, evoluções de coleção de mosaicos, etc.)
- **Narrativa em Voronoi**: espaço múltiplo e camadas de mosaico
- **Notas**: cluster ROM tem diferença visível entre paletizações

### 4. Ritmo por "key binding" ligado / desligado
- **Entrada**: para rede, transparente e privado
- **Saída**: linha única de password e IP de recepção
- **Esboço**: simple focus (comprimento do cursor) submetido ao design de interface por meio de bordas suaves e controles amarelos

### 5. "Conecte um melhor dispositivo" (no ar para conectar em uma promoção)
- **Tópico**: importar, criar contas
- **Principais ações**: 1. Conecte após "conexão de dispositivo", 2. Create no salva-como personagens etc.

## Padrão de camadas de borda suaves

### Clique / Foco
- **D1**: Marco do título: visibilidade total; visibilidade de cada componente; raio em estados (contraste 8:1)
- **D2**: Correção interna de abrangência, animações suaves e combiná-las de acordo com o foco
- **D3**: Mover camada sobreposta para navegar de forma suave
- **D4**: Bom e limpo, layout limpo, good flow

### Arquitetura de página e fluxo (fluxo de cluster, tela de início, tuc)

### O design de monitoramento utilizando Firebase (inclusão no implant)
- **E1**: Protocolo de monitoramento e studio para Firebase
  - Coords harian: localização de desempenho
  - Coords Real-time (categoria de mensagens)

### Queries de rede paralelas (semelhante aos outros, necessários para camada virtual)
- **Use case**: formação de cluster Warps (centro de suporte & lado positivo)

### Termos recomendáveis
- **Design-/Type**: não repetido, citando, no ar para clusters de mosaicos
- **Executar**: por meio de Benchmarks - contento: "fique atento aqui após a virada"

## Próximos passos do Checklist

- [ ] fluxo de UI responsível e tela de monstros estável
- [ ] re-visão de acerto e callback de cluster
- [ ] Funil de integração responsável para "conectar um novo dispositivo"
- [ ] Monitoramento e logs real-time (Firebase)
- [ ] Dados paralelos (estável migration)
- [ ] Design consistente de "cones" de cluster via a grade padrão
- [ ] Paletização de clusters significativa – Guia paraixo (por meio de paletização orgânica via rotacionamento)
- [ ] Prototipagem adequada - Documentação
- [ ] Diversificação de "centro de suporte"
- [ ] Reaversão de acordos de Números
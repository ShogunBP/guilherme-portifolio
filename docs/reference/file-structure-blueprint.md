# Blueprint Estrutural de Arquivos

## Visão Geral

Este blueprint detalha a organização de arquivos, padrões de nomenclatura, localização de arquivos crítica e separação de preocupações no Portfólio Guilherme Menezes (Next.js + TypeScript).

## Organização de diretórios

```
projeto-raiz/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Página inicial (Home)
│   │   ├── api/                # Rotas API
│   │   │   ├── contact/        # Rota /api/contact
│   │   │   │   └── route.ts     # Manipulador de formulário de contato
│   │   └── layout.tsx         # RootLayout (fixo)
│   ├── components/             # Bibliotecas de componentes reutilizáveis
│   │   ├── main/              # Componentes da seção principal
│   │   │   ├── Hero.tsx       # Seção Hero principal
│   │   │   ├── Skills.tsx     # Grade de habilidades técnicas
│   │   │   ├── Projects.tsx   # Grade de demonstrações de projetos
│   │   │   ├── Timeline.tsx   # Linha do tempo de experiência
│   │   │   ├── ContactUs.tsx  # Seção de contato interativo
│   │   │   ├── Footer.tsx     # Rodapé fixo
│   │   │   └── Resume.tsx    # Carreira / Resumo
│   │   ├── sub/              # Componentes de população utilitária
│   │   │   ├── HeroContent.tsx # RENOVAÇÃO semântica do componente Hero
│   │   │   ├── SkillText.tsx   # Visualizador de texto de habilidade
│   │   │   └── SkillDataProvider.tsx # Wrapper de dados de habilidade como componente
│   │   └── ui/               # Componentes básicos da UI
│   │       ├── badge.tsx      # Componente de visualizador de status
│   │       ├── button.tsx     # Componente de botão reutilizável
│   │       ├── card.tsx       # Layout de cartão da UI
│   │       ├── dialog.tsx     # Modal com base em Radix UI
│   │       ├── dropdown-menu.tsx # Dropdown da interface do menu
│   │       ├── separator.tsx  # Componente de divisor visual
│   │       ├── timeline.tsx   # Lista da linha do tempo
│   │       └── pointer-highlight.tsx # Elemento de destaque interativo
│   ├── hooks/                 # hooks personalizados
│   │   └── use-toogle.tsx     # Hook otimizado para interação (buraco tipográfico)
│   ├── constants/             # Definicos centralizados de dados estáticos
│   │   └── index.ts           # Exporta habilidades, redes, etc.
│   │   └── skill.ts           # Tipagem TS para entradas de dados de habilidades
│   └── globals.css            # Base Tailwind global, tema de modo escuro
├── components.json             # Configuração para componentes shadcn/ui
├── env.d.ts                    # Tipagem TypeScript para Cloudflare env vars
├── tsconfig.json              # Configuração de base do TypeScript
├── tsconfig.jest.json          # Configuração de tipos para testes
├── jest.config.mjs             # Configuração do jest (possível teste usando next/jest)
├── next.config.ts             # Configurações genéricas Next.js + Rewrites para /api
├── eslint.config.mjs           # Configurações de linting baseadas em navegador
├── postcss.config.mjs          # Configuração de processamento de CSS
├── .stylelintrc.json           # Linter CSS
├── .env.local                  # Variáveis de ambiente locais (não versionadas)
├── README.md                   # Introdução visual do usuário e fluxo do usuário para novos contribuidores
├── package.json                # Dependency-management e rotas de build
├── package-lock.json            # Lockfile gerado automaticamente via npm
├── public/                     # Conteúdo estático (imagens, ícones de SEO)
├── node_modules/               # Dependencias NPM (ignorada completamente por .gitignore)
└── docs/                       # Documentação técnica e blueprint design system
```

## Padrões de nomenclatura

### Componentes
- **Padrão PascalCase** para arquivos de componentes (.tsx)
- **Padrão kebab-case** para componentes compostos renomeados (não é usado por enquanto)

### Arquivo type/hooks/constants
- **Padrão kebab-case** para arquivos type (por exemplo, skill.ts)
- **Padrão kebab-case** para hooks (por exemplo, use-toogle.tsx)

### Nomes de arquivos com base em rotas
- **Padrão lowercase snake_case** para arquivos de rotas (route.ts)

### Exports
- **Padrão export-type default** para componentes React
- **Padrão export{} em index.ts** para extensões NPM de terceiros

## Criação de arquivos

### Diretório de componentes
```typescript
// Exemplo: src/components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";  // helpers utilitários

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, size, ...props }) => {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
};
```

### Diretório de hooks (Personalizado)
```typescript
// Exemplo: src/hooks/use-toogle.tsx
import { useState, useCallback } from 'react';

export const useToggle = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
```

### Diretório constants (Estrutura de dados centralizada)
```typescript
// Exemplo: src/constants/index.ts
export interface Skill {
  skill_name: string;
  Image: string; // URL do ícone / path
  width: number;
  height: number;
}

export const skills: Skill[] = [
  // Lista de objetos de dados array centralizando.   
];
```

### Arquivo de rotas da API (Apenas Adobe, Exemplo)
```typescript
// src/app/api/contact/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Client } from '@resend/client';

const resend = new Client(process.env.RESEND_API_KEY!);

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de e-mail inválido"),
  subject: z.string().min(3, "O assunto deve ter pelo menos 3 caracteres"),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação Zod
    const validation = formSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.error.errors.map((err) => err.message),
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    // Resend enviar para indirizzo envio@bsp-web.com subjeto [site] + email
    const { data, error } = await resend.contacts.create({
      email,
      firstName: name,
      // ... Outras opções (opcional)
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Contato criado com sucesso",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao criar contato:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
```

## Separação de preocupações

### Componentes servidor vs cliente
- **Componentes do servidor**: Út il para SEO e estabilidade (por exemplo, UI do App Router, componentes puramente descritivos)
- **Componentes cliente**: Útil para interatividade (por exemplo, componentes <form>, animações com base em eventos do usuário, componentes com base em hooks)

### Criação de composição - Espalhamento de componentes compostos
```typescript
// Exemplo: src/components/main/Projects.tsx
import { BentoGrid, BentoGridItem } from '../ui/bento-grid';
import { Badge } from '../ui/badge';

export const Projects = () => {
  // Dados estáticos centralizados para renderização estática
  const projectsData = [...];

  return (
    <section id="projects">
      <BentoGrid className="max-w-5xl mx-auto">
        {projectsData.map((project) => (
          <BentoGridItem
            key={project.title}
            title={project.title}
            description={
              <div className="space-y-1 text-sm">
                <p>{project.description}</p>
                <div className="flex gap-3">
                  <Badge asChild>github</Badge>
                  <a href={project.live}>...live</a>
                </div>
              </div>
            }
            // ... E assim em diante
          />
        ))}
      </BentoGrid>
    </section>
  );
};
```

## Boas práticas

### 1. Impressão eficiente (SSR vs CSR)
- **Páginas estáticas**: Home (page.tsx) usando renderização estática com base em dados centralizado; otimizado para SEO
- **Imagens**: Imagens carregadas via next/image com tamanho responsivo

### 2. Padronização de animações
```typescript
// Animation 📜 homogêneo e elegante devido às transições de Framer Motion design system
const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={fadeInUp} transition={{ duration: 0.3 }}>
  {/* Conteúdo */}
</motion.div>
```

### 3. Hydration Strategies
- **Top-level Layout**: Server component no servidor (RootLayout)
- **Componentes de interface**: Renderizados com base em componentes cliente (Button, Badge)
- **Fluxo de dados**: SSR para páginas abaixo da dobra, streams para navegação

### 4. Usabilidade e acessibilidade
```typescript
// Exemplo de configuração de ARIA, SVG-para HTML acessível, padrões semânticos
<button
  className="some-button"
  role="button"
  aria-label="Abrir modal de contato"
  aria-describedby="contact-dialog-desc"
  aria-expanded={isOpen}
>
  {/* Conteúdo */}
</button>
<div id="contact-dialog-desc" className="sr-only">
  Preencha o formulário para entrar em contato com Guilherme Menezes
</div>
```

### 5. Exibição responsiva com base em breakpoints e padrões de separação de concernências
```typescript
<motion.div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8">
  {/* Itens centralizados baseados em breakpoints */}
</motion.div>
```

## Dependências críticas e fluxo de manutenção de dependências

- **Bundler (Vercel / Turbopack)**: Configuração Xcode relativa a SSR + CSR e arte gráfica
- **Formatadores (ESLint + Stylelint)**: Executar `npm run lint` ao adicionar componente/mudança

## Certificado de local para próximos desenvolvedores

- **Ponto de entrada mais fácil**: `npm run dev`
- **Cabeçalho do README**: Descrição breve do site e fluxo do usuário fora do canal padrão
- **Documentação**: O blueprint técnico será mantido na pasta /docs para referência de novas entradas

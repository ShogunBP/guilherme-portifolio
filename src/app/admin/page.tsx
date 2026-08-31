import React from 'react'
import { auth, signOut } from '@/auth'
import {
  ShieldCheck,
  LogOut,
  Sparkles,
  Layers,
  FileText,
  FolderGit2,
  Globe2,
  BookMarked,
  ExternalLink,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const session = await auth()

  const sections = [
    {
      title: 'Hero & Bio',
      description: 'Gerenciamento dos textos, links sociais e apresentação inicial.',
      icon: Sparkles,
      tag: 'Fase 4',
    },
    {
      title: 'Skills & Habilidades',
      description: 'Edição das categorias de tecnologias e nível de proficiência.',
      icon: Layers,
      tag: 'Fase 5',
    },
    {
      title: 'Experiência & Currículo',
      description: 'Linha do tempo profissional, formação acadêmica e download de PDF.',
      icon: FileText,
      tag: 'Fase 6',
    },
    {
      title: 'Projetos & Portfólio',
      description: 'Catálogo de projetos em destaque, tags e links de deploy/código.',
      icon: FolderGit2,
      tag: 'Fase 7',
    },
    {
      title: 'Idioma & Traduções',
      description: 'Gerenciamento de chaves i18n em Português e Inglês.',
      icon: Globe2,
      tag: 'Fase 3',
    },
    {
      title: 'Guestbook & Mensagens',
      description: 'Moderação de depoimentos e visualização de contatos recebidos.',
      icon: BookMarked,
      tag: 'Fase 8',
    },
  ]

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-[#07041f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                Painel Administrativo
              </h1>
              <p className="text-xs text-purple-300">
                Logado como: <span className="font-mono text-gray-300">{session?.user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
            >
              <span>Ver site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/admin/login' })
              }}
            >
              <button
                type="submit"
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Status Notice */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● Sessão Ativa
            </span>
            <span className="text-xs text-gray-400 font-mono">Auth.js v5 (JWT Session)</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Autenticação por Email e Senha Validada com Sucesso
          </h2>
          <p className="text-sm text-gray-300 mt-1 max-w-3xl">
            A rota <code className="text-purple-300">/admin</code> agora está protegida por middleware.
            As seções abaixo compõem o esqueleto do painel e receberão seus formulários de edição e CRUD
            nas próximas fases.
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div
                key={section.title}
                className="group relative bg-[#0b0826]/70 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-950/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {section.tag}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  {section.description}
                </p>

                <div className="mt-5 pt-4 border-t border-purple-500/10 flex items-center justify-between text-xs text-gray-500">
                  <span>Conteúdo placeholder</span>
                  <span className="text-purple-400/60 font-mono">Em breve →</span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

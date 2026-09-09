import React from 'react'
import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { isTwoFactorEnabled } from '@/lib/totp'
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
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
  const twoFactorActive = isTwoFactorEnabled()

  const sections = [
    {
      title: 'Segurança & 2FA',
      description: 'Gerenciamento de autenticação de dois fatores (TOTP) e sessões sincronizadas.',
      icon: twoFactorActive ? ShieldCheck : Shield,
      tag: 'Fase 2.4',
      href: '/admin/seguranca',
      status: twoFactorActive ? '2FA Ativo' : '2FA Desativado',
    },
    {
      title: 'Hero & Bio',
      description: 'Gerenciamento dos textos, links sociais e apresentação inicial.',
      icon: Sparkles,
      tag: 'Fase 4',
      href: '/admin/hero',
    },
    {
      title: 'Skills & Habilidades',
      description: 'Edição das categorias de tecnologias e nível de proficiência.',
      icon: Layers,
      tag: 'Fase 5',
      href: '/admin/skills',
    },
    {
      title: 'Experiência & Currículo',
      description: 'Linha do tempo profissional, formação acadêmica e download de PDF.',
      icon: FileText,
      tag: 'Fase 6',
      href: '/admin/curriculo',
    },
    {
      title: 'Projetos & Portfólio',
      description: 'Catálogo de projetos em destaque, tags e links de deploy/código.',
      icon: FolderGit2,
      tag: 'Fase 7',
      href: '/admin/projetos',
    },
    {
      title: 'Idioma & Traduções',
      description: 'Gerenciamento de chaves i18n em Português e Inglês.',
      icon: Globe2,
      tag: 'Fase 3',
      href: '/admin/idioma',
    },
    {
      title: 'Guestbook & Mensagens',
      description: 'Moderação de depoimentos e visualização de contatos recebidos.',
      icon: BookMarked,
      tag: 'Fase 8',
      href: '/admin/guestbook',
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
            <Link
              href="/admin/seguranca"
              className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Segurança</span>
              {twoFactorActive ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              )}
            </Link>

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
            const isClickable = Boolean(section.href)

            const CardInner = (
              <div
                className={`h-full group relative bg-[#0b0826]/70 border border-purple-500/20 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-purple-950/40 ${
                  isClickable ? 'hover:border-purple-500/50 cursor-pointer' : 'hover:border-purple-500/30'
                }`}
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
                  <span>
                    {'status' in section && section.status ? (
                      <span className="text-emerald-400 font-medium">{section.status}</span>
                    ) : (
                      'Conteúdo placeholder'
                    )}
                  </span>
                  <span className="text-purple-400/80 font-mono group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    {section.href === '/admin/seguranca' ? 'Configurar →' : 'Em breve →'}
                  </span>
                </div>
              </div>
            )

            if (section.href === '/admin/seguranca') {
              return (
                <Link key={section.title} href={section.href} className="block h-full">
                  {CardInner}
                </Link>
              )
            }

            return <div key={section.title}>{CardInner}</div>
          })}
        </div>
      </main>
    </div>
  )
}

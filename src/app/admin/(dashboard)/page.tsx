import React from 'react'
import Link from 'next/link'
import { auth } from '@/auth'
import { isTwoFactorEnabled } from '@/lib/totp'
import {
  ShieldCheck,
  Shield,
  Sparkles,
  Layers,
  FileText,
  FolderGit2,
  Globe2,
  BookMarked,
  ArrowRight,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const session = await auth()
  const twoFactorActive = isTwoFactorEnabled()

  const sections = [
    {
      title: 'Segurança & 2FA',
      description: 'Gerenciamento de autenticação de dois fatores (TOTP), códigos de backup e sessões ativas.',
      icon: twoFactorActive ? ShieldCheck : Shield,
      tag: 'Fase 2.4',
      href: '/admin/security',
      status: twoFactorActive ? '2FA Ativo' : '2FA Desativado',
      actionLabel: 'Configurar',
    },
    {
      title: 'Hero & Bio',
      description: 'Gerenciamento dos textos de apresentação, foto de perfil, slogans e links de redes sociais.',
      icon: Sparkles,
      tag: 'Fase 4',
      href: '/admin/hero',
      status: 'Em breve',
      actionLabel: 'Visualizar',
    },
    {
      title: 'Skills & Habilidades',
      description: 'Edição das categorias técnicas (Frontend, Backend, Cloud, DevOps) e proficiências.',
      icon: Layers,
      tag: 'Fase 5',
      href: '/admin/skills',
      status: 'Em breve',
      actionLabel: 'Visualizar',
    },
    {
      title: 'Experiência & Currículo',
      description: 'Linha do tempo de carreira profissional, histórico acadêmico e upload de arquivo PDF.',
      icon: FileText,
      tag: 'Fase 6',
      href: '/admin/curriculo',
      status: 'Em breve',
      actionLabel: 'Visualizar',
    },
    {
      title: 'Projetos & Portfólio',
      description: 'Catálogo de projetos em destaque, capas, tecnologias aplicadas e links de deploy/repositório.',
      icon: FolderGit2,
      tag: 'Fase 7',
      href: '/admin/projetos',
      status: 'Em breve',
      actionLabel: 'Visualizar',
    },
    {
      title: 'Idioma & Traduções',
      description: 'Gerenciamento centralizado de chaves de internacionalização (i18n) em Português e Inglês.',
      icon: Globe2,
      tag: 'Fase 3',
      href: '/admin/idioma',
      status: 'Em breve',
      actionLabel: 'Visualizar',
    },
    {
      title: 'Guestbook & Mensagens',
      description: 'Moderação de comentários deixados pela comunidade e consulta de mensagens do formulário.',
      icon: BookMarked,
      tag: 'Fase 8',
      href: '/admin/guestbook',
      status: 'Em breve',
      actionLabel: 'Visualizar',
    },
  ]

  return (
    <div className="space-y-8 w-full">
      {/* Welcome / Overview Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border border-purple-500/25 backdrop-blur-md shadow-xl shadow-purple-950/20 w-full">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sessão Ativa
          </span>
          <span className="text-xs text-purple-300/80 font-mono">
            Auth.js v5 (JWT Session)
          </span>
          {twoFactorActive ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-300 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              2FA Ativado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-yellow-300 font-mono bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 rounded-full">
              2FA Desativado
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Painel Administrativo
        </h1>
        <p className="text-sm text-gray-300 mt-1.5 max-w-3xl leading-relaxed">
          Bem-vindo ao centro de controle do seu portfólio. As 7 seções abaixo estruturam o roadmap completo da aplicação.
          Navegue pelas rotas através do menu lateral ou pelos cards de acesso rápido abaixo.
        </p>

        {session?.user?.email && (
          <div className="mt-4 pt-4 border-t border-purple-500/15 flex items-center gap-2 text-xs text-gray-400">
            <span>Operando como:</span>
            <span className="font-mono text-purple-300 font-semibold">{session.user.email}</span>
          </div>
        )}
      </div>

      {/* Grid of 7 Section Cards (All Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {sections.map((section) => {
          const Icon = section.icon
          const isSecurity = section.href === '/admin/security'

          return (
            <Link
              key={section.title}
              href={section.href}
              className="group block h-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-2xl"
            >
              <div
                className={`h-full flex flex-col justify-between bg-[#0b0826]/70 border rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-xl hover:shadow-purple-950/40 ${
                  isSecurity
                    ? 'border-purple-500/30 hover:border-purple-500/60 bg-gradient-to-b from-[#0e0a30]/80 to-[#0b0826]/70'
                    : 'border-purple-500/20 hover:border-purple-500/45 hover:bg-[#0e0a30]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-105 group-hover:bg-purple-600/25 transition-all shadow-inner shadow-purple-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 group-hover:border-purple-500/35 transition-colors">
                      {section.tag}
                    </span>
                  </div>

                  <h2 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-3">
                    {section.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-purple-500/10 flex items-center justify-between text-xs">
                  <div>
                    {isSecurity ? (
                      <span
                        className={`font-medium ${
                          twoFactorActive ? 'text-emerald-400' : 'text-yellow-400'
                        }`}
                      >
                        {section.status}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-mono">{section.status}</span>
                    )}
                  </div>
                  <span className="text-purple-400/90 font-mono inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform group-hover:text-purple-300">
                    <span>{section.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/hero': 'Hero & Bio',
  '/admin/skills': 'Skills & Habilidades',
  '/admin/curriculo': 'Experiência & Currículo',
  '/admin/projetos': 'Projetos & Portfólio',
  '/admin/idioma': 'Idioma & Traduções',
  '/admin/guestbook': 'Guestbook & Mensagens',
  '/admin/security': 'Segurança & 2FA',
}

export function Breadcrumb() {
  const pathname = usePathname()
  const label = ROUTE_LABELS[pathname] || 'Painel'
  const isDashboard = pathname === '/admin'

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
      <Link
        href="/admin"
        className="hover:text-purple-300 transition-colors flex items-center gap-1"
      >
        <span>Admin</span>
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-purple-500/40 shrink-0" />
      <span className={`truncate ${isDashboard ? 'text-purple-300 font-semibold' : 'text-white'}`}>
        {label}
      </span>
    </div>
  )
}

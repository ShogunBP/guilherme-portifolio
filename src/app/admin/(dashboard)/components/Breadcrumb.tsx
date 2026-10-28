'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const routeLabels: Record<string, string> = {
  admin: 'Admin',
  security: 'Segurança',
  hero: 'Hero',
  skills: 'Skills',
  resume: 'Currículo',
  projects: 'Projetos',
  language: 'Traduções',
  guestbook: 'Guestbook',
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Se estiver só em /admin, não mostra breadcrumb
  if (segments.length <= 1) return null

  const crumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] ?? seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-gray-400">
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {!crumb.isLast ? (
            <>
              <span className="text-gray-500 hover:text-gray-300 transition-colors">
                {crumb.label}
              </span>
              <ChevronRight className="w-3 h-3 text-gray-600" />
            </>
          ) : (
            <span className="text-white font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

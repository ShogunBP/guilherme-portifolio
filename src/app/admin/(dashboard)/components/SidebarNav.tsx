'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Shield,
  Sparkles,
  Layers,
  FileText,
  FolderGit2,
  Globe2,
  BookMarked,
  LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  tag?: string
  exact?: boolean
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Segurança & 2FA', href: '/admin/security', icon: Shield, exact: true },
  { label: 'Hero & Bio', href: '/admin/hero', icon: Sparkles, tag: 'Fase 4' },
  { label: 'Skills', href: '/admin/skills', icon: Layers, tag: 'Fase 5' },
  { label: 'Currículo', href: '/admin/curriculo', icon: FileText, tag: 'Fase 6' },
  { label: 'Projetos', href: '/admin/projetos', icon: FolderGit2, tag: 'Fase 7' },
  { label: 'Idioma', href: '/admin/idioma', icon: Globe2, tag: 'Fase 3' },
  { label: 'Guestbook', href: '/admin/guestbook', icon: BookMarked, tag: 'Fase 8' },
]

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1.5 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-purple-600/20 text-white border border-purple-500/30 shadow-sm shadow-purple-950/50'
                : 'text-gray-400 hover:text-white hover:bg-purple-600/10 hover:border-purple-500/20 border border-transparent'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            )}

            <div className="flex items-center gap-3 min-w-0">
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-300'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {item.tag && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 transition-colors ${
                  isActive
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-500/35'
                    : 'bg-purple-500/10 text-purple-400/80 border border-purple-500/15 group-hover:border-purple-500/25 group-hover:text-purple-300'
                }`}
              >
                {item.tag}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

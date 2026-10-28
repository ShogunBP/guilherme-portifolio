'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  Sparkles,
  Layers,
  FileText,
  FolderGit2,
  Globe2,
  BookMarked,
  LayoutDashboard,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Segurança & 2FA', href: '/admin/security', icon: Shield },
  { label: 'Hero & Bio', href: '/admin/hero', icon: Sparkles },
  { label: 'Skills', href: '/admin/skills', icon: Layers },
  { label: 'Experiência', href: '/admin/resume', icon: FileText },
  { label: 'Projetos', href: '/admin/projects', icon: FolderGit2 },
  { label: 'Traduções', href: '/admin/language', icon: Globe2 },
  { label: 'Guestbook', href: '/admin/guestbook', icon: BookMarked },
]

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="px-3 py-2 space-y-0.5">
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
              isActive
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-inner shadow-purple-500/10'
                : 'text-gray-400 hover:text-white hover:bg-purple-600/10 border border-transparent hover:border-purple-500/15'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-purple-400'
              }`}
            />
            <span className="truncate">{item.label}</span>
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

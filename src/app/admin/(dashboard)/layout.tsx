import React from 'react'
import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { isTwoFactorEnabled } from '@/lib/totp'
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import { SidebarNav } from './components/SidebarNav'
import { Breadcrumb } from './components/Breadcrumb'
import { MobileSidebar } from './components/MobileSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const twoFactorActive = isTwoFactorEnabled()

  async function handleLogout() {
    'use server'
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.delete('admin_2fa_verified')
    cookieStore.delete('admin_2fa_status')
    await signOut({ redirectTo: '/admin/login' })
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-purple-500/15 bg-[#07041f]/95 backdrop-blur-xl z-40">
        {/* Brand */}
        <div className="h-16 px-5 border-b border-purple-500/15 flex items-center">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shadow-inner shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight group-hover:text-purple-300 transition-colors">
                Painel Admin
              </span>
              <span className="text-[11px] text-purple-400/80 font-mono">
                Portfólio v2.0
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav />
        </div>

        {/* Footer info: 2FA state + email */}
        <div className="p-4 border-t border-purple-500/15 bg-[#05021a]/90 space-y-2.5">
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
              twoFactorActive
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {twoFactorActive ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              )}
              <span>{twoFactorActive ? '2FA Ativo' : '2FA Desativado'}</span>
            </div>
            <Link
              href="/admin/security"
              className="text-[10px] underline hover:text-white transition-colors"
            >
              Config
            </Link>
          </div>

          {session?.user?.email && (
            <div className="px-1 text-[11px] text-gray-400 truncate font-mono">
              {session.user.email}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* STICKY HEADER */}
        <header className="sticky top-0 z-30 h-16 border-b border-purple-500/15 bg-[#07041f]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar
              twoFactorActive={twoFactorActive}
              userEmail={session?.user?.email}
            />
            <Breadcrumb />
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/admin/security"
              className="text-xs text-gray-300 hover:text-white hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Segurança</span>
              {twoFactorActive ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]"></span>
              )}
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
            >
              <span>Ver site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <form action={handleLogout}>
              <button
                type="submit"
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

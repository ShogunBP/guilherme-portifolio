'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, X, ShieldCheck, ShieldAlert, Shield } from 'lucide-react'
import { SidebarNav } from './SidebarNav'

interface MobileSidebarProps {
  twoFactorActive: boolean
  userEmail?: string | null
}

export function MobileSidebar({ twoFactorActive, userEmail }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const drawerContent = (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#07041f] border-r border-purple-500/20 flex flex-col z-50 shadow-2xl shadow-purple-950/80 animate-in slide-in-from-left duration-200">
        {/* Header / Brand */}
        <div className="h-16 px-4 border-b border-purple-500/15 flex items-center justify-between shrink-0">
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">Admin Panel</span>
              <span className="text-[10px] text-purple-400 font-mono">Guilherme Portfólio</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav onNavigate={() => setIsOpen(false)} />
        </div>

        {/* Footer with 2FA status and email */}
        <div className="p-4 border-t border-purple-500/15 bg-[#05021a]/95 space-y-2.5 shrink-0">
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
              onClick={() => setIsOpen(false)}
              className="text-[10px] underline hover:text-white transition-colors"
            >
              Config
            </Link>
          </div>

          {userEmail && (
            <div className="px-1 text-[11px] text-gray-400 truncate font-mono">
              {userEmail}
            </div>
          )}
        </div>
      </aside>
    </div>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-purple-600/15 border border-transparent hover:border-purple-500/20 transition-colors cursor-pointer"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && mounted && createPortal(drawerContent, document.body)}
    </>
  )
}

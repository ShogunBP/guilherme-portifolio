'use client'

import '@/i18n'
import { applyOverrides } from '@/i18n/config'
import { ReactNode } from 'react'

export interface I18nProviderProps {
  children: ReactNode
  overrides?: {
    pt?: Record<string, string>
    en?: Record<string, string>
  }
}

export function I18nProvider({ children, overrides }: I18nProviderProps) {
  // Aplica overrides de forma síncrona antes da renderização dos filhos (no SSR e no cliente)
  if (overrides) {
    applyOverrides(overrides)
  }

  return <>{children}</>
}

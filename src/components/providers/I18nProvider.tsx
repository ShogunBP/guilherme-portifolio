'use client'

import '@/i18n' // garante que o config.ts é executado no cliente
import { ReactNode } from 'react'

export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

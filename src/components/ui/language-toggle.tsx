'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('en') ? 'EN' : 'PT'

  const toggle = () => {
    const next = currentLang === 'PT' ? 'en' : 'pt'
    i18n.changeLanguage(next)
    // O LanguageDetector salva automaticamente no localStorage('i18nextLng')
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full font-bold text-xs z-50 cursor-pointer"
      onClick={toggle}
      title="Toggle language"
    >
      {currentLang}
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}

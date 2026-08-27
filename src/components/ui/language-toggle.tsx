'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const [lang, setLang] = React.useState<'PT' | 'EN'>('PT')

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full font-bold text-xs z-50"
      onClick={() => setLang(lang === 'PT' ? 'EN' : 'PT')}
      title="Toggle language"
    >
      {lang}
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import pt from './locales/pt.json'
import en from './locales/en.json'
import { unflatten } from '@/lib/i18n-utils'

// Função utilitária de normalização de idioma (tolera subtags como pt-BR e en-US)
export function normalizeLang(lang?: string | null): 'pt' | 'en' {
  if (!lang) return 'pt'
  return lang.toLowerCase().startsWith('en') ? 'en' : 'pt'
}

// Detecção síncrona antes do init para evitar flash de conteúdo.
// Ordem: localStorage('i18nextLng') → navigator.language → fallback 'pt'
const savedLang =
  typeof window !== 'undefined'
    ? localStorage.getItem('i18nextLng') ||
    navigator.language ||
    'pt'
    : 'pt'
const initialLang = normalizeLang(savedLang)

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        pt: { translation: pt },
        en: { translation: en },
      },
      lng: initialLang,
      fallbackLng: 'pt',
      supportedLngs: ['pt', 'en'],
      nonExplicitSupportedLngs: true,
      load: 'languageOnly',
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      react: {
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added',
      },
    })
}

// Utilitário de mesclagem profunda segura para reconstrução de bundles a partir da base
function deepMerge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
  const output = (Array.isArray(target) ? [...target] : { ...target }) as any
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      key in target &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      output[key] = deepMerge(target[key], source[key])
    } else {
      output[key] = source[key]
    }
  }
  return output
}

export function buildBundle(base: Record<string, any>, flatOverrides?: Record<string, string>) {
  if (!flatOverrides || Object.keys(flatOverrides).length === 0) {
    return base
  }
  const nested = unflatten(flatOverrides)
  return deepMerge(base, nested)
}

let lastAppliedPt: string | null = null
let lastAppliedEn: string | null = null

/**
 * Aplica overrides de forma síncrona, reconstruindo o bundle a partir da base (pt.json / en.json).
 * Idempotente: só reconstrói se o payload de overrides tiver mudado.
 */
export function applyOverrides(overrides?: {
  pt?: Record<string, string>
  en?: Record<string, string>
}) {
  if (!overrides) return

  const ptKeys = overrides.pt ? JSON.stringify(overrides.pt) : ''
  if (ptKeys !== lastAppliedPt) {
    const freshPt = buildBundle(pt, overrides.pt)
    i18n.addResourceBundle('pt', 'translation', freshPt, false, true)
    lastAppliedPt = ptKeys
  }

  const enKeys = overrides.en ? JSON.stringify(overrides.en) : ''
  if (enKeys !== lastAppliedEn) {
    const freshEn = buildBundle(en, overrides.en)
    i18n.addResourceBundle('en', 'translation', freshEn, false, true)
    lastAppliedEn = enKeys
  }
}

export default i18n

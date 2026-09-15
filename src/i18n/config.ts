import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import pt from './locales/pt.json'
import en from './locales/en.json'

// Detecção síncrona antes do init para evitar flash de conteúdo.
// Ordem: localStorage('i18nextLng') → navigator.language → fallback 'pt'
const SUPPORTED = ['pt', 'en']
const savedLang =
  typeof window !== 'undefined'
    ? localStorage.getItem('i18nextLng') ||
      navigator.language?.split('-')[0] ||
      'pt'
    : 'pt'
const initialLang = SUPPORTED.includes(savedLang) ? savedLang : 'pt'

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

// Função que busca e aplica os overrides do servidor
async function applyServerOverrides(lng: string) {
  if (typeof window === 'undefined') return
  try {
    const res = await fetch(`/api/translations?lang=${lng}`)
    if (!res.ok) return
    const data = await res.json()
    if (data && Object.keys(data).length > 0) {
      i18n.addResourceBundle(lng, 'translation', data, true, true)
      // Se houver chaves aninhadas/arrays, aplica unflatten para suportar returnObjects: true
      const { unflatten } = await import('@/lib/i18n-utils')
      const nested = unflatten(data)
      if (Object.keys(nested).length > 0) {
        i18n.addResourceBundle(lng, 'translation', nested, true, true)
      }
      i18n.emit('loaded')
    }
  } catch {
    // Silently fall back to defaultResources — nunca quebrar o site por erro de rede
  }
}

// Chamar UMA VEZ no carregamento inicial (não só ao trocar idioma)
if (typeof window !== 'undefined') {
  applyServerOverrides(i18n.language)
}

// Chamar a cada troca de idioma
i18n.on('languageChanged', (lng) => {
  applyServerOverrides(lng)
})

export default i18n

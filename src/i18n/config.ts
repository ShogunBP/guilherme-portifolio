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
    })

  // TODO Fase 3.2: endpoint dinâmico para chaves gerenciadas pelo painel
  // i18n.on('languageChanged', (lng) => {
  //   fetch(`/api/translations?language=${lng}`)
  //     .then((r) => r.json())
  //     .then((data) => {
  //       i18n.addResourceBundle(lng, 'translation', data, true, true)
  //     })
  //     .catch(() => {/* silently fall back to defaultResources */})
  // })
}

export default i18n

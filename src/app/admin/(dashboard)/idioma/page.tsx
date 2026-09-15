'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Globe2,
  Sparkles,
  Compass,
  Layers,
  Briefcase,
  FileText,
  LayoutGrid,
  MessageSquare,
  RotateCcw,
  Save,
  Undo2,
  Trash2,
  Search,
  Check,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Info,
} from 'lucide-react'
import ptJson from '@/i18n/locales/pt.json'
import enJson from '@/i18n/locales/en.json'
import { flatten } from '@/lib/i18n-utils'

type OverrideMap = Record<string, string>
type ToDeleteSet = Set<string>

interface CategoryDef {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  desc: string
}

const CATEGORIES: CategoryDef[] = [
  { id: 'hero', label: 'Hero / Início', icon: Sparkles, desc: 'Apresentação, cargo, bio e botões de chamada' },
  { id: 'nav', label: 'Navegação', icon: Compass, desc: 'Itens do menu de navegação e links principais' },
  { id: 'skills', label: 'Habilidades', icon: Layers, desc: 'Títulos e subtítulos da seção de tecnologias' },
  { id: 'experience', label: 'Experiência', icon: Briefcase, desc: 'Linha do tempo profissional, empresas, cargos e conquistas' },
  { id: 'resume', label: 'Currículo', icon: FileText, desc: 'Textos da seção de visualização e download de currículo' },
  { id: 'footer', label: 'Rodapé', icon: LayoutGrid, desc: 'Textos de encerramento, créditos de autoria e links' },
  { id: 'contact', label: 'Contato', icon: MessageSquare, desc: 'Formulário de mensagem, campos e alertas de feedback' },
]

// Labels amigáveis para as chaves principais
const KEY_LABELS: Record<string, string> = {
  'hero.badge': 'Tag Superior (Badge)',
  'hero.name': 'Nome em Destaque',
  'hero.role': 'Cargo / Título Profissional',
  'hero.description': 'Bio Resumida (Subtítulo)',
  'hero.cta_connect': 'Botão Conversar (CTA 1)',
  'hero.cta_github': 'Botão GitHub (CTA 2)',

  'nav.about': 'Menu: Sobre',
  'nav.skills': 'Menu: Skills',
  'nav.experience': 'Menu: Experiência',
  'nav.resume': 'Menu: Currículo',
  'nav.projects': 'Menu: Projetos',
  'nav.blog': 'Menu: Blog',
  'nav.contact': 'Menu: Contato',
  'nav.portfolio': 'Menu: Portfólio',

  'skills.heading': 'Título da Seção',
  'skills.subheading': 'Subtítulo Explicativo',
  'skills.footer': 'Texto de Rodapé das Skills',

  'experience.heading': 'Título da Seção',
  'experience.subheading': 'Subtítulo da Seção',

  'resume.heading': 'Título da Seção',
  'resume.subheading': 'Subtítulo da Seção',
  'resume.download': 'Botão Baixar Currículo',
  'resume.error': 'Mensagem de Erro de PDF',

  'footer.description': 'Descrição do Rodapé',
  'footer.quick_links': 'Título Links Rápidos',
  'footer.connect': 'Título Conecte-se',
  'footer.built_by': 'Créditos de Autoria',
  'footer.visitors': 'Texto de Contador de Visitantes',

  'contact.heading': 'Título da Seção',
  'contact.subheading': 'Subtítulo da Seção',
  'contact.field_name': 'Rótulo: Nome',
  'contact.field_email': 'Rótulo: E-mail',
  'contact.field_subject': 'Rótulo: Assunto',
  'contact.field_message': 'Rótulo: Mensagem',
  'contact.submit': 'Botão Enviar Mensagem',
  'contact.sending': 'Estado Enviando...',
  'contact.success': 'Mensagem de Sucesso',
  'contact.error': 'Mensagem de Erro no Envio',
  'contact.error_generic': 'Mensagem de Erro Genérico',
  'contact.location': 'Localização Exibida',
  'contact.copied': 'Texto Notificação Copiado',
}

// Flat base de fallback
const flatPt = flatten(ptJson as Record<string, unknown>)
const flatEn = flatten(enJson as Record<string, unknown>)

export default function AdminIdiomaPage() {
  const [loading, setLoading] = useState(true)
  const [committed, setCommitted] = useState<{ pt: OverrideMap; en: OverrideMap }>({ pt: {}, en: {} })
  const [draft, setDraft] = useState<{ pt: OverrideMap; en: OverrideMap }>({ pt: {}, en: {} })
  const [toDelete, setToDelete] = useState<{ pt: ToDeleteSet; en: ToDeleteSet }>({
    pt: new Set(),
    en: new Set(),
  })

  const [activeCategory, setActiveCategory] = useState<string>('hero')
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)
  const [expandedJobs, setExpandedJobs] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true })

  // Modais de confirmação
  const [modalSaveOpen, setModalSaveOpen] = useState(false)
  const [modalDiscardAllOpen, setModalDiscardAllOpen] = useState(false)
  const [modalRestoreAllOpen, setModalRestoreAllOpen] = useState(false)

  // Carregamento inicial de overrides do banco
  const loadTranslations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/translations')
      if (res.ok) {
        const data = await res.json()
        const ptData = data.pt || {}
        const enData = data.en || {}
        setCommitted({ pt: ptData, en: enData })
        setDraft({ pt: { ...ptData }, en: { ...enData } })
        setToDelete({ pt: new Set(), en: new Set() })
      }
    } catch (err) {
      console.error('Falha ao buscar traduções:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTranslations()
  }, [loadTranslations])

  // Cálculo de campos alterados (dirtyCount)
  const dirtyCount = useMemo(() => {
    let count = 0
    for (const lang of ['pt', 'en'] as const) {
      for (const [key, val] of Object.entries(draft[lang])) {
        if (toDelete[lang].has(key)) continue // evita double-count
        const baseVal = committed[lang][key] !== undefined
          ? committed[lang][key]
          : (lang === 'pt' ? flatPt[key] : flatEn[key]) ?? ''
        if (val !== baseVal) {
          count++
        }
      }
      count += toDelete[lang].size
    }
    return count
  }, [draft, toDelete, committed])

  // Contagem de alterações por categoria
  const dirtyByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const cat of CATEGORIES) {
      counts[cat.id] = 0
    }

    for (const lang of ['pt', 'en'] as const) {
      for (const [key, val] of Object.entries(draft[lang])) {
        if (toDelete[lang].has(key)) continue
        const cat = key.split('.')[0]
        const baseVal = committed[lang][key] !== undefined
          ? committed[lang][key]
          : (lang === 'pt' ? flatPt[key] : flatEn[key]) ?? ''
        if (val !== baseVal && counts[cat] !== undefined) {
          counts[cat]++
        }
      }
      for (const key of toDelete[lang]) {
        const cat = key.split('.')[0]
        if (counts[cat] !== undefined) {
          counts[cat]++
        }
      }
    }
    return counts
  }, [draft, toDelete, committed])

  // Aviso beforeunload caso haja alterações pendentes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyCount > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirtyCount])

  // Helper para obter valor atual exibido de um campo
  const getFieldValue = (lang: 'pt' | 'en', key: string): string => {
    if (draft[lang][key] !== undefined) {
      return draft[lang][key]
    }
    if (committed[lang][key] !== undefined) {
      return committed[lang][key]
    }
    return (lang === 'pt' ? flatPt[key] : flatEn[key]) ?? ''
  }

  // Verifica se o campo possui override ativo salvo no banco
  const hasCommittedOverride = (lang: 'pt' | 'en', key: string): boolean => {
    return committed[lang][key] !== undefined
  }

  // Verifica se o campo está modificado no draft em relação ao banco
  const isFieldDirty = (lang: 'pt' | 'en', key: string): boolean => {
    if (toDelete[lang].has(key)) return true
    const currentDraft = draft[lang][key]
    if (currentDraft === undefined) return false
    const baseVal = committed[lang][key] !== undefined
      ? committed[lang][key]
      : (lang === 'pt' ? flatPt[key] : flatEn[key]) ?? ''
    return currentDraft !== baseVal
  }

  // Verifica se o campo está marcado para remoção (restauração ao padrão)
  const isFieldPendingDelete = (lang: 'pt' | 'en', key: string): boolean => {
    return toDelete[lang].has(key)
  }

  // Ação: Editar campo
  const handleEdit = (lang: 'pt' | 'en', key: string, value: string) => {
    setDraft(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [key]: value },
    }))
    // Se estava marcado para delete, desmarca
    if (toDelete[lang].has(key)) {
      setToDelete(prev => {
        const next = new Set(prev[lang])
        next.delete(key)
        return { ...prev, [lang]: next }
      })
    }
  }

  // Ação: Restaurar padrão por campo
  const handleRestoreField = (lang: 'pt' | 'en', key: string) => {
    const defaultValue = (lang === 'pt' ? flatPt[key] : flatEn[key]) ?? ''

    // Se existe no banco de dados, marca para exclusão
    if (committed[lang][key] !== undefined) {
      setToDelete(prev => ({
        ...prev,
        [lang]: new Set([...prev[lang], key]),
      }))
      setDraft(prev => ({
        ...prev,
        [lang]: { ...prev[lang], [key]: defaultValue },
      }))
    } else {
      // Se não existia no banco e apenas foi editado no draft, reverte o draft
      setDraft(prev => {
        const next = { ...prev[lang] }
        delete next[key]
        return { ...prev, [lang]: next }
      })
      setToDelete(prev => {
        if (!prev[lang].has(key)) return prev
        const next = new Set(prev[lang])
        next.delete(key)
        return { ...prev, [lang]: next }
      })
    }
  }

  // Todas as chaves da categoria ativa
  const categoryKeys = useMemo(() => {
    const prefix = `${activeCategory}.`
    const keys = Object.keys(flatPt).filter(k => k.startsWith(prefix))
    return keys
  }, [activeCategory])

  // Ação: Descartar categoria ativa
  const handleDiscardCategory = () => {
    setDraft(prev => {
      const nextPt = { ...prev.pt }
      const nextEn = { ...prev.en }
      for (const key of categoryKeys) {
        if (committed.pt[key] !== undefined) {
          nextPt[key] = committed.pt[key]
        } else {
          delete nextPt[key]
        }
        if (committed.en[key] !== undefined) {
          nextEn[key] = committed.en[key]
        } else {
          delete nextEn[key]
        }
      }
      return { pt: nextPt, en: nextEn }
    })

    setToDelete(prev => ({
      pt: new Set([...prev.pt].filter(k => !categoryKeys.includes(k))),
      en: new Set([...prev.en].filter(k => !categoryKeys.includes(k))),
    }))
  }

  // Ação: Descartar tudo
  const handleDiscardAll = () => {
    setDraft({ pt: { ...committed.pt }, en: { ...committed.en } })
    setToDelete({ pt: new Set(), en: new Set() })
    setModalDiscardAllOpen(false)
  }

  // Ação: Restaurar tudo ao padrão (marca tudo o que está em committed para exclusão)
  const handleRestoreAllToDefault = () => {
    setToDelete({
      pt: new Set(Object.keys(committed.pt)),
      en: new Set(Object.keys(committed.en)),
    })
    setDraft({ pt: { ...flatPt }, en: { ...flatEn } })
    setModalRestoreAllOpen(false)
  }

  // Ação: Salvar alterações em lote
  const handleSave = async () => {
    try {
      setSaving(true)
      const updates: { key: string; lang: string; value: string }[] = []
      const deletes: { key: string; lang: string }[] = []

      for (const lang of ['pt', 'en'] as const) {
        // Deletes
        for (const key of toDelete[lang]) {
          deletes.push({ key, lang })
        }
        // Updates
        for (const [key, value] of Object.entries(draft[lang])) {
          if (toDelete[lang].has(key)) continue
          const prevCommitted = committed[lang][key]
          const defaultValue = (lang === 'pt' ? flatPt[key] : flatEn[key]) ?? ''
          const effectivePrev = prevCommitted ?? defaultValue

          if (value !== effectivePrev) {
            updates.push({ key, lang, value })
          }
        }
      }

      await Promise.all([
        updates.length > 0 &&
          fetch('/api/admin/translations', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates }),
          }),
        deletes.length > 0 &&
          fetch('/api/admin/translations', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deletes }),
          }),
      ])

      // Atualiza committed local
      const newCommitted = { pt: { ...committed.pt }, en: { ...committed.en } }
      for (const { key, lang, value } of updates) {
        newCommitted[lang as 'pt' | 'en'][key] = value
      }
      for (const { key, lang } of deletes) {
        delete newCommitted[lang as 'pt' | 'en'][key]
      }

      setCommitted(newCommitted)
      setDraft({ pt: { ...newCommitted.pt }, en: { ...newCommitted.en } })
      setToDelete({ pt: new Set(), en: new Set() })
      setModalSaveOpen(false)

      setSaveSuccessMsg('Todas as alterações foram salvas e já estão ativas em produção!')
      setTimeout(() => setSaveSuccessMsg(null), 5000)
    } catch (err) {
      console.error('Erro ao salvar alterações:', err)
      alert('Ocorreu um erro ao salvar as traduções. Verifique o console.')
    } finally {
      setSaving(false)
    }
  }

  // Filtragem de chaves por termo de busca
  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return categoryKeys
    const query = searchQuery.toLowerCase()
    return categoryKeys.filter(key => {
      const label = KEY_LABELS[key] || ''
      const ptVal = getFieldValue('pt', key)
      const enVal = getFieldValue('en', key)
      return (
        key.toLowerCase().includes(query) ||
        label.toLowerCase().includes(query) ||
        ptVal.toLowerCase().includes(query) ||
        enVal.toLowerCase().includes(query)
      )
    })
  }, [categoryKeys, searchQuery, draft, committed, toDelete])

  // Separação de chaves da aba Experience (escalares vs jobs)
  const { experienceScalars, experienceJobs } = useMemo(() => {
    if (activeCategory !== 'experience') {
      return { experienceScalars: [], experienceJobs: [] }
    }

    const scalars = filteredKeys.filter(k => !k.startsWith('experience.jobs.'))
    const jobKeys = filteredKeys.filter(k => k.startsWith('experience.jobs.'))

    // Agrupa por índice de job (0, 1, 2)
    const jobsMap: Record<number, { index: number; companyName: string; keys: string[] }> = {
      0: { index: 0, companyName: 'SCHOTT', keys: [] },
      1: { index: 1, companyName: 'Avanth', keys: [] },
      2: { index: 2, companyName: 'CREN', keys: [] },
    }

    for (const key of jobKeys) {
      const match = key.match(/^experience\.jobs\.(\d+)\./)
      if (match) {
        const jobIdx = parseInt(match[1], 10)
        if (jobsMap[jobIdx]) {
          jobsMap[jobIdx].keys.push(key)
        }
      }
    }

    return {
      experienceScalars: scalars,
      experienceJobs: Object.values(jobsMap),
    }
  }, [activeCategory, filteredKeys])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm text-purple-300/80 font-medium">Carregando dicionário de traduções...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-28">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-purple-500/15 pb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner shadow-purple-500/20 flex-shrink-0 mt-0.5">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Gerenciador de Traduções
              </h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                i18n Core
              </span>
            </div>
            <p className="text-xs text-purple-300/70 mt-0.5">
              Edição em tempo real de textos estáticos e dinâmicos em Português e Inglês com persistência SQLite.
            </p>
          </div>
        </div>

        {/* STATUS BADGE + AVISO DE DRAFT */}
        <div className="flex items-center gap-3">
          {dirtyCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{dirtyCount} alteraç{dirtyCount === 1 ? 'ão não salva' : 'ões não salvas'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sincronizado com o banco</span>
            </div>
          )}
        </div>
      </div>

      {/* FEEDBACK DE SUCESSO */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* CATEGORIAS (TABS) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-purple-500/10 scrollbar-thin scrollbar-thumb-purple-500/20">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          const catDirty = dirtyByCategory[cat.id] || 0

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600/25 border border-purple-500/40 text-white shadow-sm shadow-purple-500/10'
                  : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-300' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
              {catDirty > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {catDirty}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* SUB-HEADER DA CATEGORIA + BUSCA + DESCARTAR CATEGORIA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#07041f]/70 border border-purple-500/15 rounded-xl p-3.5">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>{CATEGORIES.find(c => c.id === activeCategory)?.label}</span>
            <span className="text-xs text-purple-400/60 font-normal">
              ({filteredKeys.length} {filteredKeys.length === 1 ? 'chave' : 'chaves'})
            </span>
          </h2>
          <p className="text-[11px] text-purple-300/60 mt-0.5">
            {CATEGORIES.find(c => c.id === activeCategory)?.desc}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Campo de Busca */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar chave ou texto..."
              className="w-full bg-[#05021a] border border-purple-500/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Botão Descartar Categoria */}
          <button
            onClick={handleDiscardCategory}
            disabled={dirtyByCategory[activeCategory] === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              dirtyByCategory[activeCategory] > 0
                ? 'bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 hover:text-white'
                : 'opacity-40 cursor-not-allowed border border-white/5 text-slate-500'
            }`}
            title="Reverte as alterações não salvas desta categoria para o estado atual do banco"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Descartar Categoria</span>
          </button>
        </div>
      </div>

      {/* LISTA DE CAMPOS: CASO GERAL (OU ESCALARES DE EXPERIENCE) */}
      <div className="space-y-4">
        {activeCategory !== 'experience' && filteredKeys.length === 0 && (
          <div className="p-8 text-center rounded-xl bg-white/[0.01] border border-white/5 text-xs text-purple-300/60">
            Nenhuma chave encontrada com os termos informados.
          </div>
        )}

        {/* Renderizador de campo padrão */}
        {(activeCategory !== 'experience' ? filteredKeys : experienceScalars).map(key => (
          <TranslationFieldCard
            key={key}
            fieldKey={key}
            label={KEY_LABELS[key]}
            ptValue={getFieldValue('pt', key)}
            enValue={getFieldValue('en', key)}
            ptDefault={flatPt[key] ?? ''}
            enDefault={flatEn[key] ?? ''}
            ptHasOverride={hasCommittedOverride('pt', key)}
            enHasOverride={hasCommittedOverride('en', key)}
            ptDirty={isFieldDirty('pt', key)}
            enDirty={isFieldDirty('en', key)}
            ptPendingDelete={isFieldPendingDelete('pt', key)}
            enPendingDelete={isFieldPendingDelete('en', key)}
            onEditPt={val => handleEdit('pt', key, val)}
            onEditEn={val => handleEdit('en', key, val)}
            onRestorePt={() => handleRestoreField('pt', key)}
            onRestoreEn={() => handleRestoreField('en', key)}
          />
        ))}

        {/* TRATAMENTO ESPECIAL: EXPERIENCE JOBS (Passo 6) */}
        {activeCategory === 'experience' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300/80 px-1 uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span>Cargos e Histórico Profissional (Jobs)</span>
            </div>

            {experienceJobs.map(job => {
              const isExpanded = expandedJobs[job.index] ?? true

              // Subchaves do job
              const jobScalarKeys = job.keys.filter(k => !k.includes('.achievements.'))
              const jobAchievementKeys = job.keys.filter(k => k.includes('.achievements.'))

              return (
                <div
                  key={job.index}
                  className="rounded-xl border border-purple-500/20 bg-[#07041f]/90 overflow-hidden shadow-sm"
                >
                  {/* Cabeçalho do Job expansível */}
                  <button
                    onClick={() =>
                      setExpandedJobs(prev => ({ ...prev, [job.index]: !prev[job.index] }))
                    }
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0628]/80 hover:bg-[#0e0836] transition-colors border-b border-purple-500/15 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold font-mono">
                        {job.index + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{job.companyName}</span>
                          <span className="text-[11px] text-purple-400/70 font-normal">
                            — {getFieldValue('pt', `experience.jobs.${job.index}.title`) || 'Cargo'}
                          </span>
                        </div>
                        <div className="text-[10px] text-purple-300/50 font-mono">
                          experience.jobs.{job.index}.*
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-purple-400">
                      <span className="text-[11px] text-purple-400/70">
                        {isExpanded ? 'Recolher' : 'Expandir'}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Conteúdo do Job */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {/* Campos escalares do Job (title, company, location, date, description) */}
                      <div className="space-y-3">
                        {jobScalarKeys.map(key => {
                          const subName = key.split('.').pop() || key
                          const isDescription = subName === 'description'

                          return (
                            <TranslationFieldCard
                              key={key}
                              fieldKey={key}
                              label={`Job ${job.index + 1} • ${subName.toUpperCase()}`}
                              isTextarea={isDescription}
                              ptValue={getFieldValue('pt', key)}
                              enValue={getFieldValue('en', key)}
                              ptDefault={flatPt[key] ?? ''}
                              enDefault={flatEn[key] ?? ''}
                              ptHasOverride={hasCommittedOverride('pt', key)}
                              enHasOverride={hasCommittedOverride('en', key)}
                              ptDirty={isFieldDirty('pt', key)}
                              enDirty={isFieldDirty('en', key)}
                              ptPendingDelete={isFieldPendingDelete('pt', key)}
                              enPendingDelete={isFieldPendingDelete('en', key)}
                              onEditPt={val => handleEdit('pt', key, val)}
                              onEditEn={val => handleEdit('en', key, val)}
                              onRestorePt={() => handleRestoreField('pt', key)}
                              onRestoreEn={() => handleRestoreField('en', key)}
                            />
                          )
                        })}
                      </div>

                      {/* Lista de Conquistas (Achievements) */}
                      {jobAchievementKeys.length > 0 && (
                        <div className="pt-2 border-t border-purple-500/10 space-y-3">
                          <div className="text-[11px] font-semibold text-purple-300/80 px-1">
                            Conquistas & Destaques (Achievements):
                          </div>
                          {jobAchievementKeys.map((key, achIdx) => (
                            <TranslationFieldCard
                              key={key}
                              fieldKey={key}
                              label={`Conquista [${achIdx + 1}]`}
                              isTextarea={true}
                              ptValue={getFieldValue('pt', key)}
                              enValue={getFieldValue('en', key)}
                              ptDefault={flatPt[key] ?? ''}
                              enDefault={flatEn[key] ?? ''}
                              ptHasOverride={hasCommittedOverride('pt', key)}
                              enHasOverride={hasCommittedOverride('en', key)}
                              ptDirty={isFieldDirty('pt', key)}
                              enDirty={isFieldDirty('en', key)}
                              ptPendingDelete={isFieldPendingDelete('pt', key)}
                              enPendingDelete={isFieldPendingDelete('en', key)}
                              onEditPt={val => handleEdit('pt', key, val)}
                              onEditEn={val => handleEdit('en', key, val)}
                              onRestorePt={() => handleRestoreField('pt', key)}
                              onRestoreEn={() => handleRestoreField('en', key)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CARD DE AVISO DO EXPORT/IMPORT (Card 3.2.2) */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300/80 flex items-start gap-3">
        <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-purple-200">
            Exportação e Importação de Arquivos JSON (Fase 3.2.2)
          </p>
          <p className="text-purple-300/60 leading-relaxed">
            O download de dicionários completos e importação com diff e preview modal estarão disponíveis no próximo card do roadmap.
          </p>
        </div>
      </div>

      {/* TOOLBAR FIXA NO RODAPÉ (STICKY FOOTER) */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 p-3 bg-[#07041f]/95 backdrop-blur-xl border-t border-purple-500/25 shadow-2xl shadow-purple-950/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4">
          {/* Lado Esquerdo: Contador de Alterações */}
          <div className="flex items-center gap-2.5 text-xs">
            {dirtyCount > 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span className="font-semibold text-amber-300">
                  {dirtyCount} {dirtyCount === 1 ? 'alteração pendente' : 'alterações pendentes'}
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  (clique em Salvar para persistir no banco)
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300">Nenhuma alteração pendente</span>
              </>
            )}
          </div>

          {/* Lado Direito: Ações Globais */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setModalRestoreAllOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Restaura todas as traduções de todos os idiomas para o padrão do código"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Tudo ao Padrão</span>
              <span className="sm:hidden">Reset</span>
            </button>

            <button
              onClick={() => setModalDiscardAllOpen(true)}
              disabled={dirtyCount === 0}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                dirtyCount > 0
                  ? 'border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200'
                  : 'border-white/5 opacity-40 cursor-not-allowed text-slate-500'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Descartar Tudo</span>
            </button>

            <button
              onClick={() => setModalSaveOpen(true)}
              disabled={dirtyCount === 0 || saving}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                dirtyCount > 0 && !saving
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50'
                  : 'bg-purple-600/30 text-purple-300/40 cursor-not-allowed border border-purple-500/20'
              }`}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: CONFIRMAR SALVAMENTO */}
      {modalSaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0b0728] border border-purple-500/30 rounded-2xl p-5 shadow-2xl shadow-purple-950/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Salvar Alterações no Banco?</h3>
                <p className="text-xs text-purple-300/70">
                  {dirtyCount} {dirtyCount === 1 ? 'modificação será aplicada' : 'modificações serão aplicadas'} em produção.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200/90 space-y-2">
              <p>
                Os novos textos serão gravados na tabela SQLite de overrides e ficarão imediatamente ativos na landing page pública sem necessidade de rebuild.
              </p>
              <div className="text-[11px] text-purple-300/60 font-mono">
                • {toDelete.pt.size + toDelete.en.size} exclusão(ões) de override para restaurar padrão<br />
                • {dirtyCount - (toDelete.pt.size + toDelete.en.size)} atualização(ões) de chaves
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalSaveOpen(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/30 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gravando no SQLite...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirmar e Salvar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAR DESCARTAR TUDO */}
      {modalDiscardAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0b0728] border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Descartar Todas as Alterações?</h3>
                <p className="text-xs text-amber-300/70">
                  Todas as edições não salvas ({dirtyCount}) serão perdidas.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Todos os campos voltarão aos valores salvos no banco de dados. Essa ação não pode ser desfeita.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalDiscardAllOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleDiscardAll}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
              >
                Sim, Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMAR RESTAURAR TUDO AO PADRÃO */}
      {modalRestoreAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0b0728] border border-red-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Restaurar Tudo ao Padrão de Fábrica?</h3>
                <p className="text-xs text-red-300/70">
                  Remove todas as personalizações salvas no banco.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Isso marcará todos os overrides de ambos os idiomas para exclusão. Os textos voltarão aos padrões definidos nos arquivos <code className="text-purple-300 font-mono">pt.json</code> e <code className="text-purple-300 font-mono">en.json</code>.
              <br /><br />
              Esta ação entrará no draft e precisará ser confirmada em &quot;Salvar Alterações&quot;.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModalRestoreAllOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestoreAllToDefault}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Restaurar Padrões
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Subcomponente de Card de Campo de Tradução (PT/EN lado a lado)
interface TranslationFieldCardProps {
  fieldKey: string
  label?: string
  isTextarea?: boolean
  ptValue: string
  enValue: string
  ptDefault: string
  enDefault: string
  ptHasOverride: boolean
  enHasOverride: boolean
  ptDirty: boolean
  enDirty: boolean
  ptPendingDelete: boolean
  enPendingDelete: boolean
  onEditPt: (val: string) => void
  onEditEn: (val: string) => void
  onRestorePt: () => void
  onRestoreEn: () => void
}

function TranslationFieldCard({
  fieldKey,
  label,
  isTextarea,
  ptValue,
  enValue,
  ptDefault,
  enDefault,
  ptHasOverride,
  enHasOverride,
  ptDirty,
  enDirty,
  ptPendingDelete,
  enPendingDelete,
  onEditPt,
  onEditEn,
  onRestorePt,
  onRestoreEn,
}: TranslationFieldCardProps) {
  // Se o texto for longo ou tiver quebras, usa textarea
  const shouldTextarea =
    isTextarea || ptDefault.length > 70 || enDefault.length > 70 || ptDefault.includes('\n')

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        ptDirty || enDirty
          ? 'bg-[#080424] border-purple-500/40 shadow-sm shadow-purple-500/10'
          : 'bg-[#07041f]/70 border-purple-500/15'
      }`}
    >
      {/* HEADER DO CAMPO */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-wide">
            {label || fieldKey}
          </span>
          <span className="text-[10px] text-purple-400/60 font-mono">
            {fieldKey}
          </span>
        </div>

        {/* BADGES DO CAMPO */}
        <div className="flex items-center gap-2 text-[10px]">
          {(ptHasOverride || enHasOverride) && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Override Ativo
            </span>
          )}
          {(ptDirty || enDirty) && (
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-200 font-medium flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Modificado (Draft)
            </span>
          )}
          {(ptPendingDelete || enPendingDelete) && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium">
              Restauração Pendente
            </span>
          )}
        </div>
      </div>

      {/* DUAL COLUMN: PT vs EN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* COLUNA PORTUGUÊS */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-purple-200/90 flex items-center gap-1.5">
              <span>🇧🇷 Português (PT)</span>
              {ptPendingDelete && (
                <span className="text-[10px] text-amber-400 font-normal">(padrão)</span>
              )}
            </label>

            {(ptHasOverride || ptDirty) && (
              <button
                type="button"
                onClick={onRestorePt}
                className="text-[10px] text-purple-400/80 hover:text-purple-200 flex items-center gap-1 hover:underline"
                title="Restaurar valor original do arquivo pt.json"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Restaurar padrão</span>
              </button>
            )}
          </div>

          {shouldTextarea ? (
            <textarea
              rows={3}
              value={ptValue}
              onChange={e => onEditPt(e.target.value)}
              placeholder={ptDefault}
              className={`w-full bg-[#040114] border rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors resize-y leading-relaxed ${
                ptPendingDelete
                  ? 'border-amber-500/40 text-amber-200/70 bg-amber-950/10'
                  : ptDirty
                  ? 'border-purple-500/60 focus:border-purple-400'
                  : 'border-purple-500/20 focus:border-purple-500/50'
              }`}
            />
          ) : (
            <input
              type="text"
              value={ptValue}
              onChange={e => onEditPt(e.target.value)}
              placeholder={ptDefault}
              className={`w-full bg-[#040114] border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors ${
                ptPendingDelete
                  ? 'border-amber-500/40 text-amber-200/70 bg-amber-950/10'
                  : ptDirty
                  ? 'border-purple-500/60 focus:border-purple-400'
                  : 'border-purple-500/20 focus:border-purple-500/50'
              }`}
            />
          )}

          {/* Dica de valor padrão caso diferente */}
          {ptValue !== ptDefault && (
            <div className="text-[10px] text-slate-500 truncate" title={`Padrão: ${ptDefault}`}>
              Padrão original: <span className="text-slate-400 font-mono">{ptDefault}</span>
            </div>
          )}
        </div>

        {/* COLUNA INGLÊS */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-purple-200/90 flex items-center gap-1.5">
              <span>🇺🇸 Inglês (EN)</span>
              {enPendingDelete && (
                <span className="text-[10px] text-amber-400 font-normal">(padrão)</span>
              )}
            </label>

            {(enHasOverride || enDirty) && (
              <button
                type="button"
                onClick={onRestoreEn}
                className="text-[10px] text-purple-400/80 hover:text-purple-200 flex items-center gap-1 hover:underline"
                title="Restaurar valor original do arquivo en.json"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Restaurar padrão</span>
              </button>
            )}
          </div>

          {shouldTextarea ? (
            <textarea
              rows={3}
              value={enValue}
              onChange={e => onEditEn(e.target.value)}
              placeholder={enDefault}
              className={`w-full bg-[#040114] border rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors resize-y leading-relaxed ${
                enPendingDelete
                  ? 'border-amber-500/40 text-amber-200/70 bg-amber-950/10'
                  : enDirty
                  ? 'border-purple-500/60 focus:border-purple-400'
                  : 'border-purple-500/20 focus:border-purple-500/50'
              }`}
            />
          ) : (
            <input
              type="text"
              value={enValue}
              onChange={e => onEditEn(e.target.value)}
              placeholder={enDefault}
              className={`w-full bg-[#040114] border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors ${
                enPendingDelete
                  ? 'border-amber-500/40 text-amber-200/70 bg-amber-950/10'
                  : enDirty
                  ? 'border-purple-500/60 focus:border-purple-400'
                  : 'border-purple-500/20 focus:border-purple-500/50'
              }`}
            />
          )}

          {/* Dica de valor padrão caso diferente */}
          {enValue !== enDefault && (
            <div className="text-[10px] text-slate-500 truncate" title={`Padrão: ${enDefault}`}>
              Padrão original: <span className="text-slate-400 font-mono">{enDefault}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

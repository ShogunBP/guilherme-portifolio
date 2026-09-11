import React from 'react'
import Link from 'next/link'
import { Construction, ArrowRight, ArrowLeft, LucideIcon } from 'lucide-react'

interface SectionPlaceholderProps {
  title: string
  subtitle: string
  icon: LucideIcon
  phaseTag: string
  phaseTitle: string
  description: string
  deliverables?: string[]
}

export function SectionPlaceholder({
  title,
  subtitle,
  icon: Icon,
  phaseTag,
  phaseTitle,
  description,
  deliverables = [],
}: SectionPlaceholderProps) {
  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner shadow-purple-500/20">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25">
                {phaseTag}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="self-start sm:self-auto text-xs text-purple-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative overflow-hidden bg-[#0b0826]/70 border border-purple-500/20 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center backdrop-blur-md shadow-xl shadow-purple-950/20">
        {/* Ambient glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Construction Icon Badge */}
        <div className="relative w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 shadow-lg shadow-purple-950/40">
          <Construction className="w-8 h-8 animate-pulse" />
        </div>

        <div className="relative max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
            <span>Roadmap</span>
            <span>•</span>
            <span className="text-white font-medium">{phaseTag}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Em Desenvolvimento
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed">
            {description}
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/15 border border-purple-500/25 text-purple-200 text-xs font-mono shadow-sm">
              <span className="font-semibold text-purple-300">{phaseTag}</span>
              <ArrowRight className="w-3 h-3 text-purple-400" />
              <span>{phaseTitle}</span>
            </div>
          </div>
        </div>

        {/* Planned Deliverables */}
        {deliverables.length > 0 && (
          <div className="relative mt-8 pt-6 border-t border-purple-500/15 w-full max-w-lg">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Itens previstos nesta fase:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {deliverables.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-xs text-gray-300 bg-purple-500/5 border border-purple-500/10 px-3 py-2 rounded-lg"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

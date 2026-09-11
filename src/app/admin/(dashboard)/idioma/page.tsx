import React from 'react'
import { Globe2 } from 'lucide-react'
import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function AdminIdiomaPage() {
  return (
    <SectionPlaceholder
      title="Idioma & Traduções"
      subtitle="Gerenciamento de chaves i18n e textos em Português e Inglês"
      icon={Globe2}
      phaseTag="Fase 3"
      phaseTitle="Idioma & Traduções — Chaves i18n PT/EN"
      description="Esta seção será implementada na Fase 3 do roadmap. Permitirá editar as strings e traduções estáticas e dinâmicas da aplicação (Português e Inglês) diretamente através de uma interface centralizada com persistência em banco."
      deliverables={[
        'Tabela de chaves de tradução (PT-BR / EN-US)',
        'Filtros por namespace e componente',
        'Busca rápida de termos e status de tradução',
        'Sincronização em tempo real com dicionários i18n',
      ]}
    />
  )
}

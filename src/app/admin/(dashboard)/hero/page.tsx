import React from 'react'
import { Sparkles } from 'lucide-react'
import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function AdminHeroPage() {
  return (
    <SectionPlaceholder
      title="Hero & Bio"
      subtitle="Apresentação pessoal, links sociais e chamada de abertura"
      icon={Sparkles}
      phaseTag="Fase 4"
      phaseTitle="Hero & Bio — Apresentação pessoal e links sociais"
      description="Esta seção será implementada na Fase 4 do roadmap. Os formulários de edição de biografia, foto de perfil, badges profissionais, slogans de abertura e links sociais serão integrados com o SQLite nesta etapa."
      deliverables={[
        'Título, subtítulo e bio resumida',
        'Foto de perfil e avatar dinâmico',
        'Links de redes sociais e contato',
        'Status de disponibilidade profissional',
      ]}
    />
  )
}

import React from 'react'
import { Layers } from 'lucide-react'
import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function AdminSkillsPage() {
  return (
    <SectionPlaceholder
      title="Skills & Habilidades"
      subtitle="Categorias de tecnologias, stacks e proficiências técnicas"
      icon={Layers}
      phaseTag="Fase 5"
      phaseTitle="Skills & Habilidades — Categorias e proficiências"
      description="Esta seção será implementada na Fase 5 do roadmap. Permitirá gerenciar categorias técnicas (Frontend, Backend, Cloud, DevOps, Database), ícones, nível de experiência e ordenação das tecnologias exibidas."
      deliverables={[
        'CRUD de categorias técnicas',
        'Cadastro de tecnologias e ícones',
        'Nível de proficiência e tempo de experiência',
        'Reordenação visual e destaque',
      ]}
    />
  )
}

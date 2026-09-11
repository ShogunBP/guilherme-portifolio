import React from 'react'
import { FileText } from 'lucide-react'
import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function AdminCurriculoPage() {
  return (
    <SectionPlaceholder
      title="Experiência & Currículo"
      subtitle="Linha do tempo profissional, formação acadêmica e download de PDF"
      icon={FileText}
      phaseTag="Fase 6"
      phaseTitle="Experiência & Currículo — Linha do tempo e gestão de CV"
      description="Esta seção será implementada na Fase 6 do roadmap. Você poderá gerenciar os cargos exercidos, empresas, período de atuação, conquistas, certificações e fazer upload de novas versões do currículo em PDF."
      deliverables={[
        'Linha do tempo de experiências profissionais',
        'Histórico acadêmico e certificações',
        'Upload e substituição do arquivo PDF do currículo',
        'Metadados de download e visualização',
      ]}
    />
  )
}

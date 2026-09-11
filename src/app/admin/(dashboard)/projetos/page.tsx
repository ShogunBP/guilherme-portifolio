import React from 'react'
import { FolderGit2 } from 'lucide-react'
import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function AdminProjetosPage() {
  return (
    <SectionPlaceholder
      title="Projetos & Portfólio"
      subtitle="Catálogo de projetos em destaque, mídias e links de deploy/repositório"
      icon={FolderGit2}
      phaseTag="Fase 7"
      phaseTitle="Projetos & Portfólio — Catálogo de projetos e links"
      description="Esta seção será implementada na Fase 7 do roadmap. Oferecerá gerenciamento completo de projetos: título, descrição em múltiplos idiomas, capa, galeria de imagens, tecnologias utilizadas, links de repositório no GitHub e deploy em produção."
      deliverables={[
        'CRUD completo de projetos e destaques',
        'Upload de capas e capturas de tela',
        'Associação de tags e stacks tecnológicas',
        'Links para GitHub, demo online e documentação',
      ]}
    />
  )
}

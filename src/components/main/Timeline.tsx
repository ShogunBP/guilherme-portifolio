'use client'

import { motion } from 'framer-motion'
import { FC, JSX } from 'react'
import Image from 'next/image'
import { Timeline as TimelineComponent } from '@/components/ui/timeline'
import { FaBriefcase, FaBuilding, FaLaptopCode } from 'react-icons/fa'

export interface TimelineItem {
  id: number
  type: 'work' | 'project'
  title: string
  company: string
  location: string
  date: string
  imageURL: string
  description: string
  achievements: string[]
  icon: JSX.Element
  companyIcon: JSX.Element
}

export const timelineData: TimelineItem[] = [
  {
    id: 1,
    type: 'work',
    title: 'Desenvolvedor Full-Stack',
    company: 'SCHOTT',
    location: 'Diadema – São Paulo – Brasil',
    date: 'Jan 2024 – Mar 2025',
    imageURL: '/talent-corner-logo.png',
    description:
      'Migração Vue 2 → 3, redesign de dashboard e plataforma de monitoramento industrial com Vue 3 e ASP.NET.',
    achievements: [
      'Liderou migração e redesign de dashboard (+40% performance).',
      'Desenvolveu plataforma com sensores, temas dark/light e KPIs em tempo real.',
      'Evoluiu filtros dinâmicos e painéis com dados atualizados.',
      'Stack: Vue.js 2/3, TypeScript, ASP.NET, Entity Framework, MySQL, Docker, Azure DevOps.',
    ],
    icon: <FaBriefcase className="w-6 h-6 text-primary" />,
    companyIcon: <FaBuilding className="w-8 h-8 text-blue-500" />,
  },
  {
    id: 2,
    type: 'work',
    title: 'Desenvolvedor',
    company: 'Avanth',
    location: 'Brasil',
    date: 'Fev 2023 – Out 2023',
    imageURL: '/talent-corner-logo.png',
    description:
      'Dashboard para fintech com Vue.js 2 e .NET 7, APIs RESTful com JWT e RBAC.',
    achievements: [
      'Redução de 40% no tempo de processamento de operações financeiras.',
      'APIs .NET 7 com autenticação JWT e controle de acesso RBAC.',
      'Stack: Vue.js 2, Vuex, JavaScript, .NET 7, SQL Server, Swagger.',
    ],
    icon: <FaBriefcase className="w-6 h-6 text-primary" />,
    companyIcon: <FaBuilding className="w-8 h-8 text-orange-500" />,
  },
  {
    id: 3,
    type: 'work',
    title: 'Desenvolvedor',
    company: 'CREN',
    location: 'Brasil',
    date: 'Jan 2022 – Dez 2022',
    imageURL: '/talent-corner-logo.png',
    description:
      'Prontuário eletrônico em WinForms com foco em usabilidade e conformidade LGPD.',
    achievements: [
      '+40% de agilidade e -70% em erros de digitação.',
      'Stack: C#, WinForms, MySQL, Dapper, DevExpress.',
    ],
    icon: <FaBriefcase className="w-6 h-6 text-primary" />,
    companyIcon: <FaLaptopCode className="w-8 h-8 text-blue-500" />,
  },
]

export const TimelineElement: FC<{ item: TimelineItem; index: number }> = ({ item, index }) => (
  <div className="space-y-6" key={index}>
    <div className="flex items-center gap-4">
      {item.type === 'work' && (
        <Image
          src={item.imageURL}
          alt={`${item.company} Logo`}
          width={48}
          height={48}
          className="rounded-md shadow bg-muted p-1"
        />
      )}
      <div>
        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
        <p className="text-sm text-muted-foreground">
          {item.company} • {item.location}
        </p>
        <p className="text-sm text-muted-foreground">{item.date}</p>
      </div>
    </div>

    <p className="text-sm text-muted-foreground">{item.description}</p>

    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
      {item.achievements.map((ach) => (
        <li key={ach}>{ach}</li>
      ))}
    </ul>

    {item.type === 'project' && (
      <div className="w-full mt-4">
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-md bg-background">
          <Image
            src={item.imageURL}
            alt={`${item.title} Architecture`}
            className="object-contain"
            loading="lazy"
            fill
          />
        </div>
      </div>
    )}
  </div>
)

const Timeline: FC = () => {
  const timelineContent = timelineData.map((item) => ({
    title: item.date,
    content: <TimelineElement key={item.id} item={item} index={item.id} />,
  }))

  return (
    <section id="experience" className="py-20 bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold tracking-tight text-primary">
            Professional Experience & Projects
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base">
            Highlights of my career and key projects showcasing my skills & impact.
          </p>
        </motion.div>

        <div className="relative w-full">
          <TimelineComponent data={timelineContent} />
        </div>
      </div>
    </section>
  )
}

export default Timeline

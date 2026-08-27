'use client'

import {
  IconArrowWaveRightUp,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { FaGithub } from 'react-icons/fa'
import { Badge } from '../ui/badge'
import { BentoGrid, BentoGridItem } from '../ui/bento-grid'

const projectsData = [
  {
    title: 'Projeto Mock 1',
    description:
      'Descrição de exemplo — projeto demonstrativo. O conteúdo real será gerenciado via painel administrativo em breve.',
    github: '#',
    live: '#',
    icon: <IconClipboardCopy className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Projeto Mock 2',
    description:
      'Descrição de exemplo — projeto demonstrativo. O conteúdo real será gerenciado via painel administrativo em breve.',
    github: '#',
    live: '#',
    icon: <IconFileBroken className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Projeto Mock 3',
    description:
      'Descrição de exemplo — projeto demonstrativo. O conteúdo real será gerenciado via painel administrativo em breve.',
    github: '#',
    live: '#',
    icon: <IconSignature className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Projeto Mock 4',
    description:
      'Descrição de exemplo — projeto demonstrativo. O conteúdo real será gerenciado via painel administrativo em breve.',
    github: '#',
    live: '#',
    icon: <IconTableColumn className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Projeto Mock 5',
    description:
      'Descrição de exemplo — projeto demonstrativo. O conteúdo real será gerenciado via painel administrativo em breve.',
    github: '#',
    live: '#',
    icon: <IconArrowWaveRightUp className="h-4 w-4 text-muted-foreground" />,
  },
]

const LiveIndicator = () => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
  </span>
)

const Projects = () => {
  return (
    <section id="projects" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text ">My Projects</h1>
          <p className="text-muted-foreground mt-4 max-w-3xl mx-auto text-base font-semibold md:text-lg italic">
            A collection of innovative projects showcasing technical expertise & creativity.
          </p>
        </motion.div>
      </div>

      <BentoGrid className="max-w-5xl mx-auto">
        {projectsData.map((project, i) => (
          <BentoGridItem
            key={project.title}
            title={project.title}
            description={
              <div className="space-y-1 text-sm text-foreground">
                <p>{project.description}</p>
                <div className="flex gap-3">
                  <Badge asChild variant="secondary" className="gap-1 rounded-full">
                    <a
                      href={project.github}
                      className="flex items-center gap-1 cursor-default"
                      onClick={(e) => e.preventDefault()}
                    >
                      <FaGithub className="size-3" />
                      GitHub (Mock)
                    </a>
                  </Badge>

                  <a
                    href={project.live}
                    className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-0.5 text-xs font-medium text-foreground shadow-sm transition-colors cursor-default"
                    onClick={(e) => e.preventDefault()}
                  >
                    <LiveIndicator />
                    Demo (Mock)
                  </a>
                </div>
              </div>
            }
            header={
              <div className="relative w-full h-full min-h-[6rem] rounded-xl overflow-hidden bg-muted/20 border border-dashed border-border/60 flex items-center justify-center">
                <span className="text-xs text-muted-foreground/80 font-mono">Mock Preview</span>
              </div>
            }
            icon={project.icon}
            className={i === 3 || i === 6 ? 'md:col-span-2' : ''}
          />
        ))}
      </BentoGrid>
    </section>
  )
}

export default Projects

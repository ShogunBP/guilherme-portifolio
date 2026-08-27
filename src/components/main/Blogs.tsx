'use client'

import { BlogTile } from '@/components/sub/BlogTile'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'

const blogs = [
  {
    id: 1,
    title: '📝 Post Mock 1: Título de Exemplo',
    excerpt:
      'Resumo de exemplo — publicação fictícia enquanto o painel administrativo não está pronto.',
    content: `Este é um conteúdo demonstrativo para o Post Mock 1.
O artigo técnico real será cadastrado e publicado diretamente através do painel administrativo nas próximas fases do roadmap.`,
  },
  {
    id: 2,
    title: '💡 Post Mock 2: Título de Exemplo',
    excerpt:
      'Resumo de exemplo — publicação fictícia enquanto o painel administrativo não está pronto.',
    content: `Este é um conteúdo demonstrativo para o Post Mock 2.
O artigo técnico real será cadastrado e publicado diretamente através do painel administrativo nas próximas fases do roadmap.`,
  },
  {
    id: 3,
    title: '🚀 Post Mock 3: Título de Exemplo',
    excerpt:
      'Resumo de exemplo — publicação fictícia enquanto o painel administrativo não está pronto.',
    content: `Este é um conteúdo demonstrativo para o Post Mock 3.
O artigo técnico real será cadastrado e publicado diretamente através do painel administrativo nas próximas fases do roadmap.`,
  },
]

export function BlogsSection() {
  const [selectedBlog, setSelectedBlog] = useState<null | (typeof blogs)[0]>(null)

  return (
    <section id="blogs" className="w-full py-12 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-8 text-3xl font-bold text-center text-zinc-800 dark:text-zinc-100">
          Blogs
        </h2>

        <div className="grid gap-4">
          {blogs.map((blog) => (
            <BlogTile
              key={blog.id}
              title={blog.title}
              excerpt={blog.excerpt}
              onRead={() => setSelectedBlog(blog)}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!selectedBlog} onOpenChange={() => setSelectedBlog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] overflow-y-auto p-6 rounded-lg bg-white dark:bg-neutral-900">
          {selectedBlog && (
            <>
              <DialogHeader className="sticky top-0 bg-white dark:bg-neutral-900 z-10 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                <DialogTitle className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                  {selectedBlog.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-6 prose prose-zinc dark:prose-invert max-w-none">
                <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {selectedBlog.content}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import { FaDownload } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const Document = dynamic(() => import('react-pdf').then((mod) => mod.Document), { ssr: false })
const Page = dynamic(() => import('react-pdf').then((mod) => mod.Page), { ssr: false })

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

const ResumeSection = () => {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(890)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    import('react-pdf').then(({ pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc =
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    })

    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        if (wrapperRef.current) {
          setContainerWidth(Math.min(890, wrapperRef.current.clientWidth))
        }
      }, 200)
    }

    // Calcula imediatamente ao montar para corrigir o tamanho inicial (sem debounce)
    if (wrapperRef.current) {
      setContainerWidth(Math.min(890, wrapperRef.current.clientWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const onDocumentLoadError = (error: Error) => {
    setError(error.message)
  }

  return (
    <section
      id="resume"
      className="bg-background text-foreground px-6 py-16 flex flex-col items-center min-h-screen"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">{t('resume.heading')}</h2>
        <p className="mt-2 text-muted-foreground text-sm italic">
          {t('resume.subheading')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="w-full max-w-4xl bg-card border border-border rounded-lg shadow-lg overflow-hidden"
      >
        <div ref={wrapperRef} className="relative w-full overflow-y-auto">
          {error ? (
            <p className="text-destructive text-center text-lg p-4">{t('resume.error')}: {error}</p>
          ) : (
            <Document
              file="/resume.pdf"
              onLoadError={onDocumentLoadError}
              className="flex justify-center w-full"
            >
              <Page
                pageNumber={1}
                className="flex justify-center"
                renderTextLayer
                renderAnnotationLayer
                width={containerWidth}
                scale={1}
              />
            </Document>
          )}
        </div>
      </motion.div>

      <motion.a
        href="/resume.pdf"
        download
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
      >
        <FaDownload className="text-base" />
        {t('resume.download')}
      </motion.a>
    </section>
  )
}

export default ResumeSection

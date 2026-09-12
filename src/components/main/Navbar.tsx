'use client'
import { motion } from 'motion/react'

import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  NavbarLogo,
  Navbar as NavbarWrapper,
} from '@/components/ui/resizable-navbar'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ThemeToggle } from '@/hooks/use-toogle'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaBlog, FaBriefcase, FaCode, FaEnvelope, FaProjectDiagram, FaUser } from 'react-icons/fa'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'

export function Navbar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const navItems = [
    { name: t('nav.about'), link: '#about', icon: <FaUser /> },
    { name: t('nav.skills'), link: '#skills', icon: <FaCode /> },
    { name: t('nav.experience'), link: '#experience', icon: <FaBriefcase /> },
    { name: t('nav.projects'), link: '#projects', icon: <FaProjectDiagram /> },
    { name: t('nav.blog'), link: '#blogs', icon: <FaBlog /> },
  ]

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300`}>
      <NavbarWrapper className="flex flex-col items-center justify-between gap-4 px-4 py-2">
        <NavBody>
          <NavbarLogo />

          <NavItems items={navItems} isScrolled={isScrolled} />

          <div className="relative z-10 flex items-center gap-1.5 lg:gap-2 shrink-0">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="default"
              className="rounded-full z-50"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <FaEnvelope />
            </Button>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader className="relative">
            <Link
              href="#about"
              className="z-10 flex items-center"
              aria-label="Navigate to About section"
            >
              <Image
                src="/guilherme.jpg"
                alt="Guilherme Menezes"
                width={32}
                height={32}
                className="rounded-full"
              />
            </Link>

            <span className="absolute left-1/2 -translate-x-1/2 z-10 text-lg font-bold text-neutral-800 dark:text-neutral-200 pointer-events-none">
              {isMobileMenuOpen ? 'Menu' : t('nav.portfolio')}
            </span>

            <div className="flex flex-1 items-center justify-end gap-4 z-10">
              {isMobileMenuOpen && (
                <>
                  <LanguageToggle />
                  <ThemeToggle />
                </>
              )}
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {navItems.map((item) => (
              <Link
                key={`mobile-link-${item.name}`}
                href={item.link}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  document
                    .getElementById(item.link.slice(1))
                    ?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="relative text-neutral-600 dark:text-neutral-300 flex gap-2 items-center"
              >
                {item.icon} <span>{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-4">
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }}
                variant="default"
                className="w-full rounded-full"
              >
                <FaEnvelope />
              </Button>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </NavbarWrapper>
      <div className="flex items-center justify-center">
        {!isScrolled && (
          <hr className="h-1/2 w-[90vw] rounded-full border-gray-500 bg-gradient-to-r from-primary-600 to-primary-800 shadow-md" />
        )}
      </div>
    </div>
  )
}

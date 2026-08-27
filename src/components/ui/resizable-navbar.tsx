'use client'
import { cn } from '@/lib/utils'
import { IconMenu2, IconX } from '@tabler/icons-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, LayoutGroup } from 'motion/react'
import Image from 'next/image'

import React, { JSX, useRef, useState } from 'react'

interface NavbarProps {
  children: React.ReactNode
  className?: string
}

interface NavBodyProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

interface NavItemsProps {
  items: {
    name: string
    link: string
    icon: JSX.Element
  }[]
  className?: string
  isScrolled: boolean
  onItemClick?: () => void
}

interface MobileNavProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

interface MobileNavHeaderProps {
  children: React.ReactNode
  className?: string
}

interface MobileNavMenuProps {
  children: React.ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const [visible, setVisible] = useState<boolean>(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > 100) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  })

  return (
    <motion.div
      ref={ref}
      data-testid="navbar"
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn('sticky inset-x-0 top-20 z-40 w-full', className)}
    >
      <LayoutGroup>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
            : child,
        )}
      </LayoutGroup>
    </motion.div>
  )
}

const sharedTransition = { type: 'spring', stiffness: 200, damping: 50 }

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      layout
      animate={{
        backdropFilter: visible ? 'blur(10px)' : 'none',
        boxShadow: visible
          ? '0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset'
          : 'none',
        y: visible ? 20 : 0,
      }}
      transition={sharedTransition}
      style={{
        minWidth: '200px',
      }}
      className={cn(
        'relative z-[60] mx-auto hidden max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 md:flex dark:bg-transparent gap-4',
        visible ? 'w-fit bg-white/80 dark:bg-neutral-950/80' : 'w-full',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export const NavItems = ({ items, className, isScrolled, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 md:flex md:space-x-2',
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={(e) => {
            e.preventDefault()
            onItemClick?.()
            document.getElementById(item.link.slice(1))?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
          key={`link-${item.name}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div className="absolute inset-0 h-full w-full rounded-full bg-gray-100 dark:bg-neutral-800" />
          )}
          <div className="relative z-20 flex items-center justify-between gap-2">
            {item.icon}
            <AnimatePresence>
              {!isScrolled && (
                <motion.span
                  layout
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ ...sharedTransition, opacity: { duration: 0.2 } }}
                  className="font-semibold overflow-hidden whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </a>
      ))}
    </motion.div>
  )
}

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? 'blur(10px)' : 'none',
        boxShadow: visible
          ? '0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset'
          : 'none',
        width: visible ? '90%' : '100%',
        paddingRight: visible ? '12px' : '0px',
        paddingLeft: visible ? '12px' : '0px',
        borderRadius: visible ? '4px' : '2rem',
        y: visible ? 20 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        'relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 md:hidden',
        visible && 'bg-white/80 dark:bg-neutral-950/80',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return (
    <div className={cn('flex w-full flex-row items-center justify-between', className)}>
      {children}
    </div>
  )
}

export const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950',
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const MobileNavToggle = ({
  className,
  isOpen,
  onClick,
}: {
  className?: string
  isOpen: boolean
  onClick: () => void
}) => {
  return (
    <>
      {isOpen ? (
        <IconX
          data-testid="mobile-toggle"
          className={cn('text-black dark:text-white', className)}
          onClick={onClick}
        />
      ) : (
        <IconMenu2
          data-testid="mobile-toggle"
          className={cn('text-black dark:text-white', className)}
          onClick={onClick}
        />
      )}
    </>
  )
}

export const NavbarLogo = ({ isScrolled, text = "Guilherme Menezes" }: { isScrolled?: boolean, text?: string }) => {
  return (
    <a
      href="#about"
      className="group relative z-10 flex items-center space-x-3"
      aria-label="Navigate to About section"
    >
      <Image
        src="/guilherme.jpg"
        alt="Guilherme Menezes"
        width={32}
        height={32}
        className="rounded-full"
      />
      <span className="font-mono text-sm md:text-base font-semibold group-hover:text-brand-highlight transition-colors flex items-center">
        {text === "Guilherme Menezes" ? "guilherme-menezes@home:~$" : text}
        {text === "Guilherme Menezes" && (
          <span className="ml-[2px] inline-block text-current animate-blink">█</span>
        )}
      </span>
    </a>
  )
}

export const NavbarButton = ({
  href,
  as: Tag = 'a',
  children,
  className,
  variant = 'primary',
  ...props
}: {
  href?: string
  as?: React.ElementType
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'dark' | 'gradient'
} & (React.ComponentPropsWithoutRef<'a'> | React.ComponentPropsWithoutRef<'button'>)) => {
  const baseStyles =
    'px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center'

  const variantStyles = {
    primary:
      'shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]',
    secondary: 'bg-transparent shadow-none dark:text-white',
    dark: 'bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]',
    gradient:
      'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]',
  }

  return (
    <Tag
      href={href ?? undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  )
}

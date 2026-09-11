import Footer from '@/components/main/Footer'
import { Navbar } from '@/components/main/Navbar'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/components/providers/I18nProvider'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Guilherme Menezes',
  description:
    'A clean, modern, and responsive developer portfolio showcasing my projects, skills, and experience. Built using Next.js and styled with Tailwind CSS and ShadCN UI, and deployed seamlessly on Cloudflare Pages for speed and scalability.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030014] text-white overflow-x-hidden min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <Navbar />
            {children}
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

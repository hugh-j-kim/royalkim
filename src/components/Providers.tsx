'use client'

import { SessionProvider, useSession } from "next-auth/react"
import Logo from "@/components/Logo"
import React, { useEffect, useState, createContext, useContext } from "react"
import { translations } from "@/i18n/translations"
import Link from "next/link"

export const LanguageContext = createContext({
  lang: 'ko',
  setLang: (_: string) => {},
  t: (key: string) => key,
});

const LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
]

export const useLanguage = () => useContext(LanguageContext);

function Header() {
  const { data: session } = useSession()
  const { lang } = useLanguage()
  const blogTitle = session?.user?.blogTitle;
  const urlId = session?.user?.urlId;

  return (
    <header className="fixed top-0 left-0 right-0 bg-pink-50/80 backdrop-blur-sm z-50 shadow-md">
      <div className="max-w-5xl mx-auto flex h-16 items-center px-4 md:h-24 md:px-10">
        <div className="flex w-full items-center justify-between">
          
          {/* Left side: Home and Admin buttons */}
          <div className="flex flex-1 justify-start">
            <div className="flex items-center space-x-1 md:space-x-2">
              <Link href="/" className="p-2 rounded-full text-gray-600 hover:bg-pink-100 transition-colors" aria-label="Home">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              {session?.user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:px-4 md:py-2 md:text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {lang === 'ko' ? '관리자' : 'Admin'}
                </Link>
              )}
            </div>
          </div>
          
          {/* Center Logo */}
          <div className="shrink-0">
            <Logo blogTitle={blogTitle} urlId={urlId} />
          </div>
          
          {/* Right side for balance */}
          <div className="flex-1" />
        </div>
      </div>
    </header>
  )
}

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const [lang, setLang] = useState('ko')

  useEffect(() => {
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('lang') : null
    if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
      setLang(savedLang)
    }
  }, [])

  // const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setLang(e.target.value)
  //   if (typeof window !== 'undefined') {
  //     localStorage.setItem('lang', e.target.value)
  //   }
  // }

  return (
    <SessionProvider session={session}>
      <LanguageContext.Provider value={{ lang, setLang, t: (key: string) => translations[lang]?.[key] || key }}>
        <div className="bg-pink-50 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col w-full mt-16 md:mt-24">
            {children}
          </main>
        </div>
      </LanguageContext.Provider>
    </SessionProvider>
  )
} 
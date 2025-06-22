'use client'

import { SessionProvider } from "next-auth/react"
import Logo from "@/components/Logo"
import React, { useEffect, useState, createContext, useContext } from "react"
import { translations } from "@/i18n/translations"
import Link from "next/link"
import { Session } from "next-auth"

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

function Header({ session }: { session: Session | null }) {
  const { lang } = useLanguage()
  const blogTitle = session?.user?.blogTitle;
  const urlId = session?.user?.urlId;
  const userImage = session?.user?.image;

  return (
    <header className="fixed top-0 left-0 right-0 bg-pink-50/80 backdrop-blur-sm z-50 shadow-md">
      <div className="max-w-5xl mx-auto flex h-16 items-center px-4 md:h-24 md:px-10">
        <div className="flex w-full items-center justify-between">
          
          {/* Left side: Home and Admin buttons */}
          <div className="flex flex-1 justify-start">
            <div className="flex items-center space-x-1 md:space-x-2">
              <Link 
                href="/" 
                className="relative p-2 rounded-full text-gray-600 hover:text-pink-600 hover:bg-pink-100/50 transition-all duration-500 group" 
                aria-label="Home"
                style={{
                  animation: 'glow 4s ease-in-out infinite alternate'
                }}
              >
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-300/30 via-purple-300/20 to-pink-300/30 blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{
                    animation: 'pulse-glow 2s ease-in-out infinite'
                  }}
                ></div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="relative h-5 w-5 md:h-6 md:w-6 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
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
            <Logo blogTitle={blogTitle} urlId={urlId} userImage={userImage} />
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
  session: Session | null
}) {
  const [lang, setLang] = useState('ko')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('lang')
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

  // Use the mounted state to ensure consistent rendering
  const currentLang = mounted ? lang : 'ko'

  return (
    <SessionProvider session={session}>
      <LanguageContext.Provider value={{ lang: currentLang, setLang, t: (key: string) => translations[currentLang]?.[key] || key }}>
        <div className="bg-pink-50 min-h-screen flex flex-col">
          <Header session={session} />
          <main className="flex-1 flex flex-col w-full mt-16 md:mt-24">
            {children}
          </main>
        </div>
      </LanguageContext.Provider>
    </SessionProvider>
  )
} 
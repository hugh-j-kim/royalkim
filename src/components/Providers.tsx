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

  return (
    <header className="fixed top-0 left-0 right-0 bg-pink-50/80 backdrop-blur-sm z-50 border-b border-pink-100">
      <div className="max-w-5xl mx-auto px-10 py-6">
        <div className="relative flex items-center">
          {/* 관리자 버튼 - 왼쪽에 고정 */}
          {session?.user?.role === 'ADMIN' && (
            <div className="flex-shrink-0">
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {lang === 'ko' ? '관리자' : 'Admin'}
              </Link>
            </div>
          )}
          
          {/* 로고 - 중앙에 배치 */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Logo />
          </div>
          
          {/* 오른쪽 공간 - 관리자 버튼과 대칭을 맞추기 위해 */}
          {session?.user?.role === 'ADMIN' && (
            <div className="flex-shrink-0 ml-auto">
              <div className="w-[120px]"></div>
            </div>
          )}
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
          <main className="flex-1 flex flex-col w-full mt-[88px]">
            {children}
          </main>
        </div>
      </LanguageContext.Provider>
    </SessionProvider>
  )
} 
'use client'

import { SessionProvider } from "next-auth/react"
import Logo from "@/components/Logo"
import React, { useEffect, useState, createContext, useContext } from "react"
import { translations } from "@/i18n/translations"

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

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', e.target.value)
    }
  }

  return (
    <SessionProvider session={session}>
      <LanguageContext.Provider value={{ lang, setLang, t: (key: string) => translations[lang]?.[key] || key }}>
        <div className="bg-pink-50 min-h-screen flex flex-col">
          <header className="fixed top-0 left-0 right-0 bg-pink-50/80 backdrop-blur-sm z-50 border-b border-pink-100">
            <div className="max-w-5xl mx-auto px-10 py-6">
              <div className="flex items-center justify-between">
                <div className="w-1/6" />
                <div className="w-3/5 flex justify-center">
                  <Logo />
                </div>
                <div className="w-1/6 flex justify-center">
                  <select
                    className="border rounded-md px-2 py-1 text-sm"
                    value={lang}
                    onChange={handleLangChange}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col items-center w-full mt-[88px]">
            {children}
          </main>
        </div>
      </LanguageContext.Provider>
    </SessionProvider>
  )
} 
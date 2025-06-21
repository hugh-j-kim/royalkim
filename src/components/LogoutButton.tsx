"use client"

import { signOut } from "next-auth/react"
import { useLanguage } from "@/components/Providers"

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    logout: "로그아웃",
  },
  en: {
    logout: "Logout",
  },
}

export default function LogoutButton() {
  const { lang } = useLanguage()

  return (
    <button
      onClick={() => signOut()}
      className="px-3 md:px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors whitespace-nowrap"
    >
      {I18N[lang].logout}
    </button>
  )
} 
'use client'

import { SessionProvider } from "next-auth/react"
import Logo from "@/components/Logo"

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  return (
    <SessionProvider session={session}>
      <div className="bg-pink-50 min-h-screen flex flex-col">
        <header className="fixed top-0 left-0 right-0 bg-pink-50/80 backdrop-blur-sm z-50 border-b border-pink-100">
          <div className="container mx-auto px-4 py-6 flex items-center justify-center">
            <Logo />
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center w-full mt-[88px]">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
} 
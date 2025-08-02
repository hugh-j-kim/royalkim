"use client"

import React from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [isPendingUser, setIsPendingUser] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsPendingUser(false)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // 승인 대기 중인 사용자인지 확인
        if (result.error.includes("승인 대기 중")) {
          setError("관리자 승인 대기 중인 계정입니다. 승인 후 로그인해주세요.")
          setIsPendingUser(true)
        } else {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.")
        }
        return
      }

      router.push("/")
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">로그인</h1>
        {error && (
          <div className={`p-3 rounded-md mb-4 ${
            isPendingUser 
              ? "bg-orange-100 text-orange-700 border border-orange-200" 
              : "bg-red-100 text-red-700"
          }`}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-200 text-blue-600 font-bold rounded-full shadow hover:bg-blue-300 transition"
          >
            로그인하기
          </Button>
        </form>
      </div>
    </div>
  )
} 
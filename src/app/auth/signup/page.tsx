"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// urlId 유효성 검사 함수
function isValidUrlId(value: string) {
  return /^[a-z0-9]+$/.test(value)
}

export default function SignUp() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [urlId, setUrlId] = useState("")
  const [urlIdError, setUrlIdError] = useState("")
  const [isUrlIdChecking, setIsUrlIdChecking] = useState(false)
  const [isUrlIdAvailable, setIsUrlIdAvailable] = useState<boolean|null>(null)

  // urlId 중복 체크
  const checkUrlId = async () => {
    setIsUrlIdChecking(true)
    setUrlIdError("")
    setIsUrlIdAvailable(null)
    if (!isValidUrlId(urlId)) {
      setUrlIdError("영문 소문자와 숫자만 입력하세요.")
      setIsUrlIdChecking(false)
      return
    }
    try {
      const res = await fetch(`/api/auth/check-urlid?urlId=${urlId}`)
      const data = await res.json()
      if (data.available) {
        setIsUrlIdAvailable(true)
      } else {
        setUrlIdError("이미 사용 중인 url id입니다.")
        setIsUrlIdAvailable(false)
      }
    } catch {
      setUrlIdError("중복 확인 중 오류가 발생했습니다.")
      setIsUrlIdAvailable(false)
    } finally {
      setIsUrlIdChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    setUrlIdError("")
    if (!isValidUrlId(urlId)) {
      setUrlIdError("영문 소문자와 숫자만 입력하세요.")
      setIsLoading(false)
      return
    }
    if (isUrlIdAvailable === false) {
      setUrlIdError("이미 사용 중인 url id입니다.")
      setIsLoading(false)
      return
    }
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const blogName = formData.get("blogName") as string
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          blogName,
          urlId,
        }),
      })
      if (res.ok) {
        router.push("/auth/signin?registered=true")
      } else {
        const data = await res.json()
        setError(data.error || "회원가입 중 오류가 발생했습니다.")
      }
    } catch (error) {
        setError("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            또는{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-pink-600 hover:text-pink-500"
            >
              로그인
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="이름"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="이메일"
              />
            </div>
            <div>
              <label htmlFor="blogName" className="sr-only">
                블로그명
              </label>
              <input
                id="blogName"
                name="blogName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="블로그명"
              />
            </div>
            <div>
              <label htmlFor="urlId" className="sr-only">
                URL ID
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  id="urlId"
                  name="urlId"
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9]+"
                  value={urlId}
                  onChange={e => {
                    setUrlId(e.target.value)
                    setIsUrlIdAvailable(null)
                    setUrlIdError("")
                  }}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                  placeholder="URL ID 영문 소문자/숫자 (예: royalkim)"
                />
                <button
                  type="button"
                  onClick={checkUrlId}
                  disabled={isUrlIdChecking || !urlId}
                  className="px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs whitespace-nowrap"
                >
                  {isUrlIdChecking ? "확인 중..." : "중복확인"}
                </button>
              </div>
              {urlIdError && <div className="text-xs text-red-500 mt-1">{urlIdError}</div>}
              {isUrlIdAvailable && <div className="text-xs text-green-600 mt-1">사용 가능한 url id입니다.</div>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
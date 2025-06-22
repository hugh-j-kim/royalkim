"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
// import { Button } from "@/components/ui/button" // 사용하지 않으므로 삭제
import Link from "next/link"
import Image from "next/image"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-500">Loading...</div>
      </div>
    )
  }

  const userImage = session?.user?.image || "/dog-wink.png";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            안녕하세요, <span className="text-pink-500">{session?.user?.name}</span>님!
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Link
            href={`/${session?.user?.urlId || ''}`}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-2">홈</h3>
            <p className="text-sm sm:text-base text-pink-100">내 블로그로 이동</p>
          </Link>

          <Link
            href="/posts/new"
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-2">새 글 작성</h3>
            <p className="text-sm sm:text-base text-blue-100">새로운 블로그 포스트 작성</p>
          </Link>

          <Link
            href="/profile/edit"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-2">사용자 정보 수정</h3>
            <p className="text-sm sm:text-base text-green-100">프로필 정보 변경</p>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">내 정보</h2>
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <p className="text-lg font-semibold text-gray-900">{session?.user?.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <p className="text-lg break-all text-gray-900">{session?.user?.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">블로그 주소</label>
                <p className="text-lg text-pink-600 font-mono break-all">
                  /{session?.user?.urlId}
                </p>
              </div>
              
              {session?.user?.blogTitle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">블로그 제목</label>
                  <p className="text-lg break-words text-gray-900">{session.user.blogTitle}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center lg:justify-center items-center lg:flex-1">
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-1 bg-gradient-to-r from-pink-300 to-purple-300 hover:from-pink-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 shadow-xl">
                  <Image
                    src={userImage}
                    alt={`${session?.user?.name} 프로필`}
                    fill
                    className="object-cover rounded-3xl"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-2 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
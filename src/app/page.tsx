"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    name: string
  }
  viewCount: number
}

// 카드 상단 미디어 추출 함수
function getFirstMedia(content: string) {
  // 1. 유튜브 iframe 추출
  const iframeMatch = content.match(/<iframe[^>]*src="([^"]*youtube\.com\/embed\/[^"]+)"[^>]*><\/iframe>/i);
  if (iframeMatch) {
    return (
      <div className="relative w-full h-full">
        <iframe
          src={iframeMatch[1]}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
          style={{ aspectRatio: "16/9" }}
        />
      </div>
    );
  }
  // 2. 이미지 추출
  const imgMatch = content.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
  if (imgMatch) {
    return (
      <img
        src={imgMatch[1]}
        alt="썸네일"
        className="w-full h-full object-cover rounded-lg"
      />
    );
  }
  // 3. 기본 이미지
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
      <svg
        className="w-12 h-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log("Fetching posts...")
        const response = await fetch("/api/posts")
        console.log("Response status:", response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch posts")
        }
        
        const data = await response.json()
        console.log("Fetched posts:", data)
        // 생성일 기준으로 정렬
        const sortedData = data.sort((a: Post, b: Post) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setPosts(sortedData)
      } catch (error) {
        console.error("Error fetching posts:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch posts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">글 목록</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {session ? (
              <>
                <Link
                  href="/posts/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  새 글 작성
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600">오류가 발생했습니다: {error}</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">글을 불러오는 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">아직 작성된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="relative w-full aspect-video mb-1 overflow-hidden rounded-lg">
                    {getFirstMedia(post.content)}
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-0 mt-0 line-clamp-2 px-3">
                    {post.title}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-500 gap-1 sm:gap-2 px-3 pb-2 pt-0">
                    <span>{post.author.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.viewCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

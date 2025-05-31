"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState, useRef, useContext } from "react"
import { LanguageContext } from "@/components/Providers"

interface Post {
  id: string
  title: string
  content: string
  published: boolean
  createdAt: string
  authorId: string
  author: {
    name: string | null
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

const WINDOW_SIZE = 30
const SLIDE_SIZE = 10

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    blogTitle: "Royal Kim's Blog",
    home: "홈으로",
    admin: "관리페이지",
    newPost: "새 글 작성",
    logout: "로그아웃",
    login: "로그인",
    searchPlaceholder: "검색어를 입력하세요",
    search: "검색",
    first: "처음으로",
    prev: "이전 글 보기",
    more: "더보기",
    last: "끝으로",
    noPosts: "아직 작성된 글이 없습니다.",
    error: "오류가 발생했습니다:",
    loading: "로딩 중...",
    welcome: "로그인하여 서비스를 이용해보세요.",
    title: "제목",
    content: "내용",
  },
  en: {
    blogTitle: "Royal Kim's Blog",
    home: "Home",
    admin: "Admin Page",
    newPost: "New Post",
    logout: "Logout",
    login: "Login",
    searchPlaceholder: "Enter search keyword",
    search: "Search",
    first: "First",
    prev: "Previous",
    more: "More",
    last: "Last",
    noPosts: "No posts yet.",
    error: "An error occurred:",
    loading: "Loading...",
    welcome: "Please log in to use the service.",
    title: "Title",
    content: "Content",
  }
}

export default function Home() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [total, setTotal] = useState(0)
  const [searchField, setSearchField] = useState<'title' | 'content'>('title')
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { lang } = useContext(LanguageContext)

  const fetchPosts = async (offsetValue: number, customSearchField?: string, customSearchQuery?: string) => {
    try {
      const params = new URLSearchParams()
      params.append('offset', String(offsetValue))
      params.append('limit', String(WINDOW_SIZE))
      if ((customSearchQuery ?? searchQuery).trim()) {
        params.append('searchField', customSearchField ?? searchField)
        params.append('search', customSearchQuery ?? searchQuery)
      }
      const response = await fetch(`/api/posts?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }
      const data = await response.json()
      setPosts(data.posts)
      setOffset(offsetValue)
      setHasMore(data.hasMore)
      setHasPrevious(data.hasPrevious)
      setTotal(data.total)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch posts")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchPosts(0)
    }
  }, [session])

  const handleLoadMore = () => {
    fetchPosts(offset + SLIDE_SIZE)
  }

  const handleLoadPrevious = () => {
    fetchPosts(Math.max(0, offset - SLIDE_SIZE))
  }

  const handleFirst = () => {
    fetchPosts(0)
  }

  const handleLast = () => {
    const lastOffset = Math.max(0, total - WINDOW_SIZE)
    fetchPosts(lastOffset)
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    fetchPosts(0, searchField, searchQuery)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-500 mb-4">{I18N[lang].blogTitle}</h1>
          <p className="text-gray-600 mb-8">{I18N[lang].welcome}</p>
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
          >
            {I18N[lang].login}
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-500">{I18N[lang].loading}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
          <div />
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {(session?.user as any)?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {I18N[lang].admin}
              </Link>
            )}
            {session ? (
              <>
                <Link
                  href="/posts/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  {I18N[lang].newPost}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  {I18N[lang].logout}
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                {I18N[lang].login}
              </Link>
            )}
          </div>
        </div>

        {/* 검색 UI */}
        <form className="flex flex-col sm:flex-row gap-2 mb-4 items-center" onSubmit={handleSearch}>
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={searchField}
            onChange={e => setSearchField(e.target.value as 'title' | 'content')}
          >
            <option value="title">{I18N[lang].title}</option>
            <option value="content">{I18N[lang].content}</option>
          </select>
          <input
            ref={searchInputRef}
            type="text"
            className="flex-1 border rounded-md px-3 py-1 text-sm"
            placeholder={I18N[lang].searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
          />
          <button
            type="submit"
            className="px-4 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            {I18N[lang].search}
          </button>
        </form>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{I18N[lang].error} {error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{I18N[lang].noPosts}</p>
          </div>
        ) : (
          <>
            {hasPrevious && (
              <div className="flex justify-center mb-4 gap-2">
                <button
                  onClick={handleFirst}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  {I18N[lang].first}
                </button>
                <button
                  onClick={handleLoadPrevious}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  {I18N[lang].prev}
                </button>
              </div>
            )}
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
            {hasMore && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  {I18N[lang].more}
                </button>
                <button
                  onClick={handleLast}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  {I18N[lang].last}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

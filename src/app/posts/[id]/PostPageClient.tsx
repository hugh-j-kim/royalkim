"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { useContext } from "react"
import { LanguageContext } from "@/components/Providers"
import { ContentRenderer } from "@/components/ContentRenderer"
import PostActions from "@/components/PostActions"

interface Post {
  id: string
  title: string
  content: string
  createdAt: string | Date
  updatedAt: string | Date
  viewCount: number
  user: {
    name: string | null
    email: string | null
  }
  description?: string | null
  category?: {
    id: string
    name: string
  }
}

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    author: "작성자",
    createdAt: "작성일",
    updatedAt: "최근 수정일",
    viewCount: "조회수",
  },
  en: {
    author: "Author",
    createdAt: "Created",
    updatedAt: "Last Updated",
    viewCount: "Views",
  }
}

export default function PostPageClient({ post }: { post: Post }) {
  const { lang } = useContext(LanguageContext)
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <div className="mx-auto w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 md:p-6 w-full">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 break-words">{post.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs sm:text-sm text-gray-500 mb-2 border-b pb-2 items-center">
            <span><b>{I18N[lang].author}:</b> {post.user.name}</span>
            <span><b>{I18N[lang].createdAt}:</b> {new Date(post.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            <span><b>{I18N[lang].updatedAt}:</b> {new Date(post.updatedAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <b>{I18N[lang].viewCount}:</b> {post.viewCount}
            </span>
            {post.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                {post.category.name}
              </span>
            )}
          </div>
          <PostActions postId={post.id} canEdit={!!(session?.user?.email && post.user.email && session.user.email === post.user.email)} />
          <div className="prose prose-pink max-w-none mt-4">
            <ContentRenderer content={post.content} />
          </div>
        </div>
      </div>
    </div>
  )
} 
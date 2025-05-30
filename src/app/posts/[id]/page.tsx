import React from "react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"
import { ContentRenderer } from "@/components/ContentRenderer"
import { Metadata } from "next"
import PostActions from "@/components/PostActions"

interface Post {
  id: string
  title: string
  content: string
  createdAt: string | Date
  updatedAt: string | Date
  viewCount: number
  author: {
    name: string | null
    email: string | null
  }
  description?: string | null
}

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!post) {
      throw new Error("Post not found")
    }

    // Update view count
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return post
  } catch (error) {
    console.error("Error fetching post:", error)
    throw error
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const post = await getPost(params.id)
    const description = post.description || post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150)
    return {
      title: `${post.title} | Royal Kim's Blog`,
      description,
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        publishedTime: post.createdAt.toISOString(),
        authors: [post.author.name || 'Royal Kim'],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
      },
    }
  } catch (error) {
    return {
      title: 'Post Not Found | Royal Kim\'s Blog',
      description: 'The requested post could not be found.',
    }
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions)
  console.log("Session:", session)
  console.log("Session user:", session?.user)
  let post: Post | null = null
  let error: string | null = null

  try {
    post = await getPost(params.id)
    console.log("Post:", post)
    console.log("Post author:", post?.author)
  } catch (e) {
    console.error("Error in PostPage:", e)
    error = e instanceof Error ? e.message : "Failed to fetch post"
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Post not found"}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <div className="mx-auto w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 md:p-6 w-full">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 break-words">{post.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs sm:text-sm text-gray-500 mb-2 border-b pb-2 items-center">
            <span><b>작성자:</b> {post.author.name}</span>
            <span><b>작성일:</b> {new Date(post.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            <span><b>최근 수정일:</b> {new Date(post.updatedAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <b>조회수:</b> {post.viewCount}
            </span>
          </div>
          <PostActions postId={post.id} canEdit={!!(session?.user?.email && post.author.email && session.user.email === post.author.email)} />
          <div className="prose prose-pink max-w-none mt-4">
            <ContentRenderer content={post.content} />
          </div>
        </div>
      </div>
    </div>
  )
} 
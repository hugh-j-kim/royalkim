import React from "react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"
import { ContentRenderer } from "@/components/ContentRenderer"

interface Post {
  id: string
  title: string
  content: string
  createdAt: Date
  author: {
    name: string | null
    email: string | null
  }
  viewCount: number
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
          <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-500 mb-2 border-b pb-2">
            <span>작성자: {post.author.name}</span>
            <span>{post.createdAt.toLocaleDateString()}</span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              조회수: {post.viewCount}
            </span>
          </div>
          <div className="flex flex-row justify-center items-center gap-2 w-full max-w-xs mx-auto mt-4 mb-6">
            {session?.user?.email && post.author.email && session.user.email === post.author.email && (
              <Link
                href={`/posts/${post.id}/edit`}
                className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                수정하기
              </Link>
            )}
            <Link
              href="/"
              className="w-auto px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              목록으로
            </Link>
          </div>
          <div className="prose prose-pink max-w-none mt-4">
            <ContentRenderer content={post.content} />
          </div>
        </div>
      </div>
    </div>
  )
} 
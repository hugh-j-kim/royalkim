import React from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PostEditor } from "@/components/PostEditor"

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          email: true,
        },
      },
    },
  })

  if (!post) {
    throw new Error("Post not found")
  }

  return post
}

export default async function EditPostPage({
  params,
}: {
  params: { id: string }
}) {
  const session: any = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const post = await getPost(params.id)

  if (session.user?.email !== post.author.email) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            글 수정하기
          </h1>
          <PostEditor post={post} />
        </div>
      </div>
    </div>
  )
} 
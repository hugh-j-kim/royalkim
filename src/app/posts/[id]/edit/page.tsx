import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"
import EditPostForm from "./EditPostForm"

interface Props {
  params: { id: string }
}

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      category: true,
      tags: true,
    },
  })

  if (!post) {
    notFound()
  }

  return post
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id)

  return {
    title: `Edit: ${post.title}`,
    description: post.description || undefined,
  }
}

export default async function EditPostPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    notFound()
  }

  const post = await getPost(params.id)

  if (post.user.email !== session.user.email) {
    notFound()
  }

  return <EditPostForm post={post} />
} 
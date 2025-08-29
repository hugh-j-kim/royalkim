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
      User: {
        select: {
          email: true,
        },
      },
      Category: true,
      Tag: true,
    } as any,
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
  const session = await getServerSession(authOptions) as any
  if (!session?.user?.email) {
    notFound()
  }

  const post = await getPost(params.id)

  if (((post as any).User as any).email !== session.user.email) {
    notFound()
  }

  return <EditPostForm post={post as any} isSubmitting={false} />
} 
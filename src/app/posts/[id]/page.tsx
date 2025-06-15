import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import PostPageClient from "./PostPageClient"

interface Props {
  params: { id: string }
}

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      tags: true,
      comments: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    } as any,
  })

  if (!post) {
    notFound()
  }

  // Update view count
  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })

  return post
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id)

  return {
    title: post.title,
    description: post.description || undefined,
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: [(post as any).user.name || 'Royal Kim'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || undefined,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.id)
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <PostPageClient post={post as any} />
    </div>
  )
} 
import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import PostPageClient from "./PostPageClient"
import VisitorTracker from "@/components/VisitorTracker"

interface Props {
  params: { id: string }
}

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          urlId: true,
        },
      },
      Category: {
        select: {
          id: true,
          name: true,
        },
      },
      Tag: true,
      Comment: {
        include: {
          User: {
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

  // categoryIds 배열이 있으면 해당 카테고리들의 정보를 가져옴
  let categories: Array<{ id: string; name: string }> = []
  if (post.categoryIds && post.categoryIds.length > 0) {
    categories = await prisma.category.findMany({
      where: {
        id: {
          in: post.categoryIds
        }
      },
      select: {
        id: true,
        name: true,
      }
    })
  }

  // Update view count
  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })

  return {
    ...post,
    categories,
    user: (post as any).User
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id)

  return {
    title: post.title,
    description: post.description || undefined,
    alternates: {
      canonical: `/posts/${params.id}`,
    },
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      url: `https://royalkim.com/posts/${params.id}`,
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
      <VisitorTracker userId={(post as any).user.id} postId={post.id} />
      <PostPageClient post={post as any} />
    </div>
  )
} 
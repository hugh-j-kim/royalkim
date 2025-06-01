import { Metadata } from "next"
import prisma from "@/lib/prisma"
import PostPageClient from "./PostPageClient"

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
  const post = await getPost(params.id)
  return <PostPageClient post={post} />
} 
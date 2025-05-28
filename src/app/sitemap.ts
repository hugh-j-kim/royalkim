import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 모든 포스트 가져오기
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  // 기본 URL들
  const baseUrls = [
    {
      url: 'https://royalkim.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://royalkim.vercel.app/posts',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  // 포스트 URL들
  const postUrls = posts.map((post) => ({
    url: `https://royalkim.vercel.app/posts/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...baseUrls, ...postUrls]
} 
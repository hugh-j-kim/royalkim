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

  // 모든 사용자 블로그 가져오기
  const users = await prisma.user.findMany({
    where: {
      approvedAt: { not: null },
      deletedAt: null,
    },
    select: {
      urlId: true,
      updatedAt: true,
    },
  })

  // 기본 URL들
  const baseUrls = [
    {
      url: 'https://royalkim.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://royalkim.com/posts',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  // 사용자 블로그 URL들
  const userUrls = users.map((user) => ({
    url: `https://royalkim.com/${user.urlId}`,
    lastModified: user.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 포스트 URL들
  const postUrls = posts.map((post) => ({
    url: `https://royalkim.com/posts/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...baseUrls, ...userUrls, ...postUrls]
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 기본 통계 데이터 조회
    const [totalPosts, totalViews, totalComments, totalCategories] = await Promise.all([
      prisma.post.count({
        where: { userId }
      }),
      prisma.post.aggregate({
        where: { userId },
        _sum: { viewCount: true }
      }),
      prisma.comment.count({
        where: {
          post: { userId }
        }
      }),
      prisma.category.count({
        where: { userId }
      })
    ])

    // 최근 포스트 조회
    const recentPosts = await prisma.post.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        viewCount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // 인기 포스트 조회
    const topPosts = await prisma.post.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        viewCount: true
      },
      orderBy: { viewCount: 'desc' },
      take: 10
    })

    // 월별 조회수 데이터 생성 (최근 6개월)
    const monthlyViews = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      
      const monthViews = await prisma.post.aggregate({
        where: {
          userId,
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        },
        _sum: { viewCount: true }
      })

      monthlyViews.push({
        month: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        views: monthViews._sum.viewCount || 0
      })
    }

    // 유입경로 분석
    const referrerStats = await prisma.visitorLog.groupBy({
      by: ['referrer'],
      where: { userId },
      _count: { referrer: true },
      orderBy: { _count: { referrer: 'desc' } },
      take: 10
    })

    // 지역별 방문자 분석
    const countryStats = await prisma.visitorLog.groupBy({
      by: ['country'],
      where: { 
        userId,
        country: { not: null }
      },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10
    })

    // 최근 방문자 로그
    const recentVisitors = await prisma.visitorLog.findMany({
      where: { userId },
      include: {
        post: {
          select: { title: true }
        }
      },
      orderBy: { visitedAt: 'desc' },
      take: 20
    })

    const stats = {
      totalPosts,
      totalViews: totalViews._sum.viewCount || 0,
      totalComments,
      totalCategories,
      recentPosts: recentPosts.map(post => ({
        ...post,
        createdAt: post.createdAt.toISOString()
      })),
      topPosts,
      monthlyViews,
      referrerStats: referrerStats.map(stat => ({
        referrer: stat.referrer || '직접 방문',
        count: stat._count.referrer
      })),
      countryStats: countryStats.map(stat => ({
        country: stat.country,
        count: stat._count.country
      })),
      recentVisitors: recentVisitors.map(visitor => ({
        ...visitor,
        visitedAt: visitor.visitedAt.toISOString(),
        postTitle: visitor.post?.title
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
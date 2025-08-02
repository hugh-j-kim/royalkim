import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 전체 통계 데이터 조회
    const [totalUsers, totalPosts, totalViews, totalComments, totalCategories, totalVisitors] = await Promise.all([
      prisma.user.count({
        where: { 
          role: "USER",
          deletedAt: null
        }
      }),
      prisma.post.count(),
      prisma.post.aggregate({
        _sum: { viewCount: true }
      }),
      prisma.comment.count(),
      prisma.category.count(),
      prisma.visitorLog.count()
    ])

    // 승인 대기 중인 사용자 수
    const pendingUsers = await prisma.user.count({
      where: { 
        role: "PENDING",
        deletedAt: null
      }
    })

    // 삭제된 사용자 수
    const deletedUsers = await prisma.user.count({
      where: { 
        deletedAt: { not: null }
      }
    })

    // 최근 가입한 사용자들
    const recentUsers = await prisma.user.findMany({
      where: { 
        role: "USER",
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        urlId: true,
        createdAt: true,
        approvedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // 인기 포스트 (전체)
    const topPosts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true,
        user: {
          select: {
            name: true,
            urlId: true
          }
        }
      },
      orderBy: { viewCount: 'desc' },
      take: 10
    })

    // 최근 포스트
    const recentPosts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            urlId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // 월별 가입자 수 (최근 6개월)
    const monthlySignups = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      
      const monthSignups = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        }
      })

      monthlySignups.push({
        month: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        signups: monthSignups
      })
    }

    // 월별 포스트 수 (최근 6개월)
    const monthlyPosts = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      
      const monthPosts = await prisma.post.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        }
      })

      monthlyPosts.push({
        month: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        posts: monthPosts
      })
    }

    // 전체 유입경로 분석
    const referrerStats = await prisma.visitorLog.groupBy({
      by: ['referrer'],
      _count: { referrer: true },
      orderBy: { _count: { referrer: 'desc' } },
      take: 10
    })

    // 전체 지역별 방문자 분석
    const countryStats = await prisma.visitorLog.groupBy({
      by: ['country'],
      where: { 
        country: { not: null }
      },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10
    })

    // 최근 방문자 로그 (전체)
    const recentVisitors = await prisma.visitorLog.findMany({
      include: {
        post: {
          select: { title: true }
        },
        user: {
          select: { name: true, urlId: true }
        }
      },
      orderBy: { visitedAt: 'desc' },
      take: 20
    })

    // 활성 사용자 (최근 30일 내 포스트 작성)
    const activeUsers = await prisma.user.count({
      where: {
        role: "USER",
        deletedAt: null,
        posts: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    })

    const stats = {
      totalUsers,
      pendingUsers,
      deletedUsers,
      totalPosts,
      totalViews: totalViews._sum.viewCount || 0,
      totalComments,
      totalCategories,
      totalVisitors,
      activeUsers,
      recentUsers: recentUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        approvedAt: user.approvedAt?.toISOString()
      })),
      topPosts: topPosts.map(post => ({
        ...post,
        user: post.user
      })),
      recentPosts: recentPosts.map(post => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
        user: post.user
      })),
      monthlySignups,
      monthlyPosts,
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
        postTitle: visitor.post?.title,
        userName: visitor.user?.name,
        userUrlId: visitor.user?.urlId
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin Stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
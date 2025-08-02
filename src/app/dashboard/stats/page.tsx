"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, Users, FileText, TrendingUp, Calendar, BarChart3 } from "lucide-react"

interface StatsData {
  user: {
    id: string
    name: string | null
    email: string | null
    urlId: string | null
    createdAt: string
    approvedAt: string | null
  }
  totalPosts: number
  totalViews: number
  totalComments: number
  totalCategories: number
  recentPosts: Array<{
    id: string
    title: string
    viewCount: number
    createdAt: string
  }>
  monthlyViews: Array<{
    month: string
    views: number
  }>
  topPosts: Array<{
    id: string
    title: string
    viewCount: number
  }>
  referrerStats: Array<{
    referrer: string
    count: number
  }>
  countryStats: Array<{
    country: string
    count: number
  }>
  recentVisitors: Array<{
    id: string
    referrer: string | null
    country: string | null
    city: string | null
    visitedAt: string
    postTitle: string | null
  }>
}

export default function StatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats()
    }
  }, [session?.user?.id])

  // 사용자 블로그 운영 기간 계산
  useEffect(() => {
    if (!stats?.user?.createdAt) return

    const calculateUserBlogDuration = () => {
      const blogStart = new Date(stats.user.createdAt)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - blogStart.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      const diffMinutes = Math.ceil(diffTime / (1000 * 60))
      
      let durationText = ''
      if (diffDays > 1) {
        durationText = `${diffDays}일`
      } else if (diffHours > 1) {
        durationText = `${diffHours}시간`
      } else {
        durationText = `${diffMinutes}분`
      }
      
      const durationElement = document.getElementById('userBlogDuration')
      if (durationElement) {
        durationElement.textContent = durationText
      }
    }

    calculateUserBlogDuration()
    // 1분마다 업데이트
    const interval = setInterval(calculateUserBlogDuration, 60000)
    
    return () => clearInterval(interval)
  }, [stats?.user?.createdAt])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
              통계 대시보드
            </h1>
          </div>
        </div>

        {/* 사용자 시작일 정보 */}
        {stats?.user && (
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-lg shadow-lg mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 opacity-80" />
                <div>
                  <p className="text-sm opacity-90">블로그 시작일</p>
                  <p className="text-lg font-semibold">
                    {new Date(stats.user.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">블로그 운영 기간</p>
                <p className="text-lg font-semibold" id="userBlogDuration">계산 중...</p>
              </div>
            </div>
            {stats.user.approvedAt && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-90">승인일:</span>
                  <span className="text-sm font-medium">
                    {new Date(stats.user.approvedAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">총 포스트</p>
                <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
              </div>
              <FileText className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">총 조회수</p>
                <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
              </div>
              <Eye className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">총 댓글</p>
                <p className="text-2xl font-bold">{stats?.totalComments || 0}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">카테고리</p>
                <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 인기 포스트 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-500" />
              인기 포스트
            </h2>
            <div className="space-y-3">
              {stats?.topPosts?.slice(0, 5).map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-pink-500">#{index + 1}</span>
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-gray-800 hover:text-pink-500 transition-colors duration-200 truncate"
                    >
                      {post.title}
                    </Link>
                  </div>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 포스트 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-500" />
              최근 포스트
            </h2>
            <div className="space-y-3">
              {stats?.recentPosts?.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-gray-800 hover:text-pink-500 transition-colors duration-200 block truncate"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 월별 조회수 차트 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-pink-500" />
            월별 조회수
          </h2>
          <div className="h-64 flex items-end justify-center gap-2">
            {stats?.monthlyViews?.map((data, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="bg-gradient-to-t from-pink-500 to-purple-600 rounded-t-lg min-w-[40px]"
                  style={{ height: `${Math.max((data.views / Math.max(...(stats?.monthlyViews?.map(d => d.views) || [1]))) * 200, 20)}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                <span className="text-xs font-medium text-gray-800">{data.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 유입경로 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-500" />
              유입경로 분석
            </h2>
            <div className="space-y-3">
              {stats?.referrerStats?.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-pink-500">#{index + 1}</span>
                    <span className="text-gray-800 truncate max-w-[200px]">{referrer.referrer}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{referrer.count}회</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-500" />
              지역별 방문자
            </h2>
            <div className="space-y-3">
              {stats?.countryStats?.map((country, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-pink-500">#{index + 1}</span>
                    <span className="text-gray-800">{country.country}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{country.count}명</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 최근 방문자 로그 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-pink-500" />
            최근 방문자
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">방문 시간</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">유입경로</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">지역</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">방문 페이지</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentVisitors?.map((visitor) => (
                  <tr key={visitor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {new Date(visitor.visitedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {visitor.referrer || '직접 방문'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {visitor.country && visitor.city 
                        ? `${visitor.country}, ${visitor.city}`
                        : visitor.country || '알 수 없음'
                      }
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {visitor.postTitle || '메인 페이지'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 
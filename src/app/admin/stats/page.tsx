"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useContext } from "react"
import Link from "next/link"
import { Session } from "next-auth"
import { LanguageContext } from "@/components/Providers"
import { ArrowLeft, Eye, Users, FileText, TrendingUp, Calendar, BarChart3, UserPlus, UserCheck, UserX } from "lucide-react"

interface AdminStatsData {
  totalUsers: number
  pendingUsers: number
  deletedUsers: number
  totalPosts: number
  totalViews: number
  totalComments: number
  totalCategories: number
  totalVisitors: number
  activeUsers: number
  recentUsers: Array<{
    id: string
    name: string | null
    email: string | null
    urlId: string | null
    createdAt: string
    approvedAt: string | null
  }>
  topPosts: Array<{
    id: string
    title: string
    viewCount: number
    user: {
      name: string | null
      urlId: string | null
    }
  }>
  recentPosts: Array<{
    id: string
    title: string
    viewCount: number
    createdAt: string
    user: {
      name: string | null
      urlId: string | null
    }
  }>
  monthlySignups: Array<{
    month: string
    signups: number
  }>
  monthlyPosts: Array<{
    month: string
    posts: number
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
    userName: string | null
    userUrlId: string | null
  }>
}

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    adminStats: "관리자 통계",
    home: "홈으로",
    projectStartDate: "프로젝트 시작일",
    totalUsers: "총 사용자",
    pendingUsers: "승인 대기",
    deletedUsers: "삭제된 사용자",
    totalPosts: "총 포스트",
    totalViews: "총 조회수",
    totalComments: "총 댓글",
    totalCategories: "총 카테고리",
    totalVisitors: "총 방문자",
    activeUsers: "활성 사용자",
    recentUsers: "최근 가입자",
    topPosts: "인기 포스트",
    recentPosts: "최근 포스트",
    monthlySignups: "월별 가입자",
    monthlyPosts: "월별 포스트",
    referrerStats: "유입경로 분석",
    countryStats: "지역별 방문자",
    recentVisitors: "최근 방문자",
    loading: "로딩 중...",
    visitTime: "방문 시간",
    referrer: "유입경로",
    region: "지역",
    visitPage: "방문 페이지",
    blogOwner: "블로그 주인",
    joinDate: "가입일",
    approvedDate: "승인일",
    directVisit: "직접 방문",
    unknown: "알 수 없음",
    mainPage: "메인 페이지",
    by: "작성자",
  },
  en: {
    adminStats: "Admin Statistics",
    home: "Home",
    projectStartDate: "Project Start Date",
    totalUsers: "Total Users",
    pendingUsers: "Pending Users",
    deletedUsers: "Deleted Users",
    totalPosts: "Total Posts",
    totalViews: "Total Views",
    totalComments: "Total Comments",
    totalCategories: "Total Categories",
    totalVisitors: "Total Visitors",
    activeUsers: "Active Users",
    recentUsers: "Recent Users",
    topPosts: "Top Posts",
    recentPosts: "Recent Posts",
    monthlySignups: "Monthly Signups",
    monthlyPosts: "Monthly Posts",
    referrerStats: "Referrer Analysis",
    countryStats: "Country Visitors",
    recentVisitors: "Recent Visitors",
    loading: "Loading...",
    visitTime: "Visit Time",
    referrer: "Referrer",
    region: "Region",
    visitPage: "Visit Page",
    blogOwner: "Blog Owner",
    joinDate: "Join Date",
    approvedDate: "Approved Date",
    directVisit: "Direct Visit",
    unknown: "Unknown",
    mainPage: "Main Page",
    by: "by",
  }
}

export default function AdminStatsPage() {
  const { lang } = useContext(LanguageContext)
  const { data: session, status } = useSession() as { data: (Session & { user: { role?: string } }) | null, status: string }
  const router = useRouter()
  const [stats, setStats] = useState<AdminStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchStats()
    }
  }, [session])

  // 프로젝트 운영 기간 계산
  useEffect(() => {
    const calculateProjectDuration = () => {
      const projectStart = new Date('2025-04-26T21:21:53')
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - projectStart.getTime())
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
      
      const durationElement = document.getElementById('projectDuration')
      if (durationElement) {
        durationElement.textContent = durationText
      }
    }

    calculateProjectDuration()
    // 1분마다 업데이트
    const interval = setInterval(calculateProjectDuration, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // 환경에 따른 블로그 URL 설정
  const getBlogUrl = (urlId: string) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://royalkim.com' 
      : 'http://localhost:3000'
    return `${baseUrl}/${urlId}`
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-500">{I18N[lang].loading}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
              {I18N[lang].adminStats}
            </h1>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {I18N[lang].home}
          </Link>
        </div>

        {/* 프로젝트 시작일 정보 */}
        <div className="bg-gradient-to-r from-slate-500 to-slate-700 text-white p-4 rounded-lg shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 opacity-80" />
              <div>
                <p className="text-sm opacity-90">{I18N[lang].projectStartDate}</p>
                <p className="text-lg font-semibold">2025년 4월 26일 21:21:53</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">프로젝트 운영 기간</p>
              <p className="text-lg font-semibold" id="projectDuration">계산 중...</p>
            </div>
          </div>
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{I18N[lang].totalUsers}</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{I18N[lang].totalPosts}</p>
                <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
              </div>
              <FileText className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{I18N[lang].totalViews}</p>
                <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
              </div>
              <Eye className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{I18N[lang].totalVisitors}</p>
                <p className="text-2xl font-bold">{stats?.totalVisitors || 0}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{I18N[lang].activeUsers}</p>
                <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* 사용자 상태 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{I18N[lang].pendingUsers}</p>
                <p className="text-2xl font-bold">{stats?.pendingUsers || 0}</p>
              </div>
              <UserPlus className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{I18N[lang].deletedUsers}</p>
                <p className="text-2xl font-bold">{stats?.deletedUsers || 0}</p>
              </div>
              <UserX className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{I18N[lang].totalComments}</p>
                <p className="text-2xl font-bold">{stats?.totalComments || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{I18N[lang].totalCategories}</p>
                <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 최근 가입자 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-pink-500" />
              {I18N[lang].recentUsers}
            </h2>
            <div className="space-y-3">
              {stats?.recentUsers?.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{user.name}</span>
                      {user.urlId && (
                        <a 
                          href={getBlogUrl(user.urlId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-pink-600 hover:text-pink-800 hover:underline"
                        >
                          @{user.urlId}
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {I18N[lang].joinDate}: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 인기 포스트 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-500" />
              {I18N[lang].topPosts}
            </h2>
            <div className="space-y-3">
              {stats?.topPosts?.slice(0, 5).map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-bold text-pink-500">#{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/posts/${post.id}`}
                        className="text-gray-800 hover:text-pink-500 transition-colors duration-200 truncate block"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {I18N[lang].by} {post.user.name} {post.user.urlId && `(@${post.user.urlId})`}
                      </p>
                    </div>
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

        {/* 월별 통계 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 월별 가입자 수 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-pink-500" />
              {I18N[lang].monthlySignups}
            </h2>
            <div className="h-64 flex items-end justify-center gap-2">
              {stats?.monthlySignups?.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-cyan-600 rounded-t-lg min-w-[40px]"
                    style={{ height: `${Math.max((data.signups / Math.max(...(stats?.monthlySignups?.map(d => d.signups) || [1]))) * 200, 20)}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  <span className="text-xs font-medium text-gray-800">{data.signups}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 월별 포스트 수 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-pink-500" />
              {I18N[lang].monthlyPosts}
            </h2>
            <div className="h-64 flex items-end justify-center gap-2">
              {stats?.monthlyPosts?.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-gradient-to-t from-green-500 to-emerald-600 rounded-t-lg min-w-[40px]"
                    style={{ height: `${Math.max((data.posts / Math.max(...(stats?.monthlyPosts?.map(d => d.posts) || [1]))) * 200, 20)}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  <span className="text-xs font-medium text-gray-800">{data.posts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 유입경로 및 지역별 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-500" />
              {I18N[lang].referrerStats}
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
              {I18N[lang].countryStats}
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
            {I18N[lang].recentVisitors}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">{I18N[lang].visitTime}</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">{I18N[lang].referrer}</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">{I18N[lang].region}</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">{I18N[lang].visitPage}</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">{I18N[lang].blogOwner}</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentVisitors?.map((visitor) => (
                  <tr key={visitor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {new Date(visitor.visitedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {visitor.referrer || I18N[lang].directVisit}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {visitor.country && visitor.city 
                        ? `${visitor.country}, ${visitor.city}`
                        : visitor.country || I18N[lang].unknown
                      }
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {visitor.postTitle || I18N[lang].mainPage}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {visitor.userName && visitor.userUrlId ? (
                        <a 
                          href={getBlogUrl(visitor.userUrlId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-800 hover:underline"
                        >
                          {visitor.userName} (@{visitor.userUrlId})
                        </a>
                      ) : (
                        I18N[lang].unknown
                      )}
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
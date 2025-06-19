import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { Session } from "next-auth"
import CategoryFilter from "@/components/CategoryFilter"

// 카드 상단 미디어 추출 함수 (메인 페이지와 동일)
function getFirstMedia(content: string) {
  const iframeMatch = content.match(/<iframe[^>]*src=\"([^\"]*youtube\.com\/embed\/[^\"]+)\"[^>]*><\/iframe>/i);
  if (iframeMatch) {
    return (
      <div className="relative w-full h-full">
        <iframe
          src={iframeMatch[1]}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
          style={{ aspectRatio: "16/9" }}
        />
      </div>
    );
  }
  const imgMatch = content.match(/<img[^>]*src=\"([^\"]+)\"[^>]*>/i);
  if (imgMatch) {
    return (
      <img
        src={imgMatch[1]}
        alt="썸네일"
        className="w-full h-full object-cover rounded-lg"
      />
    );
  }
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
      <svg
        className="w-12 h-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

interface CustomSession extends Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
    urlId?: string | null
  }
}

export default async function UserBlogPage({ 
  params,
  searchParams 
}: { 
  params: { userUrlId: string }
  searchParams: { 
    search?: string
    searchField?: string
    categoryId?: string
    offset?: string
  }
}) {
  const session = await getServerSession(authOptions) as CustomSession | null
  const user = await prisma.user.findFirst({
    where: { urlId: params.userUrlId } as any,
    select: {
      id: true,
      name: true,
      blogTitle: true,
    },
  })

  if (!user) return notFound()

  // 검색 및 필터링 파라미터
  const searchQuery = searchParams.search || ''
  const searchField = (searchParams.searchField as 'title' | 'content') || 'title'
  const categoryId = searchParams.categoryId || ''
  const offset = parseInt(searchParams.offset || '0')

  // 포스트 쿼리 조건
  const whereCondition: any = {
    published: true,
    userId: user.id,
  }

  if (searchQuery.trim()) {
    if (searchField === 'title') {
      whereCondition.title = { contains: searchQuery, mode: 'insensitive' }
    } else {
      whereCondition.content = { contains: searchQuery, mode: 'insensitive' }
    }
  }

  if (categoryId) {
    whereCondition.categoryId = categoryId
  }

  // 포스트 가져오기
  const posts = await prisma.post.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: 30,
    select: {
      id: true,
      title: true,
      createdAt: true,
      viewCount: true,
      content: true,
      category: { select: { name: true } },
    },
  })

  // 전체 개수 가져오기
  const total = await prisma.post.count({
    where: whereCondition,
  })

  // 카테고리 목록 가져오기
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  const blogTitle = user.blogTitle || `${user.name}의 블로그`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{blogTitle}</h1>
            {!session && (
              <Link
                href="/auth/signin"
                className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
          {session?.user?.id === user.id && (
            <div className="flex items-center space-x-4">
              <Link
                href="/posts/new"
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                새 글 작성
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                대시보드
              </Link>
            </div>
          )}
        </div>

        {/* 검색 및 필터링 UI */}
        <div className="mb-8 space-y-4">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="검색어를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                name="searchField"
                defaultValue={searchField}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="title">제목</option>
                <option value="content">내용</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                검색
              </button>
            </div>
          </form>
          <div className="w-full sm:w-64">
            <CategoryFilter 
              categories={categories}
              selectedCategoryId={categoryId}
            />
          </div>
        </div>

        {/* 포스트 목록 */}
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-xl text-gray-500">
              {searchQuery || categoryId ? "검색 결과가 없습니다." : "아직 작성된 글이 없습니다."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-video">
                  {getFirstMedia(post.content)}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.category && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {post.category.name}
                      </span>
                      <span className="flex items-center text-xs text-gray-500 gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.viewCount}
                      </span>
                    </div>
                  )}
                  <p className="text-gray-500 text-sm line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {post.content.replace(/<[^>]*>/g, "")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {posts.length > 0 && (offset > 0 || offset + 30 < total) && (
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href={`/${params.userUrlId}?${new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(searchField && { searchField }),
                ...(categoryId && { categoryId }),
                offset: '0'
              }).toString()}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
            >
              처음으로
            </Link>
            <Link
              href={`/${params.userUrlId}?${new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(searchField && { searchField }),
                ...(categoryId && { categoryId }),
                offset: String(Math.max(0, offset - 10))
              }).toString()}`}
              className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${offset === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              이전 글 보기
            </Link>
            <Link
              href={`/${params.userUrlId}?${new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(searchField && { searchField }),
                ...(categoryId && { categoryId }),
                offset: String(offset + 10)
              }).toString()}`}
              className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${offset + 30 >= total ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              더보기
            </Link>
            <Link
              href={`/${params.userUrlId}?${new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(searchField && { searchField }),
                ...(categoryId && { categoryId }),
                offset: String(Math.max(0, total - 30))
              }).toString()}`}
              className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${offset + 30 >= total ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              끝으로
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 
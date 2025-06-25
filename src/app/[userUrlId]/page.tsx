import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { getServerSession, Session } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import CategoryFilter from "@/components/CategoryFilter"
import LogoutButton from "@/components/LogoutButton"

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

export default async function UserBlogPage({ 
  params,
  searchParams 
}: { 
  params: { userUrlId: string }
  searchParams: { 
    search?: string
    searchField?: string
    categoryId?: string
    categoryIds?: string
    offset?: string
  }
}) {
  const session: Session | null = await getServerSession(authOptions)
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
  const categoryIds = searchParams.categoryIds || ''
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

  // 카테고리 필터링: categoryIds가 있으면 그것을 우선 사용, 없으면 categoryId 사용
  if (categoryIds) {
    const categoryIdsArray = categoryIds.split(',').map(id => id.trim()).filter(id => id);
    if (categoryIdsArray.length > 0) {
      whereCondition.categoryIds = {
        hasSome: categoryIdsArray
      }
    }
  } else if (categoryId) {
    whereCondition.OR = [
      { categoryId: categoryId },
      { categoryIds: { has: categoryId } }
    ]
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
      categoryIds: true,
    },
  })

  // 전체 개수 가져오기
  const total = await prisma.post.count({
    where: whereCondition,
  })

  // 카테고리 목록 가져오기 (계층 구조)
  const categoriesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories/user/${user.id}`, {
    cache: 'no-store'
  });
  
  let categories: any[] = [];
  if (categoriesResponse.ok) {
    categories = await categoriesResponse.json();
  } else {
    // API 호출이 실패한 경우 기존 방식으로 가져오기
    categories = await prisma.category.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  // 선택된 카테고리 ID들 파싱
  const selectedCategoryIds = categoryIds ? categoryIds.split(',').map(id => id.trim()).filter(id => id) : [];

  // 포스트의 categoryIds에 해당하는 카테고리 정보를 가져오기
  const allCategoryIds = posts
    .filter(post => post.categoryIds && post.categoryIds.length > 0)
    .flatMap(post => post.categoryIds);
  
  const uniqueCategoryIds = [...new Set(allCategoryIds)];
  
  const postCategories = await prisma.category.findMany({
    where: {
      id: {
        in: uniqueCategoryIds
      }
    },
    select: { id: true, name: true },
  });

  // 카테고리 ID를 이름으로 매핑
  const categoryMap = new Map(postCategories.map(cat => [cat.id, cat.name]));

  // 포스트에 카테고리 이름 추가
  const postsWithCategories = posts.map(post => ({
    ...post,
    categoryNames: post.categoryIds 
      ? post.categoryIds.map(id => categoryMap.get(id)).filter(Boolean)
      : []
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex flex-wrap justify-between items-center mb-12 gap-6">
          <div className="flex-1">
            <div className="inline-block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                <h1 className="text-4xl font-light text-gray-800 mb-3">
                  {user.blogTitle ? (
                    <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                      {user.blogTitle}
                    </span>
                  ) : (
                    <span className="text-gray-700">
                      {user.name}
                      <span className="text-pink-500 font-normal ml-2">'s Blog</span>
                    </span>
                  )}
                </h1>
                <div className="h-0.5 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 rounded-full transform origin-left transition-all duration-500 hover:scale-x-110"></div>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2 font-light">
              {user.blogTitle ? `${user.name}의 개인 블로그` : '개인 블로그'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {!session && (
              <Link
                href="/auth/signin"
                className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                로그인
              </Link>
            )}

            {session?.user?.id === user.id && (
              <>
                <Link
                  href="/posts/new"
                  className="px-3 md:px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors whitespace-nowrap"
                >
                  새 글 작성
                </Link>
                <Link
                  href="/admin/categories"
                  className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  카테고리 관리
                </Link>
                <Link
                  href="/dashboard"
                  className="px-3 md:px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors whitespace-nowrap"
                >
                  대시보드
                </Link>
              </>
            )}

            {session && (
              <LogoutButton />
            )}
          </div>
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
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 select-arrow"
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
          
          {/* 다중 카테고리 필터 */}
          <div className="w-full">
            <CategoryFilter 
              categories={categories}
              selectedCategoryId={categoryId}
              selectedCategoryIds={selectedCategoryIds}
              multiple={true}
            />
          </div>
        </div>

        {/* 포스트 목록 */}
        {postsWithCategories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-xl text-gray-500">
              {searchQuery || categoryId || categoryIds ? "검색 결과가 없습니다." : "아직 작성된 글이 없습니다."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsWithCategories.map(post => (
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
                  
                  {/* 다중 카테고리 표시 */}
                  {post.categoryNames && post.categoryNames.length > 0 && (
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex flex-wrap gap-1">
                        {post.categoryNames.map((categoryName, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            {categoryName}
                          </span>
                        ))}
                      </div>
                      <span className="flex items-center text-xs text-gray-500 gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.viewCount}
                      </span>
                    </div>
                  )}
                  
                  {/* 기존 단일 카테고리 표시 (하위 호환성) */}
                  {(!post.categoryNames || post.categoryNames.length === 0) && post.category && (
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
        {postsWithCategories.length > 0 && (offset > 0 || offset + 30 < total) && (
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href={`/${params.userUrlId}?${new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(searchField && { searchField }),
                ...(categoryId && { categoryId }),
                ...(categoryIds && { categoryIds }),
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
                ...(categoryIds && { categoryIds }),
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
                ...(categoryIds && { categoryIds }),
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
                ...(categoryIds && { categoryIds }),
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
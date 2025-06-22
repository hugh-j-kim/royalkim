import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Session } from "next-auth"
import LogoutButton from "@/components/LogoutButton"
import UserLink from "@/components/UserLink"

// 카드 상단 미디어 추출 함수
function getFirstMedia(content: string) {
  // 1. 유튜브 iframe 추출
  const iframeMatch = content.match(/<iframe[^>]*src="([^"]*youtube\.com\/embed\/[^"]+)"[^>]*><\/iframe>/i);
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
  // 2. 이미지 추출
  const imgMatch = content.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
  if (imgMatch) {
    return (
      <img
        src={imgMatch[1]}
        alt="썸네일"
        className="w-full h-full object-cover rounded-lg"
      />
    );
  }
  // 3. 기본 이미지
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

export default async function Home({
  searchParams
}: {
  searchParams: {
    search?: string
    searchField?: 'title' | 'content'
    offset?: string
  }
}) {
  const session: Session | null = await getServerSession(authOptions)

  const searchQuery = searchParams.search || ''
  const searchField = searchParams.searchField || 'title'
  const offset = parseInt(searchParams.offset || '0', 10)
  const WINDOW_SIZE = 30;

  const whereCondition: any = {
    published: true,
  }

  if (searchQuery.trim()) {
    whereCondition[searchField] = { contains: searchQuery, mode: 'insensitive' }
  }

  const posts = await prisma.post.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: WINDOW_SIZE,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      viewCount: true,
      category: { select: { name: true } },
      user: { select: { name: true, urlId: true, image: true } }
    },
  })

  const total = await prisma.post.count({ where: whereCondition })

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 상단 버튼 영역 */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-2">
            {session ? (
              <>
                {session.user.urlId && (
                  <Link
                    href={`/${session.user.urlId}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    나의 블로그
                  </Link>
                )}
                <Link
                  href="/posts/new"
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600"
                >
                  새 글 작성
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        {/* 검색 영역 */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
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
        </div>

        {/* 포스트 목록 */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-xl text-gray-500">
                {searchQuery ? "검색 결과가 없습니다." : "아직 작성된 글이 없습니다."}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border"
              >
                <div className="aspect-video">
                  {getFirstMedia(post.content)}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <div className="mb-2 flex items-center justify-between">
                    {post.category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {post.category.name}
                      </span>
                    ) : <div />}
                    <span className="flex items-center text-xs text-gray-500 gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.viewCount}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {post.content.replace(/<[^>]*>/g, '')}
                  </p>
                  <div className="text-right text-xs text-gray-400 mt-2">
                    {post.user.urlId && post.user.name ? (
                      <UserLink urlId={post.user.urlId} name={post.user.name} image={post.user.image} />
                    ) : (
                      <span>by {post.user.name}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {total > WINDOW_SIZE && (
          <div className="mt-8 flex justify-center space-x-2 sm:space-x-4">
            <Link
              href={`/?${new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(searchField && { searchField }),
                offset: '0'
              }).toString()}`}
              className={`px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 ${offset === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              처음으로
            </Link>
            <Link
              href={`/?${new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(searchField && { searchField }),
                offset: String(Math.max(0, offset - 10))
              }).toString()}`}
              className={`px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 ${offset === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              이전 보기
            </Link>
            <Link
              href={`/?${new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(searchField && { searchField }),
                offset: String(offset + 10)
              }).toString()}`}
              className={`px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 ${offset + WINDOW_SIZE >= total ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              더보기
            </Link>
            <Link
              href={`/?${new URLSearchParams({
                ...(searchQuery && { search: searchQuery }),
                ...(searchField && { searchField }),
                offset: String(Math.max(0, total - WINDOW_SIZE))
              }).toString()}`}
              className={`px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 ${offset + WINDOW_SIZE >= total ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              끝으로
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Session } from "next-auth"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
  approvedAt?: string
  deletedAt?: string | null
}

export default function AdminPage() {
  const { data: session, status } = useSession() as { data: (Session & { user: { role?: string } }) | null, status: string }
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }
        const data = await response.json()
        setUsers(data.users)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch users")
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchUsers()
    }
  }, [session])

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to approve user")
      }

      // 승인 후 사용자 목록 업데이트
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: "USER", approvedAt: new Date().toISOString() } : user
      ))
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to approve user")
    }
  }

  const handleDelete = async (userId: string) => {
    const reason = prompt('정말로 이 사용자를 삭제하시겠습니까?\n삭제 사유를 입력해 주세요. (선택)', '')
    if (reason === null) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (!response.ok) {
        throw new Error('사용자 삭제에 실패했습니다.')
      }
      setUsers(users.map(user => user.id === userId ? { ...user, deletedAt: new Date().toISOString() } : user))
    } catch (error) {
      setError(error instanceof Error ? error.message : '사용자 삭제에 실패했습니다.')
    }
  }

  const handleRestore = async (userId: string) => {
    if (!confirm('이 사용자를 복구하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('사용자 복구에 실패했습니다.')
      }
      setUsers(users.map(user => user.id === userId ? { ...user, deletedAt: null } : user))
    } catch (error) {
      setError(error instanceof Error ? error.message : '사용자 복구에 실패했습니다.')
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    )
  }

  const deletedUsers = users.filter(user => user.deletedAt)
  const pendingUsers = users.filter(user => user.role === "PENDING" && !user.deletedAt)
  const approvedUsers = users.filter(user => user.role === "USER" && !user.deletedAt)

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">관리자 페이지</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            홈으로
          </Link>
        </div>

        {/* 승인 대기 중인 사용자 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">승인 대기 중인 사용자</h2>
          {pendingUsers.length === 0 ? (
            <p className="text-gray-500">승인 대기 중인 사용자가 없습니다.</p>
          ) : (
            <>
              {/* 데스크탑: 테이블, 모바일: 카드형 */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">ID</th>
                      <th className="px-2 py-1">이름</th>
                      <th className="px-2 py-1">이메일</th>
                      <th className="px-2 py-1">권한</th>
                      <th className="px-2 py-1">가입일</th>
                      <th className="px-2 py-1">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-2 py-1 break-all">{user.id}</td>
                        <td className="px-2 py-1">{user.name}</td>
                        <td className="px-2 py-1 break-all">{user.email}</td>
                        <td className="px-2 py-1">{user.role}</td>
                        <td className="px-2 py-1">{formatDate(user.createdAt)}</td>
                        <td className="px-2 py-1 flex gap-1">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="px-3 py-1 text-xs sm:text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="px-3 py-1 text-xs sm:text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden flex flex-col gap-2">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-3 flex flex-col gap-1 bg-pink-50">
                    <div className="text-xs text-gray-500">ID: <span className="break-all">{user.id}</span></div>
                    <div className="font-semibold">{user.name} <span className="ml-2 text-xs text-gray-400">({user.role})</span></div>
                    <div className="text-xs text-gray-500">이메일: <span className="break-all">{user.email}</span></div>
                    <div className="text-xs text-gray-500">가입일: {formatDate(user.createdAt)}</div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="px-3 py-1 text-xs font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 w-full"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 w-full"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 승인된 사용자 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">승인된 사용자</h2>
          {approvedUsers.length === 0 ? (
            <p className="text-gray-500">승인된 사용자가 없습니다.</p>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">ID</th>
                      <th className="px-2 py-1">이름</th>
                      <th className="px-2 py-1">이메일</th>
                      <th className="px-2 py-1">권한</th>
                      <th className="px-2 py-1">가입일</th>
                      <th className="px-2 py-1">승인일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-2 py-1 break-all">{user.id}</td>
                        <td className="px-2 py-1">{user.name}</td>
                        <td className="px-2 py-1 break-all">{user.email}</td>
                        <td className="px-2 py-1">{user.role}</td>
                        <td className="px-2 py-1">{formatDate(user.createdAt)}</td>
                        <td className="px-2 py-1 flex gap-1">
                          {user.approvedAt ? formatDate(user.approvedAt) : '-'}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="ml-2 px-3 py-1 text-xs sm:text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden flex flex-col gap-2">
                {approvedUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-3 flex flex-col gap-1 bg-gray-50">
                    <div className="text-xs text-gray-500">ID: <span className="break-all">{user.id}</span></div>
                    <div className="font-semibold">{user.name} <span className="ml-2 text-xs text-gray-400">({user.role})</span></div>
                    <div className="text-xs text-gray-500">이메일: <span className="break-all">{user.email}</span></div>
                    <div className="text-xs text-gray-500">가입일: {formatDate(user.createdAt)}</div>
                    <div className="text-xs text-gray-500">승인일: {user.approvedAt ? formatDate(user.approvedAt) : '-'}</div>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="mt-2 px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 w-full"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 삭제된 사용자 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 mt-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-red-500">삭제된 사용자</h2>
          {deletedUsers.length === 0 ? (
            <p className="text-gray-400">삭제된 사용자가 없습니다.</p>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">ID</th>
                      <th className="px-2 py-1">이름</th>
                      <th className="px-2 py-1">이메일</th>
                      <th className="px-2 py-1">권한</th>
                      <th className="px-2 py-1">가입일</th>
                      <th className="px-2 py-1">삭제일</th>
                      <th className="px-2 py-1">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedUsers.map((user) => (
                      <tr key={user.id} className="bg-red-50">
                        <td className="px-2 py-1 break-all">{user.id}</td>
                        <td className="px-2 py-1">{user.name}</td>
                        <td className="px-2 py-1 break-all">{user.email}</td>
                        <td className="px-2 py-1">{user.role}</td>
                        <td className="px-2 py-1">{formatDate(user.createdAt)}</td>
                        <td className="px-2 py-1">{user.deletedAt ? formatDate(user.deletedAt) : '-'}</td>
                        <td className="px-2 py-1">
                          <button
                            onClick={() => handleRestore(user.id)}
                            className="px-4 py-1 text-xs sm:text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 whitespace-nowrap min-w-[60px] w-auto"
                          >
                            복구
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden flex flex-col gap-2">
                {deletedUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-3 flex flex-col gap-1 bg-red-50">
                    <div className="text-xs text-gray-500">ID: <span className="break-all">{user.id}</span></div>
                    <div className="font-semibold">{user.name} <span className="ml-2 text-xs text-gray-400">({user.role})</span></div>
                    <div className="text-xs text-gray-500">이메일: <span className="break-all">{user.email}</span></div>
                    <div className="text-xs text-gray-500">가입일: {formatDate(user.createdAt)}</div>
                    <div className="text-xs text-gray-500">삭제일: {user.deletedAt ? formatDate(user.deletedAt) : '-'}</div>
                    <button
                      onClick={() => handleRestore(user.id)}
                      className="mt-2 px-4 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 w-auto whitespace-nowrap min-w-[60px]"
                    >
                      복구
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// 날짜 포맷 함수
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
} 
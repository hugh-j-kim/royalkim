"use client"

import { useEffect, useState, useContext } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { LanguageContext } from "@/components/Providers"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
  approvedAt?: string
  deletedAt?: string | null
}

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    adminPage: "관리자 페이지",
    home: "홈으로",
    pendingUsers: "승인 대기 중인 사용자",
    noPendingUsers: "승인 대기 중인 사용자가 없습니다.",
    id: "ID",
    name: "이름",
    email: "이메일",
    role: "권한",
    joinDate: "가입일",
    actions: "작업",
    approve: "승인",
    delete: "삭제",
    deleteConfirm: "정말로 이 사용자를 삭제하시겠습니까?\n삭제 사유를 입력해 주세요. (선택)",
    deleteError: "사용자 삭제에 실패했습니다.",
    restore: "복구",
    restoreConfirm: "이 사용자를 복구하시겠습니까?",
    restoreError: "사용자 복구에 실패했습니다.",
    loading: "로딩 중...",
    approvedUsers: "승인된 사용자",
    noApprovedUsers: "승인된 사용자가 없습니다.",
    approvedDate: "승인일",
    deletedUsers: "삭제된 사용자",
    noDeletedUsers: "삭제된 사용자가 없습니다.",
    deletedDate: "삭제일",
  },
  en: {
    adminPage: "Admin Page",
    home: "Home",
    pendingUsers: "Pending Users",
    noPendingUsers: "No pending users.",
    id: "ID",
    name: "Name",
    email: "Email",
    role: "Role",
    joinDate: "Join Date",
    actions: "Actions",
    approve: "Approve",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this user?\nPlease enter the reason for deletion. (Optional)",
    deleteError: "Failed to delete user.",
    restore: "Restore",
    restoreConfirm: "Do you want to restore this user?",
    restoreError: "Failed to restore user.",
    loading: "Loading...",
    approvedUsers: "Approved Users",
    noApprovedUsers: "No approved users.",
    approvedDate: "Approved Date",
    deletedUsers: "Deleted Users",
    noDeletedUsers: "No deleted users.",
    deletedDate: "Deleted Date",
  }
}

export default function AdminPage() {
  const { lang } = useContext(LanguageContext)
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
    const reason = prompt(I18N[lang].deleteConfirm, '')
    if (reason === null) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (!response.ok) {
        throw new Error(I18N[lang].deleteError)
      }
      setUsers(users.map(user => user.id === userId ? { ...user, deletedAt: new Date().toISOString() } : user))
    } catch (error) {
      setError(error instanceof Error ? error.message : I18N[lang].deleteError)
    }
  }

  const handleRestore = async (userId: string) => {
    if (!confirm(I18N[lang].restoreConfirm)) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'POST' })
      if (!response.ok) {
        throw new Error(I18N[lang].restoreError)
      }
      setUsers(users.map(user => user.id === userId ? { ...user, deletedAt: null } : user))
    } catch (error) {
      setError(error instanceof Error ? error.message : I18N[lang].restoreError)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-500">{I18N[lang].loading}</div>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">{I18N[lang].adminPage}</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {I18N[lang].home}
          </Link>
        </div>

        {/* 승인 대기 중인 사용자 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{I18N[lang].pendingUsers}</h2>
          {pendingUsers.length === 0 ? (
            <p className="text-gray-500">{I18N[lang].noPendingUsers}</p>
          ) : (
            <>
              {/* 데스크탑: 테이블, 모바일: 카드형 */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">{I18N[lang].id}</th>
                      <th className="px-2 py-1">{I18N[lang].name}</th>
                      <th className="px-2 py-1">{I18N[lang].email}</th>
                      <th className="px-2 py-1">{I18N[lang].role}</th>
                      <th className="px-2 py-1">{I18N[lang].joinDate}</th>
                      <th className="px-2 py-1">{I18N[lang].actions}</th>
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
                            {I18N[lang].approve}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="px-3 py-1 text-xs sm:text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                          >
                            {I18N[lang].delete}
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
                    <div className="text-xs text-gray-500">{I18N[lang].id}: <span className="break-all">{user.id}</span></div>
                    <div className="font-semibold">{user.name} <span className="ml-2 text-xs text-gray-400">({user.role})</span></div>
                    <div className="text-xs text-gray-500">{I18N[lang].email}: <span className="break-all">{user.email}</span></div>
                    <div className="text-xs text-gray-500">{I18N[lang].joinDate}: {formatDate(user.createdAt)}</div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="px-3 py-1 text-xs font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 w-full"
                      >
                        {I18N[lang].approve}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 w-full"
                      >
                        {I18N[lang].delete}
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
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{I18N[lang].approvedUsers}</h2>
          {approvedUsers.length === 0 ? (
            <p className="text-gray-500">{I18N[lang].noApprovedUsers}</p>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">{I18N[lang].id}</th>
                      <th className="px-2 py-1">{I18N[lang].name}</th>
                      <th className="px-2 py-1">{I18N[lang].email}</th>
                      <th className="px-2 py-1">{I18N[lang].role}</th>
                      <th className="px-2 py-1">{I18N[lang].joinDate}</th>
                      <th className="px-2 py-1">{I18N[lang].approvedDate}</th>
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
                            {I18N[lang].delete}
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
                    <div className="text-xs text-gray-500">{I18N[lang].id}: <span className="break-all">{user.id}</span></div>
                    <div className="font-semibold">{user.name} <span className="ml-2 text-xs text-gray-400">({user.role})</span></div>
                    <div className="text-xs text-gray-500">{I18N[lang].email}: <span className="break-all">{user.email}</span></div>
                    <div className="text-xs text-gray-500">{I18N[lang].joinDate}: {formatDate(user.createdAt)}</div>
                    <div className="text-xs text-gray-500">{I18N[lang].approvedDate}: {user.approvedAt ? formatDate(user.approvedAt) : '-'}</div>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="mt-2 px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 w-full"
                    >
                      {I18N[lang].delete}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 삭제된 사용자 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 mt-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-red-500">{I18N[lang].deletedUsers}</h2>
          {deletedUsers.length === 0 ? (
            <p className="text-gray-400">{I18N[lang].noDeletedUsers}</p>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">{I18N[lang].id}</th>
                      <th className="px-2 py-1">{I18N[lang].name}</th>
                      <th className="px-2 py-1">{I18N[lang].email}</th>
                      <th className="px-2 py-1">{I18N[lang].role}</th>
                      <th className="px-2 py-1">{I18N[lang].joinDate}</th>
                      <th className="px-2 py-1">{I18N[lang].deletedDate}</th>
                      <th className="px-2 py-1">{I18N[lang].actions}</th>
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
                            {I18N[lang].restore}
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
                    <div className="text-xs text-gray-500">{I18N[lang].id}: <span className="break-all">{user.id}</span></div>
                    <div className="font-semibold">{user.name} <span className="ml-2 text-xs text-gray-400">({user.role})</span></div>
                    <div className="text-xs text-gray-500">{I18N[lang].email}: <span className="break-all">{user.email}</span></div>
                    <div className="text-xs text-gray-500">{I18N[lang].joinDate}: {formatDate(user.createdAt)}</div>
                    <div className="text-xs text-gray-500">{I18N[lang].deletedDate}: {user.deletedAt ? formatDate(user.deletedAt) : '-'}</div>
                    <button
                      onClick={() => handleRestore(user.id)}
                      className="mt-2 px-4 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 w-auto whitespace-nowrap min-w-[60px]"
                    >
                      {I18N[lang].restore}
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
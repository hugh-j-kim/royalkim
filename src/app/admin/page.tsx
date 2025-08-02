"use client"

import { useEffect, useState, useContext } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Session } from "next-auth"
import { LanguageContext } from "@/components/Providers"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
  approvedAt?: string
  deletedAt?: string | null
  urlId?: string
}

type TabType = 'pending' | 'approved' | 'deleted'

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    adminPage: "관리자 페이지",
    home: "홈으로",
    stats: "통계",
    pendingUsers: "승인 대기 중",
    approvedUsers: "승인된 사용자",
    deletedUsers: "삭제된 사용자",
    pendingUsersShort: "대기",
    approvedUsersShort: "승인",
    deletedUsersShort: "삭제",
    noPendingUsers: "승인 대기 중인 사용자가 없습니다.",
    noApprovedUsers: "승인된 사용자가 없습니다.",
    noDeletedUsers: "삭제된 사용자가 없습니다.",
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
    approvedDate: "승인일",
    deletedDate: "삭제일",
    blogUrl: "블로그 주소",
    copy: "복사",
    copied: "복사됨",
    searchByName: "사용자명",
    searchByUrlId: "블로그 ID",
    searchByEmail: "이메일",
    searchByDate: "가입일",
    searchPlaceholderName: "사용자명을 입력하세요",
    searchPlaceholderUrlId: "블로그 ID를 입력하세요",
    searchPlaceholderEmail: "이메일을 입력하세요",
    searchPlaceholderDate: "YYYY-MM-DD 형식으로 입력하세요",
    clearSearch: "초기화",
    searchResults: "검색 결과",
    searchResultsCount: "검색 결과: {count}건",
    dateFrom: "From:",
    dateTo: "To:",
    search: "검색",
    searching: "검색 중...",
  },
  en: {
    adminPage: "Admin Page",
    home: "Home",
    stats: "Statistics",
    pendingUsers: "Pending",
    approvedUsers: "Approved",
    deletedUsers: "Deleted",
    pendingUsersShort: "Pending",
    approvedUsersShort: "Approved",
    deletedUsersShort: "Deleted",
    noPendingUsers: "No pending users.",
    noApprovedUsers: "No approved users.",
    noDeletedUsers: "No deleted users.",
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
    approvedDate: "Approved Date",
    deletedDate: "Deleted Date",
    blogUrl: "Blog URL",
    copy: "Copy",
    copied: "Copied",
    searchByName: "Name",
    searchByUrlId: "URL ID",
    searchByEmail: "Email",
    searchByDate: "Join Date",
    searchPlaceholderName: "Enter name",
    searchPlaceholderUrlId: "Enter URL ID",
    searchPlaceholderEmail: "Enter email",
    searchPlaceholderDate: "YYYY-MM-DD format",
    clearSearch: "Clear",
    searchResults: "Search Results",
    searchResultsCount: "Search results: {count} items",
    dateFrom: "From:",
    dateTo: "To:",
    search: "Search",
    searching: "Searching...",
  }
}

export default function AdminPage() {
  const { lang } = useContext(LanguageContext)
  const { data: session, status } = useSession() as { data: (Session & { user: { role?: string } }) | null, status: string }
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchField, setSearchField] = useState<'name' | 'urlId' | 'email' | 'date'>('name')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchApplied, setSearchApplied] = useState<boolean>(false)
  const [displayCounts, setDisplayCounts] = useState({
    pending: 30,
    approved: 30,
    deleted: 30
  })

  // 환경에 따른 블로그 URL 설정
  const getBlogUrl = (urlId: string) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://royalkim.com' 
      : 'http://localhost:3000'
    return `${baseUrl}/${urlId}`
  }

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

  const copyToClipboard = async (urlId: string, userId: string) => {
    const blogUrl = getBlogUrl(urlId)
    try {
      await navigator.clipboard.writeText(blogUrl)
      setCopiedUserId(userId)
      setTimeout(() => setCopiedUserId(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // 검색 필터링 함수
  const filterUsers = (userList: User[]) => {
    // 검색이 적용되지 않은 경우 전체 목록 반환
    if (!searchApplied) return userList

    if (searchField === 'date') {
      // 날짜 범위 검색
      if (!dateFrom && !dateTo) return userList
      
      return userList.filter(user => {
        const userDate = new Date(user.createdAt).toISOString().split('T')[0]
        
        if (dateFrom && dateTo) {
          return userDate >= dateFrom && userDate <= dateTo
        } else if (dateFrom) {
          return userDate >= dateFrom
        } else if (dateTo) {
          return userDate <= dateTo
        }
        return true
      })
    }
    
    // 일반 텍스트 검색
    if (!searchTerm.trim()) return userList

    return userList.filter(user => {
      const term = searchTerm.toLowerCase().trim()
      
      switch (searchField) {
        case 'name':
          return user.name?.toLowerCase().includes(term) || false
        case 'urlId':
          return user.urlId?.toLowerCase().includes(term) || false
        case 'email':
          return user.email?.toLowerCase().includes(term) || false
        default:
          return true
      }
    })
  }

  // 검색어 초기화 함수
  const clearSearch = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setSearchField('name')
    setSearchApplied(false)
  }

  // 검색 실행 함수
  const executeSearch = () => {
    setIsSearching(true)
    // 검색 실행을 위한 짧은 지연 (UI 반응성 향상)
    setTimeout(() => {
      setSearchApplied(true)
      setIsSearching(false)
    }, 100)
  }

  // 검색 조건 변경 시 검색 상태 초기화
  const handleSearchFieldChange = (field: 'name' | 'urlId' | 'email' | 'date') => {
    setSearchField(field)
    setSearchApplied(false)
  }

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term)
    setSearchApplied(false)
  }

  const handleDateFromChange = (date: string) => {
    setDateFrom(date)
    setSearchApplied(false)
  }

  const handleDateToChange = (date: string) => {
    setDateTo(date)
    setSearchApplied(false)
  }

  const handleLoadMore = () => {
    setDisplayCounts(prev => ({
      ...prev,
      [activeTab]: prev[activeTab] + 10
    }))
  }

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId)
    // 탭 변경 시 해당 탭의 표시 개수를 30으로 초기화
    setDisplayCounts(prev => ({
      ...prev,
      [tabId]: 30
    }))
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

  // 검색 필터링된 사용자 목록
  const filteredDeletedUsers = filterUsers(deletedUsers)
  const filteredPendingUsers = filterUsers(pendingUsers)
  const filteredApprovedUsers = filterUsers(approvedUsers)

  const tabs = [
    { id: 'pending' as TabType, label: I18N[lang].pendingUsers, shortLabel: I18N[lang].pendingUsersShort, count: filteredPendingUsers.length },
    { id: 'approved' as TabType, label: I18N[lang].approvedUsers, shortLabel: I18N[lang].approvedUsersShort, count: filteredApprovedUsers.length },
    { id: 'deleted' as TabType, label: I18N[lang].deletedUsers, shortLabel: I18N[lang].deletedUsersShort, count: filteredDeletedUsers.length },
  ]

  const renderUserTable = (userList: User[], showApprovedDate = false, showDeletedDate = false) => {
    const currentDisplayCount = displayCounts[activeTab]
    const displayedUsers = userList.slice(0, currentDisplayCount)
    const hasMore = userList.length > currentDisplayCount

    return (
      <>
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 w-16">{I18N[lang].id}</th>
                <th className="px-2 py-1 w-20">{I18N[lang].name}</th>
                <th className="px-2 py-1 w-32">{I18N[lang].email}</th>
                <th className="px-2 py-1 w-16">{I18N[lang].role}</th>
                <th className="px-2 py-1 w-24">{I18N[lang].joinDate}</th>
                <th className="px-2 py-1 w-48">{I18N[lang].blogUrl}</th>
                {showApprovedDate && <th className="px-2 py-1 w-24">{I18N[lang].approvedDate}</th>}
                {showDeletedDate && <th className="px-2 py-1 w-24">{I18N[lang].deletedDate}</th>}
                <th className="px-2 py-1 w-20">{I18N[lang].actions}</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user.id} className={user.deletedAt ? 'bg-red-50' : ''}>
                  <td className="px-2 py-1 break-all">{user.id}</td>
                  <td className="px-2 py-1">{user.name}</td>
                  <td className="px-2 py-1 break-all">{user.email}</td>
                  <td className="px-2 py-1">{user.role}</td>
                  <td className="px-2 py-1">{formatDate(user.createdAt)}</td>
                  <td className="px-2 py-1">
                    {user.urlId ? (
                      <div className="flex items-center gap-1">
                        <a 
                          href={getBlogUrl(user.urlId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-pink-600 font-mono truncate hover:text-pink-800 hover:underline"
                        >
                          {getBlogUrl(user.urlId)}
                        </a>
                        <button
                          onClick={() => copyToClipboard(user.urlId!, user.id)}
                          className="px-1 py-0.5 text-xs bg-pink-500 hover:bg-pink-600 text-white rounded transition-colors duration-200 flex-shrink-0"
                        >
                          {copiedUserId === user.id ? I18N[lang].copied : I18N[lang].copy}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  {showApprovedDate && (
                    <td className="px-2 py-1">{user.approvedAt ? formatDate(user.approvedAt) : '-'}</td>
                  )}
                  {showDeletedDate && (
                    <td className="px-2 py-1">{user.deletedAt ? formatDate(user.deletedAt) : '-'}</td>
                  )}
                  <td className="px-2 py-1 flex gap-1 items-center justify-center h-12">
                    {user.role === "PENDING" && !user.deletedAt && (
                      <>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="px-1.5 py-0.5 text-xs font-medium text-white bg-pink-600 rounded hover:bg-pink-700 flex-shrink-0"
                        >
                          {I18N[lang].approve}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-1.5 py-0.5 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 flex-shrink-0"
                        >
                          {I18N[lang].delete}
                        </button>
                      </>
                    )}
                    {user.role === "USER" && !user.deletedAt && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-1.5 py-0.5 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 flex-shrink-0"
                      >
                        {I18N[lang].delete}
                      </button>
                    )}
                    {user.deletedAt && (
                      <button
                        onClick={() => handleRestore(user.id)}
                        className="px-1.5 py-0.5 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 flex-shrink-0"
                      >
                        {I18N[lang].restore}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden flex flex-col gap-3">
          {displayedUsers.map((user) => (
            <div key={user.id} className={`border rounded-lg p-4 flex flex-col gap-2 ${user.deletedAt ? 'bg-red-50' : user.role === 'PENDING' ? 'bg-pink-50' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-500">{I18N[lang].id}: <span className="break-all">{user.id}</span></div>
              <div className="font-semibold text-sm">{user.name} <span className="ml-2 text-xs text-gray-400">({user.role})</span></div>
              <div className="text-xs text-gray-500">{I18N[lang].email}: <span className="break-all">{user.email}</span></div>
              <div className="text-xs text-gray-500">{I18N[lang].joinDate}: {formatDateMobile(user.createdAt)}</div>
              <div className="text-xs text-gray-500">
                {I18N[lang].blogUrl}: 
                {user.urlId ? (
                  <div className="flex items-center gap-2 mt-1">
                    <a 
                      href={getBlogUrl(user.urlId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 font-mono truncate hover:text-pink-800 hover:underline flex-1"
                    >
                      {getBlogUrl(user.urlId)}
                    </a>
                    <button
                      onClick={() => copyToClipboard(user.urlId!, user.id)}
                      className="px-3 py-1.5 text-xs bg-pink-500 hover:bg-pink-600 text-white rounded transition-colors duration-200 flex-shrink-0"
                    >
                      {copiedUserId === user.id ? I18N[lang].copied : I18N[lang].copy}
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
              {showApprovedDate && (
                <div className="text-xs text-gray-500">{I18N[lang].approvedDate}: {user.approvedAt ? formatDateMobile(user.approvedAt) : '-'}</div>
              )}
              {showDeletedDate && (
                <div className="text-xs text-gray-500">{I18N[lang].deletedDate}: {user.deletedAt ? formatDateMobile(user.deletedAt) : '-'}</div>
              )}
              <div className="flex gap-2 mt-2">
                {user.role === "PENDING" && !user.deletedAt && (
                  <>
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors"
                    >
                      {I18N[lang].approve}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                    >
                      {I18N[lang].delete}
                    </button>
                  </>
                )}
                {user.role === "USER" && !user.deletedAt && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                  >
                    {I18N[lang].delete}
                  </button>
                )}
                {user.deletedAt && (
                  <button
                    onClick={() => handleRestore(user.id)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    {I18N[lang].restore}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors"
            >
              더보기 ({currentDisplayCount}/{userList.length})
            </button>
          </div>
        )}
      </>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pending':
        return filteredPendingUsers.length === 0 ? (
          <p className="text-gray-500">{I18N[lang].noPendingUsers}</p>
        ) : renderUserTable(filteredPendingUsers)
      case 'approved':
        return filteredApprovedUsers.length === 0 ? (
          <p className="text-gray-500">{I18N[lang].noApprovedUsers}</p>
        ) : renderUserTable(filteredApprovedUsers, true)
      case 'deleted':
        return filteredDeletedUsers.length === 0 ? (
          <p className="text-gray-400">{I18N[lang].noDeletedUsers}</p>
        ) : renderUserTable(filteredDeletedUsers, false, true)
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">{I18N[lang].adminPage}</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/stats"
              className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-pink-600 rounded-md hover:bg-pink-700"
            >
              {I18N[lang].stats}
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {I18N[lang].home}
            </Link>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-8">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 px-2 sm:px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 검색 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={searchField}
                onChange={(e) => handleSearchFieldChange(e.target.value as 'name' | 'urlId' | 'email' | 'date')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white bg-no-repeat bg-right pr-8 flex-shrink-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="name">{I18N[lang].searchByName}</option>
                <option value="urlId">{I18N[lang].searchByUrlId}</option>
                <option value="email">{I18N[lang].searchByEmail}</option>
                <option value="date">{I18N[lang].searchByDate}</option>
              </select>
              
              {searchField === 'date' ? (
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{I18N[lang].dateFrom}</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => handleDateFromChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{I18N[lang].dateTo}</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => handleDateToChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent flex-1"
                    />
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  placeholder={
                    searchField === 'name' ? I18N[lang].searchPlaceholderName :
                    searchField === 'urlId' ? I18N[lang].searchPlaceholderUrlId :
                    I18N[lang].searchPlaceholderEmail
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={executeSearch}
                disabled={isSearching}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-pink-400 transition-colors flex-1 sm:flex-none"
              >
                {isSearching ? I18N[lang].searching : I18N[lang].search}
              </button>
              <button
                onClick={clearSearch}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex-1 sm:flex-none"
              >
                {I18N[lang].clearSearch}
              </button>
            </div>
          </div>
          
          {searchApplied && (searchTerm || dateFrom || dateTo) && (
            <div className="mt-3 text-sm text-gray-600">
              {I18N[lang].searchResultsCount.replace('{count}', tabs.find(tab => tab.id === activeTab)?.count.toString() || '0')}
            </div>
          )}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          {renderTabContent()}
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

function formatDateMobile(dateStr: string) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
} 
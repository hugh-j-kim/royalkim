"use client"

import Link from "next/link"

export default function PostActions({ postId, canEdit }: { postId: string, canEdit: boolean }) {
  if (!canEdit) return null
  return (
    <div className="flex flex-row justify-center items-center gap-2 w-full max-w-xs mx-auto mt-4 mb-6">
      <Link
        href={`/posts/${postId}/edit`}
        className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
      >
        수정하기
      </Link>
      <button
        onClick={async () => {
          if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
            if (res.ok) {
              window.location.href = '/'
            } else {
              alert('글 삭제에 실패했습니다.')
            }
          }
        }}
        className="w-auto px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ml-2"
      >
        삭제하기
      </button>
    </div>
  )
} 
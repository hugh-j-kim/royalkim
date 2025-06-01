"use client"

import Link from "next/link"
import { useContext } from "react"
import { LanguageContext } from "@/components/Providers"

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    edit: "수정하기",
    delete: "삭제하기",
    deleteConfirm: "정말로 이 글을 삭제하시겠습니까?",
    deleteError: "글 삭제에 실패했습니다.",
  },
  en: {
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this post?",
    deleteError: "Failed to delete post.",
  }
}

export default function PostActions({ postId, canEdit }: { postId: string, canEdit: boolean }) {
  const { lang } = useContext(LanguageContext)
  
  if (!canEdit) return null
  return (
    <div className="flex flex-row justify-center items-center gap-2 w-full max-w-xs mx-auto mt-4 mb-6">
      <Link
        href={`/posts/${postId}/edit`}
        className="w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
      >
        {I18N[lang].edit}
      </Link>
      <button
        onClick={async () => {
          if (confirm(I18N[lang].deleteConfirm)) {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
            if (res.ok) {
              window.location.href = '/'
            } else {
              alert(I18N[lang].deleteError)
            }
          }
        }}
        className="w-auto px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ml-2"
      >
        {I18N[lang].delete}
      </button>
    </div>
  )
} 
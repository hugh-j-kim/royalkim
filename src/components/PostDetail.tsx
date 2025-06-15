import { useState, useContext } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LanguageContext } from "@/contexts/LanguageContext"
import { I18N } from "@/i18n"

interface Post {
  id: string
  title: string
  description: string | null
  content: string
  createdAt: string
  updatedAt: string
  viewCount: number
  user: {
    name: string | null
  }
  category?: {
    name: string
  } | null
}

interface PostDetailProps {
  post: Post
  onDelete?: (postId: string) => void
}

export function PostDetail({ post, onDelete }: PostDetailProps) {
  const { lang } = useContext(LanguageContext)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      if (onDelete) {
        onDelete(post.id)
      }
      router.push("/posts")
    } catch (error) {
      console.error("Error deleting post:", error)
      alert(I18N[lang].deleteError)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="mr-4">{post.user.name}</span>
          <span className="mr-4">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          {post.updatedAt !== post.createdAt && (
            <span className="mr-4">
              {I18N[lang].updatedAt}: {new Date(post.updatedAt).toLocaleDateString()}
            </span>
          )}
          <span>{I18N[lang].viewCount}: {post.viewCount}</span>
        </div>
        {post.category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {post.category.name}
            </span>
          </div>
        )}
        {post.description && (
          <p className="text-lg text-gray-700 mb-8">{post.description}</p>
        )}
          <div 
            className="font-helvetica text-base"
            style={{
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontSize: '16px',
            }}
            dangerouslySetInnerHTML={{ 
              __html: post.content
                .replace(/<div class="youtube-container">[\s\S]*?<\/div>/g, '')
                .replace(/<iframe[\s\S]*?<\/iframe>/g, (match: string) => {
                  return `${match}`;
                })
            }} 
          />
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <Link
          href={`/posts/${post.id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {I18N[lang].edit}
        </Link>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {I18N[lang].delete}
        </button>
      </div>

      {isDeleting && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {I18N[lang].confirmDelete}
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                {I18N[lang].cancel}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                {I18N[lang].delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
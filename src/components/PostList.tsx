import { useState, useContext } from "react"
import Link from "next/link"
import { LanguageContext } from "@/contexts/LanguageContext"
import { I18N } from "@/i18n"

interface Post {
  id: string
  title: string
  createdAt: string
  viewCount: number
  user: {
    name: string | null
  }
}

interface PostListProps {
  posts: Post[]
  onDelete?: (postId: string) => void
}

export function PostList({ posts, onDelete }: PostListProps) {
  const { lang } = useContext(LanguageContext)
  const [isDeleting, setIsDeleting] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  const handleDelete = async (postId: string) => {
    setPostToDelete(postId)
    setIsDeleting(true)
  }

  const confirmDelete = async () => {
    if (!postToDelete) return

    try {
      const response = await fetch(`/api/posts/${postToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      if (onDelete) {
        onDelete(postToDelete)
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert(I18N[lang].deleteError)
    } finally {
      setIsDeleting(false)
      setPostToDelete(null)
    }
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {I18N[lang].title}
              </th>
              <th scope="col" className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {I18N[lang].author}
              </th>
              <th scope="col" className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {I18N[lang].createdAt}
              </th>
              <th scope="col" className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {I18N[lang].viewCount}
              </th>
              <th scope="col" className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {I18N[lang].actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    <Link href={`/posts/${post.id}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{post.user.name}</div>
                </td>
                <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{post.viewCount}</div>
                </td>
                <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {I18N[lang].edit}
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {I18N[lang].delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDeleting && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {I18N[lang].confirmDelete}
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsDeleting(false)
                  setPostToDelete(null)
                }}
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
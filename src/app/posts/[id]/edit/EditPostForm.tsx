'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PostEditor } from "@/components/PostEditor"
import { Post } from "@prisma/client"

interface Props {
  post: Post & {
    user: {
      email: string
    }
    category: {
      id: string
      name: string
    } | null
    tags: {
      id: string
      name: string
    }[]
  }
}

export default function EditPostForm({ post }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update post')
      }

      router.push(`/posts/${post.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
          <PostEditor
            post={post}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
} 
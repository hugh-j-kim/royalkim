"use client"

import { useState, useContext, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Session } from "next-auth"
import { LanguageContext } from "@/components/Providers"

interface Category {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  parentId: string | null
}

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    editCategory: "카테고리 수정",
    home: "홈으로",
    categoryName: "카테고리 이름",
    description: "설명",
    parentCategory: "상위 카테고리",
    noParentCategory: "상위 카테고리 없음",
    isPublic: "공개 카테고리",
    update: "수정하기",
    updating: "수정 중...",
    updateError: "카테고리 수정에 실패했습니다.",
    loading: "로딩 중...",
    notFound: "카테고리를 찾을 수 없습니다.",
  },
  en: {
    editCategory: "Edit Category",
    home: "Home",
    categoryName: "Category Name",
    description: "Description",
    parentCategory: "Parent Category",
    noParentCategory: "No Parent Category",
    isPublic: "Public Category",
    update: "Update",
    updating: "Updating...",
    updateError: "Failed to update category.",
    loading: "Loading...",
    notFound: "Category not found.",
  }
}

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const { lang } = useContext(LanguageContext)
  const { data: session, status } = useSession() as { data: (Session & { user: { role?: string } }) | null, status: string }
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [parentId, setParentId] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${params.id}`)
        if (!response.ok) {
          throw new Error(I18N[lang].notFound)
        }
        const category = await response.json()
        setName(category.name)
        setDescription(category.description || "")
        setParentId(category.parentId || "")
        setIsPublic(category.isPublic)
      } catch (error) {
        setError(error instanceof Error ? error.message : I18N[lang].notFound)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        const data = await response.json()
        setCategories(data.filter((c: Category) => c.id !== params.id))
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchCategory()
      fetchCategories()
    }
  }, [session, params.id, lang])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-500">{I18N[lang].loading}</div>
      </div>
    )
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    router.push("/")
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/categories/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          parentId: parentId || null,
          isPublic,
        }),
      })

      if (!response.ok) {
        throw new Error(I18N[lang].updateError)
      }

      router.push("/admin/categories")
    } catch (error) {
      console.error("Error updating category:", error)
      alert(error instanceof Error ? error.message : I18N[lang].updateError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">{I18N[lang].editCategory}</h1>
          <Link
            href="/admin/categories"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {I18N[lang].home}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {I18N[lang].categoryName}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {I18N[lang].description}
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                {I18N[lang].parentCategory}
              </label>
              <select
                id="parentId"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              >
                <option value="">{I18N[lang].noParentCategory}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                {I18N[lang].isPublic}
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-500 border border-transparent rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? I18N[lang].updating : I18N[lang].update}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
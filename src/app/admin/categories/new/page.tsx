"use client"

import { useState, useContext } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Session } from "next-auth"
import { LanguageContext } from "@/components/Providers"
import { useCategories } from "@/hooks/useCategories"

interface Category {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  parentId: string | null
  children?: Category[]
}

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    newCategory: "새 카테고리",
    home: "홈으로",
    categoryName: "카테고리 이름",
    description: "설명",
    parentCategory: "상위 카테고리",
    noParentCategory: "상위 카테고리 없음",
    isPublic: "공개 카테고리",
    create: "생성하기",
    creating: "생성 중...",
    createError: "카테고리 생성에 실패했습니다.",
    loading: "로딩 중...",
    back: "뒤로가기",
  },
  en: {
    newCategory: "New Category",
    home: "Home",
    categoryName: "Category Name",
    description: "Description",
    parentCategory: "Parent Category",
    noParentCategory: "No Parent Category",
    isPublic: "Public Category",
    create: "Create",
    creating: "Creating...",
    createError: "Failed to create category.",
    loading: "Loading...",
    back: "Back",
  }
}

function flattenCategories(categories: Category[], level = 0): { id: string, name: string }[] {
  return categories.flatMap(category => [
    { id: category.id, name: `${'— '.repeat(level)}${category.name}` },
    ...(category.children ? flattenCategories(category.children, level + 1) : [])
  ])
}

export default function NewCategoryPage() {
  const { lang } = useContext(LanguageContext)
  const { status } = useSession() as { data: (Session & { user: { role?: string } }) | null, status: string }
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [parentId, setParentId] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { categories, isLoading, error, createCategory } = useCategories()

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-pink-500">{I18N[lang].loading}</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
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
      await createCategory({
        name,
        description,
        parentId: parentId || undefined,
        isPublic,
      })
      router.push("/admin/categories")
    } catch (error) {
      console.error("Error creating category:", error)
      alert(error instanceof Error ? error.message : I18N[lang].createError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">{I18N[lang].newCategory}</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/categories"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {I18N[lang].back}
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                {flattenCategories(categories).map((category) => (
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
                {isSubmitting ? I18N[lang].creating : I18N[lang].create}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
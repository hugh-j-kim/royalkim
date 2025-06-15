"use client"

import { useEffect, useState, useContext } from "react"
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
  _aggr_count_posts: number
  _aggr_count_subcategories: number
  children: Category[]
}

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    categories: "카테고리 관리",
    home: "홈으로",
    newCategory: "새 카테고리",
    categoryName: "카테고리 이름",
    description: "설명",
    parentCategory: "상위 카테고리",
    noParentCategory: "상위 카테고리 없음",
    isPublic: "공개",
    isPrivate: "비공개",
    edit: "수정",
    delete: "삭제",
    deleteConfirm: "정말로 이 카테고리를 삭제하시겠습니까?",
    deleteError: "카테고리 삭제에 실패했습니다.",
    deleteSuccess: "카테고리가 삭제되었습니다.",
    loading: "로딩 중...",
    noCategories: "카테고리가 없습니다.",
    posts: "글",
    subcategories: "하위 카테고리",
    cannotDelete: "삭제할 수 없음",
    hasPosts: "글을 포함하고 있어 삭제할 수 없습니다.",
    hasSubcategories: "하위 카테고리를 포함하고 있어 삭제할 수 없습니다.",
  },
  en: {
    categories: "Category Management",
    home: "Home",
    newCategory: "New Category",
    categoryName: "Category Name",
    description: "Description",
    parentCategory: "Parent Category",
    noParentCategory: "No Parent Category",
    isPublic: "Public",
    isPrivate: "Private",
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this category?",
    deleteError: "Failed to delete category.",
    deleteSuccess: "Category has been deleted.",
    loading: "Loading...",
    noCategories: "No categories found.",
    posts: "Posts",
    subcategories: "Subcategories",
    cannotDelete: "Cannot Delete",
    hasPosts: "Cannot delete category with posts.",
    hasSubcategories: "Cannot delete category with subcategories.",
  }
}

export default function CategoriesPage() {
  const { lang } = useContext(LanguageContext)
  const { data: session, status } = useSession() as { data: (Session & { user: { role?: string } }) | null, status: string }
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchCategories()
    }
  }, [session])

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

  const handleDelete = async (id: string) => {
    if (!window.confirm(I18N[lang].deleteConfirm)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || I18N[lang].deleteError)
      }

      setCategories(categories.filter(category => category.id !== id))
      alert(I18N[lang].deleteSuccess)
    } catch (error) {
      console.error("Error deleting category:", error)
      alert(error instanceof Error ? error.message : I18N[lang].deleteError)
    }
  }

  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return I18N[lang].noParentCategory
    const parent = categories.find(c => c.id === parentId)
    return parent ? parent.name : I18N[lang].noParentCategory
  }

  const CategoryRow = ({ category, level = 0 }: { category: Category; level?: number }) => {
    return (
      <>
        <tr key={category.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{ paddingLeft: `${level * 2 + 1.5}rem` }}>
            {category.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {category.description || "-"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {getParentCategoryName(category.parentId)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {category._aggr_count_posts}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {category._aggr_count_subcategories}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {category.isPublic ? I18N[lang].isPublic : I18N[lang].isPrivate}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex justify-end gap-2">
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="text-pink-600 hover:text-pink-900"
              >
                {I18N[lang].edit}
              </Link>
              {category._aggr_count_posts > 0 || category._aggr_count_subcategories > 0 ? (
                <span
                  className="text-gray-400 cursor-not-allowed"
                  title={
                    category._aggr_count_posts > 0
                      ? I18N[lang].hasPosts
                      : I18N[lang].hasSubcategories
                  }
                >
                  {I18N[lang].delete}
                </span>
              ) : (
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  {I18N[lang].delete}
                </button>
              )}
            </div>
          </td>
        </tr>
        {category.children && category.children.length > 0 && (
          category.children.map((child) => (
            <CategoryRow key={child.id} category={child} level={level + 1} />
          ))
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">{I18N[lang].categories}</h1>
          <div className="flex gap-2">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {I18N[lang].home}
            </Link>
            <Link
              href="/admin/categories/new"
              className="px-4 py-2 text-sm font-medium text-white bg-pink-500 border border-transparent rounded-md hover:bg-pink-600"
            >
              {I18N[lang].newCategory}
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-4 text-center text-gray-500">{I18N[lang].noCategories}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {I18N[lang].categoryName}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {I18N[lang].description}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {I18N[lang].parentCategory}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {I18N[lang].posts}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {I18N[lang].subcategories}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {I18N[lang].isPublic}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <CategoryRow key={category.id} category={category} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
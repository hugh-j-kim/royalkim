"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface Category {
  id: string
  name: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategoryId: string
}

export default function CategoryFilter({ categories, selectedCategoryId }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (categoryId) {
      params.set('categoryId', categoryId)
    } else {
      params.delete('categoryId')
    }
    
    // 검색 파라미터 유지
    const search = searchParams.get('search')
    const searchField = searchParams.get('searchField')
    
    if (search) params.set('search', search)
    if (searchField) params.set('searchField', searchField)
    
    // 페이지네이션 리셋
    params.delete('offset')
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="w-full sm:w-64">
      <select
        value={selectedCategoryId}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
      >
        <option value="">모든 카테고리</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
} 
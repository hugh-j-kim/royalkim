"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { ChevronDown, Check } from "lucide-react"

interface Category {
  id: string
  name: string
  children?: Category[]
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategoryId: string
  selectedCategoryIds?: string[]
  multiple?: boolean
}

export default function CategoryFilter({ 
  categories, 
  selectedCategoryId, 
  selectedCategoryIds = [], 
  multiple = false 
}: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedCategoryIds)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalSelectedIds(selectedCategoryIds)
  }, [selectedCategoryIds])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 모든 카테고리 ID를 재귀적으로 수집하는 함수
  const getAllCategoryIds = (cats: Category[]): string[] => {
    const ids: string[] = []
    cats.forEach(cat => {
      ids.push(cat.id)
      if (cat.children && cat.children.length > 0) {
        ids.push(...getAllCategoryIds(cat.children))
      }
    })
    return ids
  }

  // 전체 카테고리 ID 목록
  const allCategoryIds = getAllCategoryIds(categories)

  // 전체 선택 여부 확인
  const isAllSelected = allCategoryIds.length > 0 && allCategoryIds.every(id => localSelectedIds.includes(id))

  // 부분 선택 여부 확인 (일부만 선택된 경우)
  const isPartiallySelected = allCategoryIds.length > 0 && 
    allCategoryIds.some(id => localSelectedIds.includes(id)) && 
    !allCategoryIds.every(id => localSelectedIds.includes(id))

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

  const handleMultipleCategoryChange = (categoryIds: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (categoryIds.length > 0) {
      params.set('categoryIds', categoryIds.join(','))
    } else {
      params.delete('categoryIds')
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

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = localSelectedIds.includes(categoryId)
      ? localSelectedIds.filter(id => id !== categoryId)
      : [...localSelectedIds, categoryId]
    
    setLocalSelectedIds(newSelected)
    handleMultipleCategoryChange(newSelected)
  }

  // 전체 선택/해제 처리
  const handleSelectAll = () => {
    if (isAllSelected) {
      // 전체 해제
      setLocalSelectedIds([])
      handleMultipleCategoryChange([])
    } else {
      // 전체 선택
      setLocalSelectedIds(allCategoryIds)
      handleMultipleCategoryChange(allCategoryIds)
    }
  }

  const getDisplayText = () => {
    if (multiple) {
      if (localSelectedIds.length === 0) {
        return "모든 카테고리"
      }
      
      const selectedNames = localSelectedIds.map(id => {
        const findCategory = (cats: Category[]): string | null => {
          for (const cat of cats) {
            if (cat.id === id) return cat.name
            if (cat.children) {
              const found = findCategory(cat.children)
              if (found) return found
            }
          }
          return null
        }
        return findCategory(categories) || id
      })

      if (selectedNames.length === 1) {
        return selectedNames[0]
      }
      return `${selectedNames.length}개 카테고리 선택됨`
    } else {
      if (selectedCategoryId) {
        const findCategory = (cats: Category[]): string | null => {
          for (const cat of cats) {
            if (cat.id === selectedCategoryId) return cat.name
            if (cat.children) {
              const found = findCategory(cat.children)
              if (found) return found
            }
          }
          return null
        }
        return findCategory(categories) || selectedCategoryId
      }
      return "모든 카테고리"
    }
  }

  const renderCategoryOptions = (categories: Category[], level = 0): React.ReactNode[] => {
    return categories.map((category) => (
      <div key={category.id}>
        <label 
          className={`flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
            level > 0 ? 'ml-4' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation()
            handleCategoryToggle(category.id)
          }}
        >
          <input
            type="checkbox"
            checked={localSelectedIds.includes(category.id)}
            onChange={() => handleCategoryToggle(category.id)}
            className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="flex-1">{category.name}</span>
          {localSelectedIds.includes(category.id) && (
            <Check className="h-4 w-4 text-pink-600" />
          )}
        </label>
        {category.children && category.children.length > 0 && (
          <div className="ml-4">
            {renderCategoryOptions(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  if (multiple) {
    return (
      <div className="w-full relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 필터 (여러 개 선택 가능)
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 flex items-center justify-between"
          >
            <span className={`${localSelectedIds.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
              {getDisplayText()}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="py-1">
                {categories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    카테고리가 없습니다.
                  </div>
                ) : (
                  <>
                    {/* 전체 선택 옵션 */}
                    <label 
                      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium border-b border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectAll()
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) {
                            input.indeterminate = isPartiallySelected
                          }
                        }}
                        onChange={() => handleSelectAll()}
                        className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="flex-1">전체</span>
                      {isAllSelected && (
                        <Check className="h-4 w-4 text-pink-600" />
                      )}
                    </label>
                    {/* 카테고리 목록 */}
                    {renderCategoryOptions(categories)}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {localSelectedIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {localSelectedIds.map((categoryId) => {
              const findCategory = (cats: Category[]): Category | null => {
                for (const cat of cats) {
                  if (cat.id === categoryId) return cat
                  if (cat.children) {
                    const found = findCategory(cat.children)
                    if (found) return found
                  }
                }
                return null
              }
              const category = findCategory(categories)
              if (!category) return null
              
              return (
                <span
                  key={categoryId}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                >
                  {category.name}
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(categoryId)}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-pink-400 hover:bg-pink-200 hover:text-pink-500 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        카테고리 필터
      </label>
      <select
        value={selectedCategoryId}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 select-arrow"
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
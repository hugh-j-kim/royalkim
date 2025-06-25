import { useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/Providers";

interface Category {
  id: string;
  name: string;
  description?: string;
  children?: Category[];
}

interface CategorySelectProps {
  value?: string | string[]; // 단일 값 또는 배열 값 모두 지원
  onChange: (categoryId: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean; // 다중 선택 여부
}

export default function CategorySelect({ 
  value, 
  onChange, 
  placeholder, 
  multiple = false 
}: CategorySelectProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchCategories();
    }
  }, [session]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 옵션을 재귀적으로 렌더링하는 함수
  const renderCategoryOptions = (categories: Category[], level = 0): ReactNode[] => {
    return categories.map((category) => (
      <>
        <option key={category.id} value={category.id}>
          {'　'.repeat(level)}{category.name}
        </option>
        {category.children && category.children.length > 0 && (
          renderCategoryOptions(category.children, level + 1)
        )}
      </>
    ));
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      // 다중 선택인 경우
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      onChange(selectedOptions);
    } else {
      // 단일 선택인 경우 (기존 방식)
      onChange(e.target.value);
    }
  };

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      return value;
    } else if (!multiple && typeof value === 'string') {
      return value;
    }
    return multiple ? [] : '';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
        {t("category")}
      </label>
      <select
        id="category"
        value={getDisplayValue()}
        onChange={handleChange}
        multiple={multiple}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm select-arrow py-2 px-3"
      >
        {!multiple && <option value="">{placeholder || t("selectCategory")}</option>}
        {renderCategoryOptions(categories)}
      </select>
      {multiple && (
        <p className="mt-1 text-sm text-gray-500">
          Ctrl (Cmd on Mac) + 클릭으로 여러 카테고리를 선택할 수 있습니다.
        </p>
      )}
    </div>
  );
} 
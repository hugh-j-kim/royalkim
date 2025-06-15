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
  value?: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
}

export default function CategorySelect({ value, onChange, placeholder }: CategorySelectProps) {
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
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">{placeholder || t("selectCategory")}</option>
        {renderCategoryOptions(categories)}
      </select>
    </div>
  );
} 
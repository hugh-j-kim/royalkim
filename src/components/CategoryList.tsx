import { useState } from 'react';
import { Category } from '@prisma/client';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';

interface CategoryWithCounts extends Category {
  _aggr_count_posts: number;
  _aggr_count_subcategories: number;
  children: CategoryWithCounts[];
}

interface CategoryListProps {
  categories: CategoryWithCounts[];
  onSelect: (category: CategoryWithCounts) => void;
  selectedCategory?: CategoryWithCounts;
}

const CategoryItem = ({ 
  category, 
  onSelect, 
  selectedCategory,
  level = 0 
}: { 
  category: CategoryWithCounts; 
  onSelect: (category: CategoryWithCounts) => void;
  selectedCategory?: CategoryWithCounts;
  level?: number;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = category._aggr_count_subcategories > 0;
  const isSelected = selectedCategory?.id === category.id;

  return (
    <div>
      <div 
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => onSelect(category)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}
        {isOpen ? (
          <FolderOpen className="w-4 h-4 text-blue-500" />
        ) : (
          <Folder className="w-4 h-4 text-blue-500" />
        )}
        <span className="flex-1">{category.name}</span>
        <span className="text-sm text-gray-500">
          {category._aggr_count_posts} posts
        </span>
      </div>
      {isOpen && hasChildren && (
        <div>
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              onSelect={onSelect}
              selectedCategory={selectedCategory}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategoryList({ categories, onSelect, selectedCategory }: CategoryListProps) {
  // 최상위 카테고리만 필터링
  const rootCategories = categories.filter(category => !category.parentId);

  return (
    <div className="space-y-1">
      {rootCategories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onSelect={onSelect}
          selectedCategory={selectedCategory}
        />
      ))}
    </div>
  );
} 
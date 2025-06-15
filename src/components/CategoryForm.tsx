import { useState } from 'react';
import { Category } from '@prisma/client';

interface CategoryWithCounts extends Category {
  _count: {
    posts: number;
    subcategories: number;
  };
  children?: CategoryWithCounts[];
}

interface CategoryFormProps {
  onSubmit: (data: { name: string; description: string; parentId?: string; isPublic: boolean }) => void;
  categories: CategoryWithCounts[];
  selectedCategory?: CategoryWithCounts;
}

export default function CategoryForm({ onSubmit, categories, selectedCategory }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      parentId: parentId || undefined,
      isPublic
    });
    setName('');
    setDescription('');
    setParentId('');
    setIsPublic(true);
  };

  // 상위 카테고리 선택 옵션 생성
  const renderParentOptions = (categories: CategoryWithCounts[], level = 0) => {
    return categories.map((category) => (
      <option key={category.id} value={category.id} disabled={selectedCategory?.id === category.id}>
        {'　'.repeat(level)}{category.name}
      </option>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          카테고리 이름
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          required
        />
      </div>

      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          상위 카테고리
        </label>
        <select
          id="parentId"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">없음 (최상위 카테고리)</option>
          {renderParentOptions(categories)}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          설명
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          rows={3}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          공개 카테고리
        </label>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        카테고리 생성
      </button>
    </form>
  );
} 
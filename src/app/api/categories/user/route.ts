import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface CategoryWithCounts {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  parentId: string | null;
  _aggr_count_posts: number;
  _aggr_count_subcategories: number;
  children: CategoryWithCounts[];
}

// 카테고리를 트리 구조로 변환하는 함수
function buildCategoryTree(categories: CategoryWithCounts[]): CategoryWithCounts[] {
  // 카테고리 ID를 키로 하는 맵 생성
  const categoryMap = new Map<string, CategoryWithCounts>();
  
  // 모든 카테고리를 맵에 추가
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: []
    });
  });
  
  // 루트 카테고리 배열
  const rootCategories: CategoryWithCounts[] = [];
  
  // 각 카테고리를 부모-자식 관계로 연결
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    
    if (category.parentId) {
      // 부모 카테고리가 있는 경우
      const parentCategory = categoryMap.get(category.parentId);
      if (parentCategory) {
        parentCategory.children.push(categoryWithChildren);
      }
    } else {
      // 루트 카테고리인 경우
      rootCategories.push(categoryWithChildren);
    }
  });
  
  return rootCategories;
}

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 사용자가 존재하는지 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 모든 카테고리를 한 번에 가져옴
    const categories = await prisma.$queryRaw`
      WITH RECURSIVE category_tree AS (
        -- 기본 카테고리 (루트 카테고리)
        SELECT 
          c.*,
          COALESCE(p.post_count, 0) as _aggr_count_posts,
          COALESCE(sc.subcategory_count, 0) as _aggr_count_subcategories,
          0 as level
        FROM "Category" c
        LEFT JOIN (
          SELECT "categoryId", COUNT(*) as post_count
          FROM "Post"
          GROUP BY "categoryId"
        ) p ON c.id = p."categoryId"
        LEFT JOIN (
          SELECT "parentId", COUNT(*) as subcategory_count
          FROM "Category"
          GROUP BY "parentId"
        ) sc ON c.id = sc."parentId"
        WHERE c."userId" = ${userId} AND c."parentId" IS NULL

        UNION ALL

        -- 하위 카테고리
        SELECT 
          c.*,
          COALESCE(p.post_count, 0) as _aggr_count_posts,
          COALESCE(sc.subcategory_count, 0) as _aggr_count_subcategories,
          ct.level + 1
        FROM "Category" c
        INNER JOIN category_tree ct ON c."parentId" = ct.id
        LEFT JOIN (
          SELECT "categoryId", COUNT(*) as post_count
          FROM "Post"
          GROUP BY "categoryId"
        ) p ON c.id = p."categoryId"
        LEFT JOIN (
          SELECT "parentId", COUNT(*) as subcategory_count
          FROM "Category"
          GROUP BY "parentId"
        ) sc ON c.id = sc."parentId"
        WHERE c."userId" = ${userId}
      )
      SELECT * FROM category_tree
      ORDER BY level, name ASC
    `;

    // BigInt를 Number로 변환
    const categoriesWithNumbers = (categories as any[]).map(category => ({
      ...category,
      _aggr_count_posts: Number(category._aggr_count_posts),
      _aggr_count_subcategories: Number(category._aggr_count_subcategories)
    }));

    // 카테고리를 트리 구조로 변환
    const categoryTree = buildCategoryTree(categoriesWithNumbers as CategoryWithCounts[]);

    return NextResponse.json(categoryTree);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
} 
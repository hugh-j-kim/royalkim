import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // offset/limit 파라미터
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // 검색/카테고리 파라미터
    const search = searchParams.get("search")?.trim() || ""
    const searchField = searchParams.get("searchField") || "title"
    const categoryId = searchParams.get("categoryId") || ""
    const categoryIds = searchParams.get("categoryIds") || ""

    // where 조건 생성
    const where: any = {
      userId: session.user.id,
      published: true,
    }
    if (search) {
      if (searchField === "content") {
        where.content = { contains: search, mode: "insensitive" }
      } else {
        where.title = { contains: search, mode: "insensitive" }
      }
    }
    
    // 카테고리 필터링: categoryIds가 있으면 그것을 우선 사용, 없으면 categoryId 사용
    if (categoryIds) {
      const categoryIdsArray = categoryIds.split(',').map(id => id.trim()).filter(id => id);
      if (categoryIdsArray.length > 0) {
        where.categoryIds = {
          hasSome: categoryIdsArray
        }
      }
    } else if (categoryId) {
      where.OR = [
        { categoryId: categoryId },
        { categoryIds: { has: categoryId } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          Category: true,
          Series: true,
          Tag: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where,
      }),
    ])

    return NextResponse.json({
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, description, content, categoryIds } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const post = await prisma.post.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description,
        content,
        userId: user.id,
        published: true,
        categoryIds: categoryIds || [], // 다중 카테고리만 사용
        updatedAt: new Date()
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            urlId: true,
            image: true
          }
        },
        Category: true,
        Series: true,
        Tag: true
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
} 
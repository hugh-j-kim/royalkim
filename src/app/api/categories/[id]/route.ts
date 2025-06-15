import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import prisma from "@/lib/prisma"

type SessionWithRole = {
  user?: {
    id: string
    email: string
    role: string
  }
} | null

export async function DELETE(
  _unused: unknown,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as SessionWithRole

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!category) {
      return new NextResponse("Category not found", { status: 404 })
    }

    // Check if category has any posts
    const postsCount = await prisma.post.count({
      where: { categoryId: params.id },
    })

    if (postsCount > 0) {
      return new NextResponse("Cannot delete category with posts", { status: 400 })
    }

    // Check if category has any subcategories
    const subcategoriesCount = await prisma.category.count({
      where: { parentId: params.id },
    })

    if (subcategoriesCount > 0) {
      return new NextResponse("Cannot delete category with subcategories", { status: 400 })
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as SessionWithRole

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, description, parentId, isPublic } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!category) {
      return new NextResponse("Category not found", { status: 404 })
    }

    // Check if parent category exists if parentId is provided
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      })

      if (!parentCategory) {
        return new NextResponse("Parent category not found", { status: 404 })
      }

      // Check for circular reference
      if (parentId === params.id) {
        return new NextResponse("Cannot set category as its own parent", { status: 400 })
      }
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        description,
        parentId,
        isPublic,
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("[CATEGORY_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  _unused: unknown,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as SessionWithRole

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!category) {
      return new NextResponse("Category not found", { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("[CATEGORY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 
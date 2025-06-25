import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"

export async function GET(
  _unused: unknown,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { email: true } },
        category: { select: { id: true, name: true } },
        tags: true,
        comments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      } as any,
    })

    if (!post) {
      return new NextResponse("Not found", { status: 404 })
    }

    // 조회수 증가
    await prisma.post.update({
      where: { id: params.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        category: true,
        tags: true,
      } as any,
    })

    if (!post) {
      return new NextResponse("Not found", { status: 404 })
    }

    if ((post.user as any).email !== session.user.email) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await request.json()
    const { title, description, content, categoryIds, published } = body

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        description,
        content,
        categoryIds: categoryIds || [], // 다중 카테고리만 사용
        published,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      } as any,
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating post:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  _unused: unknown,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      } as any,
    })

    if (!post) {
      return new NextResponse("Not found", { status: 404 })
    }

    if ((post.user as any).email !== session.user.email) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await prisma.post.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting post:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 
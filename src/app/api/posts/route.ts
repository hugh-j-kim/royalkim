import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"

export async function GET(_request: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 로그인한 사용자의 글만 조회
    const posts = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
        published: true
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
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

    const { title, description, content } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        blog: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (!user.blog) {
      return NextResponse.json(
        { error: "Blog not found. Please create a blog first." },
        { status: 404 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        description,
        content,
        authorId: user.id,
        blogId: user.blog.id,
        published: true
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        blog: {
          select: {
            title: true,
            customUrl: true,
          },
        },
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
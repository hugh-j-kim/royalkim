import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 조회수 증가와 게시물 조회를 하나의 트랜잭션으로 처리
    const post = await prisma.$transaction(async (tx: any) => {
      // 먼저 게시물을 찾습니다
      const post = await tx.post.findUnique({
        where: {
          id: params.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!post) {
        return null
      }

      // 조회수를 증가시킵니다
      const updatedPost = await tx.post.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // HTML 콘텐츠 정리
      const processContent = (content: string) => {
        // iframe 태그 정리
        let processedContent = content.replace(/<iframe[^>]*src="([^"]*)"[^>]*>.*?<\/iframe>/g, (match: any, src) => {
          const videoId = src.split('/').pop()?.split('?')[0];
          if (videoId) {
            return `<div class="w-full aspect-video my-8"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
          }
          return match;
        });

        // 닫히지 않은 iframe 태그 제거
        processedContent = processedContent.replace(/<iframe[^>]*>/g, '');
        processedContent = processedContent.replace(/<\/iframe>/g, '');

        return processedContent;
      };

      return {
        ...updatedPost,
        content: processContent(updatedPost.content)
      };
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const post = await prisma.post.findUnique({
      where: {
        id: params.id,
      },
      include: {
        author: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (post.author.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    // HTML 콘텐츠 처리
    const processedContent = content
      // YouTube URL을 iframe으로 변환
      .replace(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:shorts\/|embed\/|watch\?v=)|youtu\.be\/)([^"&?\/\s]+)/g,
        (_: string, videoId: string) => {
          return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
      )
      // 이미지 태그 정리
      .replace(/<img[^>]*>/g, (match: any) => {
        const srcMatch = match.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
          return `<img src="${srcMatch[1]}" alt="" class="max-w-full h-auto my-8 mx-auto block" />`;
        }
        return match;
      });

    const updatedPost = await prisma.post.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        content: processedContent,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    )
  }
} 
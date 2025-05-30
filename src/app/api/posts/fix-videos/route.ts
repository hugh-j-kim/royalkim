import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST() {
  try {
    // 모든 게시물 가져오기
    const posts = await prisma.post.findMany()

    // 각 게시물의 동영상 형식 수정
    for (const post of posts) {
      const processedContent = post.content
        .replace(/youtube\.com\/shorts\/([^"&?\/\s]+)/g, 'youtube.com/embed/$1')
        .replace(/youtu\.be\/([^"&?\/\s]+)/g, 'youtube.com/embed/$1')
        .replace(/<video[^>]*>.*?<\/video>/g, (_: string) => {
          const srcMatch = _.match(/src="([^"]+)"/);
          if (srcMatch && srcMatch[1]) {
            const videoId = srcMatch[1].split('/').pop()?.split('?')[0];
            if (videoId) {
              return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="aspect-ratio: 16/9; width: 100%; max-width: 800px; margin: 2rem auto;"></iframe>`;
            }
          }
          return _;
        });

      // 수정된 내용으로 업데이트
      await prisma.post.update({
        where: { id: post.id },
        data: { content: processedContent }
      });
    }

    return NextResponse.json({ message: "Videos fixed successfully" })
  } catch (error) {
    console.error("Error fixing videos:", error)
    return NextResponse.json(
      { error: "Error fixing videos" },
      { status: 500 }
    )
  }
} 
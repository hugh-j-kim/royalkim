import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const urlId = searchParams.get("urlId")?.trim() || ""

  if (!urlId || !/^[a-z0-9]{3,20}$/.test(urlId)) {
    return NextResponse.json({ available: false, error: "유효하지 않은 url id" }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({
    where: { urlId: urlId } as any,
  })

  return NextResponse.json({ available: !existing })
} 
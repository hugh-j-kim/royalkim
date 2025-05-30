import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any)
    
    // 관리자 권한 체크
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 사용자 승인
    // @ts-ignore
    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      // @ts-ignore
      data: {
        role: "USER",
        approvedAt: new Date(),
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error approving user:", error)
    return NextResponse.json(
      { error: "Failed to approve user" },
      { status: 500 }
    )
  }
} 
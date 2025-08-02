import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { reason } = await request.json().catch(() => ({}))
    // soft delete
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    })
    // 삭제 이력 기록
    await prisma.userDeleteLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        email: user.email,
        name: user.name,
        deletedBy: session.user.email || '',
        reason,
        roleAtDelete: user.role
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

// 복구 API (POST /api/admin/users/[id]/restore)
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // 마지막 삭제 이력에서 role을 복구
    const lastDeleteLog = await prisma.userDeleteLog.findFirst({
      where: { userId: params.id },
      orderBy: { deletedAt: "desc" }
    })
    const restoreRole = lastDeleteLog?.roleAtDelete || "USER"
    // soft delete 해제 및 role 복구
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { deletedAt: null, role: restoreRole }
    })
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error restoring user:", error)
    return NextResponse.json({ error: "Failed to restore user" }, { status: 500 })
  }
} 
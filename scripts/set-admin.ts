import prisma from "../src/lib/prisma"

async function setAdmin() {
  try {
    // 가장 최근에 생성된 사용자를 찾아서 관리자로 지정
    const latestUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!latestUser) {
      console.log("사용자를 찾을 수 없습니다.")
      return
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: latestUser.id
      },
      data: {
        role: "ADMIN"
      }
    })

    console.log("관리자로 지정되었습니다:", {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    })
  } catch (error) {
    console.error("오류 발생:", error)
  } finally {
    await prisma.$disconnect()
  }
}

setAdmin() 
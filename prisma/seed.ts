import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 기존 사용자들의 블로그 정보 추가
  const users = await prisma.user.findMany({
    where: {
      blog: null
    }
  })

  for (const user of users) {
    await prisma.blog.create({
      data: {
        title: `${user.name || user.email?.split('@')[0] || 'My'}'s Blog`,
        customUrl: user.email?.split('@')[0] || `user-${user.id}`,
        userId: user.id
      }
    })
  }

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
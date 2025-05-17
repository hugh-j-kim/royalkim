import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('ryOk?Good!81', 10)
  const user = await prisma.user.upsert({
    where: { email: 'fromtoj1@gmail.com' },
    update: {},
    create: {
      name: 'royalkim',
      email: 'fromtoj1@gmail.com',
      password: hashedPassword,
    },
  })

  console.log({ user })

  // Create test posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Test Post 1',
        content: 'This is a test post with a YouTube video: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        published: true,
        authorId: user.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Test Post 2',
        content: 'Another test post with a different YouTube video: https://www.youtube.com/watch?v=jNQXAC9IVRw',
        published: true,
        authorId: user.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Test Post 3',
        content: 'A third test post with yet another YouTube video: https://www.youtube.com/watch?v=9bZkp7q19f0',
        published: true,
        authorId: user.id,
      },
    }),
  ])

  console.log({ posts })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
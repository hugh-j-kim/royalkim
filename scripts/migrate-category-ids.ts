import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCategoryIds() {
  try {
    console.log('Starting category IDs migration...');
    
    // 기존 categoryId가 있지만 categoryIds가 비어있는 포스트들을 찾습니다
    const postsToMigrate = await prisma.post.findMany({
      where: {
        categoryId: {
          not: null
        },
        categoryIds: {
          isEmpty: true
        }
      },
      select: {
        id: true,
        categoryId: true
      }
    });

    console.log(`Found ${postsToMigrate.length} posts to migrate`);

    // 각 포스트의 categoryId를 categoryIds 배열로 이동
    for (const post of postsToMigrate) {
      if (post.categoryId) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            categoryIds: [post.categoryId]
          }
        });
        console.log(`Migrated post ${post.id}: categoryId ${post.categoryId} -> categoryIds [${post.categoryId}]`);
      }
    }

    console.log('Category IDs migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategoryIds(); 
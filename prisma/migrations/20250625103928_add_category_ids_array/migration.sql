-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "categoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

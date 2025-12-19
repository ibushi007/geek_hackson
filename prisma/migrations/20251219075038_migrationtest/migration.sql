-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "tokenExpiry" TIMESTAMP(3);

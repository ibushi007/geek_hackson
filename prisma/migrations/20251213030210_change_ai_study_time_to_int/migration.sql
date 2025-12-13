/*
  Warnings:

  - The `aiStudyTime` column on the `DailyReport` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DailyReport" DROP COLUMN "aiStudyTime",
ADD COLUMN     "aiStudyTime" INTEGER;

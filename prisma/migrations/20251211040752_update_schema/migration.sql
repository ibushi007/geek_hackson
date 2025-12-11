/*
  Warnings:

  - You are about to drop the column `additions` on the `DailyReport` table. All the data in the column will be lost.
  - You are about to drop the column `deletions` on the `DailyReport` table. All the data in the column will be lost.
  - You are about to drop the column `filesChanged` on the `DailyReport` table. All the data in the column will be lost.
  - Added the required column `dailyNote` to the `DailyReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diffCount` to the `DailyReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aiScore` to the `DailyReport` table without a default value. This is not possible if the table is not empty.
  - Made the column `aiGoodPoints` on table `DailyReport` required. This step will fail if there are existing NULL values in that column.
  - Made the column `aiBadPoints` on table `DailyReport` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DailyReport" DROP COLUMN "additions",
DROP COLUMN "deletions",
DROP COLUMN "filesChanged",
ADD COLUMN     "dailyNote" TEXT NOT NULL,
ADD COLUMN     "diffCount" TEXT NOT NULL,
ALTER COLUMN "workDurationSec" DROP NOT NULL,
DROP COLUMN "aiScore",
ADD COLUMN     "aiScore" INTEGER NOT NULL,
ALTER COLUMN "aiGoodPoints" SET NOT NULL,
ALTER COLUMN "aiBadPoints" SET NOT NULL;

/*
  Warnings:

  - You are about to drop the column `aiBadPoints` on the `DailyReport` table. All the data in the column will be lost.
  - You are about to drop the column `aiGoodPoints` on the `DailyReport` table. All the data in the column will be lost.
  - You are about to drop the column `aiScore` on the `DailyReport` table. All the data in the column will be lost.
  - You are about to drop the column `aiStudyTime` on the `DailyReport` table. All the data in the column will be lost.
  - You are about to drop the column `dailyNote` on the `DailyReport` table. All the data in the column will be lost.
  - You are about to drop the column `diffCount` on the `DailyReport` table. All the data in the column will be lost.
  - You are about to drop the column `workDurationSec` on the `DailyReport` table. All the data in the column will be lost.
  - Added the required column `prSummary` to the `DailyReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `DailyReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `todayLearning` to the `DailyReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyReport" DROP COLUMN "aiBadPoints",
DROP COLUMN "aiGoodPoints",
DROP COLUMN "aiScore",
DROP COLUMN "aiStudyTime",
DROP COLUMN "dailyNote",
DROP COLUMN "diffCount",
DROP COLUMN "workDurationSec",
ADD COLUMN     "aiCoachComment" TEXT,
ADD COLUMN     "changeSize" TEXT NOT NULL DEFAULT 'M',
ADD COLUMN     "commitCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "linesChanged" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prSummary" TEXT NOT NULL,
ADD COLUMN     "struggles" TEXT,
ADD COLUMN     "techTags" JSONB,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "todayLearning" TEXT NOT NULL,
ADD COLUMN     "tomorrow" TEXT;

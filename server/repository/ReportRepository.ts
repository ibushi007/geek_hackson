import { prisma } from "@/lib/prisma";
import { CreateReportInput } from "@/types/report";

export class ReportRepository {
    async create(userId: string, input: CreateReportInput) {
        return await prisma.dailyReport.create({
            data: {
                userId,
                workDurationSec: input.workDurationSec ?? null,
                githubUrl: input.githubUrl,
                dailyNote: input.dailyNote,
                diffCount: input.diffCount,
                aiScore: input.aiScore,
                aiGoodPoints: input.aiGoodPoints,
                aiBadPoints: input.aiBadPoints,
                aiStudyTime: input.aiStudyTime ?? null,
            }
        });
    }

    async findById(id: string) {
        return await prisma.dailyReport.findUnique({
            where: { id },
        });
    }

    async findByUserId(userId: string) {
        return await prisma.dailyReport.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
}
import { ReportRepository } from "@/server/repository/ReportRepository";
import { CreateReportInput, ReportResponse } from "@/types/report";

const reportRepository = new ReportRepository();

export class ReportUseCase {
    async createReport(userId: string, input: CreateReportInput): Promise<ReportResponse> {
        const report = await reportRepository.create(userId, input);

        return {
            id: report.id,
            createdAt: report.createdAt,
            workDurationSec: report.workDurationSec,
            githubUrl: report.githubUrl,
            aiScore: report.aiScore,
            aiGoodPoints: report.aiGoodPoints,
            aiBadPoints: report.aiBadPoints,
            aiStudyTime: report.aiStudyTime,
        }
    }
}
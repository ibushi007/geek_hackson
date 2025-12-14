import { ReportRepository } from "@/server/repository/ReportRepository";
import { CreateReportInput, ReportResponse, ShowReportsResponse } from "@/types/report";

const reportRepository = new ReportRepository();

export class ReportUseCase {
  /**
   * 日報を作成
   * @param userId ユーザーID
   * @param input 日報入力
   * @returns 日報
   */
  async createReport(
    userId: string,
    input: CreateReportInput,
  ): Promise<ReportResponse> {
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
    };
  }

  /**
   * ログインユーザーの日報一覧を取得
   * @param userId ユーザーID
   * @returns ログインユーザーの日報一覧
   */
  async showReports(userId: string): Promise<ShowReportsResponse> {
    const reports = await reportRepository.findByUserId(userId);
    return {
      reports: reports.map((report) => ({
        id: report.id,
        createdAt: report.createdAt.toISOString(),
        workDurationSec: report.workDurationSec,
        githubUrl: report.githubUrl,
        aiScore: report.aiScore,
        aiGoodPoints: report.aiGoodPoints,
        aiBadPoints: report.aiBadPoints,
        aiStudyTime: report.aiStudyTime,
      })),
    };
  }
}

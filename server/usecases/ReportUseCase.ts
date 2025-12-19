import { ReportRepository } from "@/server/repository/ReportRepository";
import {
  CreateReportInput,
  ReportResponse,
  ShowReportsResponse,
} from "@/types/report";
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
    if (!input.title?.trim()) {
      throw new Error("title is required");
    }
    if (!input.todayLearning?.trim()) {
      throw new Error("todayLearning is required");
    }
    if (!input.githubUrl?.trim()) {
      throw new Error("githubUrl is required");
    }

    // Repositoryを呼び出し（新しいフィールドに対応済み）
    const report = await reportRepository.create(userId, input);

    // ✅ そのまま返す（Repositoryが既に正しい型を返す）
    return report;
  }

  /**
   * ログインユーザーの日報一覧を取得
   * @param userId ユーザーID
   * @returns ログインユーザーの日報一覧
   */
  async showReports(userId: string): Promise<ShowReportsResponse> {
    const reports = await reportRepository.findByUserId(userId);
    return {
      reports: reports,
    };
  }

  /**
   * IDで日報を取得
   * @param id 日報ID
   * @returns 日報データ
   */
  async getReportById(id: string): Promise<ReportResponse> {
    const report = await reportRepository.findById(id);

    if (!report) {
      throw new Error("Report not found");
    }

    return report;
  }

  async updateReport(
    id: string,
    body: Partial<CreateReportInput>,
  ): Promise<ReportResponse> {
    if (body.title && body.title.length > 300) {
      throw new Error("title must be less than 300 characters");
    }

    if (body.todayLearning && body.todayLearning.length > 1000) {
      throw new Error("todayLearning must be less than 1000 characters");
    }

    const report = await reportRepository.update(id, body);
    if (!report) {
      throw new Error("Report not found");
    }

    return report;
  }

  async deleteReport(id: string): Promise<void> {
    await reportRepository.delete(id);
  }
}

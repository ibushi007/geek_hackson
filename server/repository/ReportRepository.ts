import { prisma } from "@/lib/prisma";
import {
  CreateReportInput,
  ReportResponse,
  TechTag,
  ChangeSize,
} from "@/types/report";

export class ReportRepository {
  /**
   * 日報を作成
   * @param userId ユーザーID
   * @param input 日報データ
   * @returns 作成された日報
   */
  async create(
    userId: string,
    input: CreateReportInput,
  ): Promise<ReportResponse> {
    const report = await prisma.dailyReport.create({
      data: {
        userId,
        title: input.title,
        todayLearning: input.todayLearning,
        struggles: input.struggles,
        tomorrow: input.tomorrow,
        githubUrl: input.githubUrl,
        prCount: input.prCount,
        commitCount: input.commitCount,
        linesChanged: input.linesChanged,
        changeSize: input.changeSize,
        prSummary: input.prSummary,
        aiCoachComment: input.aiCoachComment,
        techTags: input.techTags,
      },
    });

    // Json型からTechTag[]に変換
    return {
      ...report,
      changeSize: report.changeSize as ChangeSize,
      techTags: report.techTags as TechTag[] | null,
    };
  }

  /**
   * IDで日報を取得
   * @param id 日報ID
   * @returns 日報データ（存在しない場合はnull）
   */
  async findById(id: string): Promise<ReportResponse | null> {
    const report = await prisma.dailyReport.findUnique({
      where: { id },
    });

    if (!report) return null;

    return {
      ...report,
      changeSize: report.changeSize as ChangeSize,
      techTags: report.techTags as TechTag[] | null,
    };
  }

  /**
   * ユーザーIDで日報一覧を取得（作成日時の降順）
   * @param userId ユーザーID
   * @returns 日報一覧
   */
  async findByUserId(userId: string): Promise<ReportResponse[]> {
    const reports = await prisma.dailyReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return reports.map((report) => ({
      ...report,
      changeSize: report.changeSize as ChangeSize,
      techTags: report.techTags as TechTag[] | null,
    }));
  }

  /**
   * 日報を削除
   * @param id 日報ID
   * @returns 削除された日報
   */
  async delete(id: string): Promise<ReportResponse> {
    const report = await prisma.dailyReport.delete({
      where: { id },
    });

    return {
      ...report,
      changeSize: report.changeSize as ChangeSize,
      techTags: report.techTags as TechTag[] | null,
    };
  }

  /**
   * 日報を更新
   * @param id 日報ID
   * @param input 更新データ
   * @returns 更新された日報
   */
  async update(
    id: string,
    input: Partial<CreateReportInput>,
  ): Promise<ReportResponse> {
    const report = await prisma.dailyReport.update({
      where: { id },
      data: input,
    });

    return {
      ...report,
      changeSize: report.changeSize as ChangeSize,
      techTags: report.techTags as TechTag[] | null,
    };
  }

  /**
 * 指定した日付のユーザーの日報を取得
 * @param userId ユーザーID
 * @param date 日付（YYYY-MM-DD形式）
 * @returns 日報データ（存在しない場合はnull）
 */
  async findByUserIdAndDate(
    userId: string, 
    date: string
  ): Promise<ReportResponse | null> {
    // JST基準で日付範囲を計算
    const startOfDay = new Date(`${date}T00:00:00+09:00`);
    const endOfDay = new Date(`${date}T23:59:59+09:00`);

    const report = await prisma.dailyReport.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!report) return null;

    return {
      ...report,
      changeSize: report.changeSize as ChangeSize,
      techTags: report.techTags as TechTag[] | null,
    };
  }
}

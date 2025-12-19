import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ReportResponse, TechTag } from "@/types/report";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface WeeklyStats {
  weekLabel: string;           // 例: "12月16日〜22日"
  startDate: string;            // YYYY-MM-DD
  endDate: string;              // YYYY-MM-DD
  
  // 基本統計
  totalCommits: number;         // 週間コミット数の合計
  totalLinesChanged: number;    // 週間変更行数の合計
  totalPRs: number;             // 週間PR数の合計
  dailyReportCount: number;     // 作成した日報の数
  
  // Momentum Score（既存ロジック使用）
  weeklyMomentum: number;       // 週全体のMomentum Score（0-100）
  
  // 技術タグ
  newTechCount: number;         // 新技術の数
  newTechTags: string[];        // 新技術の名前リスト
  allTechTags: TechTag[];       // 全技術タグ（重複除去済み）
  
  // 日別データ
  dailyBreakdown: Array<{
    date: string;               // YYYY-MM-DD
    dayOfWeek: string;          // 日本語（月、火、水...）
    commits: number;
    prs: number;
    lines: number;
  }>;
  
  // ハイライト
  mostProductiveDay: {
    date: string;
    dayOfWeek: string;          // 日本語（月曜日、火曜日...）
    commits: number;
  };
  
  biggestChange: {
    title: string;              // 日報タイトル
    lines: number;
    date: string;
  } | null;
}

export class WeeklyReportService {
  /**
   * 指定した週の統計データを取得
   * @param userId ユーザーID
   * @param weekOffset 週のオフセット（0=今週、-1=先週、-2=先々週...）
   */
  async getWeeklyStats(
    userId: string,
    weekOffset: number = 0
  ): Promise<WeeklyStats> {
    const { startDate, endDate } = this.getWeekRange(weekOffset);

    // その週の日報を全て取得
    const reports = await prisma.dailyReport.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // 統計を集計
    const stats = this.calculateWeeklyStats(reports, startDate, endDate);

    return stats;
  }

  /**
   * 週の開始日と終了日を取得（JST基準、月曜始まり）
   */
  private getWeekRange(weekOffset: number): { 
    startDate: Date; 
    endDate: Date; 
  } {
    const now = dayjs().tz("Asia/Tokyo");
    const targetWeek = now.add(weekOffset, "week");
    
    // 月曜日を週の開始日とする
    const startOfWeek = targetWeek.startOf("week").add(1, "day").startOf("day");
    const endOfWeek = startOfWeek.add(6, "day").endOf("day");

    return {
      startDate: startOfWeek.toDate(),
      endDate: endOfWeek.toDate(),
    };
  }

  /**
   * 週次統計データを計算
   */
  private calculateWeeklyStats(
    reports: any[],
    startDate: Date,
    endDate: Date
  ): WeeklyStats {
    // 基本統計の合計
    const totalCommits = reports.reduce((sum, r) => sum + r.commitCount, 0);
    const totalLinesChanged = reports.reduce((sum, r) => sum + r.linesChanged, 0);
    const totalPRs = reports.reduce((sum, r) => sum + r.prCount, 0);

    // 技術タグの集計
    const { newTechCount, newTechTags, allTechTags } = this.aggregateTechTags(reports);

    // 日別の内訳を作成
    const dailyBreakdown = this.createDailyBreakdown(reports, startDate, endDate);

    // 最も生産的な日を計算
    const mostProductiveDay = this.findMostProductiveDay(dailyBreakdown);

    // 最も変更が大きかった日報を計算
    const biggestChange = this.findBiggestChange(reports);

    // 週全体のMomentum Scoreを計算（既存ロジックを使用）
    const weeklyMomentum = this.calculateWeeklyMomentum(reports);

    // 週のラベルを生成
    const startLabel = dayjs(startDate).format("M月D日");
    const endLabel = dayjs(endDate).format("M月D日");

    return {
      weekLabel: `${startLabel}〜${endLabel}`,
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      totalCommits,
      totalLinesChanged,
      totalPRs,
      dailyReportCount: reports.length,
      weeklyMomentum,
      newTechCount,
      newTechTags,
      allTechTags,
      dailyBreakdown,
      mostProductiveDay,
      biggestChange,
    };
  }

  /**
   * 技術タグを集計（新技術と全技術）
   */
  private aggregateTechTags(reports: any[]): {
    newTechCount: number;
    newTechTags: string[];
    allTechTags: TechTag[];
  } {
    const newTechSet = new Set<string>();
    const allTechMap = new Map<string, TechTag>();

    reports.forEach((report) => {
      const techTags = report.techTags as TechTag[] | null;
      if (Array.isArray(techTags)) {
        techTags.forEach((tag) => {
          // 新技術のみ抽出
          if (tag.isNew) {
            newTechSet.add(tag.name);
          }
          
          // 全技術タグを重複除去して保存
          if (!allTechMap.has(tag.name)) {
            allTechMap.set(tag.name, tag);
          }
        });
      }
    });

    return {
      newTechCount: newTechSet.size,
      newTechTags: Array.from(newTechSet),
      allTechTags: Array.from(allTechMap.values()),
    };
  }

  /**
   * 日別の内訳を作成（月曜日〜日曜日の7日間、データがない日も含む）
   */
  private createDailyBreakdown(
    reports: any[],
    startDate: Date,
    endDate: Date
  ): Array<{
    date: string;
    dayOfWeek: string;
    commits: number;
    prs: number;
    lines: number;
  }> {
    const breakdown = [];
    const reportMap = new Map(
      reports.map((r) => [
        dayjs(r.createdAt).format("YYYY-MM-DD"),
        r,
      ])
    );

    // 月曜日から日曜日まで7日間ループ
    for (let i = 0; i < 7; i++) {
      const targetDate = dayjs(startDate).add(i, "day");
      const dateStr = targetDate.format("YYYY-MM-DD");
      const report = reportMap.get(dateStr);

      breakdown.push({
        date: dateStr,
        dayOfWeek: this.getDayOfWeekJapanese(targetDate.day()),
        commits: report?.commitCount || 0,
        prs: report?.prCount || 0,
        lines: report?.linesChanged || 0,
      });
    }

    return breakdown;
  }

  /**
   * 最も生産的な日を計算
   */
  private findMostProductiveDay(dailyBreakdown: any[]): {
    date: string;
    dayOfWeek: string;
    commits: number;
  } {
    if (dailyBreakdown.length === 0) {
      return { date: "", dayOfWeek: "", commits: 0 };
    }

    const mostProductive = dailyBreakdown.reduce((max, current) =>
      current.commits > max.commits ? current : max
    );

    return {
      date: mostProductive.date,
      dayOfWeek: this.getDayOfWeekJapaneseFull(dayjs(mostProductive.date).day()),
      commits: mostProductive.commits,
    };
  }

  /**
   * 最も変更が大きかった日報を取得
   */
  private findBiggestChange(reports: any[]): {
    title: string;
    lines: number;
    date: string;
  } | null {
    if (reports.length === 0) return null;

    const biggest = reports.reduce((max, current) =>
      current.linesChanged > max.linesChanged ? current : max
    );

    return {
      title: biggest.title,
      lines: biggest.linesChanged,
      date: dayjs(biggest.createdAt).format("YYYY-MM-DD"),
    };
  }

  /**
   * 週全体のMomentum Scoreを計算
   * GrowthUseCase.tsの計算ロジックを週次用に拡張
   */
  private calculateWeeklyMomentum(reports: any[]): number {
    if (reports.length === 0) return 0;

    // 各日報のMomentum Scoreを計算して平均を取る
    const dailyMomentums = reports.map((report) => {
      const commitScore = report.commitCount * 10;
      const prScore = report.prCount * 50;
      const linesScore = Math.min(report.linesChanged / 10, 100);

      const changeSizeMultiplier: Record<string, number> = {
        S: 1.0,
        M: 1.5,
        L: 2.0,
      };
      const sizeBonus = changeSizeMultiplier[report.changeSize] || 1.0;

      const momentum = (commitScore + prScore + linesScore) * sizeBonus;
      return Math.floor(momentum / 6);
    });

    // 週の平均Momentum Score（最大100に制限）
    const avgMomentum = dailyMomentums.reduce((sum, m) => sum + m, 0) / dailyMomentums.length;
    return Math.min(Math.round(avgMomentum), 100);
  }

  /**
   * 曜日を日本語の短縮形で取得（月、火、水...）
   */
  private getDayOfWeekJapanese(day: number): string {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return days[day];
  }

  /**
   * 曜日を日本語の完全形で取得（日曜日、月曜日...）
   */
  private getDayOfWeekJapaneseFull(day: number): string {
    const days = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
    return days[day];
  }
}

export const weeklyReportService = new WeeklyReportService();
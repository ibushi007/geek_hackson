import { GrowthData, WeeklyCommits, SkillMapData } from "@/types/growth";
import { ReportRepository } from "@/server/repository/ReportRepository";
import { ReportResponse, TechTag } from "@/types/report";

export class GrowthUseCase {
  private reportRepository: ReportRepository;

  constructor(reportRepository: ReportRepository = new ReportRepository()) {
    this.reportRepository = reportRepository;
  }

  async getGrowthData(userId: string): Promise<GrowthData> {
    const reports = await this.reportRepository.findByUserId(userId);
    const weeklyCommits = this.calculateWeeklyCommits(reports);
    const streak = this.calculateStreak(reports);
    // 最新の日報を取得して学習モメンタムを計算
    const momentum = this.calculateMomentum(reports[0]);
    const skillMap = this.calculateSkillMap(reports);

    return {
      weeklyCommits,
      streak,
      momentum,
      skillMap,
    };
  }

  /**
   * 週間コミット数を計算します（月曜始まり・日曜終わり）
   * @param reports 降順ソートされた日報一覧
   * @returns 週間コミット数
   */
  private calculateWeeklyCommits(reports: ReportResponse[]): WeeklyCommits {
    const today = new Date();
    const currentDay = today.getDay(); // 0:Sun, 1:Mon, ..., 6:Sat

    // 今週の月曜日を算出する
    // 日曜日(0)の場合は6日前、それ以外は (曜日 - 1) 日前が月曜日
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    const result: WeeklyCommits = [];

    // 月曜日(0)から日曜日(6)までループ
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + i);

      const targetDateKey = this.toDateKey(targetDate);

      // 該当日の日報を探す
      const foundReport = reports.find(
        (report) => this.toDateKey(report.createdAt) === targetDateKey,
      );

      result.push({
        dayOfWeek: this.getDayOfWeek(targetDate),
        value: foundReport?.commitCount || 0, // 日報がない（未来含む）場合は0
        dateKey: targetDateKey,
      });
    }
    return result;
  }

  /**
   * 現在の継続日数（ストリーク）を計算します。
   * 日報データは降順（最新順）かつ日付の重複がないことを前提としています。
   * @param reports 降順ソートされた日報一覧
   * @returns 継続日数（ストリーク）
   */
  private calculateStreak(reports: ReportResponse[]): number {
    if (reports.length === 0) return 0;

    // 1. 最新の日報を取得
    const latestReport = reports[0];
    const latestReportDate = new Date(latestReport.createdAt);

    // 2. 継続判定（今日または昨日投稿していなければストリークは0）
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const latestDateKey = this.toDateKey(latestReportDate);
    const todayKey = this.toDateKey(today);
    const yesterdayKey = this.toDateKey(yesterday);

    if (latestDateKey !== todayKey && latestDateKey !== yesterdayKey) {
      return 0;
    }

    // 3. ストリークの計算
    let streak = 0;

    // 最新の日報の日付を基準（期待する日付）としてスタート
    // Dateオブジェクトの演算機能を使うことで、1月1日の前日が12月31日になる等の
    // 月またぎ・年またぎの計算は自動的に正しく処理されます。
    const expectedDate = new Date(latestReportDate);

    for (const report of reports) {
      const reportDateKey = this.toDateKey(report.createdAt);
      const expectedDateKey = this.toDateKey(expectedDate);

      // 期待する日付と日報の日付が一致するか確認
      if (reportDateKey === expectedDateKey) {
        streak++;
        // 次のループのために、期待する日付を「1日前」に更新
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        // 日付が連続しなくなった時点で計算終了
        break;
      }
    }

    return streak;
  }

  /**
   * 学習モメンタムを計算します（最大100点）
   * @param report 日報
   * @returns 学習モメンタム
   */
  private calculateMomentum(report: ReportResponse | undefined): number {
    if (!report) {
      return 0;
    }

    // コミット数、PR数、変更行数を基にモメンタムを計算
    const commitScore = report.commitCount * 10;
    const prScore = report.prCount * 50;
    const linesScore = Math.min(report.linesChanged / 10, 100); // 最大100点に制限

    // 変更サイズによるボーナス
    const changeSizeMultiplier = {
      S: 1.0,
      M: 1.5,
      L: 2.0,
    };
    const sizeBonus = changeSizeMultiplier[report.changeSize] || 1.0;

    // 各スコアを合計して、変更サイズのボーナスを適用
    const momentum = (commitScore + prScore + linesScore) * sizeBonus;

    return Math.floor(momentum / 6);
  }

  /**
   * 日付を成形して返します
   * @param date 日付
   * @returns 成形した日付
   */
  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * 曜日を取得します
   * @param date 日付
   * @returns 曜日(Sun, Mon, Tue, Wed, Thu, Fri, Sat)
   */
  private getDayOfWeek(date: Date): string {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames[date.getDay()];
  }

  /**
   * スキルマップデータを計算します（今週の月曜日から今日までのtechTagsを集計）
   * @param reports 降順ソートされた日報一覧
   * @returns スキルマップデータ（各techTagの割合が100%になるように正規化）
   */
  private calculateSkillMap(reports: ReportResponse[]): SkillMapData {
    const today = new Date();
    const currentDay = today.getDay(); // 0:Sun, 1:Mon, ..., 6:Sat

    // 今週の月曜日を算出する
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    // 今週の月曜日から今日までの日報を取得
    // 日曜日(0)の場合は月曜日から日曜日まで（0から6まで、7日間）
    // それ以外は月曜日(0)から今日まで
    const daysToCheck = currentDay === 0 ? 7 : currentDay;
    const weeklyReports: ReportResponse[] = [];
    
    for (let i = 0; i <= daysToCheck; i++) {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + i);
      const targetDateKey = this.toDateKey(targetDate);

      const foundReport = reports.find(
        (report) => this.toDateKey(report.createdAt) === targetDateKey,
      );

      if (foundReport) {
        weeklyReports.push(foundReport);
      }
    }

    // techTagsを集計
    const tagCountMap = new Map<string, number>();
    let totalCount = 0;

    for (const report of weeklyReports) {
      if (report.techTags && Array.isArray(report.techTags)) {
        for (const tag of report.techTags) {
          const tagName = tag.name;
          const currentCount = tagCountMap.get(tagName) || 0;
          tagCountMap.set(tagName, currentCount + 1);
          totalCount++;
        }
      }
    }

    // 全体が100%になるように正規化
    const skillMap: SkillMapData = [];
    if (totalCount > 0) {
      for (const [tagName, count] of tagCountMap.entries()) {
        skillMap.push({
          name: tagName,
          // 少数第二位までの精度で四捨五入
          percentage: Math.round((count / totalCount) * 100 * 100) / 100, // 小数点第2位まで
        });
      }
    }

    // パーセンテージが高い順にソート
    skillMap.sort((a, b) => b.percentage - a.percentage);

    return skillMap;
  }
}

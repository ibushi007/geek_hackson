import { GrowthUseCase } from "../GrowthUseCase";
import { ReportRepository } from "@/server/repository/ReportRepository";
import { ReportResponse } from "@/types/report";

// ReportRepositoryのモック
jest.mock("@/server/repository/ReportRepository");

describe("GrowthUseCase", () => {
  let growthUseCase: GrowthUseCase;
  let mockReportRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    // モックリポジトリのインスタンスを作成
    mockReportRepository = {
      findByUserId: jest.fn(),
    } as any;

    // GrowthUseCaseのインスタンスを作成（モックリポジトリを注入）
    growthUseCase = new GrowthUseCase(mockReportRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getGrowthData", () => {
    it("日報データがない場合、空の週間コミットとストリーク0を返す", async () => {
      // モックの設定
      mockReportRepository.findByUserId.mockResolvedValue([]);

      const result = await growthUseCase.getGrowthData("user1");

      expect(result.weeklyCommits).toHaveLength(7);
      expect(result.weeklyCommits.every((day) => day.value === 0)).toBe(true);
      expect(result.streak).toBe(0);
      expect(result.momentum).toBe(0);
    });

    it("今日の日報がある場合、正しく週間コミットとストリークを計算する", async () => {
      const today = new Date();
      const todayKey = formatDate(today);

      const mockReports: ReportResponse[] = [createMockReport("1", today, 5)];

      mockReportRepository.findByUserId.mockResolvedValue(mockReports);

      const result = await growthUseCase.getGrowthData("user1");

      // 週間コミットが7日分あることを確認
      expect(result.weeklyCommits).toHaveLength(7);

      // 今日の日付が正しくマークされているか確認
      const todayData = result.weeklyCommits.find((day) => day.isToday);
      expect(todayData).toBeDefined();
      expect(todayData?.value).toBe(5);

      // ストリークが1以上であることを確認
      expect(result.streak).toBeGreaterThanOrEqual(1);
    });

    it("連続した日報がある場合、正しくストリークを計算する", async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);

      const mockReports: ReportResponse[] = [
        createMockReport("1", today, 5),
        createMockReport("2", yesterday, 3),
        createMockReport("3", twoDaysAgo, 4),
      ];

      mockReportRepository.findByUserId.mockResolvedValue(mockReports);

      const result = await growthUseCase.getGrowthData("user1");

      // 3日連続なのでストリークは3
      expect(result.streak).toBe(3);
    });

    it("連続が途切れている場合、正しくストリークを計算する", async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3); // 2日前は欠けている

      const mockReports: ReportResponse[] = [
        createMockReport("1", today, 5),
        createMockReport("2", yesterday, 3),
        createMockReport("3", threeDaysAgo, 4),
      ];

      mockReportRepository.findByUserId.mockResolvedValue(mockReports);

      const result = await growthUseCase.getGrowthData("user1");

      // 連続が途切れているのでストリークは2（今日と昨日のみ）
      expect(result.streak).toBe(2);
    });

    it("最新の日報が今日・昨日以外の場合、ストリークは0になる", async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockReports: ReportResponse[] = [
        createMockReport("1", threeDaysAgo, 5),
      ];

      mockReportRepository.findByUserId.mockResolvedValue(mockReports);

      const result = await growthUseCase.getGrowthData("user1");

      // 最新の日報が3日前なのでストリークは0
      expect(result.streak).toBe(0);
    });

    it("週間コミットが正しく計算される（複数日の日報がある場合）", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 時刻をリセット
      const monday = getMondayOfWeek(today);
      const tuesday = new Date(monday);
      tuesday.setDate(monday.getDate() + 1);
      tuesday.setHours(0, 0, 0, 0);
      const wednesday = new Date(monday);
      wednesday.setDate(monday.getDate() + 2);
      wednesday.setHours(0, 0, 0, 0);

      const mockReports: ReportResponse[] = [
        createMockReport("1", today, 10),
        createMockReport("2", tuesday, 5),
        createMockReport("3", wednesday, 8),
      ];

      mockReportRepository.findByUserId.mockResolvedValue(mockReports);

      const result = await growthUseCase.getGrowthData("user1");

      // 週間コミットが7日分あることを確認
      expect(result.weeklyCommits).toHaveLength(7);

      // 各曜日が正しく設定されているか確認
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      result.weeklyCommits.forEach((day, index) => {
        expect(day.dayOfWeek).toBe(dayNames[index]);
      });

      // 日報がある日のコミット数が正しいか確認
      const todayData = result.weeklyCommits.find((day) => day.isToday);
      expect(todayData?.value).toBe(10);

      // 火曜日と水曜日のコミット数も確認
      const tuesdayData = result.weeklyCommits.find(
        (day) => day.dayOfWeek === "Tue",
      );
      expect(tuesdayData?.value).toBe(5);
      const wednesdayData = result.weeklyCommits.find(
        (day) => day.dayOfWeek === "Wed",
      );
      expect(wednesdayData?.value).toBe(8);
    });

    it("昨日の日報がある場合、ストリークが正しく計算される", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(yesterday);
      twoDaysAgo.setDate(yesterday.getDate() - 1);

      const mockReports: ReportResponse[] = [
        createMockReport("1", yesterday, 5),
        createMockReport("2", twoDaysAgo, 3),
      ];

      mockReportRepository.findByUserId.mockResolvedValue(mockReports);

      const result = await growthUseCase.getGrowthData("user1");

      // 昨日の日報があるのでストリークは2以上
      expect(result.streak).toBeGreaterThanOrEqual(2);
    });
  });

  // ヘルパー関数
  function createMockReport(
    id: string,
    createdAt: Date,
    commitCount: number,
  ): ReportResponse {
    // 日付の時刻をリセットして、日付のみで比較できるようにする
    const dateOnly = new Date(createdAt);
    dateOnly.setHours(0, 0, 0, 0);

    return {
      id,
      userId: "user1",
      createdAt: dateOnly,
      title: "Test Report",
      todayLearning: "Test",
      githubUrl: "https://github.com/test",
      prCount: 1,
      commitCount,
      linesChanged: 100,
      changeSize: "M",
      prSummary: "Test PR",
      techTags: null,
    };
  }

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getMondayOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を取得
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0); // 時刻をリセット
    return monday;
  }
});

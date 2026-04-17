import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export class ReportController {
  // 1. 全件取得（ダッシュボード用）
  async showReports() {
    try {
      const reports = await prisma.dailyReport.findMany({
        orderBy: { createdAt: "desc" },
      });

      const formattedReports = reports.map((report) => ({
        ...report,
        techTags:
          typeof report.techTags === "string"
            ? JSON.parse(report.techTags)
            : report.techTags || [],
      }));

      return NextResponse.json({ reports: formattedReports });
    } catch (error) {
      console.error("全件取得エラー:", error);
      return NextResponse.json({ error: "取得失敗" }, { status: 500 });
    }
  }

  // 2. 1件取得（詳細画面用）
  async showReport(id: string) {
    try {
      const report = await prisma.dailyReport.findUnique({
        where: { id: id },
      });

      if (!report) {
        return NextResponse.json({ error: "見つかりません" }, { status: 404 });
      }

      const formattedReport = {
        ...report,
        techTags:
          typeof report.techTags === "string"
            ? JSON.parse(report.techTags)
            : report.techTags || [],
      };

      return NextResponse.json(formattedReport);
    } catch (error) {
      console.error("1件取得エラー:", error);
      return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
  }

  // 3. 保存機能
  async createReport(request: Request) {
    try {
      const body = await request.json();
      const newReport = await prisma.dailyReport.create({
        data: {
          userId: "user-001",
          title: body.title,
          todayLearning: body.todayLearning,
          struggles: body.struggles || "",
          tomorrow: body.tomorrow || "",
          githubUrl: body.githubUrl || "https://github.com/ssaladaku39/repo",
          prCount: body.prCount || 0,
          commitCount: body.commitCount || 0,
          linesChanged: body.linesChanged || 0,
          changeSize: body.changeSize || "S",
          prSummary: body.prSummary || "",
          techTags: JSON.stringify(body.techTags || []),
          aiCoachComment: "ナイスアウトプット！",
        },
      });
      return NextResponse.json(newReport);
    } catch (error) {
      console.error("保存エラー:", error);
      return NextResponse.json({ error: "保存失敗" }, { status: 500 });
    }
  }

  // ReportController.ts の中に追加するイメージ
  async updateReport(id: string, body: any) {
    // 1. 冷蔵庫（DB）の指定されたIDのデータを、新しいbodyの内容で「更新(update)」しろ
    const updated = await prisma.dailyReport.update({
      where: { id: id },
      data: {
        title: body.title,
        todayLearning: body.todayLearning,
        struggles: body.struggles || "",
        tomorrow: body.tomorrow || "",
        githubUrl: body.githubUrl || "https://github.com/ssaladaku39/repo",
        prCount: body.prCount || 0,
        commitCount: body.commitCount || 0,
        linesChanged: body.linesChanged || 0,
        changeSize: body.changeSize || "S",
        prSummary: body.prSummary || "",
        techTags: JSON.stringify(body.techTags || []),
        aiCoachComment: "日報を更新しましたね！ 学びの軌跡がより明確になりました！",
      },
    });
    // 2. できた料理をNextResponse（お皿）に乗せて返せ
    return NextResponse.json(updated);
  }
}

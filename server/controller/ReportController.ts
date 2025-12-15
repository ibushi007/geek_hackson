import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReportUseCase } from "@/server/usecases/ReportUseCase";
import { CreateReportInput } from "@/types/report";

const reportUseCase = new ReportUseCase();

export class ReportController {
  /**
   * 日報を作成
   * @param request リクエスト
   * @returns 日報
   */
  async createReport(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as CreateReportInput;
      if (!body.githubUrl) {
        return NextResponse.json(
          { error: "Github URL is required" },
          { status: 400 },
        );
      }

      const report = await reportUseCase.createReport(session.user.id, body);
      return NextResponse.json(report, { status: 200 });
    } catch (error) {
      console.error("Report creation failed:", error);
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 },
      );
    }
  }

  /**
   * ログインユーザーの日報一覧を取得
   * @returns ログインユーザーの日報一覧
   */
  async showReports() {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const reports = await reportUseCase.showReports(session.user.id);

      // Spring Bootでいう ResponseEntity.ok(body) です
      return NextResponse.json(reports, { status: 200 });
    } catch (error) {
      console.error("Error fetching reports:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 },
      );
    }
  }
}

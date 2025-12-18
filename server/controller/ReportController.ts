import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReportUseCase } from "@/server/usecases/ReportUseCase";
import { CreateReportInput } from "@/types/report";

export class ReportController {
    private reportUsecase: ReportUseCase;
    constructor(reportUsecase?: ReportUseCase) {
    this.reportUsecase = reportUsecase ?? new ReportUseCase();
  }
  /**
   * 認証チェック（共通処理）
   * @returns ユーザーIDまたはエラーレスポンス
   */
  private async authenticate(): Promise<
    { userId: string } | { error: NextResponse }
  > {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        error: NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ),
      };
    }
    return { userId: session.user.id };
  }

  /**
   * エラーハンドリング（共通処理）
   */
  private handleError(error: unknown, context: string): NextResponse {
    console.error(`${context} failed:`, error);
    
    if (error instanceof Error) {
      // エラーメッセージに応じてステータスコードを変更
      if (error.message === "Report not found") {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }
      if (error.message.includes("required")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: `Failed to ${context.toLowerCase()}` },
      { status: 500 }
    );
  }

  /**
   * 日報を作成
   * @param request リクエスト
   * @returns 日報
   */
  async createReport(request: NextRequest) {
    try {
      const auth = await this.authenticate();
      if ("error" in auth) return auth.error;
      const body = (await request.json()) as CreateReportInput;
      const report = await this.reportUsecase.createReport(auth.userId, body);
      return NextResponse.json(report, { status: 201 });
    } catch (error) {
      return this.handleError(error, "Report creation");
    }
  }

  /**
   * ログインユーザーの日報一覧を取得
   * @returns ログインユーザーの日報一覧
   */
  async showReports() {
    try {
      const auth = await this.authenticate();
      if ("error" in auth) return auth.error;
      const reports = await this.reportUsecase.showReports(auth.userId);
      return NextResponse.json(reports, { status: 200 });
    } catch (error) {
        return this.handleError(error, "Fetch reports");
    }
  }

  async getReportById(id: string) {
    try {
      const auth = await this.authenticate();
      if ("error" in auth) return auth.error;
      
      const report = await this.reportUsecase.getReportById(id);

      //権限チェック
      if (report.userId !== auth.userId) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
      
      return NextResponse.json(report, { status: 200 });
    } catch (error) {
      return this.handleError(error, "Fetch report by id");
    }
  }

  async updateReport(id: string, body: Partial<CreateReportInput>) {
    try {
      const auth = await this.authenticate();
      if ("error" in auth) return auth.error;

      const existingReport = await this.reportUsecase.getReportById(id);

      //権限チェック
      if (existingReport.userId !== auth.userId) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
    }
    
    //更新実行
    const updatedReport = await this.reportUsecase.updateReport(
      id,
      body
    );

    return NextResponse.json(updatedReport, { status: 200 });
  } catch (error) {
    return this.handleError(error, "Update report");
  }
}
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReportUseCase } from "@/server/usecases/ReportUseCase";
import { CreateReportInput } from "@/types/report";
import { authenticate, handleError } from "@/server/utils/auth";

export class ReportController {
    private reportUsecase: ReportUseCase;
    constructor(reportUsecase?: ReportUseCase) {
    this.reportUsecase = reportUsecase ?? new ReportUseCase();
  }

  /**
   * 日報を作成
   * @param request リクエスト
   * @returns 日報
   */
  async createReport(request: NextRequest) {
    try {
      const auth = await authenticate();
      if ("error" in auth) return auth.error;
      const body = (await request.json()) as CreateReportInput;
      const report = await this.reportUsecase.createReport(auth.userId, body);
      return NextResponse.json(report, { status: 201 });
    } catch (error) {
      return handleError(error, "Report creation");
    }
  }

  /**
   * ログインユーザーの日報一覧を取得
   * @returns ログインユーザーの日報一覧
   */
  async showReports() {
    try {
      const auth = await authenticate();
      if ("error" in auth) return auth.error;
      const reports = await this.reportUsecase.showReports(auth.userId);
      return NextResponse.json(reports, { status: 200 });
    } catch (error) {
        return handleError(error, "Fetch reports");
    }
  }

  async getReportById(id: string) {
    try {
      const auth = await authenticate();
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
      return handleError(error, "Fetch report by id");
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

  async deleteReport(id: string) {
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
      
      //削除実行
      await this.reportUsecase.deleteReport(id);
      return NextResponse.json({ 
        message: "Report deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error, "Delete report");
    }
  }
}


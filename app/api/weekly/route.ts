import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { weeklyReportService } from "@/server/services/WeeklyReportService";

/**
 * 週次統計データを取得
 * GET /api/weekly?weekOffset=0
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // クエリパラメータから週のオフセットを取得（デフォルト: 今週）
    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get("weekOffset") || "0", 10);

    // 週次統計を取得
    const stats = await weeklyReportService.getWeeklyStats(
      session.user.id,
      weekOffset
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Failed to fetch weekly stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
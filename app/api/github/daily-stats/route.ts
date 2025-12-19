import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { githubService } from "@/server/services/GitHubService";

/**
 * 指定日のGitHub統計情報を取得
 * GET /api/github/daily-stats?date=2025-12-19
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.githubId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // クエリパラメータから日付を取得
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // GitHub統計情報を取得
    const [commits, prs] = await Promise.all([
      githubService.getCommitsByDateRange(session.user.githubId, date),
      githubService.getPullRequestsByDateRange(session.user.githubId, date),
    ]);

    // 技術スタック解析
    const techTags = await githubService.analyzeTechStack(
      commits.commits,
      session.user.id,
    );

    // 変更規模を判定（S/M/L）
    const changeSize = 
      commits.linesChanged < 100 ? "S" :
      commits.linesChanged < 500 ? "M" : "L";

    // PR要約を生成（改善版）
    const prSummary = githubService.generatePRSummary(
      prs.pullRequests,
      commits.commits,
    );

    // レビュー状態の判定
    const reviewStatus =
      prs.reviewCount > 0
        ? `${prs.reviewCount}件のレビュー`
        : prs.mergedCount > 0 && prs.prCount > 0
          ? "セルフマージ"
          : prs.prCount > 0
            ? "レビュー待ち"
            : null;

    return NextResponse.json({
      success: true,
      data: {
        date,
        commits: {
          count: commits.commitCount,
          linesChanged: commits.linesChanged,
          repositories: commits.repositories,
          details: commits.commits,
        },
        pullRequests: {
          count: prs.prCount,
          merged: prs.mergedCount,
          reviews: prs.reviewCount,
          reviewStatus,
          details: prs.pullRequests,
        },
        techTags,
        changeSize,
        prSummary: prSummary.substring(0, 1000), // 最大1000文字
      },
    });
  } catch (error) {
    console.error("Failed to fetch daily stats:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
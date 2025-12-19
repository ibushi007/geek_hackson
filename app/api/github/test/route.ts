import { NextResponse } from "next/server";
import { githubClient } from "@/lib/github-client";

/**
 * GitHub API接続テスト
 * GET /api/github/test
 */
export async function GET() {
  try {
    // 認証ユーザー情報を取得
    const user = await githubClient.getAuthenticatedUser();

    // Rate limit情報を取得
    const rateLimit = await githubClient.getRateLimit();

    return NextResponse.json({
      success: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        public_repos: user.public_repos,
      },
      rateLimit,
    });
  } catch (error) {
    console.error("GitHub API test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
